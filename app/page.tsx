'use client'

import { AIInputWithSuggestions } from '@/components/ai-input-with-suggestions'
import { Chat } from '@/components/chat'
import { generateId } from 'ai'

export default function Page() {
  const id = generateId()
  return (
    <div>
      <AIInputWithSuggestions
        placeholder="Ask anything..."
        onSubmit={(text, modelId) => {
          // Handle the submission with the selected model ID
          console.log(`Submitting: ${text} with model: ${modelId}`)
        }}
      />
      <Chat id={id} />
    </div>
  )
}
