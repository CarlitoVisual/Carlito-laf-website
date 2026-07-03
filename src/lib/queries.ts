const PRODUCT_FIELDS = `_id, title, shortDescription, "image": coalesce(image, photo->image), price, currency, formats[]{ name, price, stock }, edition, featured, "collection": coalesce(collection->title, photo->collection->title), paymentUrl`
const SERVICE_FIELDS = `_id, title, "slug": slug.current, category, shortDescription, coverImage, price, currency, priceType, deliverables, featured`
const TESTIMONIAL_FIELDS = `_id, name, role, company, quote, avatar, rating`

export const pageQuery = `
*[_type == "page" && slug.current == $slug][0] {
  title,
  seo,
  sections[] {
    ...,

    _type == "hero" => {
      ...,
      image,
      videoFile { asset->{ url } },
      videoPoster,
      buttons[] { ..., link }
    },

    _type == "skillsBentoBlock" => {
      ...,
      tiles[] { _key, keyword, image, href, width, height }
    },

    _type == "gallery" => {
      ...,
      items[]-> {
        _id, _type, title, alt, image, videoType, url
      }
    },

    _type == "textBlock" => {
      ...,
      image
    },

    _type == "imageBlock" => {
      ...,
      image
    },

    _type == "videoBlock" => {
      ...
    },

    _type == "servicesBlock" => {
      ...,
      items[]-> { ${SERVICE_FIELDS} }
    },

    _type == "productsBlock" => {
      ...,
      products[]-> { ${PRODUCT_FIELDS} }
    },

    _type == "statsBlock" => {
      ...,
      items[] { label, value, suffix }
    },

    _type == "testimonialsBlock" => {
      ...,
      items[]-> { ${TESTIMONIAL_FIELDS} }
    },

    _type == "quoteBlock" => {
      ...
    },

    _type == "ctaBlock" => {
      ...,
      buttons[] { ..., link }
    },

    _type == "contactBlock" => {
      ...
    },

    _type == "timelineBlock" => {
      ...,
      items[] { year, title, description }
    }
  }
}
`

export const allSlugsQuery = `
*[_type == "page" && defined(slug.current)] {
  "slug": slug.current
}
`
