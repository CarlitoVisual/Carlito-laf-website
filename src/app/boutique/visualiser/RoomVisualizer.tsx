"use client"

import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import Image from "next/image"
import { urlFor } from "@/lib/image"
import { formatPrice, isFormatAvailable } from "@/lib/shop"
import { printSizeCm, sanityImageAspect } from "@/lib/printSize"
import ProductViewer from "@/components/boutique/ProductViewer"
import type { Product } from "@/types/sanity"

type Pt = { x: number; y: number }
type Room = { url: string; w: number; h: number }
type Frame = "none" | "black" | "white" | "oak"

const FRAMES: { id: Frame; label: string; color: string }[] = [
  { id: "none", label: "Sans cadre", color: "transparent" },
  { id: "black", label: "Noir", color: "#1b1b1b" },
  { id: "white", label: "Blanc", color: "#f2efe9" },
  { id: "oak", label: "Chêne", color: "#b58a5a" },
]
const FRAME_CM = 2.5
const MAT_CM = 6
const DEFAULT_WALL_CM = 350

type Props = { products: Product[]; initialProductId?: string; initialFormat?: string }

/** Déplacement par glisser (souris ou doigt), exprimé en pixels « réels » de la photo de la pièce. */
function useDrag(scale: number, onMove: (dx: number, dy: number) => void) {
  const last = useRef<Pt | null>(null)
  return {
    onPointerDown: (e: React.PointerEvent) => {
      e.preventDefault()
      e.stopPropagation()
      ;(e.currentTarget as HTMLElement).setPointerCapture(e.pointerId)
      last.current = { x: e.clientX, y: e.clientY }
    },
    onPointerMove: (e: React.PointerEvent) => {
      if (!last.current || scale === 0) return
      const dx = (e.clientX - last.current.x) / scale
      const dy = (e.clientY - last.current.y) / scale
      last.current = { x: e.clientX, y: e.clientY }
      onMove(dx, dy)
    },
    onPointerUp: () => {
      last.current = null
    },
    onPointerCancel: () => {
      last.current = null
    },
  }
}

