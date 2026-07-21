export async function sendEmail({ to, subject, html }: { to: string, subject: string, html: string }) {
  const apiKey = process.env.RESEND_API_KEY
  if (!apiKey) {
    console.log("RESEND_API_KEY is not set. Skipping email notification.")
    return false
  }

  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        from: "TeleNurse <onboarding@resend.dev>",
        to,
        subject,
        html
      })
    })

    if (!res.ok) {
      console.error("Failed to send email", await res.text())
      return false
    }

    return true
  } catch (err) {
    console.error("Error sending email", err)
    return false
  }
}
