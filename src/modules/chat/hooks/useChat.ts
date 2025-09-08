// src/modules/chat/hooks/useChat.ts

import { useState } from 'react'
import { chat } from '../services/chatService'
import type { Conversation, Message } from '../types/chat'

interface UseChatReturn {
  getConversations: (userId: string) => Promise<Conversation[]>
  getMessages: ({
    userId,
    chatId
  }: {
    userId: string
    chatId: string
  }) => Promise<Message>
  createMessage: ({
    senderId,
    chatId,
    content
  }: {
    senderId: string
    chatId: string
    content: string
  }) => Promise<void>
  loading: boolean
  error: string | null
}

export function useChat(): UseChatReturn {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const getConversations = async (userId: string): Promise<Conversation[]> => {
    setLoading(true)
    setError(null)
    try {
      return await chat.getConversations(userId)
    } catch (err) {
      setError('Failed to get conversations.')
      console.error('[E_GET_CONVERSATIONS]:', err)
      return []
    } finally {
      setLoading(false)
    }
  }

  const getMessages = async ({
    userId,
    chatId
  }: {
    userId: string
    chatId: string
  }): Promise<Message> => {
    setLoading(true)
    setError(null)
    try {
      return await chat.getMessages({ userId, chatId })
    } catch (err) {
      setError('Failed to get messages.')
      console.error('[E_GET_MESSAGES]:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  const createMessage = async ({
    senderId,
    chatId,
    content
  }: {
    senderId: string
    chatId: string
    content: string
  }) => {
    setLoading(true)
    setError(null)
    try {
      await chat.createMessage({ senderId, chatId, content })
    } catch (err) {
      setError('Failed to create message.')
      console.error('[E_CREATE_MESSAGE]:', err)
      throw err
    } finally {
      setLoading(false)
    }
  }

  return {
    getConversations,
    getMessages,
    createMessage,
    loading,
    error
  }
}