export default function RoomVisualizer({ products, initialProductId, initialFormat }: Props) {
  const [room, setRoom] = useState<Room | null>(null)
  const [productId, setProductId] = useState(
    products.find((p) => p._id === initialProductId)?._id ?? products[0]?._id ?? ""
  )
  const product = products.find((p) => p._id === productId)
  const formats = useMemo(() => (product?.formats ?? []).filter((f) => printSizeCm(f.name, 1)), [product])
  const [formatName, setFormatName] = useState<string | undefined>(
    () => product?.formats?.find((f) => f.name === initialFormat)?.name ?? undefined
  )
  const activeFormat = formats.find((f) => f.name === formatName) ?? formats[formats.length - 1]

  const [frame, setFrame] = useState<Frame>("black")
  const [mat, setMat] = useState(true)
  const [wallCm, setWallCm] = useState(DEFAULT_WALL_CM)
  const [pos, setPos] = useState<Pt>({ x: 0, y: 0 })
  const [calibrating, setCalibrating] = useState(false)
  const [calib, setCalib] = useState<{ a: Pt; b: Pt }>({ a: { x: 0, y: 0 }, b: { x: 0, y: 0 } })
  const [calibCm, setCalibCm] = useState("200")
  const [showOrder, setShowOrder] = useState(false)
  const [exporting, setExporting] = useState(false)
  const [exportError, setExportError] = useState("")

  const stageRef = useRef<HTMLDivElement>(null)
  const [stageW, setStageW] = useState(0)
  const k = room ? stageW / room.w : 0 // pixels écran par pixel de photo

  useEffect(() => {
    const el = stageRef.current
    if (!el) return
    const ro = new ResizeObserver(([entry]) => setStageW(entry.contentRect.width))
    ro.observe(el)
    return () => ro.disconnect()
  }, [room])

  useEffect(() => () => { if (room) URL.revokeObjectURL(room.url) }, [room])

  const loadFile = useCallback((file: File | undefined) => {
    if (!file || !file.type.startsWith("image/")) return
    const url = URL.createObjectURL(file)
    const img = new window.Image()
    img.onload = () => {
      const w = img.naturalWidth
      const h = img.naturalHeight
      setRoom({ url, w, h })
      setWallCm(DEFAULT_WALL_CM)
      setPos({ x: w / 2, y: h * 0.4 })
      setCalib({ a: { x: w * 0.3, y: h * 0.78 }, b: { x: w * 0.7, y: h * 0.78 } })
      setCalibrating(false)
    }
    img.src = url
  }, [])

  // ── Géométrie du tirage (en pixels de la photo) ──
  const aspect = sanityImageAspect(product?.image?.asset?._ref)
  const sizeCm = printSizeCm(activeFormat?.name, aspect)
  const pxPerCm = room ? room.w / wallCm : 0
  const borderCm = (frame === "none" ? 0 : FRAME_CM) + (mat ? MAT_CM : 0)
  const outerW = sizeCm ? (sizeCm.w + 2 * borderCm) * pxPerCm : 0
  const outerH = sizeCm ? (sizeCm.h + 2 * borderCm) * pxPerCm : 0
  const frameColor = FRAMES.find((f) => f.id === frame)!.color
  const printSrc = product?.image ? urlFor(product.image).width(1400).quality(85).url() : ""

  const dragPrint = useDrag(k, (dx, dy) => setPos((p) => ({ x: p.x + dx, y: p.y + dy })))
  const dragA = useDrag(k, (dx, dy) => setCalib((c) => ({ ...c, a: { x: c.a.x + dx, y: c.a.y + dy } })))
  const dragB = useDrag(k, (dx, dy) => setCalib((c) => ({ ...c, b: { x: c.b.x + dx, y: c.b.y + dy } })))

  function applyCalibration() {
    const cm = parseFloat(calibCm.replace(",", "."))
    const dist = Math.hypot(calib.b.x - calib.a.x, calib.b.y - calib.a.y)
    if (!room || !cm || cm <= 0 || dist < 5) return
    setWallCm(Math.round((room.w / dist) * cm))
    setCalibrating(false)
  }

  async function download() {
    if (!room || !sizeCm || !printSrc) return
    setExporting(true)
    setExportError("")
    try {
      const load = (src: string, cors: boolean) =>
        new Promise<HTMLImageElement>((resolve, reject) => {
          const img = new window.Image()
          if (cors) img.crossOrigin = "anonymous"
          img.onload = () => resolve(img)
          img.onerror = reject
          img.src = src
        })
      const [roomImg, printImg] = await Promise.all([load(room.url, false), load(printSrc, true)])
      const out = Math.min(1, 2400 / room.w)
      const canvas = document.createElement("canvas")
      canvas.width = Math.round(room.w * out)
      canvas.height = Math.round(room.h * out)
      const ctx = canvas.getContext("2d")!
      ctx.drawImage(roomImg, 0, 0, canvas.width, canvas.height)

      const s = out
      const ox = (pos.x - outerW / 2) * s
      const oy = (pos.y - outerH / 2) * s
      const ow = outerW * s
      const oh = outerH * s
      const fr = (frame === "none" ? 0 : FRAME_CM) * pxPerCm * s
      const mt = (mat ? MAT_CM : 0) * pxPerCm * s

      ctx.save()
      ctx.shadowColor = "rgba(0,0,0,0.35)"
      ctx.shadowBlur = Math.max(6, ow * 0.03)
      ctx.shadowOffsetY = Math.max(3, ow * 0.012)
      ctx.fillStyle = frame === "none" ? (mat ? "#fbfaf7" : "#000") : frameColor
      ctx.fillRect(ox, oy, ow, oh)
      ctx.restore()
      if (mat) {
        ctx.fillStyle = "#fbfaf7"
        ctx.fillRect(ox + fr, oy + fr, ow - 2 * fr, oh - 2 * fr)
      }
      // Image recadrée « cover » dans la zone du tirage
      const ix = ox + fr + mt
      const iy = oy + fr + mt
      const iw = ow - 2 * (fr + mt)
      const ih = oh - 2 * (fr + mt)
      const srcRatio = printImg.naturalWidth / printImg.naturalHeight
      const dstRatio = iw / ih
      let sw = printImg.naturalWidth
      let sh = printImg.naturalHeight
      if (srcRatio > dstRatio) sw = sh * dstRatio
      else sh = sw / dstRatio
      ctx.drawImage(printImg, (printImg.naturalWidth - sw) / 2, (printImg.naturalHeight - sh) / 2, sw, sh, ix, iy, iw, ih)

      const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, "image/jpeg", 0.9))
      if (!blob) throw new Error("export")
      const a = document.createElement("a")
      a.href = URL.createObjectURL(blob)
      a.download = `carlito-laf-visuel-${product?.title?.toLowerCase().replace(/[^a-z0-9]+/g, "-") ?? "tirage"}.jpg`
      a.click()
      setTimeout(() => URL.revokeObjectURL(a.href), 2000)
    } catch {
      setExportError("Le téléchargement n’a pas fonctionné. Vous pouvez faire une capture d’écran de l’aperçu.")
    } finally {
      setExporting(false)
    }
  }

  const label: React.CSSProperties = { color: "var(--color-muted)", fontSize: "0.7rem", letterSpacing: "0.15em", textTransform: "uppercase", fontWeight: 600, marginBottom: 10 }
  const pill = (active: boolean): React.CSSProperties => ({
    borderRadius: 999,
    padding: "8px 16px",
    fontSize: "0.8rem",
    border: `1px solid ${active ? "var(--color-accent)" : "var(--color-border)"}`,
    background: active ? "var(--color-accent)" : "transparent",
    color: active ? "var(--color-on-accent)" : "var(--color-text)",
    cursor: "pointer",
  })

  if (products.length === 0) {
    return <p className="py-24 text-center" style={{ color: "var(--color-muted)" }}>Aucun tirage disponible pour le moment.</p>
  }

  return (
    <section className="px-6 py-12">
      <div className="max-w-7xl mx-auto flex flex-wrap gap-8 items-start">
        {/* ── Scène ── */}
        <div className="min-w-0" style={{ flex: "999 1 560px" }}>
          {!room ? (
            <label
              className="flex flex-col items-center justify-center gap-4 text-center rounded-xl cursor-pointer"
              style={{ minHeight: 420, border: "2px dashed var(--color-border)", background: "var(--gradient-depth)", padding: 32 }}
              onDragOver={(e) => e.preventDefault()}
              onDrop={(e) => {
                e.preventDefault()
                loadFile(e.dataTransfer.files?.[0])
              }}
            >
              <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="var(--color-accent)" strokeWidth="1.5" aria-hidden="true">
                <path d="M3 7h3l2-3h8l2 3h3v13H3z" /><circle cx="12" cy="13" r="4" />
              </svg>
              <span className="text-3xl font-display uppercase font-black" style={{ color: "var(--color-text)" }}>Photo de votre pièce</span>
              <span className="text-sm max-w-md" style={{ color: "var(--color-muted)" }}>
                Photographiez votre mur de face, bien éclairé, en reculant pour voir un meuble ou une porte. Touchez ici pour
                choisir ou prendre une photo, ou glissez-la dans ce cadre.
              </span>
              <span className="inline-flex items-center min-h-12 px-7 rounded-full text-sm font-bold uppercase" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.1em" }}>
                Importer une photo
              </span>
              <input type="file" accept="image/*" className="sr-only" onChange={(e) => loadFile(e.target.files?.[0])} />
            </label>
          ) : (
            <div className="flex flex-col gap-3">
              <div ref={stageRef} className="relative w-full overflow-hidden rounded-xl select-none" style={{ touchAction: "none", background: "#000" }}>
                {/* eslint-disable-next-line @next/next/no-img-element -- photo locale (blob:), non optimisable */}
                <img src={room.url} alt="Votre pièce" className="block w-full h-auto" draggable={false} />

                {sizeCm && k > 0 && (
                  <div
                    {...dragPrint}
                    role="img"
                    aria-label={`${product?.title} en ${activeFormat?.name} cm`}
                    className="absolute cursor-grab active:cursor-grabbing"
                    style={{
                      left: (pos.x - outerW / 2) * k,
                      top: (pos.y - outerH / 2) * k,
                      width: outerW * k,
                      height: outerH * k,
                      background: frame === "none" ? "transparent" : frameColor,
                      padding: (frame === "none" ? 0 : FRAME_CM) * pxPerCm * k,
                      boxShadow: "0 6px 18px rgba(0,0,0,0.35), 0 2px 4px rgba(0,0,0,0.25)",
                      touchAction: "none",
                    }}
                  >
                    <div style={{ width: "100%", height: "100%", background: mat ? "#fbfaf7" : "transparent", padding: (mat ? MAT_CM : 0) * pxPerCm * k }}>
                      <div style={{ width: "100%", height: "100%", backgroundImage: `url(${printSrc})`, backgroundSize: "cover", backgroundPosition: "center" }} />
                    </div>
                  </div>
                )}

                {calibrating && k > 0 && (
                  <>
                    <svg className="absolute inset-0 w-full h-full pointer-events-none" aria-hidden="true">
                      <line x1={calib.a.x * k} y1={calib.a.y * k} x2={calib.b.x * k} y2={calib.b.y * k} stroke="var(--color-data)" strokeWidth="3" strokeDasharray="8 6" />
                    </svg>
                    {[{ p: calib.a, d: dragA, n: "début" }, { p: calib.b, d: dragB, n: "fin" }].map(({ p, d, n }) => (
                      <button
                        key={n}
                        type="button"
                        {...d}
                        aria-label={`Déplacer le repère de ${n}`}
                        className="absolute rounded-full"
                        style={{ left: p.x * k - 14, top: p.y * k - 14, width: 28, height: 28, background: "var(--color-data)", border: "3px solid #fff", touchAction: "none", cursor: "grab" }}
                      />
                    ))}
                  </>
                )}
              </div>
              <p className="text-xs" style={{ color: "var(--color-muted)" }}>
                Faites glisser le tirage pour le placer. Aperçu indicatif : couleurs et perspective peuvent varier selon votre photo.
              </p>
            </div>
          )}
        </div>

        {/* ── Réglages ── */}
        <aside className="min-w-0 flex flex-col gap-7" style={{ flex: "1 1 320px" }}>
          <div>
            <p style={label}>1. Tirage</p>
            <div className="grid grid-cols-4 gap-2">
              {products.map((p) => (
                <button
                  key={p._id}
                  type="button"
                  onClick={() => { setProductId(p._id); setFormatName(undefined) }}
                  aria-pressed={p._id === productId}
                  title={p.title}
                  className="relative overflow-hidden rounded-md"
                  style={{ aspectRatio: "1", outline: p._id === productId ? "2px solid var(--color-accent)" : "1px solid var(--color-border)", outlineOffset: 2 }}
                >
                  {p.image && <Image src={urlFor(p.image).width(200).height(200).url()} alt={p.title} fill sizes="80px" className="object-cover" />}
                </button>
              ))}
            </div>
            {product && <p className="mt-3 text-sm" style={{ color: "var(--color-text)" }}>{product.title}{product.collection ? ` · ${product.collection}` : ""}</p>}
          </div>

          {formats.length > 0 && (
            <div>
              <p style={label}>2. Format</p>
              <div className="flex flex-wrap gap-2">
                {formats.map((f) => (
                  <button key={f.name} type="button" onClick={() => setFormatName(f.name)} style={pill(f.name === activeFormat?.name)} disabled={!isFormatAvailable(f)}>
                    {f.name} cm{f.price ? ` · ${formatPrice(f.price, product?.currency || "EUR")}` : ""}
                  </button>
                ))}
              </div>
            </div>
          )}

          <div>
            <p style={label}>3. Finition</p>
            <div className="flex flex-wrap gap-2 mb-3">
              {FRAMES.map((f) => (
                <button key={f.id} type="button" onClick={() => setFrame(f.id)} style={pill(frame === f.id)}>{f.label}</button>
              ))}
            </div>
            <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
              <input type="checkbox" checked={mat} onChange={(e) => setMat(e.target.checked)} style={{ accentColor: "var(--color-accent)", width: 18, height: 18 }} />
              Passe-partout blanc ({MAT_CM} cm)
            </label>
          </div>

          {room && (
            <div>
              <p style={label}>4. Échelle</p>
              <label htmlFor="wall" className="text-sm block mb-2" style={{ color: "var(--color-text)" }}>
                Largeur visible sur la photo : <strong>{(wallCm / 100).toLocaleString("fr-FR")} m</strong>
              </label>
              <input id="wall" type="range" min={100} max={1000} step={10} value={wallCm} onChange={(e) => setWallCm(Number(e.target.value))} className="w-full" style={{ accentColor: "var(--color-accent)" }} />
              {!calibrating ? (
                <button type="button" onClick={() => setCalibrating(true)} className="mt-3 text-sm underline" style={{ color: "var(--color-accent)" }}>
                  Mesurer avec un objet de référence (plus précis)
                </button>
              ) : (
                <div className="mt-3 p-4 rounded-lg flex flex-col gap-3" style={{ background: "var(--color-surface)" }}>
                  <p className="text-sm" style={{ color: "var(--color-muted)" }}>
                    Placez les deux repères aux extrémités d’un objet dont vous connaissez la longueur (canapé, porte, buffet…), puis indiquez-la.
                  </p>
                  <label className="flex items-center gap-2 text-sm" style={{ color: "var(--color-text)" }}>
                    Longueur réelle
                    <input type="number" min={10} inputMode="decimal" value={calibCm} onChange={(e) => setCalibCm(e.target.value)} className="w-24 px-3 py-2 rounded-md" style={{ background: "var(--color-bg)", border: "1px solid var(--color-border)", color: "var(--color-text)" }} />
                    cm
                  </label>
                  <div className="flex gap-2">
                    <button type="button" onClick={applyCalibration} style={pill(true)}>Valider</button>
                    <button type="button" onClick={() => setCalibrating(false)} style={pill(false)}>Annuler</button>
                  </div>
                </div>
              )}
            </div>
          )}

          <div className="flex flex-col gap-3 pt-2" style={{ borderTop: "1px solid var(--color-border)" }}>
            {room && (
              <button type="button" onClick={download} disabled={exporting} className="min-h-12 rounded-full text-sm font-bold uppercase border" style={{ borderColor: "var(--color-accent)", color: "var(--color-accent)", letterSpacing: "0.1em" }}>
                {exporting ? "Préparation…" : "Télécharger l’aperçu"}
              </button>
            )}
            {exportError && <p className="text-xs" style={{ color: "#ef4444" }}>{exportError}</p>}
            {product && (
              <button type="button" onClick={() => setShowOrder(true)} className="min-h-12 rounded-full text-sm font-bold uppercase" style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.1em" }}>
                Commander ce tirage
              </button>
            )}
            {room && (
              <label className="text-center text-sm underline cursor-pointer" style={{ color: "var(--color-muted)" }}>
                Changer de photo
                <input type="file" accept="image/*" className="sr-only" onChange={(e) => loadFile(e.target.files?.[0])} />
              </label>
            )}
          </div>
        </aside>
      </div>

      {showOrder && product && <ProductViewer product={product} initialFormatName={activeFormat?.name} hideVisualizerLink onClose={() => setShowOrder(false)} />}
    </section>
  )
}
