import { Resend } from 'npm:resend@4.0.0'

const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY') || ''

if (!RESEND_API_KEY) {
  console.warn('RESEND_API_KEY is not set')
}

export const resend = new Resend(RESEND_API_KEY)
