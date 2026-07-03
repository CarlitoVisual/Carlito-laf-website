type SendEmailParams = {
  replyTo: string
  subject: string
  text: string
}

/** Sends via Resend if RESEND_API_KEY is set, otherwise logs to console (dev fallback). */
export async function sendEmail({ replyTo, subject, text }: SendEmailParams): Promise<void> {
  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey) {
    console.log(`=== EMAIL (RESEND_API_KEY non configurée) ===\nSujet: ${subject}\n\n${text}\n===`)
    return
  }

  const from = process.env.EMAIL_FROM || "onboarding@resend.dev"
  const to = process.env.CONTACT_EMAIL || "charleslaf.photo@gmail.com"

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${resendKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], reply_to: replyTo, subject, text }),
  })

  if (!res.ok) throw new Error("Email send failed")
}
