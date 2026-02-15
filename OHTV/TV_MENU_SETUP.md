# TV Menu Display Setup

This is a full-screen menu display optimized for TV screens in your lobby or restaurant.

## Features

✅ **Full-Screen Display** - Designed for landscape TVs (1920x1080 or 4K)  
✅ **Auto-Updates** - Refreshes every 5 minutes to show latest menu changes  
✅ **Same Data Source** - Uses the same Google Sheet as your website  
✅ **Sold Out Display** - Clearly shows sold out items  
✅ **Professional Look** - Clean, easy-to-read design  
✅ **No Interaction Needed** - Just display and forget  

## Quick Setup

### 1. Configure the Menu Data

1. Open `tv-menu-loader.js`
2. Find this line:
   ```javascript
   const SHEET_ID = 'YOUR_SHEET_ID';
   ```
3. Replace `YOUR_SHEET_ID` with the same Sheet ID you used for your website menu
4. Save the file

### 2. Upload Files to Your Website

Upload these files to your web server:
- `tv-menu.html`
- `tv-menu-styles.css`
- `tv-menu-loader.js`

### 3. Display on Your TV

**Option A: Using a Smart TV**
1. Open the TV's web browser
2. Navigate to: `https://yourwebsite.com/tv-menu.html`
3. Press F11 or use the browser's fullscreen option
4. Done! Menu will auto-update every 5 minutes

**Option B: Using a Computer/Streaming Device**
1. Connect computer, Raspberry Pi, or streaming stick to TV
2. Open Chrome, Firefox, or Edge
3. Navigate to: `https://yourwebsite.com/tv-menu.html`
4. Press F11 for fullscreen
5. Optional: Set as homepage and enable kiosk mode

**Option C: Using a Digital Signage Device**
1. Many digital signage devices (like BrightSign, Chrome devices) can display web pages
2. Configure the device to display: `https://yourwebsite.com/tv-menu.html`
3. Set to auto-refresh every 5 minutes

## Customization Options

### Change Auto-Refresh Interval

In `tv-menu-loader.js`, find this line:
```javascript
setTimeout(loadMenuFromCSV, 5 * 60 * 1000); // 5 minutes
```

Change to different intervals:
- `1 * 60 * 1000` = 1 minute
- `10 * 60 * 1000` = 10 minutes
- `30 * 60 * 1000` = 30 minutes

### Adjust Font Sizes

In `tv-menu-styles.css`, find these lines and adjust as needed:

```css
.tv-logo h1 {
    font-size: 4rem; /* Make bigger or smaller */
}

.tv-item-name {
    font-size: 1.5rem; /* Menu item names */
}

.tv-item-price {
    font-size: 1.8rem; /* Prices */
}
```

### Change Colors

Colors are at the top of `tv-menu-styles.css`:
```css
:root {
    --primary-color: #8B4513;
    --secondary-color: #654321;
    --accent-color: #D2691E;
}
```

### Hide Footer

In `tv-menu.html`, comment out or delete the footer section:
```html
<!-- <footer class="tv-footer">
    <p>Visit us at 61991 E 315 Rd, Grove, OK 74344</p>
</footer> -->
```

## Tips for Best Display

### Screen Resolution
- **1920x1080 (Full HD)**: Perfect, designed for this
- **3840x2160 (4K)**: Automatically scales up fonts
- **Portrait Mode**: Menu adapts to single column

### Browser Settings
- Enable "Hardware Acceleration" for smooth performance
- Disable browser notifications
- Set zoom to 100%
- Clear cache regularly

### Preventing Sleep/Screensaver

**Windows:**
1. Settings → System → Power & Sleep
2. Set "Screen" to "Never"

**Mac:**
1. System Preferences → Energy Saver
2. Prevent computer from sleeping

**Linux/Raspberry Pi:**
```bash
xset s off
xset -dpms
xset s noblank
```

### Kiosk Mode (Prevents Exiting Fullscreen)

**Chrome:**
```bash
chrome --kiosk --app=https://yourwebsite.com/tv-menu.html
```

**Firefox:**
Install "R-Kiosk" extension

## Troubleshooting

### Menu not loading?
- Check that SHEET_ID matches your Google Sheet
- Verify the Google Sheet is published (File → Publish to web)
- Check browser console (F12) for errors

### Menu not updating?
- Wait 5 minutes for auto-refresh
- Or manually refresh the page (F5)
- Check that your Google Sheet is saving changes

### Text too small/large?
- Adjust font sizes in `tv-menu-styles.css`
- Or use browser zoom (Ctrl + / Ctrl -)

### Items in wrong order?
- Rearrange rows in your Google Sheet
- Menu displays in the same order as the sheet

## Advanced: Slideshow Mode

If your menu is very long, you can add automatic scrolling:

In `tv-menu-loader.js`, add this at the end of `renderMenu()`:
```javascript
// Enable auto-scroll
const container = document.getElementById('tv-menu-container');
container.classList.add('auto-scroll');

// Scroll to top every 60 seconds
setInterval(() => {
    container.scrollTo({ top: 0, behavior: 'smooth' });
    setTimeout(() => {
        container.scrollTo({ top: container.scrollHeight, behavior: 'smooth' });
    }, 30000);
}, 60000);
```

## Recommended Hardware

**Budget Option:**
- Raspberry Pi 4 ($35-$50)
- HDMI cable
- Power supply
- Runs Chrome in kiosk mode

**Easy Option:**
- Amazon Fire TV Stick ($30-$40)
- Use Silk Browser app
- Set as homepage

**Professional Option:**
- Chrome Box or Intel NUC ($200-$400)
- Reliable, powerful
- Easy remote management

## Support

The TV menu uses the same Google Sheet as your website, so any changes you make to the menu automatically appear everywhere!
