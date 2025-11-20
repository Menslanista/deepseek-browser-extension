// Modal functionality for DeepSeek Agent
class AgentModal {
  constructor() {
    this.currentVersion = 0;
    this.projectVersions = new Map();
    this.isGenerating = false;
    this.init();
  }

  init() {
    this.setupEventListeners();
    this.loadStoredData();
    this.loadSettings();
  }

  setupEventListeners() {
    // Close modal
    document.getElementById('close-modal').addEventListener('click', () => this.closeModal());
    document.querySelector('.agent-modal-overlay').addEventListener('click', (e) => {
      if (e.target === e.currentTarget) this.closeModal();
    });

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
      btn.addEventListener('click', (e) => this.switchTab(e.target.dataset.tab));
    });

    // Project generation
    document.getElementById('generate-project').addEventListener('click', () => this.generateProject());
    document.getElementById('regenerate-project').addEventListener('click', () => this.regenerateCurrentProject());

    // Settings
    document.getElementById('export-settings').addEventListener('click', () => this.exportSettings());
    document.getElementById('import-settings').addEventListener('click', () => this.importSettings());

    // Keyboard shortcuts
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') this.closeModal();
      if (e.ctrlKey && e.key === 'Enter') this.generateProject();
    });
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

    // Refresh content if needed
    if (tabName === 'versions') {
      this.refreshVersionsList();
    }
  }

  async generateProject() {
    if (this.isGenerating) return;

    const projectData = this.collectProjectData();
    
    if (!projectData.name) {
      this.showNotification('Please enter a project name', 'error');
      return;
    }

    this.isGenerating = true;
    this.setButtonLoading(true);

    try {
      this.showNotification('Generating project structure...', 'info');
      
      // Increment version
      this.currentVersion++;
      projectData.version = this.currentVersion;
      projectData.timestamp = new Date().toISOString();

      // Generate project structure
      const projectStructure = await this.createProjectStructure(projectData);
      projectData.structure = projectStructure;

      // Store version
      this.projectVersions.set(this.currentVersion, projectData);
      this.saveToStorage();

      // Download project
      await this.downloadProject(projectStructure, projectData.name, this.currentVersion);
      
      this.showNotification(`Project version ${this.currentVersion} generated successfully!`, 'success');
      this.refreshVersionsList();
      
    } catch (error) {
      this.showNotification('Error generating project: ' + error.message, 'error');
      console.error('Project generation error:', error);
    } finally {
      this.isGenerating = false;
      this.setButtonLoading(false);
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
    const structure = {
      metadata: {
        version: projectData.version,
        generated: projectData.timestamp,
        project: projectData.name,
        type: projectData.type,
        instructions: projectData.instructions,
        techStack: projectData.techStack
      },
      files: {}
    };

    // Generate base structure
    await this.generateBaseStructure(structure, projectData);
    
    // Add technology-specific files
    await this.addTechStackFiles(structure, projectData);
    
    // Add configuration files
    await this.addConfigFiles(structure, projectData);
    
    // Add documentation if enabled
    if (projectData.settings.includeDocs) {
      await this.addDocumentation(structure, projectData);
    }

    return structure;
  }

  async generateBaseStructure(structure, projectData) {
    // Create directory structure
    structure.files['src/'] = null;
    structure.files['public/'] = null;
    structure.files['config/'] = null;
    structure.files['docs/'] = null;
    structure.files['tests/'] = null;

    // Add package.json
    structure.files['package.json'] = this.generatePackageJson(projectData);
    
    // Add README
    structure.files['README.md'] = this.generateReadme(projectData);

    // Add version file
    structure.files['VERSION.json'] = JSON.stringify({
      project: projectData.name,
      version: projectData.version,
      generated: projectData.timestamp,
      agent: 'DeepSeek AI Agent',
      techStack: projectData.techStack
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
        "nodemon": "^3.0.0",
        "jest": "^29.0.0"
      },
      keywords: ["ai-generated", "deepseek-agent", projectData.type],
      author: "DeepSeek AI Agent",
      license: "MIT"
    };

    // Add dependencies based on tech stack
    if (projectData.techStack.includes('react')) {
      basePackage.dependencies.react = "^18.2.0";
      basePackage.dependencies['react-dom'] = "^18.2.0";
    }

    if (projectData.techStack.includes('nodejs')) {
      basePackage.dependencies.express = "^4.18.0";
      basePackage.dependencies.cors = "^2.8.5";
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
${projectData.techStack.map(tech => `- ${tech.charAt(0).toUpperCase() + tech.slice(1)}`).join('\n')}

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

  // Additional methods for tech stack files, config files, etc.
  async addTechStackFiles(structure, projectData) {
    if (projectData.techStack.includes('react')) {
      structure.files['src/App.js'] = this.generateReactApp();
      structure.files['src/index.js'] = this.generateReactIndex();
      structure.files['src/App.css'] = this.generateReactAppCss();
      structure.files['src/index.css'] = this.generateReactIndexCss();
      structure.files['public/index.html'] = this.generateReactHtml();
    }
    
    if (projectData.techStack.includes('nodejs')) {
      structure.files['src/server.js'] = this.generateNodeServer();
      structure.files['src/routes/api.js'] = this.generateApiRoutes();
    }
  }

  async addConfigFiles(structure, projectData) {
    structure.files['.gitignore'] = this.generateGitignore();
    structure.files['.env.example'] = this.generateEnvExample();
    structure.files['config/default.json'] = this.generateConfigFile(projectData);
  }

  async addDocumentation(structure, projectData) {
    structure.files['docs/README.md'] = this.generateDocsReadme(projectData);
    structure.files['docs/API.md'] = this.generateApiDocs(projectData);
    structure.files['docs/SETUP.md'] = this.generateSetupDocs(projectData);
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
        <div className="features">
          <h2>Features</h2>
          <ul>
            <li>✨ Modern React application</li>
            <li>🎨 Responsive design</li>
            <li>⚡ Fast performance</li>
            <li>🔧 Easy to customize</li>
          </ul>
        </div>
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
const path = require('path');
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../public')));

// Routes
app.get('/', (req, res) => {
  res.json({ 
    message: 'Welcome to your AI generated API!',
    version: '1.0.0',
    generated: 'by DeepSeek Agent'
  });
});

// API routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ error: 'Something went wrong!' });
});

app.listen(PORT, () => {
  console.log(\`🚀 Server is running on port \${PORT}\`);
  console.log(\`📖 API documentation: http://localhost:\${PORT}/api\`);
});
`;
  }

  generateGitignore() {
    return `# Dependencies
node_modules/
npm-debug.log*
yarn-debug.log*
yarn-error.log*

# Environment variables
.env
.env.local
.env.development.local
.env.test.local
.env.production.local

# Build outputs
dist/
build/
*.tgz

# OS generated files
.DS_Store
.DS_Store?
._*
.Spotlight-V100
.Trashes
ehthumbs.db
Thumbs.db

# IDE files
.vscode/
.idea/
*.swp
*.swo
*~

# Logs
logs
*.log

# Runtime data
pids
*.pid
*.seed
*.pid.lock

# Coverage directory used by tools like istanbul
coverage/
*.lcov

# Dependency directories
jspm_packages/

# Optional npm cache directory
.npm

# Optional REPL history
.node_repl_history
`;
  }

  generateEnvExample() {
    return `# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
DB_HOST=localhost
DB_PORT=27017
DB_NAME=myapp
DB_USER=
DB_PASS=

# API Configuration
API_KEY=your_api_key_here
JWT_SECRET=your_jwt_secret_here

# External Services
OPENAI_API_KEY=your_openai_key_here
SENDGRID_API_KEY=your_sendgrid_key_here

# Development Settings
DEBUG=true
LOG_LEVEL=info
`;
  }

  // Storage methods
  loadStoredData() {
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

  loadSettings() {
    chrome.storage.local.get(['settings'], (result) => {
      if (result.settings) {
        // Apply settings to form
        document.getElementById('auto-save').checked = result.settings.autoSave;
        document.getElementById('include-docs').checked = result.settings.includeDocs;
        document.getElementById('include-tests').checked = result.settings.includeTests;
        document.getElementById('code-style').value = result.settings.codeStyle;
      }
    });
  }

  // UI methods
  setButtonLoading(isLoading) {
    const generateBtn = document.getElementById('generate-project');
    const regenerateBtn = document.getElementById('regenerate-project');
    
    if (isLoading) {
      generateBtn.innerHTML = '<span class="loading"></span> Generating...';
      generateBtn.disabled = true;
      regenerateBtn.disabled = true;
    } else {
      generateBtn.innerHTML = 'Generate Project';
      generateBtn.disabled = false;
      regenerateBtn.disabled = false;
    }
  }

  showNotification(message, type) {
    // Remove existing notifications
    document.querySelectorAll('.notification').forEach(n => n.remove());
    
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  refreshVersionsList() {
    const versionsList = document.getElementById('versions-list');
    const versions = Array.from(this.projectVersions.entries());
    
    if (versions.length === 0) {
      versionsList.innerHTML = '<div class="no-versions">No project versions generated yet.</div>';
      return;
    }

    versionsList.innerHTML = versions.map(([version, data]) => `
      <div class="version-item ${version === this.currentVersion ? 'active' : ''}">
        <div class="version-header">
          <span class="version-name">Version ${version} - ${data.name}</span>
          <span class="version-date">${new Date(data.timestamp).toLocaleString()}</span>
        </div>
        <div class="version-description">${data.description}</div>
        <div class="version-tech">
          ${data.techStack.map(tech => `<span class="tech-tag">${tech}</span>`).join('')}
        </div>
        <div class="version-actions">
          <button class="btn-download" onclick="agentModal.downloadVersion(${version})">Download</button>
          <button class="btn-restore" onclick="agentModal.restoreVersion(${version})">Restore</button>
          <button class="btn-compare" onclick="agentModal.compareVersion(${version})">Compare</button>
        </div>
      </div>
    `).join('');
  }

  downloadVersion(version) {
    const projectData = this.projectVersions.get(version);
    if (projectData) {
      this.downloadProject(projectData.structure, projectData.name, version);
      this.showNotification(`Version ${version} downloaded successfully!`, 'success');
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
      
      // Check tech stack boxes
      document.querySelectorAll('input[name="tech"]').forEach(checkbox => {
        checkbox.checked = projectData.techStack.includes(checkbox.value);
      });
      
      this.showNotification(`Version ${version} restored successfully!`, 'info');
      this.switchTab('project');
    }
  }

  compareVersion(version) {
    const currentData = this.projectVersions.get(this.currentVersion);
    const targetData = this.projectVersions.get(version);
    
    if (currentData && targetData) {
      this.showComparisonModal(currentData, targetData);
    }
  }

  showComparisonModal(current, target) {
    const modal = document.createElement('div');
    modal.className = 'comparison-modal';
    modal.innerHTML = `
      <div class="comparison-overlay">
        <div class="comparison-content">
          <div class="comparison-header">
            <h3>Version Comparison</h3>
            <button class="close-comparison" onclick="this.closest('.comparison-modal').remove()">&times;</button>
          </div>
          <div class="comparison-body">
            <div class="version-comparison">
              <div class="version-card">
                <h4>Version ${target.version} (Target)</h4>
                <p><strong>Name:</strong> ${target.name}</p>
                <p><strong>Type:</strong> ${target.type}</p>
                <p><strong>Tech Stack:</strong> ${target.techStack.join(', ')}</p>
                <p><strong>Description:</strong> ${target.description}</p>
              </div>
              <div class="version-card">
                <h4>Version ${current.version} (Current)</h4>
                <p><strong>Name:</strong> ${current.name}</p>
                <p><strong>Type:</strong> ${current.type}</p>
                <p><strong>Tech Stack:</strong> ${current.techStack.join(', ')}</p>
                <p><strong>Description:</strong> ${current.description}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    `;
    
    document.body.appendChild(modal);
  }

  regenerateCurrentProject() {
    if (this.currentVersion > 0) {
      const currentData = this.projectVersions.get(this.currentVersion);
      if (currentData) {
        // Populate form with current version data
        document.getElementById('project-name').value = currentData.name;
        document.getElementById('project-type').value = currentData.type;
        document.getElementById('project-description').value = currentData.description;
        document.getElementById('custom-instructions').value = currentData.instructions;
        
        // Check tech stack boxes
        document.querySelectorAll('input[name="tech"]').forEach(checkbox => {
          checkbox.checked = currentData.techStack.includes(checkbox.value);
        });
        
        this.showNotification(`Version ${this.currentVersion} loaded for regeneration`, 'info');
        this.switchTab('project');
      }
    } else {
      this.showNotification('No current version to regenerate', 'error');
    }
  }

  exportSettings() {
    chrome.storage.local.get(['settings'], (result) => {
      const settings = result.settings || {};
      const exportData = {
        settings: settings,
        exportedAt: new Date().toISOString(),
        version: '1.0'
      };
      
      const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `deepseek-agent-settings-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      this.showNotification('Settings exported successfully!', 'success');
    });
  }

  importSettings() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          try {
            const data = JSON.parse(event.target.result);
            if (data.settings) {
              chrome.storage.local.set({settings: data.settings}, () => {
                this.loadSettings();
                this.showNotification('Settings imported successfully!', 'success');
              });
            }
          } catch (error) {
            this.showNotification('Error importing settings: Invalid file format', 'error');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  }

  closeModal() {
    // Send message to parent window to close modal
    if (window.parent !== window) {
      window.parent.postMessage({action: 'closeAgentModal'}, '*');
    } else {
      window.close();
    }
  }
}

// Initialize modal when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
  window.agentModal = new AgentModal();
});

// Handle messages from parent window
window.addEventListener('message', function(event) {
  if (event.data.action === 'applyTemplate') {
    agentModal.applyTemplate(event.data.template);
  }
});

// Add comparison modal styles
const comparisonStyles = `
<style>
.comparison-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(0, 0, 0, 0.8);
  z-index: 10002;
  display: flex;
  justify-content: center;
  align-items: center;
}

.comparison-overlay {
  background: white;
  border-radius: 12px;
  max-width: 800px;
  width: 90%;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
}

.comparison-header {
  padding: 20px 24px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.comparison-header h3 {
  margin: 0;
  font-size: 1.4em;
}

.close-comparison {
  background: none;
  border: none;
  color: white;
  font-size: 24px;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.close-comparison:hover {
  background: rgba(255, 255, 255, 0.2);
}

.comparison-body {
  padding: 24px;
}

.version-comparison {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
}

.version-card {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 20px;
  background: #f8f9fa;
}

.version-card h4 {
  margin-top: 0;
  color: #333;
  font-size: 1.2em;
}

.version-card p {
  margin: 12px 0;
  line-height: 1.5;
}

.version-card strong {
  color: #495057;
}

@media (max-width: 768px) {
  .version-comparison {
    grid-template-columns: 1fr;
  }
}
</style>
`;

document.head.insertAdjacentHTML('beforeend', comparisonStyles);