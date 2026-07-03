import { createImageUrlBuilder } from "@sanity/image-url"
import { client } from "./sanity.client"

const builder = createImageUrlBuilder(client)

// Null-object builder: absorbs any chained call and returns "" from .url()
const nullBuilder: any = new Proxy(
  { url: () => "", toString: () => "" },
  {
    get(target, prop) {
      if (prop === "url" || prop === "toString") return target[prop as keyof typeof target]
      return () => nullBuilder
    },
  }
)

export function urlFor(source: any) {
  if (!source?.asset?._ref) return nullBuilder
  return builder.image(source)
}
