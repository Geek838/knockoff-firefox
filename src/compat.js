// Compatibility layer for Chrome and Firefox WebExtensions
// Firefox uses browser.* APIs, Chrome uses chrome.*
// This file provides a polyfill to make the code work in both browsers

(function() {
  'use strict';

  // Check if we're in Firefox (browser object exists)
  if (typeof browser !== 'undefined' && browser.runtime && browser.runtime.id) {
    // Firefox: map browser.* to chrome.* for compatibility
    if (typeof chrome === 'undefined') {
      window.chrome = browser;
    } else {
      // Some Firefox versions have both, ensure chrome points to browser
      // for all the APIs we use
      chrome.action = browser.action || browser.browserAction;
      chrome.tabs = browser.tabs;
      chrome.runtime = browser.runtime;
      chrome.storage = browser.storage;
    }
  } else if (typeof chrome === 'undefined') {
    // Shouldn't happen in a WebExtension context, but just in case
    console.error('Knockoff: Neither chrome nor browser API available');
  }

  // Polyfill for chrome.action (Firefox uses browserAction in older versions)
  if (typeof chrome.action === 'undefined' && typeof chrome.browserAction !== 'undefined') {
    chrome.action = chrome.browserAction;
  }

  // Ensure openOptionsPage is available
  if (chrome.runtime && typeof chrome.runtime.openOptionsPage === 'undefined') {
    chrome.runtime.openOptionsPage = function() {
      if (chrome.tabs) {
        chrome.tabs.create({ url: chrome.runtime.getURL('options/options.html') });
      }
    };
  }

  // Polyfill for chrome.runtime.getManifest() in content scripts
  // Firefox doesn't allow getManifest() in content scripts, so we need a workaround
  if (chrome.runtime && typeof chrome.runtime.getManifest === 'undefined') {
    // Store the manifest version in a variable that can be accessed
    // We'll set this from the background script
    window.__knockoffManifest = window.__knockoffManifest || {};
    chrome.runtime.getManifest = function() {
      return window.__knockoffManifest;
    };
  }

  // Polyfill for chrome.runtime.sendMessage to handle Firefox
  if (chrome.runtime && chrome.runtime.sendMessage && !chrome.runtime.sendMessage._polyfilled) {
    var originalSendMessage = chrome.runtime.sendMessage;
    chrome.runtime.sendMessage = function(message, options, responseCallback) {
      // Firefox doesn't support the options parameter in sendMessage
      if (arguments.length === 2 && typeof options === 'function') {
        return originalSendMessage(message, options);
      }
      return originalSendMessage(message, options, responseCallback);
    };
    chrome.runtime.sendMessage._polyfilled = true;
  }
})();
