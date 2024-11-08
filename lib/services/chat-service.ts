import { type Chat, type AIMessage } from '../types'
import { getRedisClient, type RedisWrapper } from '../redis/config'

export interface IChatService {
  getChats(userId?: string | null): Promise<Chat[]>
  getChat(id: string, userId?: string): Promise<Chat | null>
  saveChat(chat: Chat, userId?: string): Promise<any>
  clearChats(userId?: string): Promise<{ error?: string }>
  getSharedChat(id: string): Promise<Chat | null>
  shareChat(id: string, userId?: string): Promise<Chat | null>
}

export class ChatService implements IChatService {
  private redis: RedisWrapper | null = null

  private async getRedis(): Promise<RedisWrapper> {
    if (!this.redis) {
      this.redis = await getRedisClient()
    }
    return this.redis
  }

  async getChats(userId?: string | null): Promise<Chat[]> {
    if (!userId) {
      return []
    }

    try {
      const redis = await this.getRedis()
      const chats = await redis.zrange(`user:chat:${userId}`, 0, -1, {
        rev: true
      })

      if (chats.length === 0) {
        return []
      }

      const results = await Promise.all(
        chats.map(async chatKey => {
          const chat = await redis.hgetall(chatKey)
          return chat
        })
      )

      return results
        .filter((result): result is Record<string, any> => {
          if (result === null || Object.keys(result).length === 0) {
            return false
          }
          return true
        })
        .map(chat => {
          const plainChat = { ...chat }
          if (typeof plainChat.messages === 'string') {
            try {
              plainChat.messages = JSON.parse(plainChat.messages)
            } catch (error) {
              plainChat.messages = []
            }
          }
          if (plainChat.createdAt && !(plainChat.createdAt instanceof Date)) {
            plainChat.createdAt = new Date(plainChat.createdAt)
          }
          return plainChat as Chat
        })
    } catch (error) {
      return []
    }
  }

  async getChat(
    id: string,
    userId: string = 'anonymous'
  ): Promise<Chat | null> {
    const redis = await this.getRedis()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat) {
      return null
    }

    if (typeof chat.messages === 'string') {
      try {
        chat.messages = JSON.parse(chat.messages)
      } catch (error) {
        chat.messages = []
      }
    }

    if (!Array.isArray(chat.messages)) {
      chat.messages = []
    }

    return chat
  }

  async saveChat(chat: Chat, userId: string = 'anonymous'): Promise<any> {
    try {
      const redis = await this.getRedis()
      const pipeline = redis.pipeline()

      const chatToSave = {
        ...chat,
        messages: JSON.stringify(chat.messages)
      }

      pipeline.hmset(`chat:${chat.id}`, chatToSave)
      pipeline.zadd(`user:chat:${userId}`, Date.now(), `chat:${chat.id}`)

      return await pipeline.exec()
    } catch (error) {
      throw error
    }
  }

  async clearChats(userId: string = 'anonymous'): Promise<{ error?: string }> {
    const redis = await this.getRedis()
    const chats = await redis.zrange(`user:chat:${userId}`, 0, -1)

    if (!chats.length) {
      return { error: 'No chats to clear' }
    }

    const pipeline = redis.pipeline()

    for (const chat of chats) {
      pipeline.del(chat)
      pipeline.zrem(`user:chat:${userId}`, chat)
    }

    await pipeline.exec()
    return {}
  }

  async getSharedChat(id: string): Promise<Chat | null> {
    const redis = await this.getRedis()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat || !chat.sharePath) {
      return null
    }

    return chat
  }

  async shareChat(
    id: string,
    userId: string = 'anonymous'
  ): Promise<Chat | null> {
    const redis = await this.getRedis()
    const chat = await redis.hgetall<Chat>(`chat:${id}`)

    if (!chat || chat.userId !== userId) {
      return null
    }

    const payload = {
      ...chat,
      sharePath: `/share/${id}`
    }

    await redis.hmset(`chat:${id}`, payload)

    return payload
  }
}

// Export singleton instance
export const chatService = new ChatService()
