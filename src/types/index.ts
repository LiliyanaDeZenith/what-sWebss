export interface User {
  id: string
  email: string
  username: string
  full_name: string | null
  avatar_url: string | null
  bio: string
  is_online: boolean
  last_seen: string
  created_at: string
}

export interface Message {
  id: string
  chat_id: string
  sender_id: string
  content: string | null
  message_type: 'text' | 'image' | 'video' | 'audio' | 'document' | 'location' | 'contact'
  media_url?: string
  file_name?: string
  reply_to?: string
  is_deleted: boolean
  created_at: string
  sender?: User
}

export interface Chat {
  id: string
  type: 'private' | 'group'
  name?: string
  avatar_url?: string
  last_message?: string
  last_message_time?: string
  unread_count: number
  members: string[]
}

export interface StatusItem {
  id: string
  user_id: string
  media_url?: string
  content?: string
  expires_at: string
  created_at: string
  user?: User
  viewed: boolean
  }
  
