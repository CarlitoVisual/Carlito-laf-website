/** "Ocean Collection 2022" → "ocean-collection-2022" */
export function slugifyCollection(name: string): string {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
}

/** Reverse: find collection name from slug among known collections */
export function matchCollection(slug: string, collections: string[]): string | undefined {
  return collections.find((c) => slugifyCollection(c) === slug)
}

export function formatPrice(price: number, currency = "EUR"): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency }).format(price)
}

export function isFormatAvailable(format: { stock?: number }): boolean {
  return (format.stock ?? 1) > 0
}

export function startingPrice(product: any): number | null {
  if (product.formats?.length) {
    const prices = product.formats
      .filter((f: any) => isFormatAvailable(f) && f.price)
      .map((f: any) => f.price as number)
    if (prices.length) return Math.min(...prices)
  }
  return product.price ?? null
}

export function isProductAvailable(product: any): boolean {
  if (!product.formats?.length) return true
  return product.formats.some((f: any) => isFormatAvailable(f))
}
