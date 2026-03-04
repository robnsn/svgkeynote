#!/usr/bin/env node

import { convertSVGToKeynoteFile } from './index';
import { resolve, extname, basename } from 'path';
import { existsSync } from 'fs';

const args = process.argv.slice(2);

async function main() {
  if (args.length === 0 || args.includes('--help') || args.includes('-h')) {
    printHelp();
    process.exit(0);
  }

  const svgPath = args[0];
  let outputPath = args[1];

  // Validate input file
  if (!existsSync(svgPath)) {
    console.error(`Error: File not found: ${svgPath}`);
    process.exit(1);
  }

  if (extname(svgPath).toLowerCase() !== '.svg') {
    console.error('Error: Input file must be an SVG file (.svg)');
    process.exit(1);
  }

  // Generate output path if not provided
  if (!outputPath) {
    const baseName = basename(svgPath, '.svg');
    outputPath = `${baseName}.pptx`;
  }

  // Ensure output has .pptx extension
  if (extname(outputPath).toLowerCase() !== '.pptx') {
    outputPath += '.pptx';
  }

  try {
    console.log(`\n📊 SVG to Keynote Converter`);
    console.log(`${'='.repeat(40)}\n`);

    await convertSVGToKeynoteFile(resolve(svgPath), resolve(outputPath));

    console.log(`\n${'='.repeat(40)}`);
    console.log(`✨ Conversion complete!\n`);
  } catch (error) {
    console.error(`\n❌ Error: ${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  }
}

function printHelp() {
  console.log(`
SVG to Keynote Converter

Usage:
  svgkeynote <input.svg> [output.pptx]

Arguments:
  <input.svg>    Path to the SVG file to convert
  [output.pptx]  Path for the output file (optional)
                 If not provided, uses the input filename with .pptx extension

Examples:
  svgkeynote diagram.svg
  svgkeynote diagram.svg presentation.pptx

Options:
  -h, --help    Show this help message

Notes:
  - Output is a PPTX file that opens natively in Apple Keynote
  - All SVG shapes are converted to editable presentation shapes
  - Text, colors, and basic styling are preserved
  - Complex SVG features (paths, polygons) are approximated as rectangles
  `);
}

main().catch(error => {
  console.error('Unexpected error:', error);
  process.exit(1);
});
