#!/usr/bin/env node

/**
 * Color Palette Generator
 * 
 * Generates extended color palettes with 50-step increments using Oklab interpolation.
 * Uses Tailwind colors as anchors and interpolates missing values with Chroma.js.
 * 
 * Usage:
 *   node generate-color-palette.mjs <palette-name>
 * 
 * Examples:
 *   node generate-color-palette.mjs gray
 *   node generate-color-palette.mjs stone
 */

import chroma from 'chroma-js';

// Tailwind color palettes in OKLCH format
const TAILWIND_PALETTES = {
  // Neutral (true grayscale - 0 chroma)
  neutral: {
    50: 'oklch(0.985 0 0)',
    100: 'oklch(0.97 0 0)',
    200: 'oklch(0.922 0 0)',
    300: 'oklch(0.87 0 0)',
    400: 'oklch(0.708 0 0)',
    500: 'oklch(0.556 0 0)',
    600: 'oklch(0.439 0 0)',
    700: 'oklch(0.371 0 0)',
    800: 'oklch(0.269 0 0)',
    900: 'oklch(0.205 0 0)',
    950: 'oklch(0.145 0 0)',
  },
  // Stone (warm gray)
  stone: {
    50: 'oklch(0.985 0.001 106.423)',
    100: 'oklch(0.97 0.001 106.424)',
    200: 'oklch(0.923 0.003 48.717)',
    300: 'oklch(0.869 0.005 56.366)',
    400: 'oklch(0.709 0.01 56.259)',
    500: 'oklch(0.553 0.013 58.071)',
    600: 'oklch(0.444 0.011 73.639)',
    700: 'oklch(0.374 0.01 67.558)',
    800: 'oklch(0.268 0.007 34.298)',
    900: 'oklch(0.216 0.006 56.043)',
    950: 'oklch(0.147 0.004 49.25)',
  },
  // Zinc (cool gray)
  zinc: {
    50: 'oklch(0.985 0 0)',
    100: 'oklch(0.967 0.001 286.375)',
    200: 'oklch(0.92 0.004 286.32)',
    300: 'oklch(0.871 0.006 286.286)',
    400: 'oklch(0.705 0.015 286.067)',
    500: 'oklch(0.552 0.016 285.938)',
    600: 'oklch(0.442 0.017 285.786)',
    700: 'oklch(0.37 0.013 285.805)',
    800: 'oklch(0.274 0.006 286.033)',
    900: 'oklch(0.21 0.006 285.885)',
    950: 'oklch(0.141 0.005 285.823)',
  },
  // Slate (blue-gray)
  slate: {
    50: 'oklch(0.984 0.003 247.858)',
    100: 'oklch(0.968 0.007 247.896)',
    200: 'oklch(0.929 0.013 255.508)',
    300: 'oklch(0.869 0.022 252.894)',
    400: 'oklch(0.704 0.04 256.788)',
    500: 'oklch(0.554 0.046 257.417)',
    600: 'oklch(0.446 0.043 257.281)',
    700: 'oklch(0.372 0.044 257.287)',
    800: 'oklch(0.279 0.041 260.031)',
    900: 'oklch(0.208 0.042 265.755)',
    950: 'oklch(0.129 0.042 264.695)',
  },
  // Gray (neutral with slight blue tint)
  gray: {
    50: 'oklch(0.985 0.002 247.839)',
    100: 'oklch(0.967 0.003 264.542)',
    200: 'oklch(0.928 0.006 264.531)',
    300: 'oklch(0.872 0.01 258.338)',
    400: 'oklch(0.707 0.022 261.325)',
    500: 'oklch(0.551 0.027 264.364)',
    600: 'oklch(0.446 0.03 256.802)',
    700: 'oklch(0.373 0.034 259.733)',
    800: 'oklch(0.278 0.033 256.848)',
    900: 'oklch(0.21 0.034 264.665)',
    950: 'oklch(0.13 0.028 261.692)',
  },
};

// Mapping from output names to Tailwind palette names
const PALETTE_MAPPING = {
  gray: 'neutral',  // Use neutral for "gray" output
  stone: 'stone',
  zinc: 'zinc',
  slate: 'slate',
};

