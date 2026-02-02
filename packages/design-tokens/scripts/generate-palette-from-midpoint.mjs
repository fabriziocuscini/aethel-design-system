#!/usr/bin/env node

/**
 * Palette Generator from Midpoint Color
 * 
 * Generates an extended color palette (19 steps) from a single midpoint color (500)
 * using Oklab color space interpolation for perceptually uniform results.
 * 
 * Usage:
 *   bun run generate-palette-from-midpoint.mjs <palette-name> <hex-color>
 * 
 * Examples:
 *   bun run generate-palette-from-midpoint.mjs sand "#8D8D86"
 *   bun run generate-palette-from-midpoint.mjs brand "#6366f1"
 */

import chroma from 'chroma-js';

// Target lightness values based on Tailwind's neutral scale
// These represent the Oklab L values for each step
const LIGHTNESS_TARGETS = {
  50: 0.985,
  100: 0.97,
  150: 0.946,  // interpolated
  200: 0.922,
  250: 0.896,  // interpolated
  300: 0.87,
  350: 0.789,  // interpolated
  400: 0.708,
  450: 0.632,  // interpolated
  500: 0.556,  // midpoint
  550: 0.497,  // interpolated
  600: 0.439,
  650: 0.405,  // interpolated
  700: 0.371,
  750: 0.320,  // interpolated
  800: 0.269,
  850: 0.237,  // interpolated
  900: 0.205,
  950: 0.145,
};

// Light and dark anchors for interpolation
const LIGHT_ANCHOR = '#fafafa';
const DARK_ANCHOR = '#0a0a0a';

/**
 * Generate a color at a target lightness while preserving hue and adjusting chroma
 */
function generateColorAtLightness(baseColor, targetLightness) {
  const base = chroma(baseColor);
  const [, c, h] = base.oklch();
  
  // Adjust chroma based on lightness (colors tend to have less chroma at extremes)
  // This creates a more natural-looking palette
  const baseLightness = base.oklch()[0];
  const lightnessRatio = targetLightness / baseLightness;
  
  // Chroma adjustment: reduce chroma as we move away from midpoint
  let adjustedChroma;
  if (targetLightness > baseLightness) {
    // Going lighter: reduce chroma more aggressively
    const t = (targetLightness - baseLightness) / (1 - baseLightness);
    adjustedChroma = c * (1 - t * 0.8);
  } else {
    // Going darker: reduce chroma but less aggressively
    const t = (baseLightness - targetLightness) / baseLightness;
    adjustedChroma = c * (1 - t * 0.5);
  }
  
  // Ensure chroma doesn't go negative
  adjustedChroma = Math.max(0, adjustedChroma);
  
  // Create the new color
  try {
    return chroma.oklch(targetLightness, adjustedChroma, h || 0).hex();
  } catch (e) {
    // If color is out of gamut, use interpolation fallback
    const anchor = targetLightness > baseLightness ? LIGHT_ANCHOR : DARK_ANCHOR;
    const t = Math.abs(targetLightness - baseLightness) / Math.abs(chroma(anchor).oklch()[0] - baseLightness);
    return chroma.mix(baseColor, anchor, Math.min(t, 1), 'oklab').hex();
  }
}

/**
 * Generate the full palette from a midpoint color
 */
function generatePalette(paletteName, midpointHex) {
  const midpoint = chroma(midpointHex);
  const [midL, midC, midH] = midpoint.oklch();
  
  console.log(`\nGenerating "${paletteName}" palette from midpoint: ${midpointHex}`);
  console.log(`Midpoint Oklch: L=${midL.toFixed(3)}, C=${midC.toFixed(3)}, H=${midH?.toFixed(1) || 'achromatic'}`);
  console.log('');
  
  const colors = {};
  const sortedSteps = Object.keys(LIGHTNESS_TARGETS).map(Number).sort((a, b) => a - b);
  
  for (const step of sortedSteps) {
    const targetL = LIGHTNESS_TARGETS[step];
    
    if (step === 500) {
      // Use the midpoint color directly
      colors[step] = midpointHex.toLowerCase();
    } else {
      colors[step] = generateColorAtLightness(midpointHex, targetL);
    }
  }
  
  return { colors, sortedSteps };
}

/**
 * Generate JSON token format
 */
function generateTokens(paletteName, colors, sortedSteps) {
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
      "$value": colors[step],
      "$description": description
    };
  }
  
  return tokens;
}

/**
 * Verify the generated palette lightness values
 */
function verifyPalette(colors, sortedSteps) {
  console.log('Generated Palette with Lightness Values:');
  console.log('=========================================');
  
  for (const step of sortedSteps) {
    const hex = colors[step];
    const [l] = chroma(hex).oklch();
    const targetL = LIGHTNESS_TARGETS[step];
    const diff = Math.abs(l - targetL);
    const status = diff < 0.05 ? '✓' : diff < 0.1 ? '~' : '!';
    console.log(`  ${step.toString().padStart(3)}: ${hex}  L=${l.toFixed(3)} (target: ${targetL.toFixed(3)}) ${status}`);
  }
  console.log('');
}

// Main execution
const paletteName = process.argv[2];
const midpointHex = process.argv[3];

if (!paletteName || !midpointHex) {
  console.log('Palette Generator from Midpoint Color');
  console.log('=====================================');
  console.log('');
  console.log('Generates an extended color palette (19 steps) from a midpoint color.');
  console.log('Uses Oklab color space for perceptually uniform interpolation.');
  console.log('');
  console.log('Usage: bun run generate-palette-from-midpoint.mjs <palette-name> <hex-color>');
  console.log('');
  console.log('Arguments:');
  console.log('  palette-name  Name for the palette (e.g., "sand", "brand")');
  console.log('  hex-color     The midpoint color (500 step) as hex (e.g., "#8D8D86")');
  console.log('');
  console.log('Examples:');
  console.log('  bun run generate-palette-from-midpoint.mjs sand "#8D8D86"');
  console.log('  bun run generate-palette-from-midpoint.mjs brand "#6366f1"');
  console.log('  bun run generate-palette-from-midpoint.mjs accent "#f59e0b"');
  process.exit(0);
}

// Validate hex color
let validHex;
try {
  validHex = chroma(midpointHex).hex();
} catch (e) {
  console.error(`Error: Invalid hex color "${midpointHex}"`);
  process.exit(1);
}

const { colors, sortedSteps } = generatePalette(paletteName, validHex);

verifyPalette(colors, sortedSteps);

const tokens = generateTokens(paletteName, colors, sortedSteps);

console.log('JSON Token Format:');
console.log('==================');
console.log(JSON.stringify({ [paletteName]: tokens }, null, 2));
