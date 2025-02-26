// Morphic AI Assistant Extension - Popup Script

document.addEventListener('DOMContentLoaded', async () => {
  // DOM Elements
  const chatContainer = document.getElementById('chat-container')
  const userInput = document.getElementById('user-input')
  const sendButton = document.getElementById('send-button')
  const chatSidebar = document.getElementById('chat-sidebar')
  const settingsSidebar = document.getElementById('settings-sidebar')
  const overlay = document.getElementById('overlay')
  const chatListButton = document.getElementById('chat-list-button')
  const settingsButton = document.getElementById('settings-button')
  const closeChatSidebarButton = document.getElementById('close-chat-sidebar')
  const closeSettingsSidebarButton = document.getElementById(
    'close-settings-sidebar'
  )
  const newChatButton = document.getElementById('new-chat-button')
  const chatList = document.getElementById('chat-list')
  const themeToggle = document.getElementById('theme-toggle')
  const searchModeSelect = document.getElementById('search-mode')
  const defaultModelSelect = document.getElementById('default-model')
  const historyToggle = document.getElementById('history-toggle')

  // State
  let currentChatId = null
  let isProcessing = false
  let availableModels = []
  let currentModel = null
  let searchMode = 'web'
  let darkMode = false
  let historyEnabled = true

  // Initialize API Service
  await apiService.init()

  // Initialize UI
  initializeUI()

  // Event Listeners
  userInput.addEventListener('input', handleInputChange)
  userInput.addEventListener('keydown', handleKeyDown)
  sendButton.addEventListener('click', handleSendMessage)
  chatListButton.addEventListener('click', () => toggleSidebar(chatSidebar))
  settingsButton.addEventListener('click', () => toggleSidebar(settingsSidebar))
  closeChatSidebarButton.addEventListener('click', () =>
    toggleSidebar(chatSidebar, false)
  )
  closeSettingsSidebarButton.addEventListener('click', () =>
    toggleSidebar(settingsSidebar, false)
  )
  overlay.addEventListener('click', closeAllSidebars)
  newChatButton.addEventListener('click', createNewChat)
  themeToggle.addEventListener('change', toggleTheme)
  searchModeSelect.addEventListener('change', updateSearchMode)
  defaultModelSelect.addEventListener('change', updateDefaultModel)
  historyToggle.addEventListener('change', toggleHistorySetting)

  // Functions
  async function initializeUI() {
    // Load settings
    await loadSettings()

    // Apply theme
    applyTheme()

    // Load models
    await loadModels()

    // Load chat history
    if (historyEnabled) {
      await loadChatHistory()
    }

    // Create new chat if no current chat
    if (!currentChatId) {
      await createNewChat()
    } else {
      await loadCurrentChat()
    }
  }

  async function loadSettings() {
    try {
      // Get settings from storage
      const settings = await apiService.getFromStorage('settings')

      if (settings) {
        darkMode = settings.theme === 'dark'
        searchMode = settings.searchMode || 'web'
        historyEnabled = settings.historyEnabled !== false

        // Update UI to reflect settings
        themeToggle.checked = darkMode
        searchModeSelect.value = searchMode
        historyToggle.checked = historyEnabled
      }
    } catch (error) {
      console.error('Error loading settings:', error)
    }
  }

  async function loadModels() {
    try {
      // Get models from API
      const models = await apiService.getModels()
      availableModels = models.filter(model => model.enabled)

      // Get current model from storage
      const storedModel = await apiService.getFromStorage('currentModel')
      currentModel =
        storedModel || (availableModels.length > 0 ? availableModels[0] : null)

      // Populate model select
      populateModelSelect()
    } catch (error) {
      console.error('Error loading models:', error)
    }
  }

  function populateModelSelect() {
    // Clear existing options
    defaultModelSelect.innerHTML = ''

    // Add options for each available model
    availableModels.forEach(model => {
      const option = document.createElement('option')
      option.value = model.id
      option.textContent = `${model.name} (${model.provider})`
      option.selected = currentModel && model.id === currentModel.id
      defaultModelSelect.appendChild(option)
    })
  }

  async function loadChatHistory() {
    try {
      // Get chats from API
      const chats = await apiService.getChats()

      // Clear existing chat list
      chatList.innerHTML = ''

      // Add each chat to the list
      chats.forEach(chat => {
        addChatToList(chat)
      })
    } catch (error) {
      console.error('Error loading chat history:', error)
    }
  }

  function addChatToList(chat) {
    const chatItem = document.createElement('div')
    chatItem.className = `chat-item ${
      chat.id === currentChatId ? 'active' : ''
    }`
    chatItem.dataset.id = chat.id

    const chatTitle = document.createElement('div')
    chatTitle.className = 'chat-item-title'
    chatTitle.textContent = chat.title || 'New Chat'

    const chatActions = document.createElement('div')
    chatActions.className = 'chat-item-actions'

    const deleteButton = document.createElement('button')
    deleteButton.className = 'button button-ghost button-icon'
    deleteButton.innerHTML = `
      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <path d="M3 6h18"></path>
        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path>
        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path>
      </svg>
    `

    deleteButton.addEventListener('click', e => {
      e.stopPropagation()
      deleteChat(chat.id)
    })

    chatActions.appendChild(deleteButton)
    chatItem.appendChild(chatTitle)
    chatItem.appendChild(chatActions)

    chatItem.addEventListener('click', () => {
      switchChat(chat.id)
    })

    chatList.appendChild(chatItem)
  }

  async function loadCurrentChat() {
    try {
      // Get chat from API
      const chat = await apiService.getChat(currentChatId)

      // Clear chat container
      chatContainer.innerHTML = ''

      // Add messages to chat container
      chat.messages.forEach(message => {
        addMessageToUI(message)
      })

      // Scroll to bottom
      scrollToBottom()

      // Update active chat in list
      updateActiveChatInList()
    } catch (error) {
      console.error('Error loading current chat:', error)
    }
  }

  async function createNewChat() {
    try {
      // Create new chat via API
      const chat = await apiService.createChat({
        title: 'New Chat',
        messages: [
          {
            role: 'assistant',
            content:
              "Hello! I'm Morphic AI Assistant. How can I help you today?"
          }
        ]
      })

      // Set as current chat
      currentChatId = chat.id
      await apiService.setToStorage('currentChatId', currentChatId)

      // Load the new chat
      await loadCurrentChat()

      // Update chat history
      if (historyEnabled) {
        await loadChatHistory()
      }

      // Close sidebars
      closeAllSidebars()
    } catch (error) {
      console.error('Error creating new chat:', error)
    }
  }

  async function switchChat(chatId) {
    if (chatId === currentChatId) return

    currentChatId = chatId
    await apiService.setToStorage('currentChatId', currentChatId)

    await loadCurrentChat()
    closeAllSidebars()
  }

  async function deleteChat(chatId) {
    try {
      // Delete chat via API
      await apiService.deleteChat(chatId)

      // If deleted current chat, create a new one
      if (chatId === currentChatId) {
        await createNewChat()
      } else {
        // Just reload chat history
        await loadChatHistory()
      }
    } catch (error) {
      console.error('Error deleting chat:', error)
    }
  }

  function updateActiveChatInList() {
    // Remove active class from all chat items
    document.querySelectorAll('.chat-item').forEach(item => {
      item.classList.remove('active')
    })

    // Add active class to current chat
    const currentChatItem = document.querySelector(
      `.chat-item[data-id="${currentChatId}"]`
    )
    if (currentChatItem) {
      currentChatItem.classList.add('active')
    }
  }

  function handleInputChange() {
    // Enable/disable send button based on input
    sendButton.disabled = userInput.value.trim() === ''

    // Auto-resize textarea
    userInput.style.height = 'auto'
    userInput.style.height = Math.min(userInput.scrollHeight, 150) + 'px'
  }

  function handleKeyDown(e) {
    // Send message on Enter (without Shift)
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      if (!sendButton.disabled && !isProcessing) {
        handleSendMessage()
      }
    }
  }

  async function handleSendMessage() {
    if (isProcessing || userInput.value.trim() === '') return

    const userMessage = userInput.value.trim()
    userInput.value = ''
    userInput.style.height = 'auto'
    sendButton.disabled = true
    isProcessing = true

    // Add user message to UI
    addMessageToUI({
      role: 'user',
      content: userMessage
    })

    // Add loading indicator
    const loadingElement = addLoadingIndicator()

    try {
      // Send message to API
      const response = await apiService.sendChatMessage(
        currentChatId,
        userMessage,
        currentModel,
        searchMode
      )

      // Remove loading indicator
      loadingElement.remove()

      // Add assistant response to UI
      addMessageToUI({
        role: 'assistant',
        content: response.message
      })

      // If search results are included, add them
      if (response.searchResults && response.searchResults.length > 0) {
        addSearchResultsToUI(response.searchResults)
      }

      // Update chat title if it's a new chat
      const chatElement = document.querySelector(
        `.chat-item[data-id="${currentChatId}"]`
      )
      if (
        chatElement &&
        chatElement.querySelector('.chat-item-title').textContent === 'New Chat'
      ) {
        // Generate title from first user message
        const title =
          userMessage.length > 30
            ? userMessage.substring(0, 30) + '...'
            : userMessage

        // Update chat title in API
        await apiService.updateChat(currentChatId, { title })

        // Update chat title in UI
        chatElement.querySelector('.chat-item-title').textContent = title
      }
    } catch (error) {
      console.error('Error sending message:', error)

      // Remove loading indicator
      loadingElement.remove()

      // Add error message
      addMessageToUI({
        role: 'assistant',
        content: 'Sorry, I encountered an error. Please try again.'
      })
    } finally {
      isProcessing = false
      scrollToBottom()
    }
  }

  function addMessageToUI(message) {
    const messageElement = document.createElement('div')
    messageElement.className = `message message-${message.role}`

    const contentElement = document.createElement('div')
    contentElement.className = 'message-content'

    // If message is from assistant, render markdown
    if (message.role === 'assistant') {
      contentElement.innerHTML = renderMarkdown(message.content)
      contentElement.classList.add('markdown')
    } else {
      contentElement.textContent = message.content
    }

    const metaElement = document.createElement('div')
    metaElement.className = 'message-meta'

    const now = new Date()
    const timeString = `${now.getHours().toString().padStart(2, '0')}:${now
      .getMinutes()
      .toString()
      .padStart(2, '0')}`

    metaElement.textContent =
      message.role === 'user'
        ? `You • ${timeString}`
        : `Morphic AI • ${timeString}`

    messageElement.appendChild(contentElement)
    messageElement.appendChild(metaElement)

    chatContainer.appendChild(messageElement)
    scrollToBottom()
  }

  function addLoadingIndicator() {
    const loadingElement = document.createElement('div')
    loadingElement.className = 'loading'

    const spinner = document.createElement('div')
    spinner.className = 'loading-spinner'

    loadingElement.appendChild(spinner)
    chatContainer.appendChild(loadingElement)

    scrollToBottom()
    return loadingElement
  }

  function addSearchResultsToUI(results) {
    const resultsElement = document.createElement('div')
    resultsElement.className = 'search-results'

    const resultsTitle = document.createElement('div')
    resultsTitle.className = 'message-meta'
    resultsTitle.textContent = 'Search Results'

    resultsElement.appendChild(resultsTitle)

    results.forEach(result => {
      const resultElement = document.createElement('div')
      resultElement.className = 'search-result'

      const titleElement = document.createElement('div')
      titleElement.className = 'search-result-title'
      titleElement.textContent = result.title

      const contentElement = document.createElement('div')
      contentElement.className = 'search-result-content'
      contentElement.textContent = result.snippet

      const urlElement = document.createElement('a')
      urlElement.className = 'search-result-url'
      urlElement.href = result.url
      urlElement.textContent = result.url
      urlElement.target = '_blank'

      resultElement.appendChild(titleElement)
      resultElement.appendChild(contentElement)
      resultElement.appendChild(urlElement)

      resultsElement.appendChild(resultElement)
    })

    const messageElement = document.createElement('div')
    messageElement.className = 'message message-assistant'
    messageElement.appendChild(resultsElement)

    chatContainer.appendChild(messageElement)
    scrollToBottom()
  }

  function renderMarkdown(text) {
    // Simple markdown rendering
    // This is a basic implementation - for production, use a proper markdown library

    // Code blocks
    text = text.replace(
      /```([a-z]*)\n([\s\S]*?)\n```/g,
      '<pre><code>$2</code></pre>'
    )

    // Inline code
    text = text.replace(/`([^`]+)`/g, '<code>$1</code>')

    // Headers
    text = text.replace(/^### (.*$)/gm, '<h3>$1</h3>')
    text = text.replace(/^## (.*$)/gm, '<h2>$1</h2>')
    text = text.replace(/^# (.*$)/gm, '<h1>$1</h1>')

    // Bold
    text = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')

    // Italic
    text = text.replace(/\*(.*?)\*/g, '<em>$1</em>')

    // Lists
    text = text.replace(/^\s*\d+\.\s+(.*$)/gm, '<li>$1</li>')
    text = text.replace(/^\s*\-\s+(.*$)/gm, '<li>$1</li>')

    // Wrap lists
    text = text
      .replace(/<li>(.*?)<\/li>/g, function (match) {
        return '<ul>' + match + '</ul>'
      })
      .replace(/<\/ul><ul>/g, '')

    // Links
    text = text.replace(
      /\[([^\]]+)\]\(([^)]+)\)/g,
      '<a href="$2" target="_blank">$1</a>'
    )

    // Paragraphs
    text = text.replace(/\n\s*\n/g, '</p><p>')
    text = '<p>' + text + '</p>'

    // Fix any broken tags
    text = text.replace(/<\/p><p><\/ul>/g, '</ul>')
    text = text.replace(/<\/p><p><ul>/g, '<ul>')

    return text
  }

  function scrollToBottom() {
    chatContainer.scrollTop = chatContainer.scrollHeight
  }

  function toggleSidebar(sidebar, show = true) {
    // Close all sidebars first
    closeAllSidebars()

    // Then open the requested one if show is true
    if (show) {
      sidebar.classList.add('open')
      overlay.classList.add('open')
    }
  }

  function closeAllSidebars() {
    chatSidebar.classList.remove('open')
    settingsSidebar.classList.remove('open')
    overlay.classList.remove('open')
  }

  function toggleTheme() {
    darkMode = themeToggle.checked
    applyTheme()
    saveSettings()
  }

  function applyTheme() {
    if (darkMode) {
      document.body.classList.add('dark')
    } else {
      document.body.classList.remove('dark')
    }
  }

  function updateSearchMode() {
    searchMode = searchModeSelect.value
    saveSettings()
  }

  async function updateDefaultModel() {
    const modelId = defaultModelSelect.value
    currentModel = availableModels.find(model => model.id === modelId)

    if (currentModel) {
      await apiService.setToStorage('currentModel', currentModel)
    }

    saveSettings()
  }

  function toggleHistorySetting() {
    historyEnabled = historyToggle.checked
    saveSettings()
  }

  async function saveSettings() {
    const settings = {
      theme: darkMode ? 'dark' : 'light',
      searchMode,
      historyEnabled
    }

    await apiService.setToStorage('settings', settings)
  }
})
