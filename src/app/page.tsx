'use client'
import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'

export default function Home() {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const check = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      router.push(session ? '/dashboard' : '/login')
    }
    check()
  }, [router, supabase])

  return (
    <div className="min-h-screen flex items-center justify-center">
      <p>Memuat...</p>
    </div>
  )
}
