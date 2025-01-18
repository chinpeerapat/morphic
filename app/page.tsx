'use client'

import { AIInputWithSearch } from '@/components/ui/ai-input-with-search'
import { generateId } from 'ai'
import { AI } from './actions'
import { ChatMessages } from '@/components/chat-messages'
import { useUIState, useActions, useAIState } from 'ai/rsc'
import { useRouter } from 'next/navigation'
import { useAppState } from '@/lib/utils/app-state'
import { UserMessage } from '@/components/user-message'
import { toast } from 'sonner'

function ChatWrapper({ id }: { id: string }) {
  const [messages, setMessages] = useUIState()
  const [aiMessage, setAIMessage] = useAIState<typeof AI>()
  const { isGenerating, setIsGenerating } = useAppState()
  const { submit } = useActions()
  const router = useRouter()

  const handleSubmit = async (value: string, withSearch: boolean) => {
    try {
      setIsGenerating(true)
      // Add user message to UI state
      setMessages((currentMessages: Array<any>) => [
        ...currentMessages,
        {
          id: generateId(),
          component: <UserMessage message={value} />
        }
      ])

      // Create form data
      const formData = new FormData()
      formData.set('input', value)

      // Submit and get response
      const responseMessage = await submit(formData)
      setMessages((currentMessages: Array<any>) => [
        ...currentMessages,
        responseMessage
      ])
    } catch (error) {
      console.error('Error submitting message:', error)
      toast.error(`${error}`)
      handleClear()
    }
  }

  const handleClear = () => {
    setIsGenerating(false)
    setMessages([])
    setAIMessage({ messages: [], chatId: '' })
    router.push('/')
  }

  const handleFileSelect = (file: File) => {
    // Implement file handling if needed
    console.log('File selected:', file)
  }

  return (
    <div className="px-8 sm:px-12 pt-12 md:pt-14 pb-14 md:pb-24 max-w-3xl mx-auto flex flex-col space-y-3 md:space-y-4">
      <ChatMessages messages={messages} />
      <AIInputWithSearch
        onSubmit={(value: string, modelId: string) =>
          handleSubmit(value, modelId === 'search')
        }
        onFileSelect={handleFileSelect}
        placeholder="Ask a question..."
        className={messages.length === 0 ? 'mt-auto' : ''}
      />
    </div>
  )
}

export default function Page() {
  const id = generateId()
  return (
    <AI initialAIState={{ chatId: id, messages: [] }}>
      <ChatWrapper id={id} />
    </AI>
  )
}
