# Firefox Extension Build

This directory contains the Firefox-compatible version of the Knockoff Amazon Brand Filter extension.

## Changes Made for Firefox Compatibility

### 1. Compatibility Layer (`src/compat.js`)
- Added a compatibility layer that maps Firefox's `browser.*` APIs to Chrome's `chrome.*` APIs
- Handles differences in API availability between Chrome and Firefox
- Polyfills missing methods like `chrome.runtime.getManifest()` which isn't available in Firefox content scripts

### 2. Manifest Updates (`manifest.json`)
- Added `browser_specific_settings.gecko` with Firefox-specific configuration:
  - Extension ID: `knockoff@knockoff.shopping`
  - Minimum Firefox version: 109.0
  - Data collection permissions set to "none"
- Added `src/compat.js` as the first content script to ensure compatibility layer loads first
- Fixed encoding issues with special characters in the name

### 3. Background Script (`src/background.js`)
- Added compatibility layer at the top
- Added fallback for `chrome.runtime.openOptionsPage()` which may not be available in all Firefox versions
- Uses `chrome.tabs.create()` as fallback to open options page

### 4. Content Script (`src/content.js`)
- Replaced `chrome.runtime.getManifest().version` with hardcoded version string "0.2.0" (Firefox doesn't allow `getManifest()` in content scripts)
- Added `hideSponsoredListings()` function as JavaScript fallback for Firefox (which doesn't support CSS `:has()` selector)
- Updated `scan()` function to call `hideSponsoredListings()` for Firefox compatibility
- Updated `rescan()` function to reset sponsored hiding styles

### 5. Options Page (`options/options.js`)
- Added compatibility layer at the top to handle Firefox's `browser.*` APIs

### 6. CSS Updates (`src/styles.css`)
- Removed CSS rule using `:has()` selector (not supported in Firefox)
- Sponsored hiding is now handled via JavaScript in content.js

## Testing

To test the Firefox extension:

1. Open Firefox
2. Go to `about:debugging`
3. Click "This Firefox" in the left sidebar
4. Click "Load Temporary Add-on"
5. Select the `manifest.json` file from this directory

The extension should now work on Amazon pages in Firefox.

## Known Limitations

- The CSS `:has()` selector is not supported in Firefox, so sponsored listing hiding is done via JavaScript instead
- Some Chrome-specific APIs may have slightly different behavior in Firefox
- The extension ID in Firefox is `knockoff@knockoff.shopping`

## Building for Distribution

To package the extension for Firefox Add-ons:

1. Create a ZIP file of all the files in this directory
2. Submit to [Firefox Add-ons Developer Hub](https://addons.mozilla.org/developers/)
3. Use the extension ID: `knockoff@knockoff.shopping`

## File Structure

```
.
├── manifest.json              # Extension manifest (Firefox-compatible)
├── src/
│   ├── compat.js              # Chrome/Firefox compatibility layer
│   ├── background.js          # Background service worker
│   ├── content.js             # Content script with Firefox fixes
│   ├── detector.js            # Brand detection logic (unchanged)
│   ├── pdp-brand.js           # Product detail page logic (unchanged)
│   └── styles.css             # Styles (CSS :has() removed)
├── data/
│   ├── abf-brands.js          # Community brand list
│   ├── known-brands.js        # Known brands
│   ├── chinese-major.js       # Chinese major brands
│   ├── flagged-brands.js      # Flagged brands
│   └── generic-words.js        # Generic words
├── options/
│   ├── options.html           # Options page HTML
│   ├── options.js             # Options page JS (with compatibility)
│   └── options.css            # Options page CSS
└── icons/
    ├── icon16.png
    ├── icon32.png
    ├── icon48.png
    └── icon128.png
```
