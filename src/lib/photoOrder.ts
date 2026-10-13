/**
 * Sorts a collection's photos according to the manual order defined in Sanity
 * (collection.photoOrder, edited by drag & drop in the Studio).
 * Photos missing from the manual order keep their original relative order
 * (upload date) and are placed after the ordered ones.
 */
export function sortByManualOrder<T extends { _id: string }>(photos: T[], order: string[] | null | undefined): T[] {
  if (!order?.length) return photos
  const rank = new Map(order.map((id, i) => [id.replace(/^drafts\./, ""), i]))
  return photos
    .map((p, i) => ({ p, i }))
    .sort((a, b) => {
      const ra = rank.get(a.p._id) ?? Number.MAX_SAFE_INTEGER
      const rb = rank.get(b.p._id) ?? Number.MAX_SAFE_INTEGER
      return ra !== rb ? ra - rb : a.i - b.i
    })
    .map(({ p }) => p)
}
