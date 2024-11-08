'use client'

import { useState, useCallback } from 'react'
import { type Chat, type AIMessage } from '../types'
import { saveChat, clearChats, shareChat } from '../actions/chat'

interface UseChatProps {
  id?: string
  initialMessages?: AIMessage[]
  userId?: string
}

export function useChat({
  id,
  initialMessages = [],
  userId = 'anonymous'
}: UseChatProps = {}) {
  const [messages, setMessages] = useState<AIMessage[]>(initialMessages)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const addMessage = useCallback((message: AIMessage) => {
    setMessages(prev => [...prev, message])
  }, [])

  const updateMessage = useCallback(
    (id: string, updateFn: (message: AIMessage) => AIMessage) => {
      setMessages(prev =>
        prev.map(message => (message.id === id ? updateFn(message) : message))
      )
    },
    []
  )

  const removeMessage = useCallback((id: string) => {
    setMessages(prev => prev.filter(message => message.id !== id))
  }, [])

  const handleSave = useCallback(
    async (chatData: Partial<Chat> = {}) => {
      if (!id) return

      setIsLoading(true)
      setError(null)

      try {
        const chat: Chat = {
          id,
          title: chatData.title || 'New Chat',
          createdAt: chatData.createdAt || new Date(),
          userId,
          path: chatData.path || `/chat/${id}`,
          messages,
          sharePath: chatData.sharePath
        }

        await saveChat(chat, userId)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to save chat')
      } finally {
        setIsLoading(false)
      }
    },
    [id, messages, userId]
  )

  const handleShare = useCallback(async () => {
    if (!id) return null

    setIsLoading(true)
    setError(null)

    try {
      const result = await shareChat(id, userId)
      return result
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to share chat')
      return null
    } finally {
      setIsLoading(false)
    }
  }, [id, userId])

  const handleClear = useCallback(async () => {
    setIsLoading(true)
    setError(null)

    try {
      await clearChats(userId)
      setMessages([])
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to clear chats')
    } finally {
      setIsLoading(false)
    }
  }, [userId])

  return {
    messages,
    isLoading,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    saveChat: handleSave,
    shareChat: handleShare,
    clearChats: handleClear
  }
}
