import { getRedisClient } from '@/lib/redis/config'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

// Preferences schema for validation
const preferencesSchema = z.object({
  theme: z.enum(['light', 'dark', 'system']).optional(),
  defaultModel: z.string().optional(),
  searchMode: z.boolean().optional(),
  historyEnabled: z.boolean().optional(),
  notificationsEnabled: z.boolean().optional()
})

// Get user preferences
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

    const redis = await getRedisClient()
    const userKey = `user:${userId}`
    const user = await redis.hgetall(userKey)

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Return preferences or default values
    const preferences = user.preferences
      ? typeof user.preferences === 'string'
        ? JSON.parse(user.preferences)
        : user.preferences
      : { theme: 'system', historyEnabled: true, notificationsEnabled: true }

    return NextResponse.json(preferences)
  } catch (error) {
    console.error('Error fetching user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Update user preferences
export async function PATCH(req: NextRequest) {
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

    // Validate preferences data
    const validationResult = preferencesSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid preferences data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const redis = await getRedisClient()
    const userKey = `user:${userId}`

    // Check if user exists
    const user = await redis.hgetall(userKey)
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Get current preferences or create empty object
    const currentPreferences = user.preferences
      ? typeof user.preferences === 'string'
        ? JSON.parse(user.preferences)
        : user.preferences
      : {}

    // Merge new preferences with existing ones
    const updatedPreferences = {
      ...currentPreferences,
      ...validationResult.data
    }

    // Update user with new preferences
    await redis.hmset(userKey, {
      ...user,
      preferences: JSON.stringify(updatedPreferences),
      updatedAt: new Date().toISOString()
    })

    return NextResponse.json(updatedPreferences)
  } catch (error) {
    console.error('Error updating user preferences:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
