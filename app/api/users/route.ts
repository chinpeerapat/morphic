import { getRedisClient } from '@/lib/redis/config'
import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'

export const maxDuration = 30

// User schema for validation
const userSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(1),
  email: z.string().email(),
  preferences: z
    .object({
      theme: z.enum(['light', 'dark', 'system']).default('system'),
      defaultModel: z.string().optional()
    })
    .optional()
})

// Get user by ID
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

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

    return NextResponse.json(user)
  } catch (error) {
    console.error('Error fetching user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Create or update user
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()

    // Validate user data
    const validationResult = userSchema.safeParse(body)
    if (!validationResult.success) {
      return NextResponse.json(
        {
          error: 'Invalid user data',
          details: validationResult.error.format()
        },
        { status: 400 }
      )
    }

    const userData = validationResult.data
    const userId = userData.id || crypto.randomUUID()
    const userKey = `user:${userId}`

    // Add creation timestamp if new user
    if (!userData.id) {
      userData.createdAt = new Date().toISOString()
    }

    // Add/update last modified timestamp
    userData.updatedAt = new Date().toISOString()

    const redis = await getRedisClient()
    await redis.hmset(userKey, userData)

    // Add to users index if new user
    if (!userData.id) {
      await redis.zadd('users:index', Date.now(), userKey)
    }

    return NextResponse.json({
      id: userId,
      ...userData
    })
  } catch (error) {
    console.error('Error creating/updating user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// Delete user
export async function DELETE(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const userId = searchParams.get('id')

    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
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

    // Delete user
    await redis.del(userKey)

    // Remove from users index
    await redis.zrem('users:index', userKey)

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Error deleting user:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
