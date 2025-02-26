import { getRedisClient } from '@/lib/redis/config'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 60

// Video search schema for validation
const videoSearchRequestSchema = z.object({
  query: z.string().min(1),
  userId: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate search request
    const validationResult = videoSearchRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid video search request',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const { query, userId } = validationResult.data

    // Check if SERPER_API_KEY is available
    if (!process.env.SERPER_API_KEY) {
      return NextResponse.json(
        { error: 'Video search API key not configured' },
        { status: 500 }
      )
    }

    // Perform video search
    try {
      const response = await fetch('https://google.serper.dev/videos', {
        method: 'POST',
        headers: {
          'X-API-KEY': process.env.SERPER_API_KEY,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ q: query })
      })

      if (!response.ok) {
        throw new Error(
          `Video search API error: ${response.status} ${response.statusText}`
        )
      }

      const searchResults = await response.json()

      // Save search to history if userId is provided
      if (userId) {
        try {
          const timestamp = Date.now()
          const entryId = `search:video:${userId}:${timestamp}`
          const redis = await getRedisClient()

          // Save search history entry
          await redis.hmset(entryId, {
            query,
            timestamp,
            type: 'video',
            results: searchResults.videos?.length || 0
          })

          // Add to user's search history index
          const searchHistoryKey = `user:search:history:${userId}`
          await redis.zadd(searchHistoryKey, timestamp, entryId)
        } catch (error) {
          console.error('Error saving video search history:', error)
          // Continue even if saving history fails
        }
      }

      return NextResponse.json(searchResults)
    } catch (error) {
      console.error('Error performing video search:', error)
      return NextResponse.json(
        { error: 'Video search API error', details: (error as Error).message },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error('Error processing video search request:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
