import { NextResponse } from "next/server"
import { rateLimit, getClientIp } from "@/lib/apiSecurity"
import { client } from "@/lib/sanity.client"
import { isFinish, isFormatAvailable, printPaperLabel, rangeOf } from "@/lib/shop"
import { urlFor } from "@/lib/image"
import { LEGAL } from "@/lib/legal"
import { stripeApi, stripeEnabled, StripeError, type CheckoutSession } from "@/lib/stripe"
import type { ProductFormat, SanityImage } from "@/types/sanity"

const MAX_QTY = 5

type CheckoutProduct = {
  _id: string
  title: string
  price?: number
  currency?: string
  paper?: string
  image?: SanityImage
  formats?: ProductFormat[]
}

const PRODUCT_QUERY = `*[_type == "product" && _id == $id][0]{
  _id, title, price, currency, paper, "image": coalesce(image, photo->image), formats[]{ _key, range, name, price, stock }
}`

/**
 * Crée une session Stripe Checkout pour un tirage et renvoie l'URL de la page de paiement Stripe.
 * Prix, stock et format viennent toujours de Sanity, jamais du navigateur.
 * Sans clé Stripe configurée (ex. production avant la mise en service), répond 503 + fallback :
 * le site repasse alors sur la demande de commande par e-mail (/api/order).
 */
export async function POST(req: Request) {
  if (!stripeEnabled()) {
    return NextResponse.json({ error: "Paiement en ligne indisponible", fallback: true }, { status: 503 })
  }

  try {
    const ip = getClientIp(req)
    if (!rateLimit(`checkout:${ip}`, 10, 10 * 60 * 1000)) {
      return NextResponse.json({ error: "Trop de requêtes, réessayez plus tard." }, { status: 429 })
    }

    const body = await req.json()
    const { productId, format, formatKey, range: rawRange, finish: rawFinish, qty: rawQty, acceptCgv } = body ?? {}

    if (typeof productId !== "string" || !productId || productId.length > 120 || productId.startsWith("drafts.")) {
      return NextResponse.json({ error: "Produit invalide" }, { status: 400 })
    }
    if (acceptCgv !== true) {
      return NextResponse.json({ error: "Veuillez accepter les conditions générales de vente" }, { status: 400 })
    }

    const product = await client.fetch<CheckoutProduct | null>(PRODUCT_QUERY, { id: productId })
    if (!product) return NextResponse.json({ error: "Produit introuvable" }, { status: 404 })

    let unitPrice: number | undefined = product.price
    let formatName: string | undefined
    let selectedKey = ""
    let range = rangeOf(typeof rawRange === "string" ? rawRange : undefined)
    let stockLimit = MAX_QTY
    if (product.formats?.length) {
      // Format identifié par sa clé (unique), sinon par sa taille dans la gamme demandée
      const selected =
        typeof formatKey === "string" && formatKey
          ? product.formats.find((f) => f._key === formatKey)
          : product.formats.find((f) => f.name === format && rangeOf(f.range) === range)
      if (!selected) return NextResponse.json({ error: "Format invalide" }, { status: 400 })
      if (!isFormatAvailable(selected)) return NextResponse.json({ error: "Ce format n’est plus disponible" }, { status: 409 })
      unitPrice = selected.price ?? product.price
      formatName = selected.name
      selectedKey = selected._key ?? ""
      range = rangeOf(selected.range)
      stockLimit = Math.min(selected.stock ?? MAX_QTY, MAX_QTY)
    }
    // Papier photo : finition mat ou brillant (mat par défaut)
    const finish = range === "photo" ? (isFinish(rawFinish) ? rawFinish : "mat") : ""
    const paper = printPaperLabel(range, finish, product.paper)

    const qty = Number(rawQty)
    if (!Number.isInteger(qty) || qty < 1 || qty > stockLimit) {
      return NextResponse.json({ error: "Quantité invalide" }, { status: 400 })
    }
    if (typeof unitPrice !== "number" || unitPrice <= 0) {
      return NextResponse.json({ error: "Prix non défini pour ce produit" }, { status: 400 })
    }

    const origin = new URL(req.url).origin
    const name = formatName ? `${product.title} — ${formatName} cm, ${range === "photo" ? paper.toLowerCase() : "Fine Art"}` : product.title
    const imageUrl = product.image ? urlFor(product.image).width(800).quality(80).url() : undefined

    const session = await stripeApi<CheckoutSession>("POST", "/checkout/sessions", {
      mode: "payment",
      locale: "fr",
      line_items: [
        {
          quantity: qty,
          price_data: {
            currency: (product.currency || "EUR").toLowerCase(),
            unit_amount: Math.round(unitPrice * 100),
            product_data: {
              name,
              description:
                range === "photo"
                  ? `Tirage sur ${paper.toLowerCase()}, imprimé à la commande`
                  : `Tirage photo Fine Art sur ${paper}, imprimé à la commande`,
              ...(imageUrl ? { images: [imageUrl] } : {}),
              metadata: { sanityId: product._id },
            },
          },
        },
      ],
      shipping_address_collection: { allowed_countries: ["FR"] },
      shipping_options: [
        {
          shipping_rate_data: {
            type: "fixed_amount",
            fixed_amount: { amount: 0, currency: "eur" },
            display_name: `Livraison offerte (${LEGAL.shipping.zone})`,
            delivery_estimate: { minimum: { unit: "business_day", value: 3 }, maximum: { unit: "day", value: 10 } },
          },
        },
      ],
      phone_number_collection: { enabled: true },
      custom_text: {
        shipping_address: { message: `Livraison en ${LEGAL.shipping.zone} uniquement (Corse comprise).` },
        submit: { message: `Conditions générales de vente acceptées sur le site. Droit de rétractation : 14 jours après réception.` },
      },
      metadata: {
        productId: product._id,
        format: formatName ?? "",
        formatKey: selectedKey,
        range,
        finish,
        qty: String(qty),
        unitPrice: String(unitPrice),
      },
      payment_intent_data: { description: `${name} × ${qty}`, metadata: { productId: product._id, format: formatName ?? "" } },
      success_url: `${origin}/boutique/merci?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/boutique`,
      expires_at: Math.floor(Date.now() / 1000) + 30 * 60,
    })

    if (!session.url) throw new Error("Session Stripe sans URL")
    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error("Checkout API error:", err instanceof StripeError ? `${err.status} ${err.code ?? ""} ${err.message}` : err)
    return NextResponse.json({ error: "Le paiement n’a pas pu démarrer. Réessayez ou contactez-moi." }, { status: 500 })
  }
}
