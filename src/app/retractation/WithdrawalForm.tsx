"use client"

import { useState } from "react"
import Link from "next/link"

type Step = "form" | "confirm" | "sending" | "done" | "error"

const empty = { name: "", email: "", order: "", orderDate: "", comment: "", company: "" }

const inputStyle: React.CSSProperties = {
  background: "var(--color-bg)",
  border: "1px solid var(--color-border)",
  color: "var(--color-text)",
  padding: "0.75rem 1rem",
  width: "100%",
  fontSize: "0.95rem",
  borderRadius: 8,
}

const labelStyle: React.CSSProperties = { display: "block", fontSize: "0.8rem", color: "var(--color-muted)", marginBottom: 6 }

export default function WithdrawalForm() {
  const [step, setStep] = useState<Step>("form")
  const [form, setForm] = useState(empty)
  const [submittedAt, setSubmittedAt] = useState("")

  function change(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function confirm() {
    setStep("sending")
    try {
      const res = await fetch("/api/withdrawal", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) throw new Error()
      setSubmittedAt(data.submittedAt ?? "")
      setStep("done")
    } catch {
      setStep("error")
    }
  }

  if (step === "done") {
    return (
      <div className="rounded-xl p-8" style={{ background: "var(--color-surface)" }}>
        <h2 className="text-3xl mb-3" style={{ color: "var(--color-text)" }}>Rétractation enregistrée</h2>
        <p style={{ color: "var(--color-muted)" }}>
          Votre déclaration a été transmise{submittedAt ? ` le ${submittedAt}` : ""}. Un accusé de réception reprenant son
          contenu vient de vous être envoyé à <strong style={{ color: "var(--color-text)" }}>{form.email}</strong>.
        </p>
      </div>
    )
  }

  if (step === "confirm" || step === "sending" || step === "error") {
    return (
      <div className="rounded-xl p-8 flex flex-col gap-5" style={{ background: "var(--color-surface)" }}>
        <h2 className="text-3xl" style={{ color: "var(--color-text)" }}>Vérifiez votre déclaration</h2>
        <dl className="grid gap-2 text-sm" style={{ color: "var(--color-muted)" }}>
          <div><dt className="inline">Nom : </dt><dd className="inline" style={{ color: "var(--color-text)" }}>{form.name}</dd></div>
          <div><dt className="inline">E-mail (accusé de réception) : </dt><dd className="inline" style={{ color: "var(--color-text)" }}>{form.email}</dd></div>
          <div><dt className="inline">Commande / contrat : </dt><dd className="inline" style={{ color: "var(--color-text)" }}>{form.order}</dd></div>
          {form.orderDate && <div><dt className="inline">Date de commande : </dt><dd className="inline" style={{ color: "var(--color-text)" }}>{form.orderDate}</dd></div>}
          {form.comment && <div><dt className="inline">Commentaire : </dt><dd className="inline" style={{ color: "var(--color-text)" }}>{form.comment}</dd></div>}
        </dl>
        {step === "error" && (
          <p className="text-sm" style={{ color: "#ef4444" }}>
            L’envoi a échoué. Réessayez, ou écrivez directement à l’adresse indiquée dans les mentions légales.
          </p>
        )}
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={confirm}
            disabled={step === "sending"}
            className="min-h-12 px-7 rounded-full text-sm font-bold uppercase"
            style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.1em" }}
          >
            {step === "sending" ? "Envoi…" : "Confirmer ma rétractation"}
          </button>
          <button
            type="button"
            onClick={() => setStep("form")}
            disabled={step === "sending"}
            className="min-h-12 px-7 rounded-full text-sm uppercase border"
            style={{ borderColor: "var(--color-border)", color: "var(--color-text)", letterSpacing: "0.1em" }}
          >
            Modifier
          </button>
        </div>
      </div>
    )
  }

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault()
        setStep("confirm")
      }}
      className="flex flex-col gap-5"
    >
      <input type="text" name="company" value={form.company} onChange={change} tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px" }} />
      <div className="grid md:grid-cols-2 gap-5">
        <div>
          <label htmlFor="w-name" style={labelStyle}>Nom et prénom *</label>
          <input id="w-name" name="name" required value={form.name} onChange={change} style={inputStyle} autoComplete="name" />
        </div>
        <div>
          <label htmlFor="w-email" style={labelStyle}>E-mail pour l’accusé de réception *</label>
          <input id="w-email" name="email" type="email" required value={form.email} onChange={change} style={inputStyle} autoComplete="email" />
        </div>
      </div>
      <div>
        <label htmlFor="w-order" style={labelStyle}>Commande ou contrat concerné * (ex. titre du tirage et format, ou prestation)</label>
        <input id="w-order" name="order" required value={form.order} onChange={change} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="w-date" style={labelStyle}>Date de la commande</label>
        <input id="w-date" name="orderDate" type="date" value={form.orderDate} onChange={change} style={inputStyle} />
      </div>
      <div>
        <label htmlFor="w-comment" style={labelStyle}>Commentaire (facultatif)</label>
        <textarea id="w-comment" name="comment" rows={3} value={form.comment} onChange={change} style={inputStyle} />
      </div>
      <p className="text-xs" style={{ color: "var(--color-muted)" }}>
        Ces informations servent uniquement à enregistrer votre rétractation et à vous en accuser réception. Voir la{" "}
        <Link href="/confidentialite" style={{ color: "var(--color-accent)", textDecoration: "underline" }}>politique de confidentialité</Link>.
      </p>
      <button
        type="submit"
        className="self-start min-h-12 px-7 rounded-full text-sm font-bold uppercase"
        style={{ background: "var(--color-accent)", color: "var(--color-on-accent)", letterSpacing: "0.1em" }}
      >
        Continuer
      </button>
    </form>
  )
}
