import type { PortableTextBlock } from "next-sanity"

export type { PortableTextBlock }

// ─── Primitives ──────────────────────────────────────────────────────────────

export interface SanityImage {
  _type?: "image"
  _key?: string
  asset?: { _ref?: string; _id?: string; url?: string }
  hotspot?: { x: number; y: number; height: number; width: number }
  crop?: { top: number; bottom: number; left: number; right: number }
  alt?: string
}

export interface SanityFile {
  asset?: { url?: string }
}

export interface SanityLink {
  href?: string
  internalReference?: unknown
  openInNewTab?: boolean
}

export interface CTAButton {
  _key?: string
  label?: string
  url?: string
  link?: SanityLink
  style?: string
}

// ─── Documents ───────────────────────────────────────────────────────────────

export interface ProductFormat {
  name: string
  price?: number
  stock?: number
}

export interface ProductEdition {
  limited?: boolean
  number?: number
  certificate?: boolean
}

export interface Product {
  _id: string
  title: string
  shortDescription?: string
  image?: SanityImage
  gallery?: SanityImage[]
  price?: number
  currency?: string
  formats?: ProductFormat[]
  edition?: ProductEdition
  featured?: boolean
  collection?: string
  paymentUrl?: string
}

export interface Service {
  _id: string
  title: string
  slug?: string
  category?: string
  shortDescription?: string
  coverImage?: SanityImage
  price?: number
  currency?: string
  priceType?: string
  deliverables?: string[]
  featured?: boolean
}

export interface Testimonial {
  _id?: string
  name?: string
  role?: string
  company?: string
  quote?: string
  avatar?: SanityImage
  rating?: number
}

export interface GalleryItem {
  _id?: string
  _type?: string
  title?: string
  alt?: string
  image?: SanityImage
  videoType?: string
  url?: string
}

// ─── Page builder blocks ─────────────────────────────────────────────────────

interface BlockBase {
  _key?: string
  _id?: string
}

export interface HeroBlock extends BlockBase {
  _type: "hero"
  title?: string
  eyebrow?: string
  subtitle?: string
  image?: SanityImage
  overlay?: number
  height?: string
  alignment?: string
  buttons?: CTAButton[]
}

export interface SkillsBentoTile {
  _key: string
  keyword: string
  image?: SanityImage
  href?: string
  width?: number
  height?: number
}

export interface SkillsBentoBlock extends BlockBase {
  _type: "skillsBentoBlock"
  eyebrow?: string
  title?: string
  tiles?: SkillsBentoTile[]
}

export interface TextBlock extends BlockBase {
  _type: "textBlock"
  title?: string
  subtitle?: string
  content?: PortableTextBlock[]
  layout?: string
  alignment?: string
  image?: SanityImage
  imagePosition?: string
}

export interface ImageBlock extends BlockBase {
  _type: "imageBlock"
  image?: SanityImage
  caption?: string
  credit?: string
  size?: string
  aspectRatio?: string
  display?: string
  overlay?: boolean
  overlayText?: string
  link?: SanityLink
}

export interface GalleryBlock extends BlockBase {
  _type: "gallery"
  title?: string
  intro?: string
  items?: GalleryItem[]
  layout?: string
  columns?: number
  gap?: number
  aspectRatio?: string
  lightbox?: boolean
  showCaptions?: boolean
  animation?: string
}

export interface VideoBlock extends BlockBase {
  _type: "videoBlock"
  title?: string
  url?: string
  file?: SanityFile
  display?: string
  autoplay?: boolean
  loop?: boolean
  muted?: boolean
  controls?: boolean
  overlay?: boolean
  overlayTitle?: string
  overlayText?: string
  button?: CTAButton
  caption?: string
}

export interface ServicesBlock extends BlockBase {
  _type: "servicesBlock"
  title?: string
  intro?: string
  layout?: string
  buttonLabel?: string
  displayMode?: string
  items?: Service[]
}

export interface ProductsBlock extends BlockBase {
  _type: "productsBlock"
  title?: string
  intro?: string
  layout?: string
  displayMode?: string
  collection?: string
  products?: Product[]
  showPrice?: boolean
  showDescription?: boolean
  showButton?: boolean
  buttonLabel?: string
  columns?: number
  background?: string
}

export interface StatsBlock extends BlockBase {
  _type: "statsBlock"
  title?: string
  items?: { label?: string; value?: string | number; suffix?: string }[]
}

export interface TestimonialsBlock extends BlockBase {
  _type: "testimonialsBlock"
  title?: string
  items?: Testimonial[]
}

export interface QuoteBlock extends BlockBase {
  _type: "quoteBlock"
  quote?: string
  author?: string
  role?: string
}

export interface CTABlock extends BlockBase {
  _type: "ctaBlock"
  eyebrow?: string
  title?: string
  description?: string
  buttons?: CTAButton[]
}

export interface ContactBlock extends BlockBase {
  _type: "contactBlock"
  title?: string
  intro?: string
  formType?: string
}

export interface TimelineBlock extends BlockBase {
  _type: "timelineBlock"
  title?: string
  items?: { year?: string; title?: string; description?: string }[]
}

export type PageSection =
  | HeroBlock
  | SkillsBentoBlock
  | TextBlock
  | ImageBlock
  | GalleryBlock
  | VideoBlock
  | ServicesBlock
  | ProductsBlock
  | StatsBlock
  | TestimonialsBlock
  | QuoteBlock
  | CTABlock
  | ContactBlock
  | TimelineBlock

/** Props received by a block component (the `_type` discriminator is not needed inside the block). */
export type BlockProps<T extends { _type: string }> = Omit<T, "_type">
