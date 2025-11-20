# DeepSeek Agent Mode - Chrome Extension

🤖 **Transform your conversations with DeepSeek AI into complete, functional projects with version control.**

## Overview

The DeepSeek Agent Mode extension turns DeepSeek AI from a conversational assistant into an autonomous development agent capable of generating complete project structures with full version control. Simply discuss your project ideas in the chat, and the extension will help you turn them into downloadable, ready-to-run codebases.

## ✨ Features

### 🤖 Autonomous Project Generation
- **Intelligent Project Detection**: Automatically detects when you're discussing project ideas
- **Multi-Technology Support**: Generate projects in React, Node.js, Python, MongoDB, Express, and more
- **Custom Instructions**: Add specific requirements and architecture preferences
- **Smart Templates**: Quick-start with pre-configured project templates

### 📊 Version Control System
- **Automatic Versioning**: Each generation creates a new version with metadata
- **Version History**: Browse and manage all generated versions
- **Version Comparison**: Compare changes between different versions
- **Version Restoration**: Restore previous versions and regenerate from them

### 🎨 Seamless Integration
- **DeepSeek Chat Integration**: Agent button appears directly in the chat interface
- **Context-Aware Suggestions**: Suggests Agent Mode when project discussions are detected
- **Real-time Notifications**: Get notified when projects are generated successfully
- **Persistent Storage**: All versions are saved locally in your browser

### ⚙️ Advanced Configuration
- **Customizable Settings**: Configure code styles, project defaults, and generation options
- **Export/Import**: Backup and restore your project data
- **Auto-cleanup**: Automatically remove old versions based on your preferences
- **Context Menu**: Right-click to generate projects from selected text

## 🚀 Installation

1. **Download the Extension**
   - Clone this repository or download the ZIP file
   - Extract to a local directory

2. **Load in Chrome**
   - Open Chrome and navigate to `chrome://extensions/`
   - Enable "Developer mode" in the top right
   - Click "Load unpacked" and select the extension directory
   - The DeepSeek Agent icon should appear in your toolbar

