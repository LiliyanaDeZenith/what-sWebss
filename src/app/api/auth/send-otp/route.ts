import { NextResponse } from 'next/server'
import nodemailer from 'nodemailer'
import bcrypt from 'bcryptjs'

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_EMAIL,
    pass: process.env.SMTP_PASSWORD,
  },
})

export async function POST(req: Request) {
  try {
    const { email } = await req.json()
    if (!email?.includes('@')) return NextResponse.json({ error: 'Email tidak valid' }, { status: 400 })

    const otp = Math.floor(100000 + Math.random() * 900000).toString()
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000).toISOString()

    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()

    await supabase.from('otp_verifications').delete().eq('email', email)
    await supabase.from('otp_verifications').insert({
      email,
      otp: await bcrypt.hash(otp, 10),
      expires_at: expiresAt,
    })

    await transporter.sendMail({
      from: `"What'sCat" <${process.env.SMTP_EMAIL}>`,
      to: email,
      subject: 'Kode Verifikasi What\'sCat 🐱',
      html: `
        <div style="font-family:Arial;max-width:500px;margin:0;padding:20px">
          <h2 style="color:#25D366">🐱 Kode Verifikasi What'sCat</h2>
          <p>Halo,</p>
          <p>Terima kasih telah mendaftar di What'sCat Deluxe!</p>
          <p>Kode verifikasi kamu adalah:</p>
          <div style="font-size:32px;font-weight:bold;letter-spacing:8px;padding:15px;background:#f0fdf4;border-radius:8px;text-align:center;color:#25D366;margin:20px 0">
            ${otp}
          </div>
          <p>Kode ini berlaku selama <strong>15 menit</strong>.</p>
          <p>Jika kamu tidak mendaftar, silakan abaikan email ini.</p>
          <hr style="border:none;border-top:1px solid #eee;margin-top:20px">
          <p style="font-size:12px;color:#888">© 2026 What'sCat Deluxe</p>
        </div>
      `,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error(error)
    return NextResponse.json({ error: 'Gagal mengirim email' }, { status: 500 })
  }
      }
      
