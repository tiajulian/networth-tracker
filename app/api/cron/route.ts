import { NextRequest, NextResponse } from 'next/server'
import { Resend } from 'resend'

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization')
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const force = new URL(req.url).searchParams.get('force') === 'true'
  const today = new Date()
  const dayOfWeek = today.getDay()
  const dayOfMonth = today.getDate()
  const appUrl = process.env.APP_URL ?? 'http://localhost:3000'
  const toEmail = process.env.REMINDER_EMAIL

  if (!toEmail) {
    return NextResponse.json({ skipped: 'REMINDER_EMAIL not configured' })
  }

  let subject = ''
  let heading = ''
  let accountsHtml = ''

  if (dayOfMonth === 1 || force) {
    subject = force
      ? '🧪 Test — 💰 NetWorth Tracker'
      : '💰 NetWorth — Monthly Balance Check-in'
    heading = force ? 'Test Reminder' : 'Monthly Balance Check-in'
    accountsHtml = `
      <li>Indonesian Bank <span style="color:#94a3b8">(IDR)</span></li>
      <li>Indonesian Shares <span style="color:#94a3b8">(IDR)</span></li>
      <li>Australian Cash <span style="color:#94a3b8">(AUD)</span></li>
    `
  } else if (dayOfWeek === 1) {
    subject = '💰 NetWorth — Weekly Australian Cash Update'
    heading = 'Weekly Cash Update'
    accountsHtml = `<li>Australian Cash <span style="color:#94a3b8">(AUD)</span></li>`
  } else {
    return NextResponse.json({ skipped: 'Not a reminder day' })
  }

  const html = `
    <div style="font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;max-width:480px;margin:0 auto;background:#0a0f1e;border-radius:16px;overflow:hidden">
      <div style="padding:24px 28px;background:linear-gradient(135deg,rgba(99,102,241,0.3),rgba(139,92,246,0.2));border-bottom:1px solid #1e2d45">
        <div style="font-size:22px;font-weight:800;background:linear-gradient(135deg,#6366f1,#8b5cf6);-webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:4px">
          💰 NetWorth
        </div>
        <div style="color:#94a3b8;font-size:14px">${heading}</div>
      </div>
      <div style="padding:24px 28px">
        <p style="color:#f1f5f9;margin:0 0 16px">Time to update your balances:</p>
        <ul style="color:#94a3b8;margin:0 0 24px;padding-left:20px;line-height:2">
          ${accountsHtml}
        </ul>
        <a href="${appUrl}/entry"
          style="display:inline-block;background:linear-gradient(135deg,#6366f1,#8b5cf6);color:white;padding:14px 28px;border-radius:12px;text-decoration:none;font-weight:700;font-size:15px">
          Enter Balances →
        </a>
      </div>
      <div style="padding:16px 28px;border-top:1px solid #1e2d45;display:flex;justify-content:space-between">
        <span style="color:#64748b;font-size:12px">💰 NetWorth Tracker</span>
        <a href="${appUrl}" style="color:#6366f1;font-size:12px;text-decoration:none">View dashboard →</a>
      </div>
    </div>
  `

  const resend = new Resend(process.env.RESEND_API_KEY)
  const { error } = await resend.emails.send({
    from: 'NetWorth Tracker <onboarding@resend.dev>',
    to: toEmail,
    subject,
    html,
  })

  if (error) return NextResponse.json({ error }, { status: 500 })
  return NextResponse.json({ sent: true, subject })
}
