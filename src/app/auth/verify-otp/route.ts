import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'

export async function POST(req: Request) {
  try {
    const { email, otp, username, password } = await req.json()
    const { createClient } = await import('@/lib/supabase')
    const supabase = createClient()

    const { data: records } = await supabase
      .from('otp_verifications')
      .select('*')
      .eq('email', email)
      .eq('is_used', false)
      .gt('expires_at', new Date().toISOString())
      .order('created_at', { ascending: false })
      .limit(1)

    if (!records || records.length === 0) throw new Error('Kode tidak ditemukan atau sudah kadaluarsa')

    const valid = await bcrypt.compare(otp, records[0].otp)
    if (!valid) throw new Error('Kode OTP salah')

    const hashedPassword = await bcrypt.hash(password, 12)

    const { error: createErr } = await supabase.from('users').insert({
      email,
      username,
      password_hash: hashedPassword,
      full_name: username,
      is_verified: true,
    })
    if (createErr) throw new Error(createErr.message)

    await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { username }
    }).catch(() => {})

    await supabase.from('otp_verifications').update({ is_used: true }).eq('id', records[0].id)

    return NextResponse.json({ success: true })
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 })
  }
        }
      