3. **Navigate to DeepSeek**
   - Go to [https://chat.deepseek.com](https://chat.deepseek.com)
   - The Agent Mode button will appear in the chat interface

## 📖 Usage

### Getting Started

1. **Open DeepSeek Chat**: Navigate to [https://chat.deepseek.com](https://chat.deepseek.com)
2. **Discuss Your Project**: Talk about what you want to build
3. **Enable Agent Mode**: Click the "Turn on Agent Mode" button
4. **Configure Your Project**: Fill in project details and technology stack
5. **Generate**: Click "Generate Project" to create your codebase
6. **Download**: The project will be automatically downloaded as a ZIP file

### Project Configuration

- **Project Name**: Choose a unique name for your project
- **Project Type**: Select from Full-Stack, Frontend, Backend, Chrome Extension, CLI Tool, or AI Service
- **Technology Stack**: Pick your preferred technologies (React, Node.js, MongoDB, Express, Python, FastAPI)
- **Custom Instructions**: Add specific requirements for the AI agent
- **Project Description**: Describe what your project should do

### Version Management

- **View History**: Access all generated versions with timestamps and descriptions
- **Download Versions**: Download any previous version as a ZIP file
- **Restore Versions**: Load previous versions for regeneration
- **Compare Versions**: See differences between versions

### Quick Templates

Access pre-configured templates for common project types:
- **React App**: Modern React application with routing
- **Node.js API**: RESTful API with Express and MongoDB
- **Full-Stack MERN**: Complete MERN stack with authentication
- **Chrome Extension**: Browser extension with popup and content scripts

## 🛠️ Technical Details

### Architecture

```
deepseek-browser-extension/
├── manifest.json              # Extension manifest
├── background.js              # Service worker for background tasks
├── content.js                 # Content script for DeepSeek integration
├── content.css                # Styles for injected elements
├── popup.html                 # Extension popup interface
├── popup.js                   # Popup functionality
├── modal.html                 # Agent modal interface
├── modal.js                   # Modal functionality
├── modal.css                  # Modal styles
├── options.html               # Settings page
├── options.js                 # Settings functionality
└── icons/                     # Extension icons
    ├── icon16.svg
    ├── icon32.svg
    ├── icon48.svg
    └── icon128.svg
```

### Key Components

#### Content Script (`content.js`)
- Injects Agent Mode button into DeepSeek chat interface
- Creates and manages the modal interface
- Handles project generation and version management
- Monitors chat for project-related discussions

#### Background Service Worker (`background.js`)
- Manages context menu integration
- Handles data export/import operations
- Coordinates between popup and content scripts
- Provides API integration capabilities

#### Modal Interface (`modal.html`, `modal.js`, `modal.css`)
- Provides the main project generation interface
- Manages tab-based navigation (Project Setup, Version History, Settings)
- Handles file generation and ZIP creation
- Implements version control features

### Supported Technologies

#### Frontend
- **React**: Modern React applications with hooks and functional components
- **Vue.js**: Vue 3 applications with Composition API
- **Angular**: Angular applications with TypeScript
- **Vanilla JavaScript**: Plain JavaScript applications

#### Backend
- **Node.js**: Express.js servers with RESTful APIs
- **Python**: FastAPI applications with async support
- **MongoDB**: Database integration with Mongoose
- **PostgreSQL**: Database integration with Sequelize

#### Full-Stack
- **MERN Stack**: MongoDB, Express, React, Node.js
- **MEAN Stack**: MongoDB, Express, Angular, Node.js
- **MEVN Stack**: MongoDB, Express, Vue.js, Node.js

#### Specialized
- **Chrome Extensions**: Manifest V3 extensions with popup and content scripts
- **CLI Tools**: Node.js command-line applications
- **AI Services**: Python-based AI/ML services

## 📋 Configuration Options

### General Settings
- **Auto-save**: Automatically save all generated versions
- **Include Documentation**: Generate comprehensive documentation
- **Include Tests**: Create test files for your projects
- **Notifications**: Enable desktop notifications for completed generations

### Code Style Options
- **Standard JavaScript**: Follows JavaScript Standard Style
- **Airbnb Style**: Follows Airbnb JavaScript Style Guide
- **Google Style**: Follows Google JavaScript Style Guide
- **Custom**: Define your own coding standards

### Advanced Settings
- **API Endpoint**: Configure DeepSeek API endpoint
- **Maximum Versions**: Set limit for stored versions per project
- **Auto-cleanup**: Automatically remove old versions after specified days
- **Context Detection**: Enable automatic project detection from chat
- **Smart Suggestions**: Enable AI-powered project suggestions

## 🔧 Development

### Setting Up Development Environment

1. **Clone the Repository**
   ```bash
   git clone https://github.com/your-username/deepseek-browser-extension.git
   cd deepseek-browser-extension
   ```

2. **Load Extension in Chrome**
   - Open `chrome://extensions/`
   - Enable Developer mode
   - Click "Load unpacked" and select the project directory

3. **Development Workflow**
   - Make changes to the code
   - Click the refresh button on the extension card
   - Test the changes in DeepSeek chat

### File Structure

```
deepseek-browser-extension/
├── manifest.json              # Extension configuration
├── background.js              # Background service worker
├── content.js                 # Main content script
├── content.css                # Content script styles
├── popup.html                 # Extension popup
├── popup.js                   # Popup functionality
├── modal.html                 # Agent modal
├── modal.js                   # Modal functionality
├── modal.css                  # Modal styles
├── options.html               # Settings page
├── options.js                 # Settings functionality
├── icons/                     # Extension icons
└── README.md                  # This file
```

### Key APIs Used

- **Chrome Extension APIs**: `chrome.storage`, `chrome.tabs`, `chrome.runtime`, `chrome.contextMenus`
- **Web APIs**: `MutationObserver`, `File API`, `Blob`, `URL.createObjectURL()`
- **JSZip**: For creating ZIP files of generated projects

## 🧪 Testing

### Manual Testing Checklist

- [ ] Extension loads without errors
- [ ] Agent button appears in DeepSeek chat
- [ ] Modal opens and closes properly
- [ ] Project generation works with different configurations
- [ ] Version history displays correctly
- [ ] Download functionality creates valid ZIP files
- [ ] Settings persist after browser restart
- [ ] Context menu integration works
- [ ] Data export/import functions properly

### Test Projects

Try generating these example projects:

1. **Simple React App**
   - Project Type: Frontend
   - Tech Stack: React
   - Description: "A simple todo list application"

2. **REST API**
   - Project Type: Backend
   - Tech Stack: Node.js, Express
   - Description: "A REST API for a blog with CRUD operations"

3. **Chrome Extension**
   - Project Type: Chrome Extension
   - Tech Stack: JavaScript
   - Description: "A productivity extension that blocks distracting websites"

## 🐛 Troubleshooting

### Common Issues

#### Extension Not Loading
- Ensure all files are in the correct directory
- Check `manifest.json` for syntax errors
- Verify Chrome Developer mode is enabled

#### Agent Button Not Appearing
- Refresh the DeepSeek page
- Check browser console for errors
- Ensure content script is injected properly

#### Project Generation Fails
- Check if JSZip library is properly included
- Verify sufficient storage space
- Check browser permissions

#### Version History Not Saving
- Ensure `chrome.storage.local` is working
- Check storage quota limits
- Verify data serialization

### Debug Mode

Enable debug mode in the extension options to get detailed logging information in the browser console.

## 🤝 Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

### Development Guidelines

1. **Code Style**: Follow the existing code style and formatting
2. **Testing**: Test all changes thoroughly before submitting
3. **Documentation**: Update documentation for new features
4. **Issues**: Report bugs and request features using GitHub Issues

### Pull Request Process

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- **DeepSeek AI**: For providing the AI platform that makes this extension possible
- **Chrome Extension Team**: For the robust extension APIs
- **Custom ZIP Implementation**: Built-in ZIP file generation without external dependencies
- **Open Source Community**: For all the amazing tools and libraries used in this project

## 📞 Support

If you encounter any issues or have questions:

1. **Check the [Issues](https://github.com/your-username/deepseek-browser-extension/issues)** page for existing solutions
2. **Create a new issue** with detailed information about your problem
3. **Include screenshots** and error messages when applicable
4. **Provide system information** (Chrome version, OS, etc.)

## 🔄 Updates

The extension will automatically check for updates. You can also manually check for updates in the Chrome Extensions page.

### Version History

- **v1.0.0**: Initial release with core functionality
  - Project generation with version control
  - Modal interface with tab navigation
  - Settings and configuration options
  - Export/import functionality
  - Context menu integration

---

**Happy coding with DeepSeek Agent Mode!** 🚀

Transform your ideas into complete projects with the power of AI and professional version control.