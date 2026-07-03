import Image from "next/image"
import { client } from "@/lib/sanity.client"
import { urlFor } from "@/lib/image"

const PRODUCT_FIELDS = `_id, title, shortDescription, "image": coalesce(image, photo->image), price, currency, formats[]{ name, price, stock }, edition, featured, "collection": coalesce(collection->title, photo->collection->title), paymentUrl`

async function resolveProducts(props: any): Promise<any[]> {
  const { displayMode, collection, products } = props
  if (displayMode === "selected" && products?.length) return products
  if (displayMode === "featured") {
    return client.fetch(`*[_type == "product" && featured == true] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`)
  }
  if (displayMode === "collection" && collection) {
    return client.fetch(
      `*[_type == "product" && coalesce(collection->title, photo->collection->title) == $col] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`,
      { col: collection }
    )
  }
  return client.fetch(`*[_type == "product"] | order(_createdAt desc) { ${PRODUCT_FIELDS} }`)
}

// Stock is available if at least one format has stock > 0 (or no formats defined = assume available)
function isAvailable(product: any): boolean {
  if (!product.formats?.length) return true
  return product.formats.some((f: any) => (f.stock ?? 1) > 0)
}

// Starting price: lowest price across formats, or root price field
function startingPrice(product: any): number | null {
  if (product.formats?.length) {
    const prices = product.formats.map((f: any) => f.price).filter(Boolean)
    if (prices.length) return Math.min(...prices)
  }
  return product.price ?? null
}

