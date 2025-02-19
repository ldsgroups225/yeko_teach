// src/modules/chat/types/chat.ts

export interface ChatTopic {
  id: number
  topicKey: string
  defaultMessage: string
  isActive: boolean
}

export interface Chat {
  id: string
  studentId: string
  parentId: string
  teacherId: string
  classId: string
  schoolId: string
  topicId?: number
  status: 'active' | 'ended' | 'archived'
  messageCount: number
  initiatedBy: string
  endedAt?: Date
  createdAt: Date
  updatedAt: Date
}

export interface Message {
  title: string
  messageCount: number
  status: 'active' | 'ended' | 'archived'
  messages: {
    id: string
    text: string
    sender: 'user' | 'other'
    timestamp: Date
  }[]
}

export interface Conversation {
  id: string
  topic: string
  lastMessage: string
  lastMessageDate: Date
  unreadCount: number
  participants: string[]
}

export interface ChatWithDetails extends Chat {
  studentName: string
  teacherName: string
  topic?: string
  lastMessage?: string
  lastMessageDate?: Date
  unreadCount: number
}
