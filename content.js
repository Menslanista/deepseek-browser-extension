// Inject Agent Mode button into DeepSeek chat interface
class DeepSeekAgent {
  constructor() {
    this.isAgentMode = false;
    this.projectVersions = new Map();
    this.currentVersion = 0;
    this.init();
  }

  init() {
    this.injectAgentButton();
    this.loadStoredVersions();
    this.observeChatInterface();
  }

  injectAgentButton() {
    // Wait for chat interface to load
    const checkInterval = setInterval(() => {
      const chatContainer = document.querySelector('.chat-container') || 
                           document.querySelector('main') || 
                           document.body;

      if (chatContainer && !document.getElementById('deepseek-agent-btn')) {
        this.createAgentButton(chatContainer);
        clearInterval(checkInterval);
      }
    }, 1000);
  }

  createAgentButton(container) {
    const agentBtn = document.createElement('button');
    agentBtn.id = 'deepseek-agent-btn';
    agentBtn.innerHTML = `
      <span class="agent-icon">🤖</span>
      <span class="agent-text">Turn on Agent Mode</span>
    `;
    agentBtn.className = 'deepseek-agent-button';
    
    agentBtn.addEventListener('click', () => this.toggleAgentMode());
    
    // Position button in a visible location
    const header = document.querySelector('header') || 
                   document.querySelector('nav') || 
                   container;
    header.appendChild(agentBtn);
  }

  toggleAgentMode() {
    this.isAgentMode = !this.isAgentMode;
    const agentBtn = document.getElementById('deepseek-agent-btn');
    
    if (this.isAgentMode) {
      agentBtn.classList.add('active');
      agentBtn.querySelector('.agent-text').textContent = 'Agent Mode: ON';
      this.openAgentModal();
    } else {
      agentBtn.classList.remove('active');
      agentBtn.querySelector('.agent-text').textContent = 'Turn on Agent Mode';
      this.closeAgentModal();
    }
  }

  openAgentModal() {
    // Create and inject modal
    const modal = document.createElement('div');
    modal.id = 'deepseek-agent-modal';
    modal.innerHTML = `
      <div class="agent-modal-overlay">
        <div class="agent-modal-content">
          <div class="modal-header">
            <h2>🤖 DeepSeek Agent Mode</h2>
            <button class="close-btn">&times;</button>
          </div>
          <div class="modal-body">
            <div class="tab-container">
              <div class="tabs">
                <button class="tab-btn active" data-tab="project">Project Setup</button>
                <button class="tab-btn" data-tab="versions">Version History</button>
                <button class="tab-btn" data-tab="settings">Settings</button>
              </div>
              
              <div class="tab-content active" id="project-tab">
                ${this.getProjectTabContent()}
              </div>
              
              <div class="tab-content" id="versions-tab">
                ${this.getVersionsTabContent()}
              </div>
              
              <div class="tab-content" id="settings-tab">
                ${this.getSettingsTabContent()}
              </div>
            </div>
          </div>
        </div>
      </div>
    `;

    document.body.appendChild(modal);

    // Add event listeners
    this.setupModalEvents();
  }

  getProjectTabContent() {
    return `
      <div class="project-form">
        <div class="form-group">
          <label for="project-name">Project Name:</label>
          <input type="text" id="project-name" placeholder="my-ai-project" />
        </div>

        <div class="form-group">
          <label for="project-type">Project Type:</label>
          <select id="project-type">
            <option value="fullstack">Full-Stack Web App</option>
            <option value="frontend">Frontend Only</option>
            <option value="backend">Backend API</option>
            <option value="chrome-extension">Chrome Extension</option>
            <option value="node-cli">Node.js CLI Tool</option>
            <option value="ai-service">AI Service</option>
          </select>
        </div>

        <div class="form-group">
          <label for="tech-stack">Technology Stack:</label>
          <div class="tech-options">
            <label><input type="checkbox" name="tech" value="react" checked> React</label>
            <label><input type="checkbox" name="tech" value="nodejs" checked> Node.js</label>
            <label><input type="checkbox" name="tech" value="mongodb"> MongoDB</label>
            <label><input type="checkbox" name="tech" value="express"> Express</label>
            <label><input type="checkbox" name="tech" value="python"> Python</label>
            <label><input type="checkbox" name="tech" value="fastapi"> FastAPI</label>
          </div>
        </div>

        <div class="form-group">
          <label for="custom-instructions">Custom Instructions for LLM:</label>
          <textarea id="custom-instructions" rows="4" placeholder="Describe your project requirements, specific features, architecture preferences, or any special instructions for the AI agent..."></textarea>
        </div>

        <div class="form-group">
          <label for="project-description">Project Description:</label>
          <textarea id="project-description" rows="3" placeholder="Detailed description of what this project should do..."></textarea>
        </div>

        <div class="form-actions">
          <button id="generate-project" class="btn-primary">Generate Project v${this.currentVersion + 1}</button>
          <button id="regenerate-project" class="btn-secondary">Regenerate Current Version</button>
        </div>
      </div>
    `;
  }

