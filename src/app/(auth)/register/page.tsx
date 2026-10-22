'use client'
import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import toast from 'react-hot-toast'
import { Send } from 'lucide-react'

export default function RegisterPage() {
  const [form, setForm] = useState({ email: '', username: '', password: '', confirmPassword: '' })
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (form.password !== form.confirmPassword) return toast.error('Password tidak cocok')
    if (form.password.length < 6) return toast.error('Password minimal 6 karakter')

    setLoading(true)
    try {
      const { data: existingEmail } = await supabase.from('users').select('id').eq('email', form.email).maybeSingle()
      if (existingEmail) throw new Error('Email sudah terdaftar')

      const { data: existingUser } = await supabase.from('users').select('id').eq('username', form.username).maybeSingle()
      if (existingUser) throw new Error('Username sudah dipakai, pilih yang lain')

      const res = await fetch('/api/auth/send-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: form.email, username: form.username, password: form.password })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Gagal mengirim kode OTP')

      toast.success('Kode OTP dikirim ke email kamu!')
      router.push(`/verify-otp?email=${encodeURIComponent(form.email)}&username=${encodeURIComponent(form.username)}&password=${encodeURIComponent(form.password)}`)
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-whatscat-darkCard rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-whatscat-green">🐱 Daftar What'sCat</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Buat akunmu sekarang</p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-1">Email Aktif</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-whatscat-green outline-none"
            placeholder="kamu@email.com"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Username Unik</label>
          <input
            type="text"
            value={form.username}
            onChange={(e) => setForm({ ...form, username: e.target.value.toLowerCase().replace(/[^a-z0-9_]/g, '') })}
            className="w-full px-4 py-2 border rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-whatscat-green outline-none"
            placeholder="nama_kamu123"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Password</label>
          <input
            type="password"
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-whatscat-green outline-none"
            placeholder="Minimal 6 karakter"
            required
          />
        </div>
        <div>
          <label className="block text-sm font-medium mb-1">Konfirmasi Password</label>
          <input
            type="password"
            value={form.confirmPassword}
            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
            className="w-full px-4 py-2 border rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-whatscat-green outline-none"
            placeholder="Ulangi password"
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-whatscat-green text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {loading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <Send size={18} />}
          {loading ? 'Mengirim...' : 'Kirim Kode OTP'}
        </button>
      </form>

      <p className="mt-6 text-center text-sm text-gray-500">
        Sudah punya akun?{' '}
        <Link href="/login" className="text-whatscat-green font-medium hover:underline">Masuk di sini</Link>
      </p>
    </div>
  )
        }
    
