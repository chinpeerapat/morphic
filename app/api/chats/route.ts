import { clearChats, getChats, saveChat } from '@/lib/actions/chat'
import { Chat } from '@/lib/types'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

// Chat schema for validation
const chatSchema = z.object({
  id: z.string().optional(),
  title: z.string(),
  userId: z.string(),
  messages: z.array(
    z.object({
      id: z.string(),
      role: z.enum(['user', 'assistant', 'system', 'function', 'data', 'tool']),
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
  ),
  path: z.string().optional(),
  sharePath: z.string().optional(),
  createdAt: z.date().optional()
})

// Get all chats for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const chats = await getChats(userId)
    return NextResponse.json(chats)
  } catch (error) {
    console.error('Error fetching chats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create a new chat
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate chat data
    const validationResult = chatSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid chat data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const chatData = validationResult.data

    // Generate ID if not provided
    if (!chatData.id) {
      chatData.id = crypto.randomUUID()
    }

    // Set creation date if not provided
    if (!chatData.createdAt) {
      chatData.createdAt = new Date()
    }

    // Set path if not provided
    if (!chatData.path) {
      chatData.path = `/chat/${chatData.id}`
    }

    // Save chat
    await saveChat(chatData as Chat, chatData.userId)

    return NextResponse.json(chatData)
  } catch (error) {
    console.error('Error creating chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete all chats for a user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const result = await clearChats(userId)

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting chats:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
