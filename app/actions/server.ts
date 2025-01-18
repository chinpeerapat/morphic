'use server'

import {
  StreamableValue,
  createStreamableUI,
  createStreamableValue,
  getAIState,
  getMutableAIState
} from 'ai/rsc'
import { Chat } from '@/lib/types'
import { AIMessage } from '@/lib/types'
import { workflow } from '@/lib/actions/workflow'
import { isProviderEnabled } from '@/lib/utils/registry'
import { saveChat } from '@/lib/actions/chat'
import { AI, getUIStateFromAIState, AIState } from '@/app/actions'

const MAX_MESSAGES = 6

export async function submit(
  formData?: FormData,
  skip?: boolean,
  retryMessages?: AIMessage[]
) {
  const aiState = getMutableAIState<typeof AI>()
  // ... rest of submit function ...
}

export async function getUIState() {
  const aiState = getAIState()
  if (aiState) {
    const uiState = getUIStateFromAIState(aiState as Chat)
    return uiState
  } else {
    return
  }
}

export async function setAIState({
  state,
  done
}: {
  state: AIState
  done: boolean
}) {
  // ... rest of onSetAIState function ...
}
