"use client"

import Image from "next/image"
import { useState, useRef, useEffect, useCallback } from "react"
import { urlFor } from "@/lib/image"
import Lightbox from "@/components/Lightbox"

export default function Gallery(props: any) {
  const {
    title,
    intro,
    items = [],
    layout = "masonry",
    columns = 3,
    gap = 16,
    aspectRatio = "auto",
    lightbox = true,
    showCaptions = true,
    animation = "zoom",
  } = props

  const [selected, setSelected] = useState<any>(null)

  const aspectStyle = getAspectStyle(aspectRatio)

  const colClass: Record<number, string> = {
    1: "grid-cols-1",
    2: "grid-cols-1 md:grid-cols-2",
    3: "grid-cols-1 md:grid-cols-2 lg:grid-cols-3",
    4: "grid-cols-2 md:grid-cols-4",
    5: "grid-cols-2 md:grid-cols-3 lg:grid-cols-5",
    6: "grid-cols-3 md:grid-cols-6",
  }

  function open(item: any) {
    if (lightbox) setSelected(item)
  }

  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-6">
        {title && (
          <h2 className="text-3xl md:text-4xl font-bold mb-3" style={{ color: "var(--color-text)" }}>
            {title}
          </h2>
        )}
        {intro && (
          <p className="mb-10" style={{ color: "var(--color-muted)" }}>
            {intro}
          </p>
        )}

        {layout === "masonry" && (
          <MasonryLayout items={items} columns={columns} gap={gap} showCaptions={showCaptions} animation={animation} onOpen={open} />
        )}

        {layout === "grid" && (
          <div className={`grid ${colClass[columns] || colClass[3]}`} style={{ gap: `${gap}px` }}>
            {items.map((item: any, i: number) => (
              <FilledCard
                key={item._id || i}
                item={item}
                aspectStyle={aspectRatio !== "auto" ? aspectStyle : { aspectRatio: "4/3" }}
                showCaptions={showCaptions}
                animation={animation}
                onClick={() => open(item)}
              />
            ))}
          </div>
        )}

        {layout === "horizontal" && (
          <HorizontalLayout items={items} gap={gap} aspectStyle={aspectStyle} showCaptions={showCaptions} animation={animation} onOpen={open} />
        )}

        {layout === "carousel" && (
          <CarouselLayout items={items} showCaptions={showCaptions} animation={animation} lightbox={lightbox} onOpen={open} />
        )}

        {layout === "fullscreen" && (
          <div className="space-y-4">
            {items.map((item: any, i: number) => (
              <FilledCard
                key={i}
                item={item}
                aspectStyle={{ aspectRatio: "16/9" }}
                showCaptions={showCaptions}
                animation={animation}
                onClick={() => open(item)}
              />
            ))}
          </div>
        )}
      </div>

      {selected && <Lightbox item={selected} onClose={() => setSelected(null)} />}
    </section>
  )
}

// ─── Masonry ─────────────────────────────────────────────────────────────────
function MasonryLayout({ items, columns, gap, showCaptions, animation, onOpen }: any) {
  const colClass: Record<number, string> = {
    1: "columns-1",
    2: "columns-1 md:columns-2",
    3: "columns-1 md:columns-2 lg:columns-3",
    4: "columns-2 md:columns-4",
  }
  return (
    <div className={colClass[columns] || "columns-1 md:columns-2 lg:columns-3"} style={{ columnGap: `${gap}px` }}>
      {items.map((item: any, i: number) => (
        <div key={item._id || i} className="mb-4 break-inside-avoid">
          <NaturalCard item={item} showCaptions={showCaptions} animation={animation} onClick={() => onOpen(item)} />
        </div>
      ))}
    </div>
  )
}

// ─── Horizontal scroll ───────────────────────────────────────────────────────
function HorizontalLayout({ items, gap, aspectStyle, showCaptions, animation, onOpen }: any) {
  const cardAspect = aspectStyle?.aspectRatio ? aspectStyle : { aspectRatio: "4/3" }
  return (
    <div
      className="flex overflow-x-auto pb-4 snap-x snap-mandatory"
      style={{ gap: `${gap}px`, scrollbarWidth: "thin", scrollbarColor: "var(--color-accent) transparent" }}
    >
      {items.map((item: any, i: number) => (
        <div key={item._id || i} className="flex-shrink-0 snap-center" style={{ width: 320 }}>
          <FilledCard
            item={item}
            aspectStyle={cardAspect}
            showCaptions={showCaptions}
            animation={animation}
            onClick={() => onOpen(item)}
          />
        </div>
      ))}
    </div>
  )
}

