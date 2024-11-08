'use client'

import { createContext, useContext, useEffect } from 'react'
import { useUIState, useActions, useAIState } from 'ai/rsc'
import { type AI } from '../app/actions'
import { useChat } from '../lib/hooks/use-chat'
import { type AIMessage } from '../lib/types'
import { generateId } from 'ai'
import { convertToUIState } from '../lib/utils/message-utils'

interface ChatContextValue {
  messages: AIMessage[]
  isLoading: boolean
  error: string | null
  addMessage: (message: AIMessage) => void
  updateMessage: (
    id: string,
    updateFn: (message: AIMessage) => AIMessage
  ) => void
  removeMessage: (id: string) => void
  saveChat: (chatData?: any) => Promise<void>
  shareChat: () => Promise<any>
  submit: (formData: FormData) => Promise<void>
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined)

interface ChatProviderProps {
  id?: string
  initialMessages?: AIMessage[]
  userId?: string
  children: React.ReactNode
}

export function ChatProvider({
  id,
  initialMessages = [],
  userId = 'anonymous',
  children
}: ChatProviderProps) {
  const [uiState, setUIState] = useUIState<typeof AI>()
  const [aiState, setAIState] = useAIState<typeof AI>()
  const { submit: aiSubmit } = useActions()

  const {
    messages,
    isLoading,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    saveChat,
    shareChat
  } = useChat({
    id,
    initialMessages,
    userId
  })

  // Sync our chat service messages with AI SDK UI state
  useEffect(() => {
    const uiMessages = convertToUIState(messages)
    setUIState(uiMessages)
  }, [messages, setUIState])

  // Handle form submissions through AI SDK
  const handleSubmit = async (formData: FormData) => {
    const input = formData.get('input') as string
    if (!input?.trim()) return

    // Add user message to our chat service
    addMessage({
      id: generateId(),
      role: 'user',
      content: input,
      type: 'input'
    })

    try {
      // Submit through AI SDK
      const responseMessage = await aiSubmit(formData)

      // Add AI response to our chat service
      if (responseMessage.component) {
        addMessage({
          id: responseMessage.id,
          role: 'assistant',
          content: 'AI Response', // You might want to extract actual content from the component
          type: 'answer'
        })
      }
    } catch (error) {
      console.error('Error submitting message:', error)
    }
  }

  const value: ChatContextValue = {
    messages,
    isLoading,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    saveChat,
    shareChat,
    submit: handleSubmit
  }

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}

export function useChatContext() {
  const context = useContext(ChatContext)
  if (context === undefined) {
    throw new Error('useChatContext must be used within a ChatProvider')
  }
  return context
}