export default async function ProductsBlock(props: any) {
  const {
    title, intro,
    layout = "grid", columns = 4,
    showPrice = true, showDescription = false, showButton = true,
    buttonLabel = "Voir le tirage",
    background = "dark",
  } = props

  const items = await resolveProducts(props)
  const bg = background === "light" ? "var(--color-surface)" : "var(--color-bg)"

  const colClass: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 sm:grid-cols-2",
    3: "grid-cols-1 sm:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 lg:grid-cols-4",
    5: "grid-cols-2 lg:grid-cols-5",
    6: "grid-cols-3 lg:grid-cols-6",
  }

  return (
    <section className="py-24 px-6" style={{ background: bg }}>
      <div className="max-w-7xl mx-auto">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-4" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
        )}
        {intro && (
          <p className="mb-14 max-w-2xl" style={{ color: "var(--color-muted)" }}>{intro}</p>
        )}

        {items.length === 0 ? (
          <div className="py-20 text-center border" style={{ borderColor: "var(--color-border)", color: "var(--color-muted)" }}>
            <p className="text-lg mb-2">Aucun produit disponible pour le moment.</p>
            <p className="text-sm">Ajoutez des produits dans Sanity Studio → Documents → Produits.</p>
          </div>
        ) : (
          <>
            {(layout === "grid" || layout === "carousel") && (
              <div
                className={layout === "grid" ? `grid ${colClass[columns] || colClass[4]} gap-6` : "flex overflow-x-auto gap-6 pb-4 snap-x snap-mandatory"}
                style={layout === "carousel" ? { scrollbarWidth: "thin", scrollbarColor: "var(--color-accent) transparent" } : undefined}
              >
                {items.map((p: any) => (
                  <div key={p._id} className={layout === "carousel" ? "flex-shrink-0 snap-center" : ""} style={layout === "carousel" ? { width: 280 } : undefined}>
                    <ProductCard
                      product={p}
                      showPrice={showPrice}
                      showDescription={showDescription}
                      showButton={showButton}
                      buttonLabel={buttonLabel}
                    />
                  </div>
                ))}
              </div>
            )}

            {layout === "featured" && (
              <div className="space-y-20">
                {items.map((p: any, i: number) => (
                  <FeaturedProduct key={p._id} product={p} reverse={i % 2 === 1} showPrice={showPrice} showButton={showButton} buttonLabel={buttonLabel} />
                ))}
              </div>
            )}

            {layout === "list" && (
              <div className="space-y-4">
                {items.map((p: any) => (
                  <ListProduct key={p._id} product={p} showPrice={showPrice} showButton={showButton} buttonLabel={buttonLabel} />
                ))}
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}

// ─── Card grid ────────────────────────────────────────────────────────────────
function ProductCard({ product, showPrice, showDescription, showButton, buttonLabel }: any) {
  const available = isAvailable(product)
  const price = startingPrice(product)
  const currency = product.currency || "EUR"
  const formats = product.formats ?? []

  return (
    <div className="group flex flex-col overflow-hidden" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)" }}>
      {product.image && (
        <div className="relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
          <Image
            src={urlFor(product.image).width(600).quality(90).url()}
            alt={product.title}
            fill
            className="object-cover transition-transform duration-700 group-hover:scale-105"
            sizes="(max-width:640px) 50vw, 25vw"
          />
          {!available && (
            <div className="absolute inset-0 flex items-center justify-center" style={{ background: "rgba(0,0,0,0.6)" }}>
              <span className="text-xs uppercase" style={{ color: "var(--color-muted)", letterSpacing: "0.2em" }}>Épuisé</span>
            </div>
          )}
          {product.edition?.limited && (
            <div className="absolute top-3 left-3 px-2 py-1 text-xs uppercase" style={{ background: "var(--color-accent)", color: "#000", letterSpacing: "0.1em" }}>
              Édition limitée
            </div>
          )}
        </div>
      )}

      <div className="flex flex-col flex-1 p-5">
        <h3 className="text-base font-semibold mb-1" style={{ color: "var(--color-text)" }}>{product.title}</h3>

        {product.collection && (
          <p className="text-xs mb-2" style={{ color: "var(--color-accent)", letterSpacing: "0.1em" }}>{product.collection}</p>
        )}

        {showDescription && product.shortDescription && (
          <p className="text-xs leading-relaxed flex-1 mb-4" style={{ color: "var(--color-muted)" }}>{product.shortDescription}</p>
        )}

        {/* Formats */}
        {formats.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-4">
            {formats.map((f: any, i: number) => (
              <span
                key={i}
                className="text-xs px-2 py-0.5 border"
                style={{
                  borderColor: (f.stock ?? 1) > 0 ? "var(--color-border)" : "transparent",
                  color: (f.stock ?? 1) > 0 ? "var(--color-muted)" : "var(--color-border)",
                  textDecoration: (f.stock ?? 1) === 0 ? "line-through" : "none",
                }}
              >
                {f.name}
              </span>
            ))}
          </div>
        )}

        {product.edition?.limited && product.edition?.number && (
          <p className="text-xs mb-3" style={{ color: "var(--color-muted)" }}>
            {product.edition.number} exemplaires • {product.edition.certificate ? "Certificat inclus" : ""}
          </p>
        )}

        <div className="flex items-center justify-between mt-auto pt-4" style={{ borderTop: "1px solid var(--color-border)" }}>
          {showPrice && price !== null && (
            <p className="font-bold" style={{ color: "var(--color-accent)" }}>
              À partir de {price}{currency === "EUR" ? "€" : currency}
            </p>
          )}
          {showButton && (
            <a
              href={available ? (product.paymentUrl || "/contact") : undefined}
              target={product.paymentUrl ? "_blank" : undefined}
              rel="noopener noreferrer"
              className="text-xs uppercase px-4 py-2 transition-opacity"
              style={{
                background: available ? "var(--color-accent)" : "var(--color-border)",
                color: available ? "#000" : "var(--color-muted)",
                letterSpacing: "0.15em",
                cursor: available ? "pointer" : "not-allowed",
                opacity: available ? 1 : 0.6,
                pointerEvents: available ? "auto" : "none",
              }}
            >
              {buttonLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Featured (alternating) ──────────────────────────────────────────────────
function FeaturedProduct({ product, reverse, showPrice, showButton, buttonLabel }: any) {
  const available = isAvailable(product)
  const price = startingPrice(product)
  const currency = product.currency || "EUR"

  return (
    <div className={`flex flex-col ${reverse ? "md:flex-row-reverse" : "md:flex-row"} gap-12 items-center`}>
      {product.image && (
        <div className="w-full md:w-1/2 relative overflow-hidden" style={{ aspectRatio: "3/4" }}>
          <Image src={urlFor(product.image).width(900).quality(90).url()} alt={product.title} fill className="object-cover" sizes="50vw" />
          {product.edition?.limited && (
            <div className="absolute top-4 left-4 px-3 py-1 text-xs uppercase" style={{ background: "var(--color-accent)", color: "#000", letterSpacing: "0.1em" }}>
              Édition limitée
            </div>
          )}
        </div>
      )}
      <div className="flex-1 space-y-5">
        {product.collection && (
          <p className="text-xs uppercase" style={{ color: "var(--color-accent)", letterSpacing: "0.2em" }}>{product.collection}</p>
        )}
        <h3 className="text-2xl font-bold" style={{ color: "var(--color-text)" }}>{product.title}</h3>
        {product.shortDescription && (
          <p className="leading-relaxed" style={{ color: "var(--color-muted)" }}>{product.shortDescription}</p>
        )}
        {product.formats?.length > 0 && (
          <div>
            <p className="text-xs uppercase mb-2" style={{ color: "var(--color-muted)", letterSpacing: "0.15em" }}>Formats disponibles</p>
            <div className="flex flex-wrap gap-2">
              {product.formats.map((f: any, i: number) => (
                <span key={i} className="text-sm px-3 py-1 border" style={{
                  borderColor: (f.stock ?? 1) > 0 ? "var(--color-border)" : "transparent",
                  color: (f.stock ?? 1) > 0 ? "var(--color-text)" : "var(--color-border)",
                  textDecoration: (f.stock ?? 1) === 0 ? "line-through" : "none",
                }}>
                  {f.name}{f.price ? ` — ${f.price}€` : ""}
                </span>
              ))}
            </div>
          </div>
        )}
        {product.edition?.number && (
          <p className="text-sm" style={{ color: "var(--color-muted)" }}>
            Tirage limité à {product.edition.number} exemplaires
            {product.edition.certificate ? " · Certificat d'authenticité inclus" : ""}
          </p>
        )}
        <div className="flex items-center gap-6 pt-2">
          {showPrice && price !== null && (
            <p className="text-2xl font-bold" style={{ color: "var(--color-accent)" }}>
              À partir de {price}{currency === "EUR" ? "€" : currency}
            </p>
          )}
          {showButton && (
            <a
              href={available ? (product.paymentUrl || "/contact") : undefined}
              className="text-sm uppercase px-8 py-3 font-semibold"
              style={{ background: available ? "var(--color-accent)" : "var(--color-border)", color: available ? "#000" : "var(--color-muted)", letterSpacing: "0.2em" }}
            >
              {buttonLabel}
            </a>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── List ────────────────────────────────────────────────────────────────────
function ListProduct({ product, showPrice, showButton, buttonLabel }: any) {
  const available = isAvailable(product)
  const price = startingPrice(product)
  const currency = product.currency || "EUR"

  return (
    <div className="flex items-center gap-6 p-4" style={{ border: "1px solid var(--color-border)", background: "var(--color-surface)" }}>
      {product.image && (
        <div className="relative flex-shrink-0" style={{ width: 80, height: 80 }}>
          <Image src={urlFor(product.image).width(160).quality(80).url()} alt={product.title} fill className="object-cover" sizes="80px" />
        </div>
      )}
      <div className="flex-1 min-w-0">
        <p className="font-semibold truncate" style={{ color: "var(--color-text)" }}>{product.title}</p>
        {product.shortDescription && (
          <p className="text-sm mt-0.5 truncate" style={{ color: "var(--color-muted)" }}>{product.shortDescription}</p>
        )}
      </div>
      <div className="flex items-center gap-4 flex-shrink-0">
        {showPrice && price !== null && (
          <p className="font-bold" style={{ color: "var(--color-accent)" }}>
            {price}{currency === "EUR" ? "€" : currency}
          </p>
        )}
        {showButton && (
          <a
            href={available ? (product.paymentUrl || "/contact") : undefined}
            className="text-xs uppercase px-4 py-2"
            style={{ background: available ? "var(--color-accent)" : "var(--color-border)", color: available ? "#000" : "var(--color-muted)", letterSpacing: "0.12em" }}
          >
            {buttonLabel}
          </a>
        )}
      </div>
    </div>
  )
}
