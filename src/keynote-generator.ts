import PptxGenJS from 'pptxgenjs';
import { SVGShape, ParsedSVG } from './svg-parser';

const PX_PER_INCH = 96;

function pxToInches(px: number): number {
  return px / PX_PER_INCH;
}

/**
 * Parse an SVG color value to a 6-char hex string (no #), or null for none/transparent.
 */
function parseColor(svgColor: string | undefined): string | null {
  if (!svgColor || svgColor === 'none' || svgColor === 'transparent') return null;

  if (svgColor.startsWith('#')) {
    let hex = svgColor.slice(1);
    if (hex.length === 3) {
      hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
    }
    return hex.toUpperCase();
  }

  const rgbMatch = svgColor.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/);
  if (rgbMatch) {
    const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
    const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
    const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
    return (r + g + b).toUpperCase();
  }

  const colorMap: Record<string, string> = {
    white: 'FFFFFF', black: '000000', red: 'FF0000', green: '008000',
    blue: '0000FF', yellow: 'FFFF00', cyan: '00FFFF', magenta: 'FF00FF',
    gray: '808080', grey: '808080', orange: 'FFA500', purple: '800080',
    pink: 'FFC0CB', brown: 'A52A2A', navy: '000080', teal: '008080',
    maroon: '800000', olive: '808000', lime: '00FF00', aqua: '00FFFF',
    silver: 'C0C0C0', fuchsia: 'FF00FF',
  };

  return colorMap[svgColor.toLowerCase()] || null;
}

function getShapeStyle(shape: SVGShape) {
  const fillColor = parseColor(shape.attributes.fill);
  const strokeColor = parseColor(shape.attributes.stroke);
  const strokeWidth = shape.attributes['stroke-width']
    ? parseFloat(shape.attributes['stroke-width'])
    : undefined;
  return { fillColor, strokeColor, strokeWidth };
}

// pptxgenjs shape type strings (runtime values from pres.shapes.*)
const SHAPE_RECT = 'rect' as any;
const SHAPE_ROUND_RECT = 'roundRect' as any;
const SHAPE_OVAL = 'ellipse' as any;
const SHAPE_LINE = 'line' as any;

// ── Shape converters ────────────────────────────────────────────────

function addRect(slide: PptxGenJS.Slide, shape: SVGShape): void {
  const x = pxToInches(parseFloat(shape.attributes.x || '0'));
  const y = pxToInches(parseFloat(shape.attributes.y || '0'));
  const w = pxToInches(parseFloat(shape.attributes.width || '100'));
  const h = pxToInches(parseFloat(shape.attributes.height || '100'));
  const { fillColor, strokeColor, strokeWidth } = getShapeStyle(shape);

  const hasRoundedCorners = shape.attributes.rx || shape.attributes.ry;
  const shapeType = hasRoundedCorners ? SHAPE_ROUND_RECT : SHAPE_RECT;

  const opts: any = { x, y, w, h };
  if (hasRoundedCorners) {
    opts.rectRadius = pxToInches(parseFloat(shape.attributes.rx || shape.attributes.ry || '0'));
  }
  if (fillColor) opts.fill = { color: fillColor };
  if (strokeColor) opts.line = { color: strokeColor, width: strokeWidth || 1 };

  slide.addShape(shapeType, opts);
}

function addCircle(slide: PptxGenJS.Slide, shape: SVGShape): void {
  const cx = parseFloat(shape.attributes.cx || '0');
  const cy = parseFloat(shape.attributes.cy || '0');
  const r = parseFloat(shape.attributes.r || '50');
  const { fillColor, strokeColor, strokeWidth } = getShapeStyle(shape);

  const opts: any = {
    x: pxToInches(cx - r),
    y: pxToInches(cy - r),
    w: pxToInches(r * 2),
    h: pxToInches(r * 2),
  };
  if (fillColor) opts.fill = { color: fillColor };
  if (strokeColor) opts.line = { color: strokeColor, width: strokeWidth || 1 };

  slide.addShape(SHAPE_OVAL, opts);
}

function addEllipse(slide: PptxGenJS.Slide, shape: SVGShape): void {
  const cx = parseFloat(shape.attributes.cx || '0');
  const cy = parseFloat(shape.attributes.cy || '0');
  const rx = parseFloat(shape.attributes.rx || '50');
  const ry = parseFloat(shape.attributes.ry || '50');
  const { fillColor, strokeColor, strokeWidth } = getShapeStyle(shape);

  const opts: any = {
    x: pxToInches(cx - rx),
    y: pxToInches(cy - ry),
    w: pxToInches(rx * 2),
    h: pxToInches(ry * 2),
  };
  if (fillColor) opts.fill = { color: fillColor };
  if (strokeColor) opts.line = { color: strokeColor, width: strokeWidth || 1 };

  slide.addShape(SHAPE_OVAL, opts);
}

