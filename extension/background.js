// Background script for Morphic AI Assistant

// Default user ID for the extension
const DEFAULT_USER_ID =
  'extension_user_' + Math.random().toString(36).substring(2, 15)

// Initialize extension data
chrome.runtime.onInstalled.addListener(() => {
  // Set default user ID if not already set
  chrome.storage.local.get(['userId'], result => {
    if (!result.userId) {
      chrome.storage.local.set({ userId: DEFAULT_USER_ID })
    }
  })

  // Set default model
  const defaultModel = {
    id: 'gpt-4o-mini',
    name: 'GPT-4o mini',
    provider: 'OpenAI',
    providerId: 'openai',
    enabled: true,
    toolCallType: 'native'
  }

  chrome.storage.local.get(['selectedModel'], result => {
    if (!result.selectedModel) {
      chrome.storage.local.set({ selectedModel: defaultModel })
    }
  })

  // Set default settings
  const defaultSettings = {
    theme: 'system',
    searchMode: true,
    historyEnabled: true,
    apiBaseUrl: 'http://localhost:3000'
  }

  chrome.storage.local.get(['settings'], result => {
    if (!result.settings) {
      chrome.storage.local.set({ settings: defaultSettings })
    }
  })
})

// Listen for messages from popup or content scripts
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
  if (request.action === 'getApiBaseUrl') {
    chrome.storage.local.get(['settings'], result => {
      const apiBaseUrl = result.settings?.apiBaseUrl || 'http://localhost:3000'
      sendResponse({ apiBaseUrl })
    })
    return true // Required for async response
  }

  if (request.action === 'getUserId') {
    chrome.storage.local.get(['userId'], result => {
      sendResponse({ userId: result.userId || DEFAULT_USER_ID })
    })
    return true // Required for async response
  }
})
