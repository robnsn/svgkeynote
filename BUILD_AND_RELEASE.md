# Building and Releasing SVG to Keynote

This guide explains how to build the macOS desktop app and create releases.

## Quick Start for macOS Users

### Building the App on macOS

If you have a Mac, you can build the app yourself:

```bash
# Clone the repository
git clone <repository-url>
cd svgkeynote

# Install dependencies
npm install

# Build the macOS app
npm run electron:build
```

The built app will be in the `release/` folder:
- **SVG to Keynote.dmg** - Disk image for distribution (double-click to install)
- **SVG to Keynote.zip** - ZIP archive of the app

### Installation

1. Download the `.dmg` file
2. Double-click to open the disk image
3. Drag "SVG to Keynote" to the Applications folder
4. Open Applications and double-click "SVG to Keynote"

### Usage

**Method 1: Drag and Drop in Window**
- Drag SVG files directly into the app window
- Converted .key files appear next to the originals

**Method 2: Dock Icon Drop (Preferred)**
- Drop SVG files onto the app icon in the Dock
- App launches/focuses automatically
- Conversion starts immediately
- Results appear in Finder

**Method 3: File Browser**
- Click "Select File" button in the app
- Choose an SVG file
- Conversion begins

## Creating a GitHub Release

Once you've built the macOS app on a Mac:

### Option 1: Using GitHub Web Interface

1. Push your branch to GitHub
2. Go to your repository on github.com
3. Click "Releases" → "Create a new release"
4. Tag: `v1.0.0`
5. Title: `SVG to Keynote v1.0.0`
6. Upload the `.dmg` file from `release/SVG to Keynote.dmg`
7. Add release notes
8. Publish

### Option 2: Using GitHub CLI

```bash
# Build the app first (on macOS)
npm run electron:build

# Create the release
gh release create v1.0.0 \
  --title "SVG to Keynote v1.0.0" \
  --notes "Convert SVG files to native Keynote presentations" \
  release/SVG*.dmg
```

## Build Requirements

- **Node.js** 16 or later
- **npm** or yarn
- **macOS** 10.13 or later (for building macOS apps)
- **Xcode Command Line Tools** (optional, for code signing)

## Build Process Details

### Targets

- **CLI**: `npm run build:cli` → `lib/cli.js`
- **Desktop App**: `npm run build:app` → compiled Electron + React UI
- **macOS Package**: `npm run electron:build` → creates `.dmg` and `.zip`
- **All**: `npm run build` → builds CLI and dependencies

### Output Directories

- `lib/` - Compiled CLI tool
- `dist/` - Built React frontend and Electron main process
- `release/` - Final macOS app packages

## Development

### Development Mode

```bash
npm run dev:app
```

This starts:
- Vite dev server on http://localhost:5173 (hot reload)
- Electron app with DevTools open

### Production Build

```bash
npm run build
```

Compiles all code for production.

## Platform Support

Currently optimized for **macOS**. The Electron build configuration includes:

- **macOS Target**: DMG + ZIP distribution
- **Code Signing**: Ready for notarization (add signing config in electron-builder.yml)
- **Entitlements**: Configured for file access and security

The app builds work on Linux/Windows but are optimized for macOS UX.

## Signing and Notarization (for Distribution)

For production macOS releases, add code signing to `electron-builder.yml`:

```yaml
mac:
  certificateFile: path/to/certificate.p12
  certificatePassword: ${CERTIFICATE_PASSWORD}
  notarize:
    teamId: ${APPLE_TEAM_ID}
```

This ensures users won't see security warnings when opening the app.

## Troubleshooting

### Build Fails on macOS

```bash
# Clear cache and rebuild
npm run clean
npm install
npm run electron:build
```

### App Won't Open

Ensure you're on macOS 10.13 or later and have downloaded from a trusted source.

### Files Don't Convert

1. Verify the SVG file is valid (not corrupted)
2. Check file permissions (SVG must be readable)
3. Ensure output directory is writable

## CLI Tool Usage

The CLI tool works on any platform:

```bash
# Install globally
npm install -g .

# Convert file
svgkeynote input.svg output.key

# Or use locally
npm run dev -- input.svg output.key
```

## Next Steps

1. Build the macOS app on a Mac
2. Test the app thoroughly
3. Create a GitHub release with the `.dmg` file
4. Share the release link for others to download

Enjoy! 🎉
