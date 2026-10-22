'use client'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'
import { Search, MoreVertical, MessageSquare, Phone, Video, ArrowLeft, Smile, Paperclip, Mic, Send, Check, CheckCheck } from 'lucide-react'
import Image from 'next/image'
import { formatTime } from '@/lib/utils'
import toast from 'react-hot-toast'

export default function DashboardPage() {
  const supabase = createClient()
  const [user, setUser] = useState<any>(null)
  const [chats, setChats] = useState<any[]>([])
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState('')
  const [selectedChat, setSelectedChat] = useState<any>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [contacts, setContacts] = useState<any[]>([])

  useEffect(() => {
    const init = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) return
      setUser(session.user)

      const { data: profile } = await supabase.from('users').select('*').neq('id', session.user.id).limit(10)
      if (profile) setContacts(profile.map((u, i) => ({
        ...u,
        last_message: i % 2 === 0 ? 'Halo! Apa kabar?' : 'Terima kasih infonya 🙏',
        last_time: new Date(Date.now() - Math.random() * 3600000).toISOString(),
        unread: i % 3 === 0 ? Math.floor(Math.random() * 5) + 1 : 0,
      })))

      setChats(contacts)
    }
    init()

    const channel = supabase.channel('public:messages')
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'messages' }, (payload) => {
        setMessages(prev => [...prev, payload.new])
      })
      .subscribe()

    return () => supabase.removeChannel(channel)
  }, [supabase])

  const filteredChats = chats.filter(c =>
    (c.full_name || '').toLowerCase().includes(searchQuery.toLowerCase())
  )

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newMessage.trim() || !selectedChat) return

    const message = {
      id: Date.now().toString(),
      chat_id: selectedChat.id,
      sender_id: user?.id,
      content: newMessage,
      message_type: 'text',
      created_at: new Date().toISOString(),
    }

    setMessages(prev => [...prev, message])
    setNewMessage('')
  }

  const openChat = (contact: any) => {
    setSelectedChat(contact)
    setMessages([
      { id: '1', sender_id: contact.id, content: 'Halo! Selamat datang di What\'Cat Deluxe 😺', created_at: new Date(Date.now() - 300000).toISOString() },
      { id: '2', sender_id: user?.id, content: 'Halo! Terima kasih! 👋', created_at: new Date(Date.now() - 240000).toISOString() },
      { id: '3', sender_id: contact.id, content: 'Semoga aplikasi ini membantu kamu ya!', created_at: new Date(Date.now() - 120000).toISOString() },
    ])
  }

  return (
    <div className="flex h-full">
      {/* Chat List - Left Panel */}
      <div className={`${selectedChat ? 'hidden md:flex' : 'flex'} flex-col w-full md:w-96 border-r dark:border-gray-700 bg-white dark:bg-whatscat-darkCard`}>
        {/* Header */}
        <div className="p-3 border-b dark:border-gray-700">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-lg font-semibold">Pesan</h2>
            <div className="flex gap-2">
              <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><MessageSquare size={18} /></button>
            </div>
          </div>
          <div className="relative">
            <Search size={16} className="absolute left-3 top-2.5 text-gray-500" />
            <input
              type="text"
              placeholder="Cari chat..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-100 dark:bg-gray-800 rounded-lg text-sm outline-none"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChats.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-16 text-gray-500">
              <MessageSquare size={48} className="mb-2 opacity-30" />
              <p>Belum ada chat</p>
            </div>
          ) : (
            filteredChats.map(chat => (
              <button
                key={chat.id}
                onClick={() => openChat(chat)}
                className={`w-full flex items-center gap-3 p-3 hover:bg-gray-50 dark:hover:bg-gray-800 transition ${
                  selectedChat?.id === chat.id ? 'bg-green-50 dark:bg-green-900/20' : ''
                }`}
              >
                <div className="relative w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                  {(chat.full_name || chat.username)?.[0]?.toUpperCase()}
                  <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white dark:border-whatscat-darkCard rounded-full" />
                </div>
                <div className="flex-1 min-w-0 text-left">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium truncate">{chat.full_name || chat.username}</h3>
                    <span className="text-xs text-gray-500">{formatTime(chat.last_time)}</span>
                  </div>
                  <div className="flex justify-between items-center mt-0.5">
                    <p className="text-sm text-gray-500 truncate">{chat.last_message}</p>
                    {chat.unread > 0 && (
                      <span className="bg-whatscat-green text-white text-xs font-bold rounded-full w-5 h-5 flex items-center justify-center ml-2">
                        {chat.unread}
                      </span>
                    )}
                  </div>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Chat Window - Right Panel */}
      <div className={`${!selectedChat ? 'hidden md:flex' : 'flex'} flex-1 flex-col bg-whatscat-gray dark:bg-whatscat-darkBg`}>
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-3 bg-white dark:bg-whatscat-darkCard border-b dark:border-gray-700 flex items-center gap-3">
              <button onClick={() => setSelectedChat(null)} className="md:hidden p-1"><ArrowLeft size={20} /></button>
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-green-400 to-teal-500 flex items-center justify-center text-white font-bold">
                {(selectedChat.full_name || selectedChat.username)?.[0]?.toUpperCase()}
              </div>
              <div className="flex-1">
                <h3 className="font-medium">{selectedChat.full_name || selectedChat.username}</h3>
                <p className="text-xs text-green-500 flex items-center gap-1">
                  <span className="w-2 h-2 bg-green-500 rounded-full" /> Online
                </p>
              </div>
              <div className="flex gap-1">
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Phone size={18} /></button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><Video size={18} /></button>
                <button className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full"><MoreVertical size={18} /></button>
              </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ backgroundImage: 'url(/chat-bg.png)', backgroundColor: '#E5DDD5' }}>
              {messages.map(msg => {
                const isMe = msg.sender_id === user?.id
                return
  
