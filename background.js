// Background service worker for DeepSeek Agent Extension

// Extension installation and update handling
chrome.runtime.onInstalled.addListener(function(details) {
  console.log('DeepSeek Agent Extension installed/updated');
  
  // Set default settings
  chrome.storage.local.set({
    settings: {
      autoSave: true,
      includeDocs: true,
      includeTests: true,
      codeStyle: 'standard',
      notifications: true
    }
  });
  
  // Create context menu items
  chrome.contextMenus.create({
    id: 'deepseek-agent-generate',
    title: 'Generate Project with DeepSeek Agent',
    contexts: ['selection']
  });
  
  chrome.contextMenus.create({
    id: 'deepseek-agent-analyze',
    title: 'Analyze Code with DeepSeek Agent',
    contexts: ['selection']
  });
});

// Context menu click handler
chrome.contextMenus.onClicked.addListener(function(info, tab) {
  if (info.menuItemId === 'deepseek-agent-generate') {
    // Handle project generation from selected text
    handleProjectGeneration(info.selectionText, tab);
  } else if (info.menuItemId === 'deepseek-agent-analyze') {
    // Handle code analysis from selected text
    handleCodeAnalysis(info.selectionText, tab);
  }
});

// Handle messages from content scripts and popup
chrome.runtime.onMessage.addListener(function(request, sender, sendResponse) {
  switch (request.action) {
    case 'getSettings':
      getSettings(sendResponse);
      return true; // Keep message channel open for async response
      
    case 'saveSettings':
      saveSettings(request.settings, sendResponse);
      return true;
      
    case 'exportProject':
      exportProject(request.projectData, sendResponse);
      return true;
      
    case 'syncWithDeepSeek':
      syncWithDeepSeek(request.data, sendResponse);
      return true;
      
    default:
      sendResponse({success: false, error: 'Unknown action'});
  }
});

// Handle project generation from context menu
function handleProjectGeneration(selectionText, tab) {
  // Parse the selected text to extract project requirements
  const projectData = parseProjectRequirements(selectionText);
  
  // Store the project data for the content script
  chrome.storage.local.set({
    pendingProject: projectData,
    sourceTab: tab.id
  });
  
  // Navigate to DeepSeek if not already there
  if (!tab.url.includes('deepseek.com')) {
    chrome.tabs.create({url: 'https://chat.deepseek.com'});
  } else {
    // Send message to content script to show project generation UI
    chrome.tabs.sendMessage(tab.id, {
      action: 'showProjectGeneration',
      projectData: projectData
    });
  }
}

// Handle code analysis from context menu
function handleCodeAnalysis(selectionText, tab) {
  const analysisData = {
    code: selectionText,
    language: detectLanguage(selectionText),
    timestamp: new Date().toISOString()
  };
  
  chrome.storage.local.set({
    pendingAnalysis: analysisData,
    sourceTab: tab.id
  });
  
  if (!tab.url.includes('deepseek.com')) {
    chrome.tabs.create({url: 'https://chat.deepseek.com'});
  } else {
    chrome.tabs.sendMessage(tab.id, {
      action: 'showCodeAnalysis',
      analysisData: analysisData
    });
  }
}

// Parse project requirements from selected text
function parseProjectRequirements(text) {
  // Simple parsing logic - can be enhanced with NLP
  const requirements = {
    name: extractProjectName(text),
    type: detectProjectType(text),
    techStack: detectTechStack(text),
    description: text.substring(0, 500), // First 500 chars as description
    features: extractFeatures(text)
  };
  
  return requirements;
}

