'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import toast from 'react-hot-toast'
import { CheckCircle2 } from 'lucide-react'

export default function VerifyOTPPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const email = searchParams.get('email') || ''
  const username = searchParams.get('username') || ''
  const password = searchParams.get('password') || ''
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [countdown, setCountdown] = useState(900)

  useEffect(() => {
    if (!email) router.push('/register')
    const timer = setInterval(() => setCountdown(c => c > 0 ? c - 1 : 0), 1000)
    return () => clearInterval(timer)
  }, [email, router])

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`

  const handleVerify = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const res = await fetch('/api/auth/verify-otp', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, otp, username, password })
      })
      const result = await res.json()
      if (!res.ok) throw new Error(result.error || 'Kode salah atau sudah kadaluarsa')

      toast.success('✅ Akun berhasil dibuat! Silakan masuk')
      router.push('/login')
    } catch (err: any) {
      toast.error(err.message)
    } finally {
      setLoading(false)
    }
  }

  const resendOTP = async () => {
    setCountdown(900)
    const res = await fetch('/api/auth/send-otp', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    if (res.ok) toast.success('Kode OTP baru dikirim!')
  }

  return (
    <div className="w-full max-w-md bg-white dark:bg-whatscat-darkCard rounded-2xl shadow-xl p-8">
      <div className="text-center mb-8">
        <CheckCircle2 size={48} className="mx-auto text-whatscat-green mb-3" />
        <h1 className="text-2xl font-bold">Verifikasi Email</h1>
        <p className="text-gray-500 dark:text-gray-400 mt-1">Kode dikirim ke: <span className="font-medium text-whatscat-dark">{email}</span></p>
      </div>

      <form onSubmit={handleVerify} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2 text-center">Masukkan 6 digit kode</label>
          <input
            type="text"
            value={otp}
            onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full text-center text-2xl tracking-widest px-4 py-3 border rounded-lg dark:border-gray-600 focus:ring-2 focus:ring-whatscat-green outline-none"
            placeholder="000000"
            maxLength={6}
            required
          />
        </div>

        <button
          type="submit"
          disabled={loading || otp.length !== 6}
          className="w-full bg-whatscat-green text-white py-2.5 rounded-lg font-medium hover:bg-green-600 transition disabled:opacity-50"
        >
          {loading ? 'Memverifikasi...' : 'Verifikasi Akun'}
        </button>
      </form>

      <div className="mt-6 text-center text-sm">
        {countdown > 0 ? (
          <p className="text-gray-500">Kirim ulang dalam <span className="font-medium">{formatTime(countdown)}</span></p>
        ) : (
          <button onClick={resendOTP} className="text-whatscat-green hover:underline">Kirim ulang kode OTP</button>
        )}
      </div>
    </div>
  )
    }
                                             
