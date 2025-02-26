import { getSharedChat } from '@/lib/actions/chat'
import { NextRequest, NextResponse } from 'next/server'

export const maxDuration = 30

// Get a shared chat by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const chatId = searchParams.get('id')

    if (!chatId) {
      return NextResponse.json(
        { error: 'Chat ID is required' },
        { status: 400 }
      )
    }

    const chat = await getSharedChat(chatId)

    if (!chat) {
      return NextResponse.json(
        { error: 'Shared chat not found' },
        { status: 404 }
      )
    }

    // Parse the messages if they're stored as a string
    if (typeof chat.messages === 'string') {
      try {
        chat.messages = JSON.parse(chat.messages)
      } catch (error) {
        chat.messages = []
      }
    }

    // Remove sensitive information
    const sanitizedChat = {
      id: chat.id,
      title: chat.title,
      messages: chat.messages,
      createdAt: chat.createdAt,
      sharePath: chat.sharePath
    }

    return NextResponse.json(sanitizedChat)
  } catch (error) {
    console.error('Error fetching shared chat:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
