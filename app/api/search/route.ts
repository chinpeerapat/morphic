import { getRedisClient } from '@/lib/redis/config'
import { search } from '@/lib/tools/search'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 60

// Search schema for validation
const searchRequestSchema = z.object({
  query: z.string().min(1),
  maxResults: z.number().min(1).max(50).optional().default(10),
  searchDepth: z.enum(['basic', 'advanced']).optional().default('basic'),
  includeDomains: z.array(z.string()).optional().default([]),
  excludeDomains: z.array(z.string()).optional().default([]),
  userId: z.string().optional()
})

export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate search request
    const validationResult = searchRequestSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid search request',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const {
      query,
      maxResults,
      searchDepth,
      includeDomains,
      excludeDomains,
      userId
    } = validationResult.data

    // Perform search
    const searchResults = await search(
      query,
      maxResults,
      searchDepth,
      includeDomains,
      excludeDomains
    )

    // Save search to history if userId is provided
    if (userId) {
      try {
        const timestamp = Date.now()
        const entryId = `search:${userId}:${timestamp}`
        const redis = await getRedisClient()

        // Save search history entry
        await redis.hmset(entryId, {
          query,
          timestamp,
          results: searchResults.results.length,
          source: searchDepth
        })

        // Add to user's search history index
        const searchHistoryKey = `user:search:history:${userId}`
        await redis.zadd(searchHistoryKey, timestamp, entryId)
      } catch (error) {
        console.error('Error saving search history:', error)
        // Continue even if saving history fails
      }
    }

    return NextResponse.json(searchResults)
  } catch (error) {
    console.error('Error performing search:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
