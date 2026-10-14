"use client"

import { useState } from "react"
import type { BlockProps, ContactBlock as ContactBlockData } from "@/types/sanity"
import FormPrivacyNotice from "@/components/legal/FormPrivacyNotice"
import { SERVICE_LABELS, type ServiceKey } from "@/lib/quote"

const DURATIONS = [
  { key: "1h", label: "1 heure" },
  { key: "2h", label: "2 heures" },
  { key: "half", label: "Demi-journée (≈ 4 h)" },
  { key: "day", label: "Journée (≈ 8 h)" },
  { key: "week", label: "Plusieurs jours / semaine" },
]
const SHOOT_SERVICES: ServiceKey[] = ["photo", "video", "drone", "actionCam"]
const POST_SERVICES: ServiceKey[] = ["clipSocial", "filmCourt", "filmAventure", "retoucheAvancee"]

export default function ContactBlock(props: BlockProps<ContactBlockData>) {
  const isDevis = props.formType === "devis"

  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    projectType: "",
    location: "",
    date: "",
    budget: "",
    message: "",
    company: "",
    duration: "",
    usage: "private",
    express: false,
  })
  const [services, setServices] = useState<ServiceKey[]>(["photo"])

  function toggleService(k: ServiceKey) {
    setServices((list) => (list.includes(k) ? list.filter((x) => x !== k) : [...list, k]))
  }
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  )

  function handleChange(
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) {
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }))
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setStatus("sending")
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, services, isDevis }),
      })
      if (!res.ok) throw new Error()
      setStatus("sent")
    } catch {
      setStatus("error")
    }
  }

  const fieldStyle = {
    background: "var(--color-bg)",
    border: "1px solid var(--color-border)",
    color: "var(--color-text)",
    padding: "0.75rem 1rem",
    width: "100%",
    fontSize: "0.875rem",
    outline: "none",
  }

  const labelStyle = {
    display: "block",
    fontSize: "0.7rem",
    textTransform: "uppercase" as const,
    letterSpacing: "0.15em",
    color: "var(--color-muted)",
    marginBottom: "0.4rem",
  }

  return (
    <section className="py-24 px-6">
      <div className="max-w-3xl mx-auto">
        {props.title && (
          <h2
            className="text-3xl md:text-4xl font-bold mb-4"
            style={{ color: "var(--color-text)" }}
          >
            {props.title}
          </h2>
        )}
        {props.intro && (
          <p className="mb-12" style={{ color: "var(--color-muted)" }}>
            {props.intro}
          </p>
        )}

        {status === "sent" ? (
          <div
            className="p-10 text-center"
            style={{
              background: "var(--color-surface)",
              border: "1px solid var(--color-border)",
            }}
          >
            <p
              className="text-2xl font-bold mb-3"
              style={{ color: "var(--color-accent)" }}
            >
              Message envoyé ✓
            </p>
            <p style={{ color: "var(--color-muted)" }}>
              Je vous répondrai dans les 48h. Merci pour votre confiance.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            <input
              type="text"
              name="company"
              value={form.company}
              onChange={handleChange}
              tabIndex={-1}
              autoComplete="off"
              aria-hidden="true"
              style={{ position: "absolute", left: "-9999px", width: 1, height: 1, opacity: 0 }}
            />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Nom complet *</label>
                <input
                  type="text"
                  name="name"
                  required
                  value={form.name}
                  onChange={handleChange}
                  style={fieldStyle}
                  placeholder="Votre nom"
                />
              </div>
              <div>
                <label style={labelStyle}>Email *</label>
                <input
                  type="email"
                  name="email"
                  required
                  value={form.email}
                  onChange={handleChange}
                  style={fieldStyle}
                  placeholder="votre@email.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label style={labelStyle}>Téléphone</label>
                <input
                  type="tel"
                  name="phone"
                  value={form.phone}
                  onChange={handleChange}
                  style={fieldStyle}
                  placeholder="+33 6 00 00 00 00"
                />
              </div>
              <div>
                <label style={labelStyle}>Type de projet *</label>
                <select
                  name="projectType"
                  required
                  value={form.projectType}
                  onChange={handleChange}
                  style={fieldStyle}
                >
                  <option value="">Sélectionner...</option>
                  <option value="photo-aventure">Reportage photo aventure</option>
                  <option value="video-aventure">Film vidéo aventure</option>
                  <option value="sports-nautiques">Sports nautiques</option>
                  <option value="evenement">Couverture d&apos;événement</option>
                  <option value="commercial">Contenu commercial / marque</option>
                  <option value="fine-art">Tirage Fine Art</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
            </div>

            {isDevis && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label style={labelStyle}>Lieu / Destination</label>
                  <input
                    type="text"
                    name="location"
                    value={form.location}
                    onChange={handleChange}
                    style={fieldStyle}
                    placeholder="Ville (ex. Hossegor, Biarritz…)"
                  />
                </div>
                <div>
                  <label style={labelStyle}>Date souhaitée</label>
                  <input
                    type="text"
                    name="date"
                    value={form.date}
                    onChange={handleChange}
                    style={fieldStyle}
                    placeholder="Mois / Année"
                  />
                </div>
              </div>
            )}

            {isDevis && (
              <div className="flex flex-col gap-6 p-6 rounded-xl" style={{ background: "var(--color-surface)", border: "1px solid var(--color-border)" }}>
                <div>
                  <label style={labelStyle} htmlFor="duration">Durée estimée sur place *</label>
                  <select id="duration" name="duration" required value={form.duration} onChange={handleChange} style={fieldStyle}>
                    <option value="">Sélectionner…</option>
                    {DURATIONS.map((d) => (
                      <option key={d.key} value={d.key}>{d.label}</option>
                    ))}
                  </select>
                </div>
                <fieldset>
                  <legend style={labelStyle}>Prestations souhaitées</legend>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2 mt-2">
                    {[...SHOOT_SERVICES, ...POST_SERVICES].map((k) => (
                      <label key={k} className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: "var(--color-text)" }}>
                        <input type="checkbox" checked={services.includes(k)} onChange={() => toggleService(k)} style={{ width: 18, height: 18, accentColor: "var(--color-accent)" }} />
                        {SERVICE_LABELS[k]}
                      </label>
                    ))}
                  </div>
                </fieldset>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <fieldset>
                    <legend style={labelStyle}>Utilisation des images</legend>
                    <div className="flex flex-col gap-2 mt-2">
                      {[
                        { v: "private", l: "Usage personnel / privé" },
                        { v: "commercial", l: "Usage commercial (marque, pub, site pro)" },
                      ].map((o) => (
                        <label key={o.v} className="flex items-center gap-3 text-sm cursor-pointer" style={{ color: "var(--color-text)" }}>
                          <input type="radio" name="usage" value={o.v} checked={form.usage === o.v} onChange={handleChange} style={{ width: 18, height: 18, accentColor: "var(--color-accent)" }} />
                          {o.l}
                        </label>
                      ))}
                    </div>
                  </fieldset>
                  <label className="flex items-center gap-3 text-sm cursor-pointer self-end" style={{ color: "var(--color-text)" }}>
                    <input type="checkbox" checked={form.express} onChange={(e) => setForm((f) => ({ ...f, express: e.target.checked }))} style={{ width: 18, height: 18, accentColor: "var(--color-accent)" }} />
                    Livraison express (moins de 72 h)
                  </label>
                </div>
              </div>
            )}

            {isDevis && (
              <div>
                <label style={labelStyle}>Budget approximatif</label>
                <select
                  name="budget"
                  value={form.budget}
                  onChange={handleChange}
                  style={fieldStyle}
                >
                  <option value="">Non défini</option>
                  <option value="<500">Moins de 500€</option>
                  <option value="500-1500">500€ – 1 500€</option>
                  <option value="1500-3000">1 500€ – 3 000€</option>
                  <option value="3000-6000">3 000€ – 6 000€</option>
                  <option value=">6000">Plus de 6 000€</option>
                </select>
              </div>
            )}

            <div>
              <label style={labelStyle}>
                {isDevis ? "Décrivez votre projet *" : "Message *"}
              </label>
              <textarea
                name="message"
                required
                rows={6}
                value={form.message}
                onChange={handleChange}
                style={{ ...fieldStyle, resize: "vertical" }}
                placeholder={
                  isDevis
                    ? "Décrivez votre projet, les contraintes techniques, le rendu souhaité..."
                    : "Votre message..."
                }
              />
            </div>

            <FormPrivacyNotice purpose={isDevis ? "établir votre devis et vous recontacter" : "répondre à votre message"} />

            {status === "error" && (
              <p className="text-sm" style={{ color: "#ef4444" }}>
                Une erreur est survenue. Contactez-moi directement par email.
              </p>
            )}

            <button
              type="submit"
              disabled={status === "sending"}
              className="text-sm uppercase font-semibold px-10 py-4 self-start transition-opacity rounded-full"
              style={{
                background: "var(--color-accent)",
                color: "var(--color-on-accent)",
                letterSpacing: "0.2em",
                opacity: status === "sending" ? 0.6 : 1,
                cursor: status === "sending" ? "wait" : "pointer",
              }}
            >
              {status === "sending"
                ? "Envoi en cours..."
                : isDevis
                ? "Envoyer ma demande de devis"
                : "Envoyer le message"}
            </button>
          </form>
        )}
      </div>
    </section>
  )
}
