# Morphic AI Assistant Chrome Extension

A Chrome extension version of the Morphic AI Assistant that leverages the existing API endpoints to provide AI-powered search and chat functionality.

## Features

- Chat with Morphic AI Assistant directly from your browser
- Perform web searches and get AI-enhanced results
- Save and manage chat history
- Customize settings including theme, search mode, and model selection
- Responsive and user-friendly interface

## Installation

### Development Mode

1. Clone or download this repository
2. Open Chrome and navigate to `chrome://extensions/`
3. Enable "Developer mode" in the top right corner
4. Click "Load unpacked" and select the `extension` folder from this repository
5. The extension should now be installed and visible in your Chrome toolbar

### From Chrome Web Store (Coming Soon)

1. Visit the Chrome Web Store
2. Search for "Morphic AI Assistant"
3. Click "Add to Chrome"

## Usage

1. Click the Morphic AI Assistant icon in your Chrome toolbar to open the extension popup
2. Type your question or request in the input field and press Enter or click the send button
3. View the AI's response and any search results
4. Access chat history and settings using the buttons in the header

## Configuration

### Settings

- **Dark Mode**: Toggle between light and dark themes
- **Search Mode**: Choose between web search or chat-only mode
- **Default Model**: Select your preferred AI model
- **Save Chat History**: Enable or disable chat history saving

## Development

### Project Structure

- `manifest.json`: Extension configuration
- `popup.html`: Main extension popup interface
- `css/styles.css`: Styling for the extension
- `js/api.js`: API service for handling requests
- `js/popup.js`: Main functionality for the popup interface
- `background.js`: Background script for extension initialization and messaging
- `icons/`: Extension icons in various sizes

### API Integration

The extension uses the following API endpoints:

- User Management: `/api/users`
- Chat Management: `/api/chats`
- Search Functionality: `/api/search`, `/api/video-search`, `/api/retrieve`
- Model Management: `/api/models`
- Provider Status: `/api/providers`

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Acknowledgements

- Built with vanilla JavaScript, HTML, and CSS
- Uses the Morphic AI API for AI functionality
