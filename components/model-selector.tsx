'use client'

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue
} from './ui/select'
import Image from 'next/image'
import { Model, models } from '@/lib/types/models'

interface ModelSelectorProps {
  selectedModelId: string
  onModelChange: (id: string) => void
}

function groupModelsByCategory(models: Model[]) {
  return models.reduce((groups, model) => {
    const category = model.category
    if (!groups[category]) {
      groups[category] = []
    }
    groups[category].push(model)
    return groups
  }, {} as Record<string, Model[]>)
}

const categoryLabels: Record<string, string> = {
  speed: 'Speed',
  balanced: 'Balanced',
  quality: 'Quality'
}

export function ModelSelector({
  selectedModelId,
  onModelChange
}: ModelSelectorProps) {
  const handleModelChange = (id: string) => {
    onModelChange(id)
  }

  const groupedModels = groupModelsByCategory(models)

  return (
    <div className="absolute -top-8 left-2">
      <Select
        name="model"
        value={selectedModelId}
        onValueChange={handleModelChange}
      >
        <SelectTrigger className="mr-2 h-7 text-xs border-none shadow-none focus:ring-0">
          <SelectValue placeholder="Select model" />
        </SelectTrigger>
        <SelectContent className="max-h-[300px] overflow-y-auto">
          {Object.entries(groupedModels).map(([category, categoryModels]) => (
            <SelectGroup key={category}>
              <SelectLabel className="text-xs sticky top-0 bg-background z-10">
                {categoryLabels[category]}
              </SelectLabel>
              {categoryModels.map((model: Model) => (
                <SelectItem key={model.id} value={model.id} className="py-2">
                  <div className="flex items-center space-x-1">
                    <Image
                      src={`/providers/logos/${model.providerId}.svg`}
                      alt={model.provider}
                      width={18}
                      height={18}
                      className="bg-white rounded-full border"
                    />
                    <span className="text-xs font-medium">{model.id}</span>
                  </div>
                </SelectItem>
              ))}
            </SelectGroup>
          ))}
        </SelectContent>
      </Select>
    </div>
  )
}