// ─── Carousel ────────────────────────────────────────────────────────────────
function CarouselLayout({ items, showCaptions, animation, lightbox, onOpen }: any) {
  const [current, setCurrent] = useState(0)
  const [dragging, setDragging] = useState(false)
  const dragStart = useRef(0)
  const total = items.length

  const prev = useCallback(() => setCurrent((c) => (c - 1 + total) % total), [total])
  const next = useCallback(() => setCurrent((c) => (c + 1) % total), [total])

  // Keyboard navigation
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "ArrowLeft") prev()
      if (e.key === "ArrowRight") next()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [prev, next])

  // Touch/drag support
  function onPointerDown(e: React.PointerEvent) {
    dragStart.current = e.clientX
    setDragging(true)
  }
  function onPointerUp(e: React.PointerEvent) {
    if (!dragging) return
    const delta = dragStart.current - e.clientX
    if (delta > 50) next()
    else if (delta < -50) prev()
    setDragging(false)
  }

  const item = items[current]
  if (!item?.image) return null

  return (
    <div className="relative select-none">
      {/* Main image */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "16/9", background: "var(--color-surface)", cursor: dragging ? "grabbing" : "grab" }}
        onPointerDown={onPointerDown}
        onPointerUp={onPointerUp}
        onPointerLeave={() => setDragging(false)}
        onClick={() => { if (!dragging) onOpen(item) }}
      >
        {items.map((it: any, i: number) => (
          <div
            key={it._id || i}
            className="absolute inset-0 transition-opacity duration-500"
            style={{ opacity: i === current ? 1 : 0, pointerEvents: i === current ? "auto" : "none" }}
          >
            {it.image && (
              <Image
                src={urlFor(it.image).width(1600).quality(90).url()}
                alt={it.alt || it.title || ""}
                fill
                className="object-cover"
                sizes="100vw"
                priority={i === 0}
              />
            )}
          </div>
        ))}

        {/* Caption */}
        {showCaptions && item.title && (
          <div
            className="absolute bottom-0 left-0 right-0 p-4 pointer-events-none"
            style={{ background: "linear-gradient(to top, rgba(0,0,0,0.65), transparent)" }}
          >
            <p className="text-white text-sm">{item.title}</p>
          </div>
        )}

        {/* Prev / Next buttons */}
        <button
          onClick={(e) => { e.stopPropagation(); prev() }}
          className="absolute left-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all"
          style={{ background: "rgba(0,0,0,0.45)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          ‹
        </button>
        <button
          onClick={(e) => { e.stopPropagation(); next() }}
          className="absolute right-4 top-1/2 -translate-y-1/2 w-10 h-10 flex items-center justify-center transition-all"
          style={{ background: "rgba(0,0,0,0.45)", color: "#fff", border: "1px solid rgba(255,255,255,0.2)" }}
        >
          ›
        </button>
      </div>

      {/* Dot indicators */}
      <div className="flex justify-center gap-2 mt-4">
        {items.map((_: any, i: number) => (
          <button
            key={i}
            onClick={() => setCurrent(i)}
            className="transition-all duration-300"
            style={{
              width: i === current ? 24 : 8,
              height: 8,
              borderRadius: 4,
              background: i === current ? "var(--color-accent)" : "var(--color-border)",
            }}
          />
        ))}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex gap-2 mt-4 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
          {items.map((it: any, i: number) => (
            <button
              key={i}
              onClick={() => setCurrent(i)}
              className="flex-shrink-0 relative overflow-hidden transition-all duration-200"
              style={{
                width: 80,
                height: 54,
                outline: i === current ? "2px solid var(--color-accent)" : "2px solid transparent",
                outlineOffset: 2,
                opacity: i === current ? 1 : 0.5,
              }}
            >
              {it.image && (
                <Image
                  src={urlFor(it.image).width(160).quality(70).url()}
                  alt={it.title || ""}
                  fill
                  className="object-cover"
                  sizes="80px"
                />
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ─── Shared card components ──────────────────────────────────────────────────

function NaturalCard({ item, showCaptions, animation, onClick }: any) {
  if (!item?.image) return null
  const { w, h } = getDimensions(item.image)
  return (
    <div
      className="relative overflow-hidden cursor-pointer group"
      onClick={onClick}
      style={{ background: "var(--color-surface)" }}
    >
      <Image
        src={urlFor(item.image).width(1200).quality(88).url()}
        alt={item.alt || item.title || ""}
        width={w}
        height={h}
        style={{ width: "100%", height: "auto", display: "block" }}
        className={`transition duration-700 ${animation === "zoom" ? "group-hover:scale-105" : ""}`}
        sizes="(max-width:768px) 100vw, (max-width:1200px) 50vw, 33vw"
      />
      {showCaptions && item.title && <Caption title={item.title} />}
    </div>
  )
}

function FilledCard({ item, aspectStyle, showCaptions, animation, onClick }: any) {
  if (!item?.image) return null
  return (
    <div
      className="relative overflow-hidden cursor-pointer group"
      onClick={onClick}
      style={{ background: "var(--color-surface)", ...aspectStyle }}
    >
      <Image
        src={urlFor(item.image).width(1200).quality(88).url()}
        alt={item.alt || item.title || ""}
        fill
        sizes="(max-width:768px) 100vw, 33vw"
        className={`object-cover transition duration-700 ${animation === "zoom" ? "group-hover:scale-105" : ""}`}
      />
      {showCaptions && item.title && <Caption title={item.title} />}
    </div>
  )
}

function Caption({ title }: { title: string }) {
  return (
    <div
      className="absolute bottom-0 left-0 right-0 p-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
      style={{ background: "linear-gradient(to top, rgba(0,0,0,0.7), transparent)" }}
    >
      <p className="text-sm text-white">{title}</p>
    </div>
  )
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function getAspectStyle(ratio: string): React.CSSProperties {
  const map: Record<string, string> = {
    square: "1/1",
    landscape: "16/9",
    portrait: "3/4",
    auto: "4/3",
  }
  return { aspectRatio: map[ratio] || "4/3" }
}

function getDimensions(image: any): { w: number; h: number } {
  const ref: string = image?.asset?._ref ?? ""
  const match = ref.match(/-(\d+)x(\d+)-/)
  if (match) return { w: parseInt(match[1]), h: parseInt(match[2]) }
  return { w: 1200, h: 800 }
}
