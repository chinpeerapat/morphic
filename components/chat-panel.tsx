'use client'

import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { models } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { Message, generateId } from 'ai'
import { ArrowUp, Plus, Square } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { useEffect, useRef, useState } from 'react'
import Textarea from 'react-textarea-autosize'
import { EmptyScreen } from './empty-screen'
import { ModelSelector } from './model-selector'
import { Button } from './ui/button'

interface ChatPanelProps {
  input: string
  handleInputChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  handleSubmit: (e: React.FormEvent<HTMLFormElement>) => void
  isLoading: boolean
  messages: Message[]
  setMessages: (messages: Message[]) => void
  query?: string
  stop: () => void
  append: (message: Message) => void
}

export function ChatPanel({
  input,
  handleInputChange,
  handleSubmit,
  isLoading,
  messages,
  setMessages,
  query,
  stop,
  append
}: ChatPanelProps) {
  const [showEmptyScreen, setShowEmptyScreen] = useState(false)
  const router = useRouter()
  const inputRef = useRef<HTMLTextAreaElement>(null)
  const isFirstRender = useRef(true)
  const [isComposing, setIsComposing] = useState(false) // Composition state
  const [enterDisabled, setEnterDisabled] = useState(false) // Disable Enter after composition ends
  const [selectedModelIndex, setSelectedModelIndex] = useState(0)

  const handleCompositionStart = () => setIsComposing(true)

  const handleCompositionEnd = () => {
    setIsComposing(false)
    setEnterDisabled(true)
    setTimeout(() => {
      setEnterDisabled(false)
    }, 300)
  }

  const handleNewChat = () => {
    setMessages([])
    router.push('/')
  }

  // if query is not empty, submit the query
  useEffect(() => {
    if (isFirstRender.current && query && query.trim().length > 0) {
      append({
        id: generateId(),
        role: 'user',
        content: query
      })
      isFirstRender.current = false
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query])

  // Filter out undefined models
  const availableModels = models.filter(
    model => model.id !== 'undefined' && model.name !== 'Undefined'
  )

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight: 36,
    maxHeight: 200
  })

  useEffect(() => {
    adjustHeight()
  }, [input, adjustHeight])

  const toggleMode = () => {
    setSelectedModelIndex(prev => (prev + 1) % availableModels.length)
  }

  const getModelButtonStyle = (provider: string): string => {
    return (
      {
        OpenAI:
          'bg-green-50 border-green-200 text-green-600 hover:bg-green-100',
        Anthropic:
          'bg-purple-50 border-purple-200 text-purple-600 hover:bg-purple-100',
        'Google Generative AI':
          'bg-blue-50 border-blue-200 text-blue-600 hover:bg-blue-100',
        Groq: 'bg-orange-50 border-orange-200 text-orange-600 hover:bg-orange-100',
        Ollama: 'bg-red-50 border-red-200 text-red-600 hover:bg-red-100',
        Azure: 'bg-sky-50 border-sky-200 text-sky-600 hover:bg-sky-100',
        'OpenAI Compatible':
          'bg-emerald-50 border-emerald-200 text-emerald-600 hover:bg-emerald-100'
      }[provider] ||
      'bg-gray-50 border-gray-200 text-gray-600 hover:bg-gray-100'
    )
  }

  return (
    <div
      className={cn(
        'mx-auto w-full',
        messages.length > 0
          ? 'fixed bottom-0 left-0 right-0 bg-background'
          : 'fixed bottom-8 left-0 right-0 top-0 flex flex-col items-center justify-center'
      )}
    >
      <form
        onSubmit={handleSubmit}
        className={cn(
          'max-w-3xl w-full mx-auto',
          messages.length > 0 ? 'px-0 py-4' : 'px-6'
        )}
      >
        <div className="relative flex items-center w-full gap-2">
          {messages.length > 0 && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleNewChat}
              className="shrink-0 rounded-full group"
              type="button"
            >
              <Plus className="size-4 group-hover:rotate-90 transition-all" />
            </Button>
          )}
          {messages.length === 0 && <ModelSelector />}
          <Textarea
            ref={textareaRef}
            id="chat-input"
            placeholder="Ask a question or search..."
            className="max-w-xl w-full rounded-2xl pr-10 py-2 placeholder:text-black/70 dark:placeholder:text-white/70 border-none focus:ring text-black dark:text-white resize-none text-wrap bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-[1.2] min-h-[36px]"
            value={input}
            onChange={handleInputChange}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault()
                handleSubmit(e as any)
              }
            }}
          />
          <Button
            type={isLoading ? 'button' : 'submit'}
            size={'icon'}
            variant={'ghost'}
            className={cn(
              'absolute right-2 top-1/2 transform -translate-y-1/2',
              isLoading && 'animate-pulse'
            )}
            disabled={input.length === 0 && !isLoading}
            onClick={isLoading ? stop : undefined}
          >
            {isLoading ? <Square size={20} /> : <ArrowUp size={20} />}
          </Button>
        </div>
        {messages.length === 0 && (
          <EmptyScreen
            submitMessage={message => {
              handleInputChange({
                target: { value: message }
              } as React.ChangeEvent<HTMLTextAreaElement>)
            }}
            className={cn(showEmptyScreen ? 'visible' : 'invisible')}
          />
        )}
      </form>
    </div>
  )
}
