'use client'

import { Textarea } from '@/components/ui/textarea'
import { useAutoResizeTextarea } from '@/hooks/use-auto-resize-textarea'
import { models } from '@/lib/types/models'
import { cn } from '@/lib/utils'
import { CornerRightDown } from 'lucide-react'
import { useEffect, useState } from 'react'

interface AIInputWithSuggestionsProps {
  id?: string
  placeholder?: string
  minHeight?: number
  maxHeight?: number
  onSubmit?: (text: string, modelId: string) => void
  className?: string
}

export function AIInputWithSuggestions({
  id = 'ai-input-with-actions',
  placeholder = 'Ask a question or search...',
  minHeight = 36,
  maxHeight = 200,
  onSubmit,
  className
}: AIInputWithSuggestionsProps) {
  const [inputValue, setInputValue] = useState('')
  const [selectedModelIndex, setSelectedModelIndex] = useState(0)

  // Filter out undefined models
  const availableModels = models.filter(
    model => model.id !== 'undefined' && model.name !== 'Undefined'
  )

  const { textareaRef, adjustHeight } = useAutoResizeTextarea({
    minHeight,
    maxHeight
  })

  useEffect(() => {
    adjustHeight()
  }, [inputValue, adjustHeight])

  const toggleMode = () => {
    setSelectedModelIndex(prev => (prev + 1) % availableModels.length)
  }

  const handleSubmit = () => {
    if (inputValue.trim()) {
      onSubmit?.(inputValue, availableModels[selectedModelIndex].id)
      setInputValue('')
      adjustHeight()
    }
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
    <div className={cn('w-full py-4', className)}>
      <div className="relative max-w-xl w-full mx-auto">
        <div className="relative border border-black/10 dark:border-white/10 focus-within:border-black/20 dark:focus-within:border-white/20 rounded-2xl bg-black/[0.03] dark:bg-white/[0.03]">
          <div className="flex flex-col">
            <div className="overflow-y-auto">
              <Textarea
                ref={textareaRef}
                id={id}
                placeholder={placeholder}
                className="max-w-xl w-full rounded-2xl pr-10 py-2 placeholder:text-black/70 dark:placeholder:text-white/70 border-none focus:ring text-black dark:text-white resize-none text-wrap bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 leading-[1.2] min-h-[36px]"
                value={inputValue}
                onChange={e => {
                  setInputValue(e.target.value)
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault()
                    handleSubmit()
                  }
                }}
              />
            </div>

            <div className="h-9 bg-transparent flex items-center">
              <div className="absolute left-3 bottom-2 z-10">
                <button
                  type="button"
                  onClick={toggleMode}
                  className={cn([
                    'inline-flex items-center gap-1.5',
                    'border shadow-sm rounded-md px-2 py-1 text-xs font-medium',
                    'animate-fadeIn transition-colors duration-200',
                    getModelButtonStyle(
                      availableModels[selectedModelIndex].provider
                    )
                  ])}
                >
                  {availableModels[selectedModelIndex].provider === 'OpenAI' &&
                    '🤖'}
                  {availableModels[selectedModelIndex].provider ===
                    'Anthropic' && '🌟'}
                  {availableModels[selectedModelIndex].provider ===
                    'Google Generative AI' && '🧠'}
                  {availableModels[selectedModelIndex].provider === 'Groq' &&
                    '⚡'}
                  {availableModels[selectedModelIndex].provider === 'Ollama' &&
                    '🐪'}
                  {availableModels[selectedModelIndex].provider === 'Azure' &&
                    '☁️'}
                  {availableModels[selectedModelIndex].provider ===
                    'OpenAI Compatible' && '🔄'}
                  {' ' + availableModels[selectedModelIndex].name}
                </button>
              </div>
            </div>
          </div>

          <CornerRightDown
            className={cn(
              'absolute right-3 top-3 w-4 h-4 transition-all duration-200 dark:text-white',
              inputValue ? 'opacity-100 scale-100' : 'opacity-30 scale-95'
            )}
          />
        </div>
      </div>
    </div>
  )
}
