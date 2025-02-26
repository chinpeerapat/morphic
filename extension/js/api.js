// API service for Morphic AI Assistant

class ApiService {
  constructor() {
    this.baseUrl = 'http://localhost:3000' // Default base URL
    this.userId = null
    this.init()
  }

  async init() {
    // Get base URL from storage
    const settings = await this.getFromStorage('settings')
    if (settings && settings.apiBaseUrl) {
      this.baseUrl = settings.apiBaseUrl
    }

    // Get user ID from storage
    const userId = await this.getFromStorage('userId')
    if (userId) {
      this.userId = userId
    }
  }

  async getFromStorage(key) {
    return new Promise(resolve => {
      chrome.storage.local.get([key], result => {
        resolve(result[key])
      })
    })
  }

  async setToStorage(key, value) {
    return new Promise(resolve => {
      chrome.storage.local.set({ [key]: value }, () => {
        resolve()
      })
    })
  }

  async getApiBaseUrl() {
    return new Promise(resolve => {
      chrome.runtime.sendMessage({ action: 'getApiBaseUrl' }, response => {
        resolve(response.apiBaseUrl)
      })
    })
  }

  async getUserId() {
    if (this.userId) return this.userId

    return new Promise(resolve => {
      chrome.runtime.sendMessage({ action: 'getUserId' }, response => {
        this.userId = response.userId
        resolve(response.userId)
      })
    })
  }

  // User Management APIs
  async getUser() {
    const userId = await this.getUserId()
    const response = await fetch(`${this.baseUrl}/api/users?id=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      if (response.status === 404) {
        // User not found, create a new one
        return this.createUser()
      }
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async createUser() {
    const userId = await this.getUserId()
    const response = await fetch(`${this.baseUrl}/api/users`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: userId,
        name: 'Extension User',
        email: `${userId}@extension.app`
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async getUserPreferences() {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/users/preferences?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async updateUserPreferences(preferences) {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/users/preferences?userId=${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(preferences)
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  // Chat APIs
  async getChats() {
    const userId = await this.getUserId()
    const response = await fetch(`${this.baseUrl}/api/chats?userId=${userId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async getChat(chatId) {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/chats/${chatId}?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async createChat(title, initialMessage) {
    const userId = await this.getUserId()
    const chatId = crypto.randomUUID()

    const response = await fetch(`${this.baseUrl}/api/chats`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        id: chatId,
        title: title || 'New Chat',
        userId: userId,
        messages: initialMessage
          ? [
              {
                id: crypto.randomUUID(),
                role: 'user',
                content: initialMessage
              }
            ]
          : []
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async updateChat(chatId, updates) {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/chats/${chatId}?userId=${userId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(updates)
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async deleteChat(chatId) {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/chats/${chatId}?userId=${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async shareChat(chatId) {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/chats/${chatId}?userId=${userId}&action=share`,
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  // Search APIs
  async search(query, options = {}) {
    const userId = await this.getUserId()
    const response = await fetch(`${this.baseUrl}/api/search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        maxResults: options.maxResults || 10,
        searchDepth: options.searchDepth || 'basic',
        includeDomains: options.includeDomains || [],
        excludeDomains: options.excludeDomains || [],
        userId
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async videoSearch(query) {
    const userId = await this.getUserId()
    const response = await fetch(`${this.baseUrl}/api/video-search`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        userId
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async retrieveContent(url) {
    const response = await fetch(`${this.baseUrl}/api/retrieve`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        url
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async getSearchHistory() {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/search-history?userId=${userId}`,
      {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async clearSearchHistory() {
    const userId = await this.getUserId()
    const response = await fetch(
      `${this.baseUrl}/api/search-history?userId=${userId}`,
      {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json'
        }
      }
    )

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  // Model APIs
  async getModels() {
    const response = await fetch(`${this.baseUrl}/api/models`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async getModel(modelId) {
    const response = await fetch(`${this.baseUrl}/api/models/${modelId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  // Chat completion API
  async sendChatMessage(messages, modelId) {
    const selectedModel = modelId
      ? await this.getModel(modelId)
      : await this.getFromStorage('selectedModel')

    // Store the selected model in storage
    if (selectedModel) {
      await this.setToStorage('selectedModel', selectedModel)
    }

    const settings = await this.getFromStorage('settings')
    const searchMode = settings?.searchMode || false

    const response = await fetch(`${this.baseUrl}/api/chat`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Cookie: `selectedModel=${JSON.stringify(
          selectedModel
        )}; search-mode=${searchMode}`
      },
      body: JSON.stringify({
        messages,
        id: crypto.randomUUID()
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.body
  }

  // Provider APIs
  async getProviders() {
    const response = await fetch(`${this.baseUrl}/api/providers`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }

  async checkProvider(providerId) {
    const response = await fetch(`${this.baseUrl}/api/providers`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        providerId
      })
    })

    if (!response.ok) {
      throw new Error(`API error: ${response.status}`)
    }

    return response.json()
  }
}

// Create and export a singleton instance
const apiService = new ApiService()
