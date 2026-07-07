// Compatibility layer for Firefox
// Firefox uses browser.* APIs, Chrome uses chrome.*
if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.id) {
  if (typeof chrome === 'undefined') {
    var chrome = browser;
  } else {
    // Ensure all chrome APIs point to browser APIs
    chrome.action = browser.action || browser.browserAction;
    chrome.tabs = browser.tabs;
    chrome.runtime = browser.runtime;
    chrome.storage = browser.storage;
  }
}

// Store manifest info for content scripts to access
var manifest;
try {
  manifest = chrome.runtime.getManifest();
} catch (e) {
  // Firefox may not allow getManifest in background context
  manifest = { version: "0.2.0" };
}

// Knockoff background service worker. The toolbar button toggles the
// in-page control panel on Amazon tabs; anywhere else (no content script to
// answer the message) it opens the settings page instead.

chrome.action.onClicked.addListener(function (tab) {
  chrome.tabs.sendMessage(tab.id, { type: "ko-toggle-panel" }, function () {
    if (chrome.runtime.lastError) {
      // Try to open options page
      if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
      } else {
        // Fallback for Firefox
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
      }
    }
  });
});

// Content scripts can't open the options page themselves.
chrome.runtime.onMessage.addListener(function (msg) {
  if (msg && msg.type === "ko-open-options") {
    if (chrome.runtime.openOptionsPage) {
      chrome.runtime.openOptionsPage();
    } else {
      // Fallback for Firefox
      chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
    }
  }
});

// Provide manifest info to content scripts
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
  if (msg && msg.type === "ko-get-manifest") {
    sendResponse(manifest);
  }
});
