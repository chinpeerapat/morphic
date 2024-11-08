'use client'

import { useEffect } from 'react'
import { StreamableValue, createStreamableValue } from 'ai/rsc'
import { type AIMessage } from '../lib/types'
import { useChat } from '../lib/hooks/use-chat'

export type UIMessage = {
  id: string
  component: React.ReactNode
  isGenerating?: StreamableValue<boolean>
  isCollapsed?: StreamableValue<boolean>
}

interface ChatInterfaceProps {
  id?: string
  initialMessages?: AIMessage[]
  userId?: string
  children: (props: {
    messages: UIMessage[]
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
  }) => React.ReactNode
}

export function ChatInterface({
  id,
  initialMessages = [],
  userId = 'anonymous',
  children
}: ChatInterfaceProps) {
  const {
    messages: chatMessages,
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

  // Convert AIMessages to UIMessages
  const uiMessages: UIMessage[] = chatMessages.map(message => {
    const isGenerating = createStreamableValue(false)
    const isCollapsed = createStreamableValue(false)

    return {
      id: message.id,
      component: (
        <div className="whitespace-pre-wrap" key={message.id}>
          {message.content}
        </div>
      ),
      isGenerating: isGenerating.value,
      isCollapsed: isCollapsed.value
    }
  })

  return children({
    messages: uiMessages,
    isLoading,
    error,
    addMessage,
    updateMessage,
    removeMessage,
    saveChat,
    shareChat
  })
}
