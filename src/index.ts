import { parseSVG } from './svg-parser';
import { convertSVGToKeynote, generateKeynoteFile } from './keynote-generator';
import { writeFileSync } from 'fs';
import { resolve } from 'path';

/**
 * Main converter function
 * @param svgPath Path to the SVG file
 * @param outputPath Path where the Keynote file will be saved
 */
export async function convertSVGToKeynoteFile(svgPath: string, outputPath: string): Promise<void> {
  try {
    // Parse SVG
    console.log(`Parsing SVG: ${svgPath}`);
    const parsedSVG = parseSVG(svgPath);
    console.log(`SVG dimensions: ${parsedSVG.width}x${parsedSVG.height}`);
    console.log(`Found ${parsedSVG.shapes.length} shapes`);

    // Convert to Keynote
    console.log('Converting to Keynote format...');
    const presentation = convertSVGToKeynote(parsedSVG);

    // Generate Keynote file
    console.log('Generating Keynote file...');
    const buffer = await generateKeynoteFile(presentation);

    // Save to file
    const resolvedPath = resolve(outputPath);
    writeFileSync(resolvedPath, buffer);
    console.log(`✓ Keynote file saved: ${resolvedPath}`);
  } catch (error) {
    if (error instanceof Error) {
      throw new Error(`Conversion failed: ${error.message}`);
    }
    throw error;
  }
}

export { parseSVG } from './svg-parser';
export { convertSVGToKeynote, generateKeynoteFile } from './keynote-generator';
export type { SVGShape, ParsedSVG } from './svg-parser';
export type { KeynotePresentation } from './keynote-generator';
