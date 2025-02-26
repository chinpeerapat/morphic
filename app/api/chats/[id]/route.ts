import { getChat, saveChat, shareChat } from '@/lib/actions/chat'
import { getRedisClient } from '@/lib/redis/config'
import { Chat } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

// Chat update schema for validation
const chatUpdateSchema = z.object({
  title: z.string().optional(),
  messages: z
    .array(
      z.object({
        id: z.string(),
        role: z.enum([
          'user',
          'assistant',
          'system',
          'function',
          'data',
          'tool'
        ]),
        content: z.union([z.string(), z.record(z.any())]),
        name: z.string().optional(),
        type: z
          .enum([
            'answer',
            'related',
            'skip',
            'inquiry',
            'input',
            'input_related',
            'tool',
            'followup',
            'end'
          ])
          .optional()
      })
    )
    .optional(),
  sharePath: z.string().optional()
})

// Get a specific chat
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const chatId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const chat = await getChat(chatId, userId)

    if (!chat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    return NextResponse.json(chat)
  } catch (error) {
    console.error('Error fetching chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update a chat
export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const chatId = params.id
    const body = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate update data
    const validationResult = chatUpdateSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid chat data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    // Get existing chat
    const existingChat = await getChat(chatId, userId)
    if (!existingChat) {
      return NextResponse.json({ error: 'Chat not found' }, { status: 404 })
    }

    // Update chat with new data
    const updatedChat: Chat = {
      ...existingChat,
      ...validationResult.data
    }

    // Save updated chat
    await saveChat(updatedChat, userId)

    return NextResponse.json(updatedChat)
  } catch (error) {
    console.error('Error updating chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete a chat
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const chatId = params.id

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const redis = await getRedisClient()
    const chatKey = `chat:${chatId}`

    // Check if chat exists and belongs to user
    const chat = await redis.hgetall(chatKey)
    if (!chat || chat.userId !== userId) {
      return NextResponse.json(
        { error: 'Chat not found or access denied' },
        { status: 404 }
      )
    }

    // Delete chat
    await redis.del(chatKey)

    // Remove from user's chat index
    await redis.zrem(`user:v2:chat:${userId}`, chatKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Share a chat
export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const chatId = params.id
    const action = searchParams.get('action')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    if (action === 'share') {
      const sharePath = await shareChat(chatId, userId)
      return NextResponse.json({ sharePath })
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 })
  } catch (error) {
    console.error('Error processing chat action:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
