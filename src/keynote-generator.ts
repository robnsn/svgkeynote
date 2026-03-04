import JSZip from 'jszip';
import { v4 as uuid } from 'uuid';
import { SVGShape, ParsedSVG } from './svg-parser';

interface KeynoteShape {
  id: string;
  type: string;
  geometry: {
    x: number;
    y: number;
    width: number;
    height: number;
  };
  fill?: string;
  stroke?: string;
  strokeWidth?: number;
  content?: string;
}

export interface KeynotePresentation {
  width: number;
  height: number;
  shapes: KeynoteShape[];
}

/**
 * Convert parsed SVG to Keynote presentation
 */
export function convertSVGToKeynote(svg: ParsedSVG): KeynotePresentation {
  const shapes: KeynoteShape[] = [];

  // Process all shapes in the SVG
  if (svg.shapes) {
    processShapes(svg.shapes, shapes, svg.width, svg.height);
  }

  return {
    width: svg.width,
    height: svg.height,
    shapes
  };
}

/**
 * Recursively process SVG shapes
 */
function processShapes(
  svgShapes: SVGShape[],
  keynoteShapes: KeynoteShape[],
  svgWidth: number,
  svgHeight: number
): void {
  for (const shape of svgShapes) {
    if (shape.type === 'g') {
      // Groups can contain children
      if (shape.children) {
        processShapes(shape.children, keynoteShapes, svgWidth, svgHeight);
      }
    } else if (shape.type === 'rect') {
      keynoteShapes.push(convertRect(shape, svgWidth, svgHeight));
    } else if (shape.type === 'circle') {
      keynoteShapes.push(convertCircle(shape, svgWidth, svgHeight));
    } else if (shape.type === 'ellipse') {
      keynoteShapes.push(convertEllipse(shape, svgWidth, svgHeight));
    } else if (shape.type === 'line') {
      keynoteShapes.push(convertLine(shape, svgWidth, svgHeight));
    } else if (shape.type === 'path') {
      keynoteShapes.push(convertPath(shape, svgWidth, svgHeight));
    } else if (shape.type === 'polygon' || shape.type === 'polyline') {
      keynoteShapes.push(convertPolygon(shape, svgWidth, svgHeight));
    } else if (shape.type === 'text') {
      keynoteShapes.push(convertText(shape, svgWidth, svgHeight));
    }
  }
}

function convertRect(shape: SVGShape, svgWidth: number, svgHeight: number): KeynoteShape {
  const x = parseFloat(shape.attributes.x || '0');
  const y = parseFloat(shape.attributes.y || '0');
  const width = parseFloat(shape.attributes.width || '100');
  const height = parseFloat(shape.attributes.height || '100');
  const fill = shape.attributes.fill || '#FFFFFF';
  const stroke = shape.attributes.stroke;
  const strokeWidth = shape.attributes['stroke-width'] ? parseFloat(shape.attributes['stroke-width']) : undefined;

  return {
    id: uuid(),
    type: 'shape',
    geometry: { x, y, width, height },
    fill: convertColor(fill),
    stroke: stroke ? convertColor(stroke) : undefined,
    strokeWidth
  };
}

function convertCircle(shape: SVGShape, svgWidth: number, svgHeight: number): KeynoteShape {
  const cx = parseFloat(shape.attributes.cx || '0');
  const cy = parseFloat(shape.attributes.cy || '0');
  const r = parseFloat(shape.attributes.r || '50');
  const fill = shape.attributes.fill || '#FFFFFF';
  const stroke = shape.attributes.stroke;
  const strokeWidth = shape.attributes['stroke-width'] ? parseFloat(shape.attributes['stroke-width']) : undefined;

  return {
    id: uuid(),
    type: 'circle',
    geometry: {
      x: cx - r,
      y: cy - r,
      width: r * 2,
      height: r * 2
    },
    fill: convertColor(fill),
    stroke: stroke ? convertColor(stroke) : undefined,
    strokeWidth
  };
}

function convertEllipse(shape: SVGShape, svgWidth: number, svgHeight: number): KeynoteShape {
  const cx = parseFloat(shape.attributes.cx || '0');
  const cy = parseFloat(shape.attributes.cy || '0');
  const rx = parseFloat(shape.attributes.rx || '50');
  const ry = parseFloat(shape.attributes.ry || '50');
  const fill = shape.attributes.fill || '#FFFFFF';
  const stroke = shape.attributes.stroke;
  const strokeWidth = shape.attributes['stroke-width'] ? parseFloat(shape.attributes['stroke-width']) : undefined;

  return {
    id: uuid(),
    type: 'ellipse',
    geometry: {
      x: cx - rx,
      y: cy - ry,
      width: rx * 2,
      height: ry * 2
    },
    fill: convertColor(fill),
    stroke: stroke ? convertColor(stroke) : undefined,
    strokeWidth
  };
}

function convertLine(shape: SVGShape, svgWidth: number, svgHeight: number): KeynoteShape {
  const x1 = parseFloat(shape.attributes.x1 || '0');
  const y1 = parseFloat(shape.attributes.y1 || '0');
  const x2 = parseFloat(shape.attributes.x2 || '0');
  const y2 = parseFloat(shape.attributes.y2 || '0');
  const stroke = shape.attributes.stroke || '#000000';
  const strokeWidth = shape.attributes['stroke-width'] ? parseFloat(shape.attributes['stroke-width']) : 1;

  const x = Math.min(x1, x2);
  const y = Math.min(y1, y2);
  const width = Math.abs(x2 - x1);
  const height = Math.abs(y2 - y1);

  return {
    id: uuid(),
    type: 'line',
    geometry: { x, y, width: width || 1, height: height || 1 },
    stroke: convertColor(stroke),
    strokeWidth
  };
}

function convertPath(shape: SVGShape, svgWidth: number, svgHeight: number): KeynoteShape {
  // Simplified path handling - get bounding box
  const d = shape.attributes.d || '';
  const bbox = calculatePathBoundingBox(d);
  const fill = shape.attributes.fill;
  const stroke = shape.attributes.stroke;
  const strokeWidth = shape.attributes['stroke-width'] ? parseFloat(shape.attributes['stroke-width']) : undefined;

  return {
    id: uuid(),
    type: 'path',
    geometry: bbox,
    fill: fill ? convertColor(fill) : undefined,
    stroke: stroke ? convertColor(stroke) : undefined,
    strokeWidth,
    content: d
  };
}

function convertPolygon(shape: SVGShape, svgWidth: number, svgHeight: number): KeynoteShape {
  const points = shape.attributes.points || '';
  const coords = parsePoints(points);
  const bbox = calculatePointsBoundingBox(coords);
  const fill = shape.attributes.fill || '#FFFFFF';
  const stroke = shape.attributes.stroke;
  const strokeWidth = shape.attributes['stroke-width'] ? parseFloat(shape.attributes['stroke-width']) : undefined;

  return {
    id: uuid(),
    type: shape.type === 'polygon' ? 'polygon' : 'polyline',
    geometry: bbox,
    fill: convertColor(fill),
    stroke: stroke ? convertColor(stroke) : undefined,
    strokeWidth,
    content: points
  };
}

function convertText(shape: SVGShape, svgWidth: number, svgHeight: number): KeynoteShape {
  const x = parseFloat(shape.attributes.x || '0');
  const y = parseFloat(shape.attributes.y || '0');
  const fontSize = shape.attributes['font-size'] ? parseFloat(shape.attributes['font-size']) : 12;
  const fill = shape.attributes.fill || '#000000';
  const content = shape.content || '';

  return {
    id: uuid(),
    type: 'text',
    geometry: {
      x,
      y,
      width: content.length * (fontSize * 0.6),
      height: fontSize
    },
    fill: convertColor(fill),
    content
  };
}

function calculatePathBoundingBox(d: string): { x: number; y: number; width: number; height: number } {
  // Very simplified - extracts numbers from path data
  const numbers = d.match(/-?\d+\.?\d*/g) || [];
  const nums = numbers.map(n => parseFloat(n));

  if (nums.length === 0) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  // Assume coordinates come in pairs (x, y)
  const xCoords = [];
  const yCoords = [];

  for (let i = 0; i < nums.length; i += 2) {
    if (i < nums.length) xCoords.push(nums[i]);
    if (i + 1 < nums.length) yCoords.push(nums[i + 1]);
  }

  const minX = Math.min(...xCoords);
  const maxX = Math.max(...xCoords);
  const minY = Math.min(...yCoords);
  const maxY = Math.max(...yCoords);

  return {
    x: minX,
    y: minY,
    width: maxX - minX || 100,
    height: maxY - minY || 100
  };
}

function calculatePointsBoundingBox(coords: number[][]): { x: number; y: number; width: number; height: number } {
  if (coords.length === 0) {
    return { x: 0, y: 0, width: 100, height: 100 };
  }

  const xs = coords.map(c => c[0]);
  const ys = coords.map(c => c[1]);

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);

  return {
    x: minX,
    y: minY,
    width: maxX - minX || 100,
    height: maxY - minY || 100
  };
}

function parsePoints(points: string): number[][] {
  const coords: number[][] = [];
  const pairs = points.trim().split(/\s+/);

  for (const pair of pairs) {
    const [x, y] = pair.split(',').map(v => parseFloat(v));
    if (!isNaN(x) && !isNaN(y)) {
      coords.push([x, y]);
    }
  }

  return coords;
}

function convertColor(svgColor: string): string {
  // Convert SVG color to RGB hex
  if (svgColor.startsWith('#')) {
    return svgColor;
  }

  // Map common color names
  const colorMap: Record<string, string> = {
    'white': '#FFFFFF',
    'black': '#000000',
    'red': '#FF0000',
    'green': '#00FF00',
    'blue': '#0000FF',
    'yellow': '#FFFF00',
    'cyan': '#00FFFF',
    'magenta': '#FF00FF',
    'gray': '#808080',
    'grey': '#808080',
    'transparent': '#00000000'
  };

  return colorMap[svgColor.toLowerCase()] || '#FFFFFF';
}

/**
 * Generate Keynote file as buffer
 */
export async function generateKeynoteFile(presentation: KeynotePresentation): Promise<Buffer> {
  const zip = new JSZip();

  // Add Index file
  const indexXML = generateIndexXML(presentation);
  zip.file('Index.xml', indexXML);

  // Add metadata files
  zip.file('BuildVersionHistory.plist', generateBuildVersionHistory());
  zip.file('Metadata/DocumentMetadata.plist', generateDocumentMetadata());
  zip.file('Metadata/Properties.plist', generateProperties());

  // Convert to buffer
  return zip.generateAsync({ type: 'nodebuffer' });
}

function generateIndexXML(presentation: KeynotePresentation): string {
  let shapesXML = '';

  for (const shape of presentation.shapes) {
    shapesXML += generateShapeXML(shape);
  }

  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE package>
<package version="1.0">
  <slide uidref="SLD000">
    <masterRef uidref="MST000"/>
    <geometry width="${presentation.width}" height="${presentation.height}"/>
    <layer>
      ${shapesXML}
    </layer>
  </slide>
</package>`;
}

function generateShapeXML(shape: KeynoteShape): string {
  const { id, type, geometry, fill, stroke, strokeWidth, content } = shape;

  let shapeElement = '';

  if (type === 'circle') {
    shapeElement = `<shape uidref="${id}">
      <geometry x="${geometry.x}" y="${geometry.y}" w="${geometry.width}" h="${geometry.height}"/>
      <style fill="${fill || '#FFFFFF'}" ${stroke ? `stroke="${stroke}"` : ''} ${strokeWidth ? `strokeWidth="${strokeWidth}"` : ''}/>
    </shape>`;
  } else if (type === 'text') {
    shapeElement = `<shape uidref="${id}">
      <geometry x="${geometry.x}" y="${geometry.y}" w="${geometry.width}" h="${geometry.height}"/>
      <text>${escapeXML(content || '')}</text>
      <style fill="${fill || '#000000'}"/>
    </shape>`;
  } else {
    shapeElement = `<shape uidref="${id}">
      <geometry x="${geometry.x}" y="${geometry.y}" w="${geometry.width}" h="${geometry.height}"/>
      <style fill="${fill || '#FFFFFF'}" ${stroke ? `stroke="${stroke}"` : ''} ${strokeWidth ? `strokeWidth="${strokeWidth}"` : ''}/>
    </shape>`;
  }

  return shapeElement;
}

function generateBuildVersionHistory(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>BuildVersionHistory</key>
  <array>
    <string>M15.2</string>
  </array>
</dict>
</plist>`;
}

function generateDocumentMetadata(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>Author</key>
  <string>SVGKeynote</string>
  <key>CreationDate</key>
  <date>${new Date().toISOString()}</date>
  <key>ModificationDate</key>
  <date>${new Date().toISOString()}</date>
</dict>
</plist>`;
}

function generateProperties(): string {
  return `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0">
<dict>
  <key>ShowPresenterNotes</key>
  <true/>
</dict>
</plist>`;
}

function escapeXML(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}
