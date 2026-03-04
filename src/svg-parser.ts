import { readFileSync } from 'fs';
import { XMLParser } from 'fast-xml-parser';

export interface SVGShape {
  type: string;
  attributes: Record<string, string>;
  children?: SVGShape[];
  content?: string;
}

export interface ParsedSVG {
  width: number;
  height: number;
  viewBox?: string;
  shapes: SVGShape[];
}

/**
 * Parse SVG file and extract shape information
 */
export function parseSVG(filePath: string): ParsedSVG {
  const content = readFileSync(filePath, 'utf-8');

  const parser = new XMLParser({
    ignoreAttributes: false,
    attributeNamePrefix: '',
    textNodeName: '#text'
  });

  const parsed = parser.parse(content) as any;
  const root = parsed.svg;

  if (!root) {
    throw new Error('Invalid SVG file: root element must be <svg>');
  }

  const width = parseFloat(root.width || root.viewBox?.split(' ')[2] || '800');
  const height = parseFloat(root.height || root.viewBox?.split(' ')[3] || '600');
  const viewBox = root.viewBox;

  // Extract shapes from root
  const shapes = extractShapes(root);

  return {
    width,
    height,
    viewBox,
    shapes
  };
}

/**
 * Extract all shape elements from an SVG element
 */
function extractShapes(element: any): SVGShape[] {
  const shapes: SVGShape[] = [];

  // List of shape element types we want to process
  const shapeTypes = ['rect', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'text', 'g'];

  // Process each shape type
  for (const type of shapeTypes) {
    if (element[type]) {
      const items = Array.isArray(element[type]) ? element[type] : [element[type]];

      for (const item of items) {
        const shape = elementToShape(type, item);
        if (shape) {
          shapes.push(shape);
        }
      }
    }
  }

  return shapes;
}

/**
 * Convert an XML element to a SVGShape
 */
function elementToShape(type: string, element: any): SVGShape | null {
  const attributes: Record<string, string> = {};

  // Extract attributes
  if (typeof element === 'object' && element !== null) {
    for (const [key, value] of Object.entries(element)) {
      if (key !== '#text' && !['rect', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'text', 'g', 'tspan'].includes(key)) {
        attributes[key] = String(value);
      }
    }
  }

  const shape: SVGShape = {
    type,
    attributes
  };

  // Extract content for text elements
  if (type === 'text' && element['#text']) {
    shape.content = element['#text'];
  }

  // Extract children for groups
  if (type === 'g' && typeof element === 'object') {
    const childShapes: SVGShape[] = [];
    const childTypes = ['rect', 'circle', 'ellipse', 'line', 'path', 'polygon', 'polyline', 'text', 'g'];

    for (const childType of childTypes) {
      if (element[childType]) {
        const items = Array.isArray(element[childType]) ? element[childType] : [element[childType]];
        for (const item of items) {
          const child = elementToShape(childType, item);
          if (child) {
            childShapes.push(child);
          }
        }
      }
    }

    if (childShapes.length > 0) {
      shape.children = childShapes;
    }
  }

  return shape;
}
