import { NextRequest } from 'next/server'

import { beforeEach, describe, expect, it, vi } from 'vitest'

import { getChatsPage } from '@/lib/actions/chat'

import { GET } from '../route'

vi.mock('@/lib/actions/chat', () => ({
  getChatsPage: vi.fn()
}))

describe('GET /api/chats', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  it('should return paginated chats with default offset and limit', async () => {
    const mockChats = [
      {
        id: 'chat-1',
        title: 'Test Chat 1',
        userId: 'user-1',
        visibility: 'private' as const,
        createdAt: new Date()
      }
    ]

    vi.mocked(getChatsPage).mockResolvedValue({
      chats: mockChats,
      nextOffset: null
    })

    const request = new NextRequest('http://localhost:3000/api/chats')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(getChatsPage).toHaveBeenCalledWith(20, 0)
    expect(json).toEqual({
      chats: expect.arrayContaining([
        expect.objectContaining({ id: 'chat-1', title: 'Test Chat 1' })
      ]),
      nextOffset: null
    })
  })

  it('should respect custom offset and limit query parameters', async () => {
    vi.mocked(getChatsPage).mockResolvedValue({
      chats: [],
      nextOffset: 30
    })

    const request = new NextRequest(
      'http://localhost:3000/api/chats?offset=20&limit=10'
    )
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(200)
    expect(getChatsPage).toHaveBeenCalledWith(10, 20)
    expect(json).toEqual({
      chats: [],
      nextOffset: 30
    })
  })

  it('should return 500 when getChatsPage throws an error', async () => {
    vi.mocked(getChatsPage).mockRejectedValue(new Error('Database error'))

    const request = new NextRequest('http://localhost:3000/api/chats')
    const response = await GET(request)
    const json = await response.json()

    expect(response.status).toBe(500)
    expect(json).toEqual({
      chats: [],
      nextOffset: null
    })
  })
})