  getVersionsTabContent() {
    const versions = Array.from(this.projectVersions.entries());
    
    if (versions.length === 0) {
      return '<div class="no-versions">No project versions generated yet.</div>';
    }

    return `
      <div class="versions-list">
        <h3>Project Versions</h3>
        <div class="version-items">
          ${versions.map(([version, data]) => `
            <div class="version-item ${version === this.currentVersion ? 'active' : ''}">
              <div class="version-header">
                <span class="version-name">Version ${version} - ${data.name}</span>
                <span class="version-date">${new Date(data.timestamp).toLocaleString()}</span>
              </div>
              <div class="version-description">${data.description}</div>
              <div class="version-actions">
                <button class="btn-download" data-version="${version}">Download</button>
                <button class="btn-restore" data-version="${version}">Restore This Version</button>
                <button class="btn-compare" data-version="${version}">Compare Changes</button>
              </div>
            </div>
          `).join('')}
        </div>
      </div>
    `;
  }

  getSettingsTabContent() {
    return `
      <div class="settings-form">
        <div class="form-group">
          <label>
            <input type="checkbox" id="auto-save" checked>
            Auto-save all versions
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="include-docs" checked>
            Include documentation in projects
          </label>
        </div>
        <div class="form-group">
          <label>
            <input type="checkbox" id="include-tests" checked>
            Include test files
          </label>
        </div>
        <div class="form-group">
          <label for="code-style">Preferred Code Style:</label>
          <select id="code-style">
            <option value="standard">Standard JavaScript</option>
            <option value="airbnb">Airbnb Style</option>
            <option value="google">Google Style</option>
            <option value="custom">Custom</option>
          </select>
        </div>
      </div>
    `;
  }

  setupModalEvents() {
    const modal = document.getElementById('deepseek-agent-modal');
    const closeBtn = modal.querySelector('.close-btn');
    const tabBtns = modal.querySelectorAll('.tab-btn');
    const generateBtn = modal.querySelector('#generate-project');
    const regenerateBtn = modal.querySelector('#regenerate-project');

    closeBtn.addEventListener('click', () => this.closeAgentModal());
    modal.querySelector('.agent-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeAgentModal();
    });