/**
 * Convert OKLCH string to hex using Chroma.js
 */
function oklchToHex(oklchString) {
  const match = oklchString.match(/oklch\(([\d.]+)\s+([\d.]+)\s+([\d.]+)\)/);
  if (!match) throw new Error(`Invalid OKLCH: ${oklchString}`);
  
  const [, l, c, h] = match.map(Number);
  return chroma.oklch(l, c, h).hex();
}

/**
 * Generate a complete palette with 50-step increments
 */
function generatePalette(paletteName) {
  const tailwindName = PALETTE_MAPPING[paletteName] || paletteName;
  const tailwindPalette = TAILWIND_PALETTES[tailwindName];
  
  if (!tailwindPalette) {
    console.error(`Unknown palette: ${paletteName}`);
    console.error(`Available palettes: ${Object.keys(PALETTE_MAPPING).join(', ')}`);
    process.exit(1);
  }

  // Convert anchor colors to hex
  const anchorColors = {};
  for (const [step, oklch] of Object.entries(tailwindPalette)) {
    anchorColors[step] = oklchToHex(oklch);
  }

  // Define interpolation pairs for missing steps
  const interpolations = [
    { step: 150, from: 100, to: 200 },
    { step: 250, from: 200, to: 300 },
    { step: 350, from: 300, to: 400 },
    { step: 450, from: 400, to: 500 },
    { step: 550, from: 500, to: 600 },
    { step: 650, from: 600, to: 700 },
    { step: 750, from: 700, to: 800 },
    { step: 850, from: 800, to: 900 },
  ];

  // Generate interpolated colors using Oklab
  const interpolatedColors = {};
  for (const { step, from, to } of interpolations) {
    const color1 = anchorColors[from];
    const color2 = anchorColors[to];
    interpolatedColors[step] = chroma.mix(color1, color2, 0.5, 'oklab').hex();
  }

  // Combine all colors
  const allColors = { ...anchorColors, ...interpolatedColors };
  const sortedSteps = [50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650, 700, 750, 800, 850, 900, 950];

  return { allColors, sortedSteps, anchorColors };
}

/**
 * Generate JSON token format
 */
function generateTokens(paletteName, allColors, sortedSteps) {
  const tokens = {};
  const displayName = paletteName.charAt(0).toUpperCase() + paletteName.slice(1);
  
  for (const step of sortedSteps) {
    const isLightest = step === 50;
    const isDarkest = step === 950;
    
    let description = `${displayName} ${step}`;
    if (isLightest) description += ' - Lightest';
    else if (isDarkest) description += ' - Darkest';
    
    tokens[step] = {
      "$type": "color",
      "$value": allColors[step],
      "$description": description
    };
  }
  
  return tokens;
}

// Main execution
const paletteName = process.argv[2];

if (!paletteName) {
  console.log('Color Palette Generator');
  console.log('=======================');
  console.log('');
  console.log('Usage: node generate-color-palette.mjs <palette-name>');
  console.log('');
  console.log('Available palettes:');
  for (const [name, tailwindName] of Object.entries(PALETTE_MAPPING)) {
    console.log(`  ${name} (from Tailwind ${tailwindName})`);
  }
  process.exit(0);
}

const { allColors, sortedSteps, anchorColors } = generatePalette(paletteName);

console.log(`\n${paletteName.toUpperCase()} Color Palette`);
console.log('='.repeat(30));
console.log('');

console.log('Anchor Colors (from Tailwind):');
for (const [step, hex] of Object.entries(anchorColors).sort((a, b) => Number(a[0]) - Number(b[0]))) {
  console.log(`  ${step}: ${hex}`);
}
console.log('');

console.log('Complete Palette (with interpolation):');
for (const step of sortedSteps) {
  const isInterpolated = !anchorColors.hasOwnProperty(step);
  const marker = isInterpolated ? ' (interpolated)' : '';
  console.log(`  ${step}: ${allColors[step]}${marker}`);
}
console.log('');

const tokens = generateTokens(paletteName, allColors, sortedSteps);
console.log('JSON Token Format:');
console.log(JSON.stringify({ [paletteName]: tokens }, null, 2));
