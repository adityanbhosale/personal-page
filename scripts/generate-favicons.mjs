/**
 * Build-time generator for the site favicons, cut from the portrait in me.jpg.
 *
 *   node scripts/generate-favicons.mjs
 *
 * Emits into public/:
 *   favicon.ico          16 + 32 packed into one ICO (PNG entries, alpha intact)
 *   favicon-16x16.png    RGBA, transparent margin
 *   favicon-32x32.png    RGBA, transparent margin
 *   icon-192.png         RGBA
 *   icon-512.png         RGBA
 *   apple-touch-icon.png 180x180, opaque #0c0c0d behind the circle
 *
 * The face is composited as a circle at CIRCLE_DIAMETER of the canvas, leaving
 * a small transparent margin so the icon reads as an avatar rather than a
 * full-bleed square. The 180 is the exception: iOS masks to its own shape and
 * composites onto an unknown background, so it gets a solid ground instead of
 * transparency — an alpha margin there would show as a light halo.
 *
 * NOTE: icon-192/512 are generated but nothing references them, because this
 * project has no web manifest. Add one (and link it from Base.astro) if they
 * are ever needed; they are emitted here so the set is complete.
 *
 * On the crop: CROP runs hairline-to-chin with the face at ~80% of the frame
 * height, centred on the face rather than the source frame. Landmarks measured
 * off the 987x1358 source: hairline y=536, chin y=1099, face centre (471, 818).
 *
 * On the tone treatment: the photo is bright to the point of mild
 * overexposure, so the face carries little separation once downsampled. Rather
 * than stretching contrast — which blocks the hair into a flat mass and clips
 * the already-hot highlights — the small sizes get a gamma curve pulling
 * midtones down with both endpoints pinned, plus mild output sharpening after
 * the downscale. Applied ONLY at 16 and 32, where the pixel budget needs it.
 *
 * On the vignette: a face is taller than it is wide but a circle is not, so
 * framing hairline-to-chin puts the circle's widest band over background —
 * here, blown-out sky, which read as two bright wings at 3 and 9 o'clock
 * against a dark tab bar. A mild radial darkening toward the rim sinks them
 * into the surround without visibly touching skin tone.
 *
 * Uses sharp (already a project dependency), matching generate-dither-bg.mjs.
 */
