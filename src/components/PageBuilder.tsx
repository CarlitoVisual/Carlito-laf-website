import Hero from "./blocks/Hero"
import SkillsBentoBlock from "./blocks/SkillsBentoBlock"
import TextBlock from "./blocks/TextBlock"
import Gallery from "./blocks/Gallery"
import VideoBlock from "./blocks/VideoBlock"
import CTABlock from "./blocks/CTABlock"
import ContactBlock from "./blocks/ContactBlock"
import ServicesBlock from "./blocks/ServicesBlock"
import ProductsBlock from "./blocks/ProductsBlock"
import StatsBlock from "./blocks/StatsBlock"
import TestimonialsBlock from "./blocks/TestimonialsBlock"
import QuoteBlock from "./blocks/QuoteBlock"
import ImageBlock from "./blocks/ImageBlock"
import TimelineBlock from "./blocks/TimelineBlock"

type Props = { sections: any[] }

export default function PageBuilder({ sections }: Props) {
  return (
    <>
      {sections?.map((s) => {
        const key = s._key || s._id || Math.random().toString()
        switch (s._type) {
          case "hero":              return <Hero key={key} {...s} />
          case "skillsBentoBlock":  return <SkillsBentoBlock key={key} {...s} />
          case "textBlock":        return <TextBlock key={key} {...s} />
          case "imageBlock":       return <ImageBlock key={key} {...s} />
          case "gallery":          return <Gallery key={key} {...s} />
          case "videoBlock":       return <VideoBlock key={key} {...s} />
          case "servicesBlock":    return <ServicesBlock key={key} {...s} />
          case "productsBlock":    return <ProductsBlock key={key} {...s} />
          case "statsBlock":       return <StatsBlock key={key} {...s} />
          case "testimonialsBlock":return <TestimonialsBlock key={key} {...s} />
          case "quoteBlock":       return <QuoteBlock key={key} {...s} />
          case "ctaBlock":         return <CTABlock key={key} {...s} />
          case "contactBlock":     return <ContactBlock key={key} {...s} />
          case "timelineBlock":    return <TimelineBlock key={key} {...s} />
          default:                 return null
        }
      })}
    </>
  )
}
