// src/modules/chat/services/chatService.ts

import { supabase } from '@src/lib/supabase'
import { formatFullName } from '@utils/Formatting'
import type { Conversation, Message } from '../types/chat'

export const chat = {
  async markMessagesAsRead(chatId: string, userId: string): Promise<void> {
    try {
      const { error } = await supabase.rpc('mark_chat_read', {
        chat_id_param: chatId,
        user_id_param: userId
      })

      if (error) {
        console.error('Error calling mark_chat_read RPC:', error)
        // Decide if you want to throw or just log
        // throw error;
      }
    } catch (error) {
      console.error('Exception marking messages as read:', error)
      // throw error;
    }
  },

  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('chats')
      .select(`
      id, last_message, is_last_message_read, updated_at,
      chat_topics(title, default_message),
      student: students!chats_student_id_fkey(first_name, last_name, student_school_class(classroom: classes(name, schools(name)))),
      teacher: users!chats_teacher_id_fkey(first_name, last_name),
      parent: users!chats_parent_id_fkey(first_name, last_name)
    `)
      .eq('teacher_id', userId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error) throw error

    if (!data || data.length === 0) {
      return []
    }

    const students = data.map(d =>
      formatFullName(d.student.last_name, d.student.first_name)
    )
    const classrooms = data.map(c => {
      const currentClass = c.student.student_school_class?.[0]?.classroom
      return {
        classroom: currentClass?.name ?? 'Pas de classe',
        school: currentClass?.schools?.name ?? "Pas d'école"
      }
    })

    const messages: {
      chatId: string
      content: string
      date: Date
      isRead: boolean
    }[] = data.map(d => ({
      chatId: d.id,
      content: d.last_message ?? '',
      date: d.updated_at ? new Date(d.updated_at) : new Date(),
      isRead: d.is_last_message_read ?? false
    }))

    const chats = data.map((c, i) => {
      const messageInfo = messages.find(m => m.chatId === c.id) ?? {
        content: '',
        date: new Date(),
        isRead: true
      }

      const teacherName = formatFullName(
        c.teacher?.first_name ?? '',
        c.teacher?.last_name ?? ''
      )

      return {
        id: c.id,
        topic: c.chat_topics?.title ?? 'Discussion',
        lastMessage: messageInfo.content,
        lastMessageDate: messageInfo.date,
        unreadCount: messageInfo.isRead ? 0 : 1,
        participants: [
          teacherName,
          `Parent de ${students[i]} (${classrooms[i].classroom}) au ${classrooms[i].school}`
        ]
      } satisfies Conversation
    })

    return chats
  },

  async getMessages({
    userId,
    chatId
  }: {
    userId: string
    chatId: string
  }): Promise<Message> {
    const chatQuery = supabase
      .from('chats')
      .select('chat_topics(title), message_count, status')
      .eq('id', chatId)
      .eq('teacher_id', userId)
      .neq('status', 'archived')
      .single()

    const messageQuery = supabase
      .from('messages')
      .select('*')
      .eq('chat_id', chatId)
      .order('created_at', { ascending: true })

    const [
      { data: chatData, error: chatError },
      { data: messages, error: messagesError }
    ] = await Promise.all([chatQuery, messageQuery])

    if (chatError) throw chatError
    if (messagesError) throw messagesError

    return {
      title: chatData?.chat_topics?.title ?? 'Discussion',
      messageCount: chatData?.message_count ?? 0,
      status: (chatData?.status ?? 'open') as Message['status'],
      messages:
        messages?.map(msg => ({
          id: msg.id,
          text: msg.content,
          sender: msg.sender_id === userId ? 'user' : 'other',
          timestamp: new Date(msg.created_at ?? new Date())
        })) ?? []
    }
  },

  async createMessage({
    senderId,
    chatId,
    content
  }: {
    senderId: string
    chatId: string
    content: string
  }): Promise<void> {
    const messageQs = supabase.from('messages').insert([
      {
        chat_id: chatId,
        sender_id: senderId,
        content: content.trim()
      }
    ])

    const lastMessageUpdQs = supabase
      .from('chats')
      .update({ last_message: content })
      .eq('id', chatId)

    const [{ error: messageError }, { error: lastMmessageError }] =
      await Promise.all([messageQs, lastMessageUpdQs])
    if (messageError || lastMmessageError)
      throw messageError || lastMmessageError
  }
}
