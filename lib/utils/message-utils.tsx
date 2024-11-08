import React from 'react'
import { StreamableValue } from 'ai/rsc'
import { type AIMessage } from '../types'
import { createStreamableValue } from 'ai/rsc'
import { UserMessage } from '../../components/user-message'

export type UIMessage = {
  id: string
  component: React.ReactNode
  isGenerating?: StreamableValue<boolean>
  isCollapsed?: StreamableValue<boolean>
}

export type UIState = UIMessage[]

export function convertToUIState(messages: AIMessage[]): UIState {
  return messages.map(message => {
    const isGenerating = createStreamableValue(false)
    const isCollapsed = createStreamableValue(false)

    let component: React.ReactNode
    switch (message.role) {
      case 'user':
        component = <UserMessage key={message.id} message={message.content} />
        break
      default:
        component = (
          <div key={message.id} className="whitespace-pre-wrap">
            {message.content}
          </div>
        )
    }

    return {
      id: message.id,
      component,
      isGenerating: isGenerating.value,
      isCollapsed: isCollapsed.value
    }
  })
}
