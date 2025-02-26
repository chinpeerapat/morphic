import { getRedisClient } from '@/lib/redis/config'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

// Search history entry schema for validation
const searchHistoryEntrySchema = z.object({
  query: z.string().min(1),
  timestamp: z.number().optional(),
  results: z.number().optional(),
  source: z.string().optional()
})

// Get search history for a user
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const limit = parseInt(searchParams.get('limit') || '50', 10)
    const offset = parseInt(searchParams.get('offset') || '0', 10)

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    const redis = await getRedisClient()
    const searchHistoryKey = `user:search:history:${userId}`

    // Get search history entries sorted by timestamp (newest first)
    const entries = await redis.zrange(
      searchHistoryKey,
      offset,
      offset + limit - 1,
      { rev: true }
    )

    // Parse entries
    const searchHistory = await Promise.all(
      entries.map(async entryKey => {
        const entry = await redis.hgetall(entryKey)
        return entry
      })
    )

    // Filter out null entries and sort by timestamp
    const validEntries = searchHistory
      .filter(entry => entry !== null)
      .sort((a, b) => {
        const timestampA = a?.timestamp
          ? parseInt(a.timestamp as string, 10)
          : 0
        const timestampB = b?.timestamp
          ? parseInt(b.timestamp as string, 10)
          : 0
        return timestampB - timestampA
      })

    return NextResponse.json(validEntries)
  } catch (error) {
    console.error('Error fetching search history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Add a search history entry
export async function POST(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('userId')
    const body = await req.json()

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      )
    }

    // Validate search history entry
    const validationResult = searchHistoryEntrySchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid search history data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const entryData = validationResult.data
    const timestamp = entryData.timestamp || Date.now()
    const entryId = `search:${userId}:${timestamp}`

    // Add timestamp if not provided
    if (!entryData.timestamp) {
      entryData.timestamp = timestamp
    }

    const redis = await getRedisClient()

    // Save search history entry
    await redis.hmset(entryId, entryData)

    // Add to user's search history index
    const searchHistoryKey = `user:search:history:${userId}`
    await redis.zadd(searchHistoryKey, timestamp, entryId)

    return NextResponse.json(entryData)
  } catch (error) {
    console.error('Error adding search history entry:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Clear search history for a user
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

    const redis = await getRedisClient()
    const searchHistoryKey = `user:search:history:${userId}`

    // Get all search history entries
    const entries = await redis.zrange(searchHistoryKey, 0, -1)

    // Delete each entry
    const pipeline = redis.pipeline()
    entries.forEach(entryKey => {
      pipeline.del(entryKey)
    })

    // Delete the index
    pipeline.del(searchHistoryKey)

    // Execute pipeline
    await pipeline.exec()

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error clearing search history:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
