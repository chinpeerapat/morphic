import { type AIMessage } from '../types'
import { type UIState } from '../app/actions'
import { createStreamableValue } from 'ai/rsc'
import { UserMessage } from '../../components/user-message'

export function convertToUIState(messages: AIMessage[]): UIState {
  return messages.map(message => {
    const isGenerating = createStreamableValue(false)
    const isCollapsed = createStreamableValue(false)

    let component
    switch (message.role) {
      case 'user':
        component = <UserMessage message={message.content} />
        break
      default:
        component = <div className="whitespace-pre-wrap">{message.content}</div>
    }

    return {
      id: message.id,
      component,
      isGenerating: isGenerating.value,
      isCollapsed: isCollapsed.value
    }
  })
}
