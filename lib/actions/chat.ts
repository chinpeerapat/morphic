'use server'

import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { type Chat } from '../types'
import { chatService } from '../services/chat-service'

export async function getChats(userId?: string | null) {
  return await chatService.getChats(userId)
}

export async function getChat(id: string, userId: string = 'anonymous') {
  return await chatService.getChat(id, userId)
}

export async function clearChats(userId: string = 'anonymous') {
  const result = await chatService.clearChats(userId)

  if (!result.error) {
    revalidatePath('/')
    redirect('/')
  }

  return result
}

export async function saveChat(chat: Chat, userId: string = 'anonymous') {
  try {
    return await chatService.saveChat(chat, userId)
  } catch (error) {
    throw error
  }
}

export async function getSharedChat(id: string) {
  return await chatService.getSharedChat(id)
}

export async function shareChat(id: string, userId: string = 'anonymous') {
  return await chatService.shareChat(id, userId)
}
