# Quick Start - Getting the macOS App

## TL;DR

You need to build the app on a **Mac**. Here's what to do:

### 1. On Your Mac, Clone and Build

```bash
git clone <your-repo-url>
cd svgkeynote
npm install
npm run electron:build
```

### 2. Get Your App

The built app is in `release/`:
- `SVG to Keynote.dmg` ← **Download this file**
- `SVG to Keynote.zip` (alternative)

### 3. Install on Your Mac

- Double-click the `.dmg` file
- Drag "SVG to Keynote" to Applications
- Done! Open from Applications folder

### 4. Use It

**Drop on dock icon** (easiest):
- Drop any SVG file on the app icon in your Dock
- App launches automatically
- Conversion starts immediately
- Keynote file appears in the same folder

**Or use the app window**:
- Drag files into the window
- Click "Select File" to browse

## What About GitHub Releases?

Once you have the `.dmg` file from step 2:

1. Go to your GitHub repository
2. Click "Releases" → "Create a new release"
3. Upload the `SVG to Keynote.dmg` file
4. Tag it as `v1.0.0`
5. Add release notes
6. Publish

Others can now download it!

## No Mac Available?

Use the **CLI tool instead**:

```bash
npm install -g .
svgkeynote input.svg
```

This works on any platform (macOS, Linux, Windows).

## For Developers

- **Development**: `npm run dev:app`
- **Build everything**: `npm run build`
- **Build CLI only**: `npm run build:cli`
- **Build macOS app**: `npm run electron:build`
- **Run tests**: `npm test`

## Features

✨ Native Keynote shapes
🎨 Colors and styling preserved
📊 Drag & drop support
🚀 Fast conversion
💾 Creates valid .key files

## Support

See `README.md` for detailed docs or `BUILD_AND_RELEASE.md` for comprehensive build guide.