import sharp from 'sharp';
import { writeFileSync, statSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const SRC = resolve(ROOT, 'me.jpg');
const PUBLIC = resolve(ROOT, 'public');

/** Square crop in source pixels. Source is 987x1358. */
const CROP = { left: 119, top: 466, width: 704, height: 704 };

/** Circle diameter as a fraction of the canvas; the remainder is margin. */
const CIRCLE_DIAMETER = 0.88;
/** Supersampling factor for the circle mask, for a clean antialiased edge. */
const MASK_SUPERSAMPLE = 8;

/** Midtone pull for the small sizes: out = 255 * (in/255)^GAMMA, GAMMA > 1. */
const GAMMA = 1.25;
/** Output sharpening radius for the small sizes, applied after the downscale. */
const SHARPEN_SIGMA = 0.8;
/** Above this size the image reads unaided, so it ships untreated. */
const TREAT_UPTO = 32;

/** Rim darkening: starts at this fraction of the radius, reaching VIGNETTE. */
const VIGNETTE_START = 0.55;
const VIGNETTE = 0.35;

/** Ground behind the circle on the apple-touch-icon. Matches --bg. */
const IOS_BG = { r: 0x0c, g: 0x0c, b: 0x0d };

const LUT = Buffer.alloc(256);
for (let i = 0; i < 256; i++) LUT[i] = Math.round(255 * Math.pow(i / 255, GAMMA));

/**
 * Single-channel antialiased circular alpha.
 *
 * The backing rect matters: with a transparent SVG background, raw() yields
 * two interleaved channels (grey + alpha) and indexing it as one silently
 * produces a hard-edged, horizontally squashed mask.
 */
async function circleAlpha(size) {
  const big = size * MASK_SUPERSAMPLE;
  const r = (big * CIRCLE_DIAMETER) / 2;
  const svg =
    `<svg width="${big}" height="${big}" xmlns="http://www.w3.org/2000/svg">` +
    `<rect width="${big}" height="${big}" fill="#000"/>` +
    `<circle cx="${big / 2}" cy="${big / 2}" r="${r}" fill="#fff"/></svg>`;
  // mitchell rather than lanczos: no ringing overshoot on a hard circle edge.
  return sharp(Buffer.from(svg))
    .removeAlpha()
    .greyscale()
    .resize(size, size, { kernel: 'mitchell' })
    .raw()
    .toBuffer();
}

/** Raw RGB of the face crop at `size`, tone-treated only at the small sizes. */
async function faceRgb(size) {
  let pipeline = sharp(SRC)
    .extract(CROP)
    .resize(size, size, { kernel: 'lanczos3' })
    .flatten({ background: '#ffffff' });

  const treat = size <= TREAT_UPTO;
  if (treat) pipeline = pipeline.sharpen({ sigma: SHARPEN_SIGMA });

  const rgb = await pipeline.removeAlpha().raw().toBuffer();
  if (treat) for (let i = 0; i < rgb.length; i++) rgb[i] = LUT[rgb[i]];
  return rgb;
}

/**
 * Circular avatar at `size`. With `ground`, the circle is composited onto that
 * solid colour and the result is opaque; without, the margin stays transparent.
 */
async function avatar(size, ground = null) {
  const rgb = await faceRgb(size);
  const alpha = await circleAlpha(size);

  const channels = ground ? 3 : 4;
  const out = Buffer.alloc(size * size * channels);
  const radius = (size * CIRCLE_DIAMETER) / 2;
  const centre = (size - 1) / 2;

  for (let y = 0; y < size; y++) {
    for (let x = 0; x < size; x++) {
      const i = y * size + x;

      // Rim darkening, eased quadratically from VIGNETTE_START to the edge.
      const d = Math.hypot(x - centre, y - centre) / radius;
      let k = 1;
      if (d > VIGNETTE_START) {
        const t = Math.min(1, (d - VIGNETTE_START) / (1 - VIGNETTE_START));
        k = 1 - VIGNETTE * t * t;
      }

      const r = rgb[i * 3] * k;
      const g = rgb[i * 3 + 1] * k;
      const b = rgb[i * 3 + 2] * k;
      const a = alpha[i];
      const o = i * channels;

      if (ground) {
        // Source-over onto the solid ground, so the edge stays antialiased.
        const f = a / 255;
        out[o] = Math.round(r * f + ground.r * (1 - f));
        out[o + 1] = Math.round(g * f + ground.g * (1 - f));
        out[o + 2] = Math.round(b * f + ground.b * (1 - f));
      } else {
        out[o] = Math.round(r);
        out[o + 1] = Math.round(g);
        out[o + 2] = Math.round(b);
        out[o + 3] = a;
      }
    }
  }

  // Encoding splits on whether the icon carries alpha, and it matters a lot.
  //
  // Left to choose, sharp emits a palette PNG. For the opaque icon that is
  // nearly free — all 256 entries go to colour, and the measured mean channel
  // error is ~1/255. But once there is an alpha channel, the quantiser has to
  // spend entries on colour+alpha combinations, and the same image comes back
  // with a mean error of ~24/255 and the circle's rim collapsed to ~20 alpha
  // levels. So: palette when opaque, truecolour when not.
  return sharp(out, { raw: { width: size, height: size, channels } })
    .png(
      ground
        ? { palette: true, quality: 100, compressionLevel: 9, effort: 10 }
        : { palette: false, compressionLevel: 9, effort: 10 }
    )
    .toBuffer();
}

/**
 * Pack PNG buffers into an ICO. PNG-compressed entries have been supported for
 * well over a decade and carry their own alpha, so no BMP frames or AND masks
 * are needed; the 32bpp in each directory entry declares that alpha.
 */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // 1 = icon
  header.writeUInt16LE(entries.length, 4);

  const dir = Buffer.alloc(16 * entries.length);
  let offset = header.length + dir.length;

  entries.forEach(({ size, data }, i) => {
    const at = i * 16;
    dir.writeUInt8(size === 256 ? 0 : size, at); // 0 encodes 256
    dir.writeUInt8(size === 256 ? 0 : size, at + 1);
    dir.writeUInt8(0, at + 2); // palette size: 0 for truecolour
    dir.writeUInt8(0, at + 3); // reserved
    dir.writeUInt16LE(1, at + 4); // colour planes
    dir.writeUInt16LE(32, at + 6); // bits per pixel, i.e. RGBA
    dir.writeUInt32LE(data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

const png16 = await avatar(16);
const png32 = await avatar(32);
const png192 = await avatar(192);
const png512 = await avatar(512);
const png180 = await avatar(180, IOS_BG);

writeFileSync(resolve(PUBLIC, 'favicon-16x16.png'), png16);
writeFileSync(resolve(PUBLIC, 'favicon-32x32.png'), png32);
writeFileSync(resolve(PUBLIC, 'icon-192.png'), png192);
writeFileSync(resolve(PUBLIC, 'icon-512.png'), png512);
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), png180);
writeFileSync(
  resolve(PUBLIC, 'favicon.ico'),
  buildIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
  ])
);

for (const name of [
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
  'icon-192.png',
  'icon-512.png',
]) {
  const file = resolve(PUBLIC, name);
  const { size } = statSync(file);
  const meta = await sharp(file).metadata();
  console.log(
    `${name.padEnd(22)} ${String(meta.width).padStart(3)}px  ` +
      `alpha=${meta.hasAlpha ? 'yes' : 'no '}  ${(size / 1024).toFixed(1)}KB`
  );
}

// sharp cannot decode ICO, so report it from the container we just built.
{
  const { size } = statSync(resolve(PUBLIC, 'favicon.ico'));
  const dims = [png16, png32].map((b, i) => `${[16, 32][i]}`).join('+');
  console.log(`${'favicon.ico'.padEnd(22)} ${dims}   alpha=yes  ${(size / 1024).toFixed(1)}KB`);
}
