// Popup functionality for DeepSeek Agent Extension
document.addEventListener('DOMContentLoaded', function() {
  // Load statistics from storage
  loadStatistics();
  
  // Add event listeners to buttons
  document.getElementById('open-agent').addEventListener('click', openAgentMode);
  document.getElementById('view-versions').addEventListener('click', viewVersionHistory);
  document.getElementById('quick-template').addEventListener('click', openQuickTemplate);
  document.getElementById('export-data').addEventListener('click', exportAllData);
  
  // Check if agent mode is active on current tab
  checkAgentModeStatus();
});

function loadStatistics() {
  chrome.storage.local.get(['projectVersions', 'currentVersion'], function(result) {
    const projectVersions = result.projectVersions || {};
    const totalProjects = Object.keys(projectVersions).length;
    const totalVersions = Object.values(projectVersions).reduce((sum, project) => {
      return sum + (project.versions ? project.versions.length : 1);
    }, 0);
    
    document.getElementById('total-projects').textContent = totalProjects;
    document.getElementById('total-versions').textContent = totalVersions;
  });
}

function checkAgentModeStatus() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    // Check if we're on DeepSeek website
    if (currentTab.url && currentTab.url.includes('deepseek.com')) {
      // Check if agent mode is active
      chrome.tabs.sendMessage(currentTab.id, {action: 'checkAgentStatus'}, function(response) {
        if (response && response.isActive) {
          updateAgentStatus(true);
        } else {
          updateAgentStatus(false);
        }
      });
    } else {
      // Not on DeepSeek, show disabled state
      updateAgentStatus(false, true);
    }
  });
}

function updateAgentStatus(isActive, isDisabled = false) {
  const agentBtn = document.getElementById('open-agent');
  const statusIndicator = document.getElementById('agent-status');
  
  if (isDisabled) {
    agentBtn.textContent = 'Not on DeepSeek';
    agentBtn.disabled = true;
    agentBtn.style.opacity = '0.6';
    statusIndicator.className = 'status-indicator status-inactive';
  } else if (isActive) {
    agentBtn.textContent = 'Agent Mode: ON';
    statusIndicator.className = 'status-indicator status-active';
  } else {
    agentBtn.textContent = 'Open Agent Mode';
    statusIndicator.className = 'status-indicator status-inactive';
  }
}

function openAgentMode() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    if (currentTab.url && currentTab.url.includes('deepseek.com')) {
      // Send message to content script to toggle agent mode
      chrome.tabs.sendMessage(currentTab.id, {action: 'toggleAgentMode'}, function(response) {
        if (response && response.success) {
          updateAgentStatus(response.isActive);
          window.close(); // Close popup after action
        }
      });
    } else {
      // Navigate to DeepSeek
      chrome.tabs.create({url: 'https://chat.deepseek.com'});
      window.close();
    }
  });
}

function viewVersionHistory() {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    if (currentTab.url && currentTab.url.includes('deepseek.com')) {
      // Send message to content script to open versions tab
      chrome.tabs.sendMessage(currentTab.id, {action: 'openVersionsTab'}, function(response) {
        if (response && response.success) {
          window.close();
        }
      });
    } else {
      alert('Please navigate to DeepSeek chat first to view version history.');
    }
  });
}

function openQuickTemplate() {
  // Create a simple template selector
  const templates = [
    {
      name: 'React App',
      type: 'frontend',
      tech: ['react'],
      description: 'A modern React application with routing and state management'
    },
    {
      name: 'Node.js API',
      type: 'backend',
      tech: ['nodejs', 'express'],
      description: 'RESTful API with Express.js and MongoDB integration'
    },
    {
      name: 'Full-Stack MERN',
      type: 'fullstack',
      tech: ['react', 'nodejs', 'mongodb', 'express'],
      description: 'Complete MERN stack application with authentication'
    },
    {
      name: 'Chrome Extension',
      type: 'chrome-extension',
      tech: ['javascript'],
      description: 'Browser extension with popup and content scripts'
    }
  ];
  
  // Create template selection dialog
  const templateHtml = `
    <div style="position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.5); z-index: 10000; display: flex; justify-content: center; align-items: center;">
      <div style="background: white; padding: 20px; border-radius: 8px; max-width: 400px; width: 90%;">
        <h3 style="margin-top: 0;">Quick Templates</h3>
        <div style="margin-bottom: 15px;">
          ${templates.map(template => `
            <div style="border: 1px solid #ddd; padding: 10px; margin-bottom: 10px; border-radius: 4px; cursor: pointer;" onclick="selectTemplate('${template.name}')">
              <strong>${template.name}</strong>
              <p style="margin: 5px 0; font-size: 12px; color: #666;">${template.description}</p>
              <small style="color: #999;">${template.tech.join(', ')}</small>
            </div>
          `).join('')}
        </div>
        <button onclick="closeTemplateDialog()" style="background: #6c757d; color: white; border: none; padding: 8px 16px; border-radius: 4px; cursor: pointer;">Cancel</button>
      </div>
    </div>
  `;
  
  // Add to document
  const dialog = document.createElement('div');
  dialog.id = 'template-dialog';
  dialog.innerHTML = templateHtml;
  document.body.appendChild(dialog);
  
  // Add global functions for template selection
  window.selectTemplate = function(templateName) {
    const template = templates.find(t => t.name === templateName);
    if (template) {
      applyTemplate(template);
    }
    closeTemplateDialog();
  };
  
  window.closeTemplateDialog = function() {
    const dialog = document.getElementById('template-dialog');
    if (dialog) {
      dialog.remove();
    }
  };
}

function applyTemplate(template) {
  chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    const currentTab = tabs[0];
    
    if (currentTab.url && currentTab.url.includes('deepseek.com')) {
      // Send template data to content script
      chrome.tabs.sendMessage(currentTab.id, {
        action: 'applyTemplate',
        template: template
      }, function(response) {
        if (response && response.success) {
          window.close();
        }
      });
    } else {
      alert('Please navigate to DeepSeek chat first to use templates.');
    }
  });
}

function exportAllData() {
  chrome.storage.local.get(['projectVersions', 'currentVersion'], function(result) {
    const data = {
      projectVersions: result.projectVersions || {},
      currentVersion: result.currentVersion || 0,
      exportDate: new Date().toISOString()
    };
    
    // Create JSON file
    const jsonData = JSON.stringify(data, null, 2);
    const blob = new Blob([jsonData], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    // Download file
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek-agent-data-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    // Show success message
    showNotification('Data exported successfully!', 'success');
  });
}

function showNotification(message, type) {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 20px;
    border-radius: 6px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 300px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
    background: ${type === 'success' ? '#28a745' : '#dc3545'};
  `;
  notification.textContent = message;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

// Listen for storage changes to update statistics
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local' && (changes.projectVersions || changes.currentVersion)) {
    loadStatistics();
  }
});