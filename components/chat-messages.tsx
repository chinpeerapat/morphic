'use client'

import { StreamableValue } from 'ai/rsc'
import type { UIState } from '@/app/actions'
import { CollapsibleMessage } from './collapsible-message'
import { useCallback } from 'react'

interface ChatMessagesProps {
  messages: UIState
  enhanceThaiOutput: boolean
}

type GroupedMessage = {
  id: string
  components: React.ReactNode[]
  isCollapsed?: StreamableValue<boolean> | undefined
}

async function enhanceThaiText(text: string) {
  try {
    const response = await fetch('/api/enhance-thai', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ text })
    })

    if (!response.ok) throw new Error('Enhancement failed')

    const data = await response.json()
    return data.enhancedText
  } catch (error) {
    console.error('Thai enhancement error:', error)
    return text // Return original text if enhancement fails
  }
}

export function ChatMessages({
  messages,
  enhanceThaiOutput
}: ChatMessagesProps) {
  if (!messages.length) {
    return null
  }

  // Group messages based on ID, and if there are multiple messages with the same ID, combine them into one message
  const groupedMessages = messages.reduce(
    (acc: { [key: string]: GroupedMessage }, message) => {
      if (!acc[message.id]) {
        acc[message.id] = {
          id: message.id,
          components: [],
          isCollapsed: message.isCollapsed
        }
      }
      acc[message.id].components.push(message.component)
      return acc
    },
    {}
  )

  // Convert grouped messages into an array with explicit type
  const groupedMessagesArray = Object.values(groupedMessages).map(group => ({
    ...group,
    components: group.components as React.ReactNode[]
  })) as {
    id: string
    components: React.ReactNode[]
    isCollapsed?: StreamableValue<boolean>
  }[]

  const renderMessage = useCallback(
    async (message: Message) => {
      let content = message.content

      // If it's an assistant message and Thai enhancement is enabled
      if (
        message.role === 'assistant' &&
        enhanceThaiOutput &&
        containsThai(content)
      ) {
        content = await enhanceThaiText(content)
      }

      return <Message key={message.id} role={message.role} content={content} />
    },
    [enhanceThaiOutput]
  )

  return (
    <>
      {groupedMessagesArray.map((groupedMessage: GroupedMessage) => (
        <CollapsibleMessage
          key={`${groupedMessage.id}`}
          message={{
            id: groupedMessage.id,
            component: groupedMessage.components.map((component, i) => (
              <div key={`${groupedMessage.id}-${i}`}>{component}</div>
            )),
            isCollapsed: groupedMessage.isCollapsed
          }}
          isLastMessage={groupedMessage.id === messages[messages.length - 1].id}
        />
      ))}
    </>
  )
}

// Helper function to detect Thai text
function containsThai(text: string) {
  return /[\u0E00-\u0E7F]/.test(text)
}
