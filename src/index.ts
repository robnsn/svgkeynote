import { parseSVG } from './svg-parser';
import { generatePresentationFile } from './keynote-generator';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Convert an SVG file to a PPTX presentation (opens natively in Keynote).
 */
export async function convertSVGToKeynoteFile(svgPath: string, outputPath: string): Promise<void> {
  try {
    console.log(`Parsing SVG: ${svgPath}`);
    const parsedSVG = parseSVG(svgPath);
    console.log(`SVG dimensions: ${parsedSVG.width}x${parsedSVG.height}`);
    console.log(`Found ${parsedSVG.shapes.length} shapes`);

    console.log('Generating presentation...');
    const buffer = await generatePresentationFile(parsedSVG);

    const resolvedPath = resolve(outputPath);
    writeFileSync(resolvedPath, buffer);
    console.log(`Presentation saved: ${resolvedPath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
    throw error;
  }
}

export { parseSVG } from './svg-parser';
export { generatePresentationFile } from './keynote-generator';
export type { SVGShape, ParsedSVG } from './svg-parser';