    // Tab switching
    tabBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tabName = e.target.dataset.tab;
        this.switchTab(tabName);
      });
    });

    // Generate new version
    generateBtn.addEventListener('click', () => this.generateNewVersion());
    regenerateBtn.addEventListener('click', () => this.regenerateCurrentVersion());
  }

  switchTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.classList.toggle('active', btn.dataset.tab === tabName);
    });

    // Update tab content
    document.querySelectorAll('.tab-content').forEach(content => {
      content.classList.toggle('active', content.id === `${tabName}-tab`);
    });

    // Refresh versions tab if needed
    if (tabName === 'versions') {
      this.refreshVersionsTab();
    }
  }

  async generateNewVersion() {
    const projectData = this.collectProjectData();
    
    if (!projectData.name) {
      this.showNotification('Please enter a project name', 'error');
      return;
    }

    this.currentVersion++;
    projectData.version = this.currentVersion;
    projectData.timestamp = new Date().toISOString();

    try {
      this.showNotification('Generating project structure...', 'info');
      
      // Create project structure
      const projectStructure = await this.createProjectStructure(projectData);
      projectData.structure = projectStructure;
      
      // Store version
      this.projectVersions.set(this.currentVersion, projectData);
      this.saveToStorage();
      
      // Download immediately
      await this.downloadProject(projectStructure, projectData.name, this.currentVersion);
      
      this.showNotification(`Project version ${this.currentVersion} generated successfully!`, 'success');
      this.refreshVersionsTab();
      
    } catch (error) {
      this.showNotification('Error generating project: ' + error.message, 'error');
    }
  }

  collectProjectData() {
    return {
      name: document.getElementById('project-name').value,
      type: document.getElementById('project-type').value,
      description: document.getElementById('project-description').value,
      instructions: document.getElementById('custom-instructions').value,
      techStack: Array.from(document.querySelectorAll('input[name="tech"]:checked'))
        .map(input => input.value),
      settings: {
        autoSave: document.getElementById('auto-save').checked,
        includeDocs: document.getElementById('include-docs').checked,
        includeTests: document.getElementById('include-tests').checked,
        codeStyle: document.getElementById('code-style').value
      }
    };
  }

  async createProjectStructure(projectData) {
    // Enhanced project structure generator with versioning
    const structure = {
      metadata: {
        version: projectData.version,
        generated: projectData.timestamp,
        project: projectData.name,
        type: projectData.type,
        instructions: projectData.instructions
      },
      files: {}
    };

    // Generate base structure based on project type
    await this.generateBaseStructure(structure, projectData);
    
    // Add technology-specific files
    await this.addTechStackFiles(structure, projectData);
    
    // Add configuration files
    await this.addConfigFiles(structure, projectData);
    
    // Add documentation
    if (projectData.settings.includeDocs) {
      await this.addDocumentation(structure, projectData);
    }

    return structure;
  }

  async generateBaseStructure(structure, projectData) {
    // Create standard directory structure
    structure.files['src/'] = null;
    structure.files['public/'] = null;
    structure.files['config/'] = null;
    structure.files['docs/'] = null;
    structure.files['tests/'] = null;

    // Add package.json
    structure.files['package.json'] = this.generatePackageJson(projectData);
    
    // Add README with version info
    structure.files['README.md'] = this.generateReadme(projectData);

    // Add version file
    structure.files['VERSION.json'] = JSON.stringify({
      project: projectData.name,
      version: projectData.version,
      generated: projectData.timestamp,
      agent: 'DeepSeek AI Agent'
    }, null, 2);
  }

  generatePackageJson(projectData) {
    const basePackage = {
      name: projectData.name,
      version: `1.0.${projectData.version}`,
      description: projectData.description,
      main: "src/index.js",
      scripts: {
        "start": "node src/index.js",
        "dev": "nodemon src/index.js",
        "test": "jest",
        "build": "npm run build:prod",
        "build:dev": "webpack --mode development",
        "build:prod": "webpack --mode production"
      },
      dependencies: {},
      devDependencies: {
        "nodemon": "^2.0.20",
        "jest": "^29.0.0"
      },
      keywords: ["ai-generated", "deepseek-agent", projectData.type],
      repository: {
        type: "git",
        url: `https://github.com/user/${projectData.name}`
      }
    };

    // Add dependencies based on tech stack
    if (projectData.techStack.includes('react')) {
      basePackage.dependencies.react = "^18.2.0";
      basePackage.dependencies['react-dom'] = "^18.2.0";
    }

    if (projectData.techStack.includes('nodejs')) {
      basePackage.dependencies.express = "^4.18.0";
    }

    if (projectData.techStack.includes('mongodb')) {
      basePackage.dependencies.mongoose = "^7.0.0";
    }

    return JSON.stringify(basePackage, null, 2);
  }

  generateReadme(projectData) {
    return `# ${projectData.name}

> **AI Agent Generated** - Version ${projectData.version}
> 
> *Generated by DeepSeek Agent on ${new Date(projectData.timestamp).toLocaleString()}*

## Project Description
${projectData.description}

## Custom Instructions
${projectData.instructions}

## Technology Stack
- ${projectData.techStack.map(tech => tech.charAt(0).toUpperCase() + tech.slice(1)).join('\n- ')}

## Project Structure
\`\`\`
${projectData.name}/
├── src/           # Source code
├── public/        # Static assets
├── config/        # Configuration files
├── docs/          # Documentation
├── tests/         # Test files
└── VERSION.json   # Version metadata
\`\`\`

## Quick Start

\`\`\`bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test
\`\`\`

## Version History
- Version ${projectData.version}: Initial generation with ${projectData.techStack.join(', ')}

---
*This project was autonomously generated by DeepSeek AI Agent*
`;
  }

  refreshVersionsTab() {
    const versionsTab = document.getElementById('versions-tab');
    if (versionsTab && versionsTab.classList.contains('active')) {
      versionsTab.innerHTML = this.getVersionsTabContent();
      this.setupVersionEvents();
    }
  }

  setupVersionEvents() {
    // Add event listeners for version actions
    document.querySelectorAll('.btn-download').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const version = parseInt(e.target.dataset.version);
        this.downloadVersion(version);
      });
    });

    document.querySelectorAll('.btn-restore').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const version = parseInt(e.target.dataset.version);
        this.restoreVersion(version);
      });
    });

    document.querySelectorAll('.btn-compare').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const version = parseInt(e.target.dataset.version);
        this.compareVersion(version);
      });
    });
  }

  async downloadVersion(version) {
    const projectData = this.projectVersions.get(version);
    if (projectData) {
      await this.downloadProject(projectData.structure, projectData.name, version);
    }
  }

  restoreVersion(version) {
    const projectData = this.projectVersions.get(version);
    if (projectData) {
      // Populate form with restored version data
      document.getElementById('project-name').value = projectData.name;
      document.getElementById('project-type').value = projectData.type;
      document.getElementById('project-description').value = projectData.description;
      document.getElementById('custom-instructions').value = projectData.instructions;
      
      this.showNotification(`Version ${version} restored. You can now regenerate based on this version.`, 'info');
      this.switchTab('project');
    }
  }

  compareVersion(version) {
    const currentData = this.projectVersions.get(this.currentVersion);
    const targetData = this.projectVersions.get(version);
    
    if (currentData && targetData) {
      this.showComparison(currentData, targetData);
    }
  }

  showComparison(current, target) {
    // Simple comparison modal
    const comparison = `
      <div class="comparison-modal">
        <h3>Version Comparison</h3>
        <div class="comparison-grid">
          <div>
            <h4>Version ${target.version}</h4>
            <p><strong>Tech:</strong> ${target.techStack.join(', ')}</p>
            <p><strong>Description:</strong> ${target.description}</p>
          </div>
          <div>
            <h4>Version ${current.version} (Current)</h4>
            <p><strong>Tech:</strong> ${current.techStack.join(', ')}</p>
            <p><strong>Description:</strong> ${current.description}</p>
          </div>
        </div>
      </div>
    `;
    
    // You could implement a more detailed file comparison here
    this.showNotification('Version comparison shown in console', 'info');
    console.log('Version Comparison:', { target, current });
  }

  async downloadProject(projectStructure, projectName, version) {
    const te = new TextEncoder();
    const entries = [];
    for (const [filePath, content] of Object.entries(projectStructure.files)) {
      const isDir = content === null || filePath.endsWith('/');
      const data = isDir ? new Uint8Array(0) : te.encode(content);
      entries.push({ name: filePath, isDir, data });
    }
    function ct(){const t=[];for(let n=0;n<256;n++){let c=n;for(let k=0;k<8;k++){c=(c&1)?(0xEDB88320^(c>>>1)):(c>>>1);}t[n]=c;}return t;}
    const T = ct();
    function crc32(u8){let crc=0xFFFFFFFF;for(let i=0;i<u8.length;i++){crc=(crc>>>8)^T[(crc^u8[i])&0xFF];}return (crc^0xFFFFFFFF)>>>0;}
    function createZipBlob(list){
      const parts=[];let offset=0;const centrals=[];const te2=new TextEncoder();
      for(const e of list){
        const nameU8=te2.encode(e.name);
        const isDir=e.isDir;
        const data=e.data;
        const c=crc32(data);
        const cs=data.length;
        const us=data.length;
        const lf=new Uint8Array(30+nameU8.length);
        const dv=new DataView(lf.buffer);
        dv.setUint32(0,0x04034b50,true);
        dv.setUint16(4,20,true);
        dv.setUint16(6,0x0800,true);
        dv.setUint16(8,0,true);
        dv.setUint16(10,0,true);
        dv.setUint32(12,c,true);
        dv.setUint32(16,cs,true);
        dv.setUint32(20,us,true);
        dv.setUint16(24,nameU8.length,true);
        dv.setUint16(26,0,true);
        lf.set(nameU8,30);
        parts.push(lf);offset+=lf.length;
        if(!isDir){parts.push(data);offset+=data.length;}
        const extAttr=isDir?16:0;
        const cd=new Uint8Array(46+nameU8.length);
        const cdv=new DataView(cd.buffer);
        cdv.setUint32(0,0x02014b50,true);
        cdv.setUint16(4,20,true);
        cdv.setUint16(6,20,true);
        cdv.setUint16(8,0x0800,true);
        cdv.setUint16(10,0,true);
        cdv.setUint16(12,0,true);
        cdv.setUint32(14,c,true);
        cdv.setUint32(18,cs,true);
        cdv.setUint32(22,us,true);
        cdv.setUint16(26,nameU8.length,true);
        cdv.setUint16(28,0,true);
        cdv.setUint16(30,0,true);
        cdv.setUint16(32,0,true);
        cdv.setUint16(34,0,true);
        cdv.setUint32(36,extAttr,true);
        cdv.setUint32(40,offset-lf.length,true);
        cd.set(nameU8,46);
        centrals.push(cd);
      }
      const centralSize=centrals.reduce((s,c)=>s+c.length,0);
      const centralOffset=offset;
      for(const c of centrals){parts.push(c);offset+=c.length;}
      const eocd=new Uint8Array(22);
      const edv=new DataView(eocd.buffer);
      edv.setUint32(0,0x06054b50,true);
      edv.setUint16(4,0,true);
      edv.setUint16(6,0,true);
      edv.setUint16(8,list.length,true);
      edv.setUint16(10,list.length,true);
      edv.setUint32(12,centralSize,true);
      edv.setUint32(16,centralOffset,true);
      edv.setUint16(20,0,true);
      parts.push(eocd);
      const total=parts.reduce((s,p)=>s+p.length,0);
      const out=new Uint8Array(total);
      let pos=0;
      for(const p of parts){out.set(p,pos);pos+=p.length;}
      return new Blob([out],{type:'application/zip'});
    }
    const blob=createZipBlob(entries);
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;
    a.download=`${projectName}-v${version}.zip`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `agent-notification ${type}`;
    notification.textContent = message;
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  closeAgentModal() {
    const modal = document.getElementById('deepseek-agent-modal');
    if (modal) {
      modal.remove();
    }
    this.isAgentMode = false;
    const agentBtn = document.getElementById('deepseek-agent-btn');
    if (agentBtn) {
      agentBtn.classList.remove('active');
      agentBtn.querySelector('.agent-text').textContent = 'Turn on Agent Mode';
    }
  }

  loadStoredVersions() {
    chrome.storage.local.get(['projectVersions', 'currentVersion'], (result) => {
      if (result.projectVersions) {
        this.projectVersions = new Map(Object.entries(result.projectVersions).map(([k, v]) => [parseInt(k), v]));
      }
      if (result.currentVersion) {
        this.currentVersion = result.currentVersion;
      }
    });
  }

  saveToStorage() {
    const versionsObj = Object.fromEntries(this.projectVersions);
    chrome.storage.local.set({
      projectVersions: versionsObj,
      currentVersion: this.currentVersion
    });
  }

  observeChatInterface() {
    // Monitor chat for project-related discussions
    const observer = new MutationObserver((mutations) => {
      mutations.forEach((mutation) => {
        if (mutation.addedNodes.length) {
          this.checkForProjectDiscussion(mutation.addedNodes);
        }
      });
    });

    observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  checkForProjectDiscussion(nodes) {
    nodes.forEach(node => {
      if (node.nodeType === 1 && node.textContent) {
        const text = node.textContent.toLowerCase();
        
        // Detect project-related discussions
        if (text.includes('project') || text.includes('build') || text.includes('create') || text.includes('application')) {
          // Suggest using Agent Mode
          this.suggestAgentMode();
        }
      }
    });
  }

  suggestAgentMode() {
    if (!this.isAgentMode && !document.getElementById('agent-suggestion')) {
      const suggestion = document.createElement('div');
      suggestion.id = 'agent-suggestion';
      suggestion.className = 'agent-suggestion';
      suggestion.innerHTML = `
        <p>💡 <strong>DeepSeek Agent Tip:</strong> Ready to turn your idea into a complete project? 
        <button id="enable-agent-suggestion">Enable Agent Mode</button></p>
      `;
      
      document.body.appendChild(suggestion);
      
      document.getElementById('enable-agent-suggestion').addEventListener('click', () => {
        this.toggleAgentMode();
        suggestion.remove();
      });
      
      setTimeout(() => {
        if (suggestion.parentNode) {
          suggestion.remove();
        }
      }, 10000);
    }
  }

  // Additional methods for tech stack files, config files, etc.
  async addTechStackFiles(structure, projectData) {
    // Add technology-specific files based on selected stack
    if (projectData.techStack.includes('react')) {
      structure.files['src/App.js'] = this.generateReactApp();
      structure.files['src/index.js'] = this.generateReactIndex();
    }
    
    if (projectData.techStack.includes('nodejs')) {
      structure.files['src/server.js'] = this.generateNodeServer();
    }
  }

  async addConfigFiles(structure, projectData) {
    // Add configuration files
    structure.files['.gitignore'] = this.generateGitignore();
    structure.files['.env.example'] = this.generateEnvExample();
  }

  async addDocumentation(structure, projectData) {
    // Add documentation files
    structure.files['docs/README.md'] = this.generateDocsReadme(projectData);
    structure.files['docs/API.md'] = this.generateApiDocs(projectData);
  }

  // Template generators for different file types
  generateReactApp() {
    return `import React from 'react';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>Welcome to Your AI Generated Project</h1>
        <p>This project was generated by DeepSeek Agent</p>
      </header>
    </div>
  );
}

export default App;
`;
  }

  generateReactIndex() {
    return `import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
`;
  }

  generateNodeServer() {
    return `const express = require('express');
const cors = require('cors');
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => {
  res.json({ message: 'Welcome to your AI generated API!' });
});

app.listen(PORT, () => {
  console.log(\`Server is running on port \${PORT}\`);
});
`;
  }

  generateGitignore() {
    return `node_modules/
.env
.DS_Store
*.log
dist/
build/
`;
  }

  generateEnvExample() {
    return `PORT=3000
NODE_ENV=development
API_KEY=your_api_key_here
`;
  }

  generateDocsReadme(projectData) {
    return `# Documentation for ${projectData.name}

This documentation was generated by DeepSeek Agent.

## Getting Started

See the main README.md for setup instructions.

## Project Structure

- \`src/\` - Source code
- \`public/\` - Static assets  
- \`config/\` - Configuration files
- \`docs/\` - This documentation
- \`tests/\` - Test files
`;
  }

  generateApiDocs(projectData) {
    return `# API Documentation for ${projectData.name}

This API documentation was generated by DeepSeek Agent.

## Endpoints

### GET /
Returns a welcome message.

**Response:**
\`\`\`json
{
  "message": "Welcome to your AI generated API!"
}
\`\`\`

## Authentication

Add authentication details here based on your requirements.
`;
  }

  regenerateCurrentVersion() {
    if (this.currentVersion > 0) {
      const currentData = this.projectVersions.get(this.currentVersion);
      if (currentData) {
        // Repopulate form with current version data
        document.getElementById('project-name').value = currentData.name;
        document.getElementById('project-type').value = currentData.type;
        document.getElementById('project-description').value = currentData.description;
        document.getElementById('custom-instructions').value = currentData.instructions;
        
        // Check tech stack boxes
        document.querySelectorAll('input[name="tech"]').forEach(checkbox => {
          checkbox.checked = currentData.techStack.includes(checkbox.value);
        });
        
        this.showNotification(`Version ${this.currentVersion} loaded for regeneration`, 'info');
      }
    } else {
      this.showNotification('No current version to regenerate', 'error');
    }
  }
}

// Initialize the agent when content script loads
const deepSeekAgent = new DeepSeekAgent();