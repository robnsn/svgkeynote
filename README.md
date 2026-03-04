# SVGKeynote

Convert SVG files into Apple Keynote presentations with natively editable shapes.

## Features

- ✨ Convert SVG shapes to native Keynote shapes
- 🎨 Preserve colors and basic styling
- 📝 Support for text elements
- 🔄 Batch conversion ready
- 💾 Creates valid .key files that open in Keynote
- 🛠️ CLI tool for easy use
- 🖥️ Native macOS desktop app with drag-and-drop support

## Installation

```bash
npm install -g svgkeynote
```

Or use with npm:

```bash
npm install svgkeynote
npx svgkeynote <input.svg>
```

## Usage

### Command Line

```bash
svgkeynote input.svg [output.key]
```

**Arguments:**
- `input.svg` - Path to the SVG file to convert (required)
- `output.key` - Path for the output Keynote file (optional). If not specified, uses the input filename with `.key` extension

**Examples:**
```bash
# Convert diagram.svg to diagram.key
svgkeynote diagram.svg

# Convert diagram.svg to my-presentation.key
svgkeynote diagram.svg my-presentation.key
```

### Desktop App

The SVG to Keynote desktop app provides a simple, visual interface for converting SVG files on macOS.

**Features:**
- Drag and drop SVG files directly onto the app
- Automatic conversion with progress indicator
- Saves Keynote files in the same folder as the original SVG
- Open results directly in Finder

**Building the App:**

```bash
npm run electron:build
```

This will create a distributable macOS app in the `release/` directory.

**Development:**

```bash
npm run dev:app
```

This starts the development server on port 5173 and launches the Electron app.

### Programmatic Usage

```typescript
import { convertSVGToKeynoteFile } from 'svgkeynote';

await convertSVGToKeynoteFile('diagram.svg', 'presentation.key');
```

## Supported SVG Elements

The converter handles the following SVG elements:

- `<rect>` - Rectangles
- `<circle>` - Circles
- `<ellipse>` - Ellipses
- `<line>` - Lines
- `<path>` - Paths (simplified bounding box)
- `<polygon>` - Polygons
- `<polyline>` - Polylines
- `<text>` - Text elements
- `<g>` - Groups (recursively processed)

## Styling Support

The converter preserves:
- Fill colors (`fill` attribute)
- Stroke colors (`stroke` attribute)
- Stroke width (`stroke-width` attribute)
- Basic positioning and sizing

## Generated Keynote Files

The output `.key` files:
- Are valid Keynote presentations that open in Apple Keynote (macOS and iPad)
- Contain all shapes as native Keynote objects (fully editable)
- Include metadata and presentation structure
- Can be further edited in Keynote

## Limitations

- Complex SVG filters and effects are not supported
- Gradients are simplified to solid colors
- Transformations may be simplified
- Very large SVGs may take time to process
- Some advanced SVG features may be approximated

## Development

### Setup

```bash
npm install
npm run build
```

### Development Modes

**CLI Tool:**
```bash
npm run dev -- input.svg output.key
```

**Desktop App:**
```bash
npm run dev:app
```

This will:
1. Start the Vite dev server on http://localhost:5173
2. Launch the Electron app
3. Enable hot reload for React components

### Building

**All targets:**
```bash
npm run build
```

**CLI only:**
```bash
npm run build:cli
```

**Desktop app and Electron:**
```bash
npm run build:app
```

**Packaged macOS app:**
```bash
npm run electron:build
```

### Testing

```bash
npm test
```

## Architecture

### Components

- **svg-parser.ts** - Parses SVG files and extracts shape information
- **keynote-generator.ts** - Converts parsed SVG to Keynote format and generates .key files
- **index.ts** - Main converter API
- **cli.ts** - Command-line interface
- **main.ts** - Electron main process (window management, file handling)
- **preload.ts** - Electron preload script (secure IPC bridge)
- **renderer/App.tsx** - React frontend for the desktop app
- **renderer/App.css** - Styling for the desktop interface

### How It Works

1. **Parse SVG** - Read and parse the SVG file into a structured format
2. **Extract Shapes** - Identify and extract geometric information from SVG elements
3. **Convert to Keynote** - Map SVG shapes to Keynote's native shape format
4. **Generate Package** - Create the Keynote file structure (ZIP archive with XML files)
5. **Save Output** - Write the .key file to disk

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.
