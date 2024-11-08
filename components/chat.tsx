'use client'

import { usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { ChatPanel } from './chat-panel'
import { ChatMessages } from './chat-messages'
import { ChatProvider, useChatContext } from './chat-provider'
import { type AIMessage } from '../lib/types'
import { convertToUIState } from '../lib/utils/message-utils'

interface ChatContentProps {
  id?: string
  query?: string
}

function ChatContent({ id, query }: ChatContentProps) {
  const path = usePathname()
  const { messages, isLoading, error } = useChatContext()
  const uiMessages = convertToUIState(messages)

  useEffect(() => {
    if (!path.includes('search') && messages.length === 1) {
      window.history.replaceState({}, '', `/search/${id}`)
    }
  }, [id, path, messages])

  return (
    <div className="px-8 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-3xl mx-auto flex flex-col space-y-3 md:space-y-4">
      <ChatMessages messages={uiMessages} />
      <ChatPanel
        messages={uiMessages}
        query={query}
        onModelChange={modelId => {
          // Handle model change if needed
        }}
      />
    </div>
  )
}

interface ChatProps {
  id?: string
  query?: string
  initialMessages?: AIMessage[]
  userId?: string
}

export function Chat({
  id,
  query,
  initialMessages = [],
  userId = 'anonymous'
}: ChatProps) {
  return (
    <ChatProvider id={id} initialMessages={initialMessages} userId={userId}>
      <ChatContent id={id} query={query} />
    </ChatProvider>
  )
}
