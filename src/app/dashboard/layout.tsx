'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { useRouter, usePathname } from 'next/navigation'
import { Home, MessageCircle, Users, Settings, User, LogOut, PlusCircle, Bell, Moon, Sun } from 'lucide-react'
import { useTheme } from 'next-themes'
import Link from 'next/link'
import toast from 'react-hot-toast'

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<any>(null)
  const [profile, setProfile] = useState<any>(null)
  const [sidebarOpen, setSidebarOpen] = useState(true)
  const supabase = createClient()
  const router = useRouter()
  const pathname = usePathname()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return router.push('/login')
      setUser(session.user)

      const { data } = await supabase.from('users').select('*').eq('email', session.user.email).single()
      setProfile(data)
    }
    getUser()

    const channel = supabase.channel('online-status')
    channel.subscribe()
    return () => supabase.removeChannel(channel)
  }, [supabase, router])

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Berhasil keluar')
    router.push('/login')
  }

  const navItems = [
    { href: '/dashboard', icon: Home, label: 'Chats' },
    { href: '/dashboard/status', icon: PlusCircle, label: 'Status' },
    { href: '/dashboard/groups', icon: Users, label: 'Grup' },
    { href: '/dashboard/profile', icon: User, label: 'Profil' },
    { href: '/dashboard/settings', icon: Settings, label: 'Pengaturan' },
  ]

  return (
    <div className="flex h-screen overflow-hidden bg-whatscat-gray dark:bg-whatscat-darkBg">
      {/* Sidebar */}
      <aside className={`${sidebarOpen ? 'w-16 md:w-64' : 'w-0'} transition-all duration-300 bg-white dark:bg-whatscat-darkCard border-r dark:border-gray-700 flex flex-col overflow-hidden`}>
        {/* Header */}
        <div className="p-3 border-b dark:border-gray-700 flex items-center justify-between">
          <h1 className="hidden md:block text-xl font-bold text-whatscat-green">🐱 What'sCat</h1>
          <button onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700">
            {theme === 'dark' ? <Sun size={18} /> : <Moon size={18} />}
          </button>
        </div>

        {/* User Info */}
        <div className="hidden md:flex p-3 items-center gap-3 border-b dark:border-gray-700">
          <div className="w-10 h-10 rounded-full bg-whatscat-green flex items-center justify-center text-white font-bold">
            {profile?.full_name?.[0] || user?.email?.[0]?.toUpperCase()}
          </div>
          <div className="flex-1 min-w-0">
            <p className="font-medium text-sm truncate">{profile?.full_name || profile?.username}</p>
            <p className="text-xs text-green-500 flex items-center gap-1">
              <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" /> Online
            </p>
          </div>
          <span className="text-xs bg-gradient-to-r from-green-500 to-teal-500 text-white px-2 py-0.5 rounded-full font-semibold">Deluxe</span>
        </div>

        {/* Nav */}
        <nav className="flex-1 py-4 px-2 space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition ${
                pathname === item.href ? 'bg-green-50 dark:bg-green-900/20 text-whatscat-green' : 'hover:bg-gray-100 dark:hover:bg-gray-800'
              }`}
            >
              <item.icon size={20} />
              <span className="hidden md:inline text-sm">{item.label}</span>
            </Link>
          ))}
        </nav>

        {/* Logout */}
        <div className="p-3 border-t dark:border-gray-700">
          <button onClick={handleLogout} className="flex items-center gap-3 px-3 py-2.5 w-full text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition">
            <LogOut size={20} />
            <span className="hidden md:inline text-sm">Keluar</span>
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
  
