// src/modules/chat/services/chatService.ts

import type { Conversation, Message } from '../types/chat'
import { supabase } from '@src/lib/supabase'
import { formatFullName } from '@utils/Formatting'

export const chat = {
  async getConversations(userId: string): Promise<Conversation[]> {
    const { data, error } = await supabase
      .from('chats')
      .select(`
      id,
      chat_topics(title, default_message),
      student: students!chats_student_id_fkey(first_name, last_name, student_school_class(classroom: classes(name, schools(name)))),
      teacher: users!chats_teacher_id_fkey(first_name, last_name),
      parent: users!chats_parent_id_fkey(first_name, last_name)
    `)
      .eq('teacher_id', userId)
      .neq('status', 'archived')
      .order('created_at', { ascending: false })

    if (error)
      throw error

    if (!data || data.length === 0) {
      return []
    }

    const students = data.map(d => formatFullName(d.student.last_name, d.student.first_name))
    const classrooms = data.map((c) => {
      const currentClass = c.student.student_school_class?.[0]?.classroom
      return {
        classroom: currentClass?.name ?? 'Pas de classe',
        school: currentClass?.schools?.name ?? 'Pas d\'école',
      }
    })

    // Fetch last message for each conversation
    const chatIDs = data.map(c => c.id)

    const messages: { chat_id: string, content: string, date: Date, isRead: boolean }[] = []

    for (let i = 0; i < chatIDs.length; i++) {
      const { data: msg, error } = await supabase
        .from('messages')
        .select('chat_id, content, created_at, read_by')
        .eq('chat_id', chatIDs[i])
        .order('created_at', { ascending: false })
        .limit(1)

      if (error)
        throw error

      if (msg && msg.length > 0) {
        messages.push({
          chat_id: chatIDs[i],
          content: msg[0].content ?? '',
          date: new Date(msg[0].created_at ?? new Date()),
          isRead: !!msg[0].read_by?.length,
        })
      }
      else {
        // Handle case where there are no messages
        messages.push({
          chat_id: chatIDs[i],
          content: '',
          date: new Date(),
          isRead: true,
        })
      }
    }

    const chats = data.map((c, i) => {
      const messageInfo = messages.find(m => m.chat_id === c.id) ?? {
        content: '',
        date: new Date(),
        isRead: true,
      }

      const teacherName = formatFullName(
        c.teacher?.first_name ?? '',
        c.teacher?.last_name ?? '',
      )

      return {
        id: c.id,
        topic: c.chat_topics?.title ?? 'Discussion',
        lastMessage: messageInfo.content,
        lastMessageDate: messageInfo.date,
        unreadCount: messageInfo.isRead ? 0 : 1,
        participants: [
          teacherName,
          `Parent de ${students[i]} (${classrooms[i].classroom}) au ${classrooms[i].school}`,
        ],
      } satisfies Conversation
    })

    return chats
  },

  async getMessages({ userId, chatId }: { userId: string, chatId: string }): Promise<Message> {
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
      { data: messages, error: messagesError },
    ] = await Promise.all([chatQuery, messageQuery])

    if (chatError)
      throw chatError
    if (messagesError)
      throw messagesError

    return {
      title: chatData?.chat_topics?.title ?? 'Discussion',
      messageCount: chatData?.message_count ?? 0,
      status: (chatData?.status ?? 'open') as Message['status'],
      messages: messages?.map(msg => ({
        id: msg.id,
        text: msg.content,
        sender: msg.sender_id === userId ? 'user' : 'other',
        timestamp: new Date(msg.created_at ?? new Date()),
      })) ?? [],
    }
  },

  async createMessage({ senderId, chatId, content }: { senderId: string, chatId: string, content: string }): Promise<void> {
    const { error } = await supabase
      .from('messages')
      .insert([{
        chat_id: chatId,
        sender_id: senderId,
        content: content.trim(),
      }])

    if (error)
      throw error
  },
}
