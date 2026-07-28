/**
 * Build-time generator for the NYSE background layers.
 *
 *   node scripts/generate-dither-bg.mjs
 *
 * Emits two duotones of the same dithered facade:
 *
 *   public/nyse-dither.png       dark theme, and the texture the WebGL layer
 *                                samples (it reads only the red channel as a
 *                                lit/unlit selector, so this one serves both).
 *   public/nyse-dither-light.png light theme's static fallback.
 *
 * The light pair is tuned to the same tone-to-tone contrast as the dark pair
 * (1.30:1), so the building reads with identical subtlety on paper.
 *
 * Pipeline:
 *   1. Render scripts/nyse-facade.svg at HALF resolution (1200x800).
 *   2. Scale the white mask down to a mid-grey, so ordered dithering has
 *      something to pattern. A pure white shape thresholds to a flat block.
 *   3. Apply 8x8 ordered (Bayer) dithering by hand.
 *   4. Map the two resulting levels to the duotone.
 *   5. Upscale 2x with nearest-neighbour so the cells stay visibly chunky.
 *   6. Emit a 2-colour palette PNG.
 *
 * Dithering at half resolution and then doubling is what gives the coarse
 * cell feel — dithering at full size would produce a pattern too fine to
 * read as texture behind text.
 *
 * Uses sharp (already a project dependency) rather than ImageMagick so the
 * script runs anywhere `npm ci` has run, with no system binary required.
 */
import sharp from 'sharp';
import { readFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'scripts/nyse-facade.svg');
const OUT = resolve(ROOT, 'public/nyse-dither.png');
const OUT_LIGHT = resolve(ROOT, 'public/nyse-dither-light.png');

const HALF_W = 1200;
const HALF_H = 800;
const UPSCALE = 2;
const FULL_W = HALF_W * UPSCALE;
const FULL_H = HALF_H * UPSCALE;

/**
 * Peak dot density inside the silhouette, 0..1.
 * At 1.0 the shape is solid; at 0.5 it is a checkerboard, which reads as a
 * regular grid rather than texture. 0.45 keeps the pattern irregular enough
 * to feel like dithering.
 */
const DENSITY = 0.45;

const BG = [0x0c, 0x0c, 0x0d];
// Light tone lifted from #1a1a1e so the pattern reads through unaided —
// legibility is handled by a text-shadow on the content, not by dimming this.
const FG = [0x26, 0x26, 0x2c];
// Light theme: paper ground, building a shade darker. Same 1.30:1 tone ratio.
const BG_LIGHT = [0xf2, 0xf0, 0xeb];
const FG_LIGHT = [0xd8, 0xd4, 0xcb];


// Standard 8x8 Bayer threshold matrix, values 0..63.
const BAYER8 = [
   0, 32,  8, 40,  2, 34, 10, 42,
  48, 16, 56, 24, 50, 18, 58, 26,
  12, 44,  4, 36, 14, 46,  6, 38,
  60, 28, 52, 20, 62, 30, 54, 22,
   3, 35, 11, 43,  1, 33,  9, 41,
  51, 19, 59, 27, 49, 17, 57, 25,
  15, 47,  7, 39, 13, 45,  5, 37,
  63, 31, 55, 23, 61, 29, 53, 21,
];

const mask = await sharp(readFileSync(SRC))
  .resize(HALF_W, HALF_H, { fit: 'fill' })
  .greyscale()
  .raw()
  .toBuffer();

const rgb = Buffer.allocUnsafe(HALF_W * HALF_H * 3);
const rgbLight = Buffer.allocUnsafe(HALF_W * HALF_H * 3);
let lit = 0;

for (let y = 0; y < HALF_H; y++) {
  for (let x = 0; x < HALF_W; x++) {
    const i = y * HALF_W + x;
    // Mask luminance scaled to the target density.
    const value = (mask[i] / 255) * DENSITY;
    // +0.5 centres each threshold within its 1/64 band.
    const threshold = (BAYER8[(y % 8) * 8 + (x % 8)] + 0.5) / 64;
    const on = value > threshold;
    if (on) lit++;
    const [r, g, b] = on ? FG : BG;
    rgb[i * 3] = r;
    rgb[i * 3 + 1] = g;
    rgb[i * 3 + 2] = b;
    const [lr, lg, lb] = on ? FG_LIGHT : BG_LIGHT;
    rgbLight[i * 3] = lr;
    rgbLight[i * 3 + 1] = lg;
    rgbLight[i * 3 + 2] = lb;
  }
}

await sharp(rgb, { raw: { width: HALF_W, height: HALF_H, channels: 3 } })
  .resize(FULL_W, FULL_H, { kernel: 'nearest' })
  .png({ palette: true, colours: 2, effort: 10, compressionLevel: 9 })
  .toFile(OUT);


await sharp(rgbLight, { raw: { width: HALF_W, height: HALF_H, channels: 3 } })
  .resize(FULL_W, FULL_H, { kernel: 'nearest' })
  .png({ palette: true, colours: 2, effort: 10, compressionLevel: 9 })
  .toFile(OUT_LIGHT);

for (const file of [OUT, OUT_LIGHT]) {
  const { size } = statSync(file);
  const meta = await sharp(file).metadata();
  console.log(
    `${file.replace(ROOT + '/', '').padEnd(30)} ${meta.width}x${meta.height}  ` +
    `${(size / 1024).toFixed(1)}KB`
  );
}
console.log(`dither density: ${((lit / (HALF_W * HALF_H)) * 100).toFixed(1)}% cells lit`);
