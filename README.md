# LinkedIn Connection Request Tracker

A Chrome extension that helps you track your LinkedIn connection requests and stay within the weekly limit of 100 requests (for non-premium users).

<div align="center">

[![Download Extension](https://img.shields.io/badge/Download-Chrome_Extension-00897b?style=for-the-badge&logo=googlechrome&logoColor=white)](https://github.com/Gunjan-D/LinkedIn-Connection-Tracker/raw/main/linkedin-request-tracker-v1.0.0.zip)
[![Website](https://img.shields.io/badge/Visit-Website-0a66c2?style=for-the-badge&logo=linkedin&logoColor=white)](https://gunjan-d.github.io/LinkedIn-Connection-Tracker/)
[![GitHub](https://img.shields.io/badge/GitHub-Repository-181717?style=for-the-badge&logo=github&logoColor=white)](https://github.com/Gunjan-D/LinkedIn-Connection-Tracker)

</div>

---

## Quick Start

**[📥 Download Extension](https://github.com/Gunjan-D/LinkedIn-Connection-Tracker/raw/main/linkedin-request-tracker-v1.0.0.zip)** | **[🌐 Visit Website](https://gunjan-d.github.io/LinkedIn-Connection-Tracker/)**

## Features

- **Real-time Counter**: Displays a floating widget on LinkedIn showing your current connection request count
- **Weekly Tracking**: Automatically tracks requests over a rolling 7-day period
- **Visual Indicators**: 
  - Green (Safe): 0-69 requests
  - Orange (Warning): 70-89 requests
  - Red (Critical): 90+ requests
- **Alerts**: Notifications when approaching or reaching the limit
- **History View**: See your request history for the past 7 days
- **Popup Dashboard**: Detailed statistics accessible from the extension icon
- **Auto-cleanup**: Automatically removes requests older than 7 days

## Installation

### Method 1: Load Unpacked Extension (Developer Mode)

1. **Open Chrome Extensions Page**:
   - Go to `chrome://extensions/` in your Chrome browser
   - Or click the three dots menu → More Tools → Extensions

2. **Enable Developer Mode**:
   - Toggle the "Developer mode" switch in the top-right corner

3. **Load the Extension**:
   - Click "Load unpacked" button
   - Navigate to the folder containing these extension files
   - Select the folder and click "Select Folder"

4. **Create Icons** (Required):
   - Create an `icons` folder in the extension directory
   - Add three PNG icon files:
     - `icon16.png` (16x16 pixels)
     - `icon48.png` (48x48 pixels)
     - `icon128.png` (128x128 pixels)
   - You can create simple icons using any image editor or online tool

5. **Verify Installation**:
   - The extension should appear in your extensions list
   - You should see the extension icon in your Chrome toolbar

6. **Start Using**:
   - Navigate to LinkedIn.com
   - The floating counter should appear in the bottom-right corner
   - Click any "Connect" button to see the counter increment

## How It Works

### Architecture

1. **Content Script** (`content.js`):
   - Runs on all LinkedIn pages
   - Monitors for "Connect" button clicks
   - Displays floating counter widget
   - Updates count in real-time

2. **Background Script** (`background.js`):
   - Manages extension badge (number on extension icon)
   - Updates badge color based on status

3. **Popup** (`popup.html` + `popup.js`):
   - Displays detailed statistics
   - Shows weekly history
   - Provides reset functionality

4. **Storage**:
   - Uses Chrome's local storage API
   - Stores timestamps of each connection request
   - Data persists across browser sessions

### Logic Flow

```
User clicks "Connect" button
    ↓
Content script detects click
    ↓
Timestamp is recorded in Chrome storage
    ↓
Old requests (>7 days) are cleaned up
    ↓
Counter is updated on page
    ↓
If count ≥ 90: Show warning alert
If count ≥ 100: Show limit alert
    ↓
Badge on extension icon is updated
```

### Algorithm

**Request Detection:**
```javascript
1. Monitor DOM for click events
2. Check if clicked element is a "Connect" button
3. Check for text: "Connect" or aria-label containing "connect"
4. Exclude "Pending" buttons
5. Also detect "Send" buttons in connection modals
```

**Count Calculation:**
```javascript
1. Retrieve all stored timestamps from Chrome storage
2. Filter out timestamps older than 7 days
3. Count remaining timestamps
4. Calculate percentage: (count / 100) * 100
5. Determine status based on percentage:
   - 0-69%: Safe (Green)
   - 70-89%: Warning (Orange)
   - 90-100%: Critical (Red)
```

**Data Cleanup:**
```javascript
1. Run cleanup on every new request
2. Current time - 7 days = threshold
3. Filter requests: timestamp > threshold
4. Save cleaned array back to storage
```

## Usage Guide

### Daily Use

1. **Navigate to LinkedIn**: Open www.linkedin.com
2. **Check Counter**: Look at the bottom-right corner for your current count
3. **Send Requests**: Click "Connect" buttons as usual
4. **Monitor Progress**: Counter updates automatically after each request
5. **View Details**: Click the extension icon for detailed statistics

### Features in Detail

#### Floating Widget
- **Location**: Bottom-right corner of LinkedIn pages
- **Toggle**: Click the "-" button to collapse/expand
- **Shows**:
  - Current count / 100
  - Progress bar with color coding
  - Requests this week
  - Remaining requests
  - Current status

#### Extension Popup
- **Access**: Click the extension icon in Chrome toolbar
- **Shows**:
  - Large count display
  - Progress percentage
  - Remaining requests
  - Status badge
  - Daily history for past 7 days
  - Refresh and Reset buttons

#### Alerts
- **Warning Alert** (90+ requests):
  - Orange notification
  - Shows remaining count
  - Displays for 4 seconds

- **Limit Alert** (100 requests):
  - Red notification
  - Warns about limit reached
  - Suggests waiting or upgrading
  - Displays for 5 seconds

### Resetting the Counter

You can reset the counter in two ways:

1. **From Floating Widget**: Click the "Reset Counter" button
2. **From Popup**: Click the "🗑️ Reset" button

**Note**: This clears all tracked requests. Use only if needed (e.g., testing or after upgrading to Premium).

## Technical Details

### Files Structure
```
linkedin-tracker/
├── manifest.json          # Extension configuration
├── content.js            # Main tracking logic
├── background.js         # Badge management
├── popup.html           # Popup interface
├── popup.js             # Popup logic
├── styles.css           # Widget styling
├── README.md            # This file
└── icons/
    ├── icon16.png       # 16x16 icon
    ├── icon48.png       # 48x48 icon
    └── icon128.png      # 128x128 icon
```

### Storage Format
```javascript
{
  "linkedin_connection_requests": [
    1738627200000,  // Timestamp in milliseconds
    1738713600000,
    1738800000000,
    ...
  ]
}
```

### Browser Compatibility
- Chrome 88+
- Edge 88+
- Any Chromium-based browser supporting Manifest V3

## Troubleshooting

### Counter Not Appearing
1. Refresh the LinkedIn page
2. Check if extension is enabled in `chrome://extensions/`
3. Open Developer Console (F12) and check for errors

### Counter Not Updating
1. Ensure you're clicking the actual "Connect" button
2. Wait 1 second after clicking (processing delay)
3. Check Chrome storage: `chrome://extensions/` → Extension Details → "Inspect views: service worker"

### Wrong Count
1. Click "Reset Counter" to start fresh
2. Manually verify by checking LinkedIn's "My Network" → "Manage" → "Sent"

### Icons Not Showing
1. Ensure `icons` folder exists
2. Verify icon files are named correctly (icon16.png, icon48.png, icon128.png)
3. Reload the extension

## Privacy & Security

- **No Data Collection**: All data stays on your computer
- **No External Servers**: No data is sent anywhere
- **Local Storage Only**: Uses Chrome's local storage API
- **No Permissions Abuse**: Only accesses LinkedIn.com
- **Open Source**: You can inspect all the code

## Limitations

- Only works on LinkedIn.com
- Cannot detect requests sent from mobile apps
- Cannot detect requests sent from other browsers
- Counter resets if you clear browser data
- May not catch all request types (e.g., InMail, sponsored)

## Future Enhancements

Possible improvements:
- [ ] Export request history to CSV
- [ ] Custom weekly limits
- [ ] Notification system
- [ ] Dark mode support
- [ ] Analytics dashboard
- [ ] Sync across devices (with user permission)

## Support

If you encounter issues:
1. Check the Troubleshooting section above
2. Verify you're on LinkedIn.com
3. Try refreshing the page
4. Check browser console for errors

## License

Free to use and modify for personal use.

## Changelog

### Version 1.0.0 (Initial Release)
- Real-time connection request tracking
- Floating counter widget
- Popup dashboard
- Weekly limit monitoring
- Color-coded status indicators
- Alert system
- History tracking
- Auto-cleanup of old data

---
///////////////////////////////////////////////////////////////

**Happy Networking! 🤝**

Remember: Quality connections > Quantity. Use this tool to stay organized, not to spam!
