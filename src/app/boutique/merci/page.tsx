import type { Metadata } from "next"
import Link from "next/link"
import { LEGAL } from "@/lib/legal"
import { formatPrice } from "@/lib/shop"
import { fromCents, sessionShipping, stripeApi, stripeEnabled, type CheckoutSession } from "@/lib/stripe"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Merci pour votre commande", robots: { index: false, follow: false } }

type SessionWithItems = CheckoutSession & { line_items?: { data?: { description?: string; quantity?: number }[] } }

async function loadSession(id: string | undefined): Promise<SessionWithItems | null> {
  if (!id || !/^cs_(test|live)_[A-Za-z0-9]+$/.test(id) || !stripeEnabled()) return null
  try {
    return await stripeApi<SessionWithItems>("GET", `/checkout/sessions/${id}`, { expand: ["line_items"] })
  } catch {
    return null
  }
}

export default async function MerciPage({ searchParams }: { searchParams: Promise<{ session_id?: string }> }) {
  const { session_id } = await searchParams
  const session = await loadSession(session_id)
  const paid = session?.payment_status === "paid"
  const firstName = (session?.customer_details?.name ?? "").split(" ")[0]
  const ship = session ? sessionShipping(session) : null
  const item = session?.line_items?.data?.[0]

  return (
    <main className="min-h-screen px-6 pt-36 pb-24" style={{ background: "var(--color-bg)" }}>
      <div className="max-w-xl mx-auto text-center">
        <p className="text-xs uppercase font-semibold mb-4" style={{ color: "var(--color-accent)", letterSpacing: "0.3em" }}>
          Boutique
        </p>
        <h1 className="text-4xl md:text-5xl font-bold mb-6" style={{ color: "var(--color-text)" }}>
          {paid ? `Merci${firstName ? ` ${firstName}` : ""} !` : "Commande en cours de validation"}
        </h1>

        {paid ? (
          <div className="space-y-6 text-left">
            <p className="text-center" style={{ color: "var(--color-muted)" }}>
              Votre paiement est confirmé. Un e-mail récapitulatif vient de vous être envoyé
              {session?.customer_details?.email ? ` à ${session.customer_details.email}` : ""}.
            </p>
            <div className="p-6 rounded-2xl space-y-3" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
              {item?.description && (
                <p style={{ color: "var(--color-text)", fontWeight: 600 }}>
                  {item.description}
                  {item.quantity && item.quantity > 1 ? ` × ${item.quantity}` : ""}
                </p>
              )}
              <p style={{ color: "var(--color-muted)" }}>
                Total payé :{" "}
                <strong style={{ color: "var(--color-accent)" }}>{formatPrice(fromCents(session?.amount_total))}</strong> — livraison offerte
              </p>
              {ship?.address && (
                <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
                  Livraison à {ship.name ? `${ship.name}, ` : ""}
                  {[ship.address.line1, ship.address.postal_code, ship.address.city].filter(Boolean).join(" ")}
                </p>
              )}
            </div>
            <p style={{ color: "var(--color-muted)", fontSize: "0.9rem" }}>
              Votre tirage est imprimé à la commande par notre laboratoire partenaire, qui vous l’expédie directement.
              Vous le recevrez sous {LEGAL.shipping.delay} au plus ; le numéro de suivi vous sera envoyé dès l’expédition.
            </p>
          </div>
        ) : (
          <p style={{ color: "var(--color-muted)" }}>
            Si vous venez de payer, la confirmation arrive par e-mail dans quelques minutes. Une question ? Écrivez-moi à{" "}
            <a href={`mailto:${LEGAL.contactEmail}`} style={{ color: "var(--color-accent)" }}>{LEGAL.contactEmail}</a>.
          </p>
        )}

        <div className="mt-10 flex flex-wrap gap-4 justify-center">
          <Link href="/boutique" className="px-6 py-3 rounded-full text-xs uppercase font-bold" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.2em" }}>
            Retour à la boutique
          </Link>
          <Link href="/portfolio" className="px-6 py-3 rounded-full text-xs uppercase" style={{ border: "1px solid var(--color-border)", color: "var(--color-text)", letterSpacing: "0.2em" }}>
            Voir le portfolio
          </Link>
        </div>
      </div>
    </main>
  )
}
