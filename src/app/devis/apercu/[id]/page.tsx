import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { client } from "@/lib/sanity.client"
import { writeClient } from "@/lib/sanity.write"
import { LEGAL } from "@/lib/legal"
import { euro } from "@/lib/quote"
import PrintButton from "./PrintButton"

export const dynamic = "force-dynamic"
export const metadata: Metadata = { title: "Devis", robots: { index: false, follow: false } }

type Line = { _key: string; label?: string; detail?: string; qty?: number; unitPrice?: number }
type Devis = {
  number?: string
  status?: string
  issuedAt?: string
  validUntil?: string
  title?: string
  client?: { name?: string; email?: string; phone?: string; company?: string }
  lines?: Line[]
  message?: string
  accessKey?: string
}

const fmtDate = (d?: string) => (d ? new Date(d + "T12:00:00").toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) : "—")

type Props = { params: Promise<{ id: string }>; searchParams: Promise<{ k?: string }> }

export default async function DevisApercuPage({ params, searchParams }: Props) {
  const [{ id }, { k }] = await Promise.all([params, searchParams])
  if (!k) notFound()
  // Lit la version brouillon si Carlito a modifié le devis dans le Studio
  if (!writeClient) notFound()
  const devis = await writeClient
    .withConfig({ perspective: "drafts" })
    .fetch<Devis | null>(`*[_type == "devis" && _id == $id][0]`, { id: id.replace(/^drafts\./, "") })
  if (!devis || devis.accessKey !== k) notFound()

  const [grid] = await Promise.all([client.fetch<{ paymentTerms?: string } | null>(`*[_id == "priceGrid"][0]{ paymentTerms }`)])
  const lines = devis.lines ?? []
  const total = lines.reduce((s, l) => s + (l.qty ?? 1) * (l.unitPrice ?? 0), 0)

  return (
    <div className="devis-print px-4 pt-28 pb-16" style={{ background: "#e9eef2" }}>
      <div className="no-print max-w-[820px] mx-auto mb-4 flex flex-wrap gap-3 items-center justify-between">
        <p className="text-sm" style={{ color: "#051B2E" }}>
          Aperçu {devis.status === "draft" ? "du brouillon" : "du devis"} — modifiez-le dans le Studio, puis rechargez cette page.
        </p>
        <PrintButton />
      </div>

      <article className="max-w-[820px] mx-auto bg-white shadow-xl" style={{ color: "#111", padding: "48px 52px", fontFamily: "var(--font-body)" }}>
        <header className="flex flex-wrap justify-between gap-6 pb-6" style={{ borderBottom: "3px solid #051B2E" }}>
          <div>
            <p className="font-display text-3xl font-black uppercase" style={{ color: "#051B2E", letterSpacing: "0.04em" }}>
              Carlito Laf <span style={{ color: "#B8945C" }}>Visuel</span>
            </p>
            <p className="text-xs mt-2 leading-relaxed" style={{ color: "#444" }}>
              {LEGAL.ownerName} — {LEGAL.status}
              <br />
              {LEGAL.address}
              <br />
              SIRET {LEGAL.siret} · {LEGAL.phone} · {LEGAL.contactEmail}
            </p>
          </div>
          <div className="text-right">
            <p className="font-display text-4xl font-black uppercase" style={{ color: "#051B2E" }}>Devis</p>
            <p className="text-sm font-semibold">{devis.number}</p>
            <p className="text-xs mt-1" style={{ color: "#444" }}>
              Date : {fmtDate(devis.issuedAt)}
              <br />
              Valable jusqu’au : {fmtDate(devis.validUntil)}
            </p>
          </div>
        </header>

        <section className="grid grid-cols-2 gap-6 py-6 text-sm">
          <div>
            <p className="text-xs uppercase font-bold mb-1" style={{ color: "#666", letterSpacing: "0.1em" }}>Client</p>
            <p className="font-semibold">{devis.client?.name}</p>
            {devis.client?.company && <p>{devis.client.company}</p>}
            <p>{devis.client?.email}</p>
            {devis.client?.phone && <p>{devis.client.phone}</p>}
          </div>
          <div>
            <p className="text-xs uppercase font-bold mb-1" style={{ color: "#666", letterSpacing: "0.1em" }}>Objet</p>
            <p>{devis.title}</p>
          </div>
        </section>

        {devis.message && <p className="text-sm whitespace-pre-line mb-6" style={{ color: "#222" }}>{devis.message}</p>}

        <table className="w-full text-sm" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ background: "#051B2E", color: "#fff" }}>
              <th className="text-left p-2">Désignation</th>
              <th className="text-right p-2 w-16">Qté</th>
              <th className="text-right p-2 w-28">Prix unitaire</th>
              <th className="text-right p-2 w-28">Total</th>
            </tr>
          </thead>
          <tbody>
            {lines.map((l) => (
              <tr key={l._key} style={{ borderBottom: "1px solid #ddd" }}>
                <td className="p-2 align-top">
                  {l.label}
                  {l.detail && <span className="block text-xs" style={{ color: "#666" }}>{l.detail}</span>}
                </td>
                <td className="p-2 text-right align-top">{l.qty ?? 1}</td>
                <td className="p-2 text-right align-top">{euro(l.unitPrice ?? 0)}</td>
                <td className="p-2 text-right align-top">{euro((l.qty ?? 1) * (l.unitPrice ?? 0))}</td>
              </tr>
            ))}
          </tbody>
          <tfoot>
            <tr>
              <td colSpan={3} className="p-2 text-right font-bold">Total net à payer</td>
              <td className="p-2 text-right font-bold" style={{ fontSize: 16 }}>{euro(total)}</td>
            </tr>
          </tfoot>
        </table>
        <p className="text-xs mt-2" style={{ color: "#444" }}>{LEGAL.vat}.</p>

        <section className="mt-8 text-xs leading-relaxed" style={{ color: "#444" }}>
          <p><strong>Conditions de paiement :</strong> {grid?.paymentTerms ?? "Facture à la livraison, payable à réception."}</p>
          <p className="mt-2">
            Devis gratuit. Prestation soumise aux conditions générales de vente consultables sur {LEGAL.website.replace("https://", "")}/cgv.
            Les prises de vue en extérieur peuvent être reportées sans frais en cas de conditions météo ou de sécurité défavorables.
            Les droits d’utilisation des images sont limités à l’usage indiqué au présent devis.
          </p>
        </section>

        <section className="mt-10 grid grid-cols-2 gap-8 text-xs">
          <div />
          <div className="p-4" style={{ border: "1px solid #bbb", minHeight: 110 }}>
            <p className="font-semibold">Bon pour accord</p>
            <p style={{ color: "#666" }}>Date, nom et signature du client précédés de la mention « Bon pour accord »</p>
          </div>
        </section>
      </article>
    </div>
  )
}
