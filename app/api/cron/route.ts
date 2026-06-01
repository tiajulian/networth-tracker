import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'
import { createServiceClient } from '@/lib/supabase'

export async function GET(req: NextRequest) {
  // Verify this is called from Vercel Cron (or manually with the secret)
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const force = new URL(req.url).searchParams.get('force') === 'true'
  const today = new Date()
  const dayOfWeek = today.getDay() // 0=Sun, 1=Mon
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const toEmail = process.env.REMINDER_EMAIL

  if (!toEmail) {
    return NextResponse.json({ skipped: 'REMINDER_EMAIL not configured' })
  }

  const dayOfMonth = today.getDate()

  let subject = ''
  let accountsHtml = ''

  if (dayOfMonth === 1 || force) {
    subject = force ? '🧪 Test email — Net Worth Tracker' : '📊 Monthly net worth check-in'
    accountsHtml = `
      <li>Indonesian Bank (IDR)</li>
      <li>Indonesian Shares (IDR)</li>
      <li>Australian Cash (AUD)</li>
    `
  } else if (dayOfWeek === 1) {
    subject = '💵 Weekly Australian Cash check-in'
    accountsHtml = `<li>Australian Cash (AUD)</li>`
  } else {
    return NextResponse.json({ skipped: 'Not a reminder day' })
  }

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto">
      <h2 style="color:#1a1a2e">Net Worth Tracker</h2>
      <p>Hi! Time to update your balances:</p>
      <ul>${accountsHtml}</ul>
      <a href="${appUrl}/entry" style="display:inline-block;background:#4f46e5;color:white;padding:12px 24px;border-radius:8px;text-decoration:none;font-weight:600;margin-top:8px">
        Enter Balances →
      </a>
      <p style="color:#888;font-size:12px;margin-top:24px">
        Sent by your Net Worth Tracker · <a href="${appUrl}">View dashboard</a>
      </p>
    </div>
  `

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'Net Worth Tracker <onboarding@resend.dev>',
    to: toEmail,
    subject,
    html,
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ sent: true, subject })
}
