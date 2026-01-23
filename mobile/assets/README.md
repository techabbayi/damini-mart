# Damini Mart Mobile Assets

## Generated Assets

This folder contains app icons and splash screens for the Damini Mart mobile app.

### Files:
- **icon.svg** - App icon (1024x1024)
- **adaptive-icon.svg** - Android adaptive icon (1024x1024)
- **splash.svg** - Splash screen (1284x2778)
- **favicon.svg** - Web favicon (48x48)

### Converting to PNG:

Before building the APK, convert these SVG files to PNG format using:

```bash
# Install sharp-cli if not already installed
npm install -g sharp-cli

# Convert icon
npx sharp-cli -i assets/icon.svg -o assets/icon.png --width 1024 --height 1024

# Convert adaptive icon
npx sharp-cli -i assets/adaptive-icon.svg -o assets/adaptive-icon.png --width 1024 --height 1024

# Convert splash
npx sharp-cli -i assets/splash.svg -o assets/splash.png --width 1284 --height 2778

# Convert favicon
npx sharp-cli -i assets/favicon.svg -o assets/favicon.png --width 48 --height 48
```

Or use an online SVG to PNG converter like:
- https://svgtopng.com/
- https://convertio.co/svg-png/

### Customization:

To customize these assets, edit the SVG files with:
- Adobe Illustrator
- Inkscape (free)
- Figma
- Any text editor (they're XML)

The current design uses:
- Orange color: #f97316
- White text: #ffffff
- Simple "D" letter logo

Replace with your actual logo/brand design before production release.