// Extract project name from text
function extractProjectName(text) {
  // Look for patterns like "project called X", "build X", "create X"
  const patterns = [
    /project called ['"](.+?)['"]/i,
    /build ['"](.+?)['"]/i,
    /create ['"](.+?)['"]/i,
    /develop ['"](.+?)['"]/i
  ];
  
  for (const pattern of patterns) {
    const match = text.match(pattern);
    if (match) {
      return match[1].replace(/\s+/g, '-').toLowerCase();
    }
  }
  
  // Fallback: use first few words
  return text.split(/\s+/).slice(0, 3).join('-').toLowerCase().replace(/[^a-z0-9-]/g, '');
}

// Detect project type from text
function detectProjectType(text) {
  const keywords = {
    'chrome-extension': ['chrome extension', 'browser extension', 'addon'],
    'fullstack': ['full stack', 'fullstack', 'frontend and backend', 'complete app'],
    'frontend': ['frontend', 'react', 'vue', 'angular', 'web app'],
    'backend': ['backend', 'api', 'server', 'database'],
    'node-cli': ['cli', 'command line', 'terminal', 'script'],
    'ai-service': ['ai', 'machine learning', 'neural network', 'model']
  };
  
  for (const [type, keywordsList] of Object.entries(keywords)) {
    for (const keyword of keywordsList) {
      if (text.toLowerCase().includes(keyword)) {
        return type;
      }
    }
  }
  
  return 'fullstack'; // Default
}

// Detect technology stack from text
function detectTechStack(text) {
  const techKeywords = {
    'react': ['react', 'reactjs'],
    'nodejs': ['node', 'nodejs', 'node.js'],
    'mongodb': ['mongodb', 'mongo'],
    'express': ['express', 'expressjs'],
    'python': ['python', 'django', 'flask'],
    'fastapi': ['fastapi'],
    'vue': ['vue', 'vuejs'],
    'angular': ['angular'],
    'typescript': ['typescript', 'ts'],
    'javascript': ['javascript', 'js']
  };
  
  const detectedTech = [];
  
  for (const [tech, keywords] of Object.entries(techKeywords)) {
    for (const keyword of keywords) {
      if (text.toLowerCase().includes(keyword)) {
        detectedTech.push(tech);
        break;
      }
    }
  }
  
  return detectedTech.length > 0 ? detectedTech : ['react', 'nodejs'];
}

// Extract features from text
function extractFeatures(text) {
  // Look for feature keywords
  const featurePatterns = [
    /features?:?\s*(.+?)(?:\.|,|$)/i,
    /include (.+?)(?:\.|,|$)/i,
    /with (.+?)(?:\.|,|$)/i
  ];
  
  const features = [];
  
  for (const pattern of featurePatterns) {
    const match = text.match(pattern);
    if (match) {
      features.push(...match[1].split(/[,and]/).map(f => f.trim()));
    }
  }
  
  return features.filter(f => f.length > 0 && f.length < 50);
}

// Detect programming language from code
function detectLanguage(code) {
  const languagePatterns = {
    'javascript': /\b(function|const|let|var|=>)\b/,
    'python': /\b(def|class|import|from)\b/,
    'java': /\b(public|private|class|interface)\b/,
    'cpp': /\b(#include|class|namespace)\b/,
    'html': /<\w+.*?>.*?<\/\w+>/,
    'css': /\{[^}]*:[^;]+;[^}]*\}/
  };
  
  for (const [lang, pattern] of Object.entries(languagePatterns)) {
    if (pattern.test(code)) {
      return lang;
    }
  }
  
  return 'text';
}

// Get extension settings
function getSettings(callback) {
  chrome.storage.local.get(['settings'], function(result) {
    callback(result.settings || {});
  });
}

// Save extension settings
function saveSettings(settings, callback) {
  chrome.storage.local.set({settings: settings}, function() {
    callback({success: true});
  });
}

// Export project data
function exportProject(projectData, callback) {
  const exportData = {
    ...projectData,
    exportedAt: new Date().toISOString(),
    version: '1.0'
  };
  
  // Create downloadable file
  const blob = new Blob([JSON.stringify(exportData, null, 2)], {type: 'application/json'});
  const url = URL.createObjectURL(blob);
  
  // Download the file
  chrome.downloads.download({
    url: url,
    filename: `deepseek-project-${projectData.name}-${Date.now()}.json`,
    saveAs: true
  }, function(downloadId) {
    if (chrome.runtime.lastError) {
      callback({success: false, error: chrome.runtime.lastError.message});
    } else {
      callback({success: true, downloadId: downloadId});
    }
    
    // Clean up the URL
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}

// Sync data with DeepSeek API
function syncWithDeepSeek(data, callback) {
  // This would integrate with DeepSeek's API when available
  // For now, we'll just store the data locally
  
  chrome.storage.local.set({
    lastSync: new Date().toISOString(),
    syncedData: data
  }, function() {
    callback({
      success: true,
      message: 'Data synced locally (API integration pending)',
      timestamp: new Date().toISOString()
    });
  });
}

// Handle extension icon click
chrome.action.onClicked.addListener(function(tab) {
  // Open DeepSeek in a new tab if not already there
  if (!tab.url.includes('deepseek.com')) {
    chrome.tabs.create({url: 'https://chat.deepseek.com'});
  }
});

// Handle tab updates to check for DeepSeek
chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
  if (changeInfo.status === 'complete' && tab.url && tab.url.includes('deepseek.com')) {
    // Check if there are pending projects or analyses
    chrome.storage.local.get(['pendingProject', 'pendingAnalysis'], function(result) {
      if (result.pendingProject) {
        chrome.tabs.sendMessage(tabId, {
          action: 'showProjectGeneration',
          projectData: result.pendingProject
        });
        chrome.storage.local.remove('pendingProject');
      } else if (result.pendingAnalysis) {
        chrome.tabs.sendMessage(tabId, {
          action: 'showCodeAnalysis',
          analysisData: result.pendingAnalysis
        });
        chrome.storage.local.remove('pendingAnalysis');
      }
    });
  }
});

// Periodic cleanup of old data
chrome.alarms.create('cleanup', {periodInMinutes: 60});

chrome.alarms.onAlarm.addListener(function(alarm) {
  if (alarm.name === 'cleanup') {
    cleanupOldData();
  }
});

// Clean up old project data (keep last 30 days)
function cleanupOldData() {
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
  
  chrome.storage.local.get(['projectVersions'], function(result) {
    if (result.projectVersions) {
      const cleanedVersions = {};
      
      for (const [versionId, versionData] of Object.entries(result.projectVersions)) {
        if (new Date(versionData.timestamp) > thirtyDaysAgo) {
          cleanedVersions[versionId] = versionData;
        }
      }
      
      chrome.storage.local.set({projectVersions: cleanedVersions});
    }
  });
}