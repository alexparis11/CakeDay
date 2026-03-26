import "server-only"
import { Resend } from "resend"

// Singleton Resend client — server-only
const resend = new Resend(process.env.RESEND_API_KEY!)

export default resend

export const FROM_EMAIL =
  process.env.RESEND_FROM_EMAIL ?? "CakeDay <noreply@yourcakeday.com>"
