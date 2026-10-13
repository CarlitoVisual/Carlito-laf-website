import { createImageUrlBuilder, type ImageUrlBuilder, type SanityImageSource } from "@sanity/image-url"
import { client } from "./sanity.client"
import type { SanityImage } from "@/types/sanity"

const builder = createImageUrlBuilder(client)

// Null-object builder: absorbs any chained call and returns "" from .url()
const nullBuilder: ImageUrlBuilder = new Proxy(
  { url: () => "", toString: () => "" },
  {
    get(target, prop) {
      if (prop === "url" || prop === "toString") return target[prop as keyof typeof target]
      return () => nullBuilder
    },
  }
) as unknown as ImageUrlBuilder

export function urlFor(source: SanityImage | null | undefined): ImageUrlBuilder {
  if (!source?.asset?._ref) return nullBuilder
  return builder.image(source as SanityImageSource)
}
