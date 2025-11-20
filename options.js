// Options page functionality for DeepSeek Agent Extension

// Load settings on page load
document.addEventListener('DOMContentLoaded', function() {
  loadSettings();
  loadStatistics();
  setupEventListeners();
  updateExtensionInfo();
});

function setupEventListeners() {
  // Save settings button
  document.getElementById('save-settings').addEventListener('click', saveSettings);
  
  // Reset settings button
  document.getElementById('reset-settings').addEventListener('click', resetSettings);
  
  // Data management buttons
  document.getElementById('export-data').addEventListener('click', exportAllData);
  document.getElementById('import-data').addEventListener('click', importData);
  document.getElementById('clear-data').addEventListener('click', clearAllData);
  
  // Auto-save settings on change
  const inputs = document.querySelectorAll('input, select');
  inputs.forEach(input => {
    input.addEventListener('change', debounce(saveSettings, 500));
  });
}

function loadSettings() {
  chrome.storage.local.get(['settings'], function(result) {
    const settings = result.settings || getDefaultSettings();
    
    // Apply settings to form
    document.getElementById('auto-save').checked = settings.autoSave;
    document.getElementById('include-docs').checked = settings.includeDocs;
    document.getElementById('include-tests').checked = settings.includeTests;
    document.getElementById('notifications').checked = settings.notifications;
    document.getElementById('context-detection').checked = settings.contextDetection;
    document.getElementById('smart-suggestions').checked = settings.smartSuggestions;
    document.getElementById('code-style').value = settings.codeStyle;
    document.getElementById('default-project-type').value = settings.defaultProjectType;
    document.getElementById('api-endpoint').value = settings.apiEndpoint;
    document.getElementById('max-versions').value = settings.maxVersions;
    document.getElementById('auto-cleanup-days').value = settings.autoCleanupDays;
  });
}

function getDefaultSettings() {
  return {
    autoSave: true,
    includeDocs: true,
    includeTests: true,
    notifications: true,
    contextDetection: true,
    smartSuggestions: true,
    codeStyle: 'standard',
    defaultProjectType: 'fullstack',
    apiEndpoint: 'https://api.deepseek.com',
    maxVersions: 10,
    autoCleanupDays: 30
  };
}

function saveSettings() {
  const settings = {
    autoSave: document.getElementById('auto-save').checked,
    includeDocs: document.getElementById('include-docs').checked,
    includeTests: document.getElementById('include-tests').checked,
    notifications: document.getElementById('notifications').checked,
    contextDetection: document.getElementById('context-detection').checked,
    smartSuggestions: document.getElementById('smart-suggestions').checked,
    codeStyle: document.getElementById('code-style').value,
    defaultProjectType: document.getElementById('default-project-type').value,
    apiEndpoint: document.getElementById('api-endpoint').value,
    maxVersions: parseInt(document.getElementById('max-versions').value),
    autoCleanupDays: parseInt(document.getElementById('auto-cleanup-days').value)
  };
  
  chrome.storage.local.set({settings: settings}, function() {
    showNotification('Settings saved successfully!', 'success');
    
    // Send message to background script to update settings
    chrome.runtime.sendMessage({
      action: 'settingsUpdated',
      settings: settings
    });
  });
}

function resetSettings() {
  if (confirm('Are you sure you want to reset all settings to defaults? This action cannot be undone.')) {
    const defaultSettings = getDefaultSettings();
    chrome.storage.local.set({settings: defaultSettings}, function() {
      loadSettings();
      showNotification('Settings reset to defaults!', 'success');
    });
  }
}

function loadStatistics() {
  chrome.storage.local.get(['projectVersions'], function(result) {
    const projectVersions = result.projectVersions || {};
    const totalProjects = Object.keys(projectVersions).length;
    const totalVersions = Object.values(projectVersions).length;
    
    document.getElementById('total-projects').textContent = totalProjects;
    document.getElementById('total-versions').textContent = totalVersions;
    
    // Calculate storage usage (rough estimate)
    const storageData = JSON.stringify(result);
    const storageUsedKB = Math.round(storageData.length / 1024);
    document.getElementById('storage-used').textContent = storageUsedKB;
  });
}

function exportAllData() {
  chrome.storage.local.get(null, function(result) {
    const exportData = {
      exportDate: new Date().toISOString(),
      extensionVersion: '1.0.0',
      data: result
    };
    
    const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = `deepseek-agent-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    showNotification('Data exported successfully!', 'success');
  });
}

function importData() {
  const input = document.createElement('input');
  input.type = 'file';
  input.accept = '.json';
  input.onchange = function(e) {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = function(event) {
        try {
          const data = JSON.parse(event.target.result);
          
          if (confirm('This will replace all your current data. Are you sure you want to continue?')) {
            chrome.storage.local.set(data.data, function() {
              loadSettings();
              loadStatistics();
              showNotification('Data imported successfully!', 'success');
            });
          }
        } catch (error) {
          showNotification('Error importing data: Invalid file format', 'error');
        }
      };
      reader.readAsText(file);
    }
  };
  input.click();
}

function clearAllData() {
  if (confirm('Are you sure you want to clear ALL data? This action cannot be undone and will delete all your projects and settings.')) {
    chrome.storage.local.clear(function() {
      // Reset to default settings
      const defaultSettings = getDefaultSettings();
      chrome.storage.local.set({settings: defaultSettings}, function() {
        loadSettings();
        loadStatistics();
        showNotification('All data cleared successfully!', 'success');
      });
    });
  }
}

function updateExtensionInfo() {
  // Get extension info
  chrome.management.getSelf(function(extensionInfo) {
    document.getElementById('extension-id').value = extensionInfo.id;
    document.getElementById('last-updated').value = new Date(extensionInfo.installType === 'development' ? Date.now() : extensionInfo.installTime).toLocaleString();
  });
}

function showNotification(message, type) {
  // Remove existing notifications
  document.querySelectorAll('.notification').forEach(n => n.remove());
  
  const notification = document.createElement('div');
  notification.className = `notification ${type}`;
  notification.textContent = message;
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 16px 24px;
    border-radius: 8px;
    color: white;
    font-weight: 500;
    z-index: 1000;
    max-width: 400px;
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
    animation: slideInRight 0.3s ease-out;
    background: ${type === 'success' ? 'linear-gradient(135deg, #28a745 0%, #20c997 100%)' : 
                 type === 'error' ? 'linear-gradient(135deg, #dc3545 0%, #fd7e14 100%)' : 
                 'linear-gradient(135deg, #17a2b8 0%, #667eea 100%)'};
  `;
  
  document.body.appendChild(notification);
  
  setTimeout(() => {
    notification.remove();
  }, 3000);
}

function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

// Listen for storage changes
chrome.storage.onChanged.addListener(function(changes, namespace) {
  if (namespace === 'local') {
    if (changes.projectVersions) {
      loadStatistics();
    }
    if (changes.settings) {
      loadSettings();
    }
  }
});

// Add CSS animation
const style = document.createElement('style');
style.textContent = `
  @keyframes slideInRight {
    from {
      transform: translateX(100%);
      opacity: 0;
    }
    to {
      transform: translateX(0);
      opacity: 1;
    }
  }
`;
document.head.appendChild(style);