function addLine(slide: PptxGenJS.Slide, shape: SVGShape): void {
  const x1 = pxToInches(parseFloat(shape.attributes.x1 || '0'));
  const y1 = pxToInches(parseFloat(shape.attributes.y1 || '0'));
  const x2 = pxToInches(parseFloat(shape.attributes.x2 || '0'));
  const y2 = pxToInches(parseFloat(shape.attributes.y2 || '0'));
  const strokeColor = parseColor(shape.attributes.stroke) || '000000';
  const strokeWidth = shape.attributes['stroke-width']
    ? parseFloat(shape.attributes['stroke-width'])
    : 1;

  slide.addShape(SHAPE_LINE, {
    x: x1,
    y: y1,
    w: x2 - x1,
    h: y2 - y1,
    line: { color: strokeColor, width: strokeWidth },
  });
}

function addText(slide: PptxGenJS.Slide, shape: SVGShape): void {
  const x = parseFloat(shape.attributes.x || '0');
  const y = parseFloat(shape.attributes.y || '0');
  const fontSize = shape.attributes['font-size']
    ? parseFloat(shape.attributes['font-size'])
    : 12;
  const fillColor = parseColor(shape.attributes.fill) || '000000';
  const content = shape.content || '';
  const fontFamily = shape.attributes['font-family'] || 'Helvetica';

  slide.addText(content, {
    x: pxToInches(x),
    y: pxToInches(y - fontSize), // SVG text y is baseline; shift up
    w: pxToInches(content.length * fontSize * 0.6 + 20),
    h: pxToInches(fontSize * 1.5),
    fontSize,
    fontFace: fontFamily.replace(/'/g, ''),
    color: fillColor,
    autoFit: true,
  });
}

function addPathAsFallback(slide: PptxGenJS.Slide, shape: SVGShape): void {
  let bbox: { x: number; y: number; w: number; h: number };

  if (shape.type === 'path') {
    bbox = calculatePathBBox(shape.attributes.d || '');
  } else {
    bbox = calculatePointsBBox(shape.attributes.points || '');
  }

  const { fillColor, strokeColor, strokeWidth } = getShapeStyle(shape);

  const opts: any = {
    x: pxToInches(bbox.x),
    y: pxToInches(bbox.y),
    w: pxToInches(bbox.w),
    h: pxToInches(bbox.h),
  };
  if (fillColor) opts.fill = { color: fillColor };
  if (strokeColor) opts.line = { color: strokeColor, width: strokeWidth || 1 };

  slide.addShape(SHAPE_RECT, opts);
}

// ── Bounding-box helpers ────────────────────────────────────────────

function calculatePathBBox(d: string) {
  const numbers = d.match(/-?\d+\.?\d*/g) || [];
  const nums = numbers.map(Number);
  if (nums.length < 2) return { x: 0, y: 0, w: 100, h: 100 };

  const xs: number[] = [];
  const ys: number[] = [];
  for (let i = 0; i < nums.length; i += 2) {
    xs.push(nums[i]);
    if (i + 1 < nums.length) ys.push(nums[i + 1]);
  }
  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, w: (maxX - minX) || 100, h: (maxY - minY) || 100 };
}

function calculatePointsBBox(points: string) {
  const pairs = points.trim().split(/\s+/);
  const xs: number[] = [];
  const ys: number[] = [];
  for (const pair of pairs) {
    const [x, y] = pair.split(',').map(Number);
    if (!isNaN(x)) xs.push(x);
    if (!isNaN(y)) ys.push(y);
  }
  if (xs.length === 0 || ys.length === 0) return { x: 0, y: 0, w: 100, h: 100 };

  const minX = Math.min(...xs);
  const maxX = Math.max(...xs);
  const minY = Math.min(...ys);
  const maxY = Math.max(...ys);
  return { x: minX, y: minY, w: (maxX - minX) || 100, h: (maxY - minY) || 100 };
}

// ── Recursive shape walker ──────────────────────────────────────────

function addShapesToSlide(slide: PptxGenJS.Slide, shapes: SVGShape[]): void {
  for (const shape of shapes) {
    try {
      switch (shape.type) {
        case 'g':
          if (shape.children) addShapesToSlide(slide, shape.children);
          break;
        case 'rect':
          addRect(slide, shape);
          break;
        case 'circle':
          addCircle(slide, shape);
          break;
        case 'ellipse':
          addEllipse(slide, shape);
          break;
        case 'line':
          addLine(slide, shape);
          break;
        case 'text':
          addText(slide, shape);
          break;
        case 'path':
        case 'polygon':
        case 'polyline':
          addPathAsFallback(slide, shape);
          break;
      }
    } catch (e) {
      console.warn(`Skipping shape type="${shape.type}":`, e);
    }
  }
}

// ── Public API ──────────────────────────────────────────────────────

/**
 * Generate a PPTX buffer from a parsed SVG.
 * Keynote opens PPTX natively with full shape editability.
 */
export async function generatePresentationFile(svg: ParsedSVG): Promise<Buffer> {
  const pres = new PptxGenJS();

  const widthInches = pxToInches(svg.width);
  const heightInches = pxToInches(svg.height);
  pres.defineLayout({ name: 'SVG', width: widthInches, height: heightInches });
  pres.layout = 'SVG';

  const slide = pres.addSlide();

  if (svg.shapes && svg.shapes.length > 0) {
    addShapesToSlide(slide, svg.shapes);
  }

  return (await pres.write({ outputType: 'nodebuffer' })) as Buffer;
}
