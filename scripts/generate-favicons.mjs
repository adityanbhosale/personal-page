/**
 * Build-time generator for the site favicons: an "AB" monogram set in
 * EB Garamond, the same face the site reads in.
 *
 *   node scripts/generate-favicons.mjs
 *
 * Emits into public/:
 *   favicon.svg          vector, what modern browsers actually use
 *   favicon.ico          16 + 32 packed into one ICO (PNG entries, alpha intact)
 *   favicon-16x16.png
 *   favicon-32x32.png
 *   icon-192.png
 *   icon-512.png
 *   apple-touch-icon.png 180x180, opaque — iOS discards alpha anyway
 *
 * The glyphs are converted to outlines with opentype.js rather than set as
 * SVG <text>. Text would leave the mark at the mercy of whatever font happens
 * to resolve at rasterise time — librsvg has no access to the webfont, so a
 * build machine without EB Garamond installed would silently substitute
 * something else. Outlines make the output deterministic everywhere and let
 * favicon.svg ship without an embedded font.
 *
 * Proportions were tuned by rendering and looking, not derived: a 34% cap
 * height puts the two letters at ~67% of the canvas width, which leaves
 * visible breathing room inside the 94% disc. At the 40% cap tried first,
 * "AB" spanned 78% and crowded the rim. The 16px icon steps up to a 38% cap
 * — see CAP_HEIGHT_SMALL.
 *
 * The disc is deliberately the site's own near-black with off-white letters —
 * a 15:1 ratio, the strongest of the options tried, which is what carries the
 * mark at 16px where the serifs are down to a pixel or so. On a dark browser
 * tab strip the disc recedes and the letters read as floating; on a light one
 * the whole disc reads. Both were checked against real tab-bar greys.
 */
import sharp from 'sharp';
import opentype from 'opentype.js';
import { writeFileSync, statSync, readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = resolve(ROOT, 'public');
const FONT = resolve(
  ROOT,
  'node_modules/@fontsource/eb-garamond/files/eb-garamond-latin-700-normal.woff'
);

const INITIALS = 'AB';

/** Disc and ink. Mirrors --bg / --ink from the layout's dark palette. */
const DISC = '#0c0c0d';
const INK = '#e8e6e1';

/** Disc diameter as a fraction of the canvas; the rest is transparent margin. */
const DISC_DIAMETER = 0.94;
/** Cap height as a fraction of the canvas. Drives the letters' final size. */
const CAP_HEIGHT = 0.34;
/**
 * Optical size: at 16px the 34% cap leaves strokes under a pixel and the
 * letters grey out, so the smallest icon gets proportionally larger letters.
 * This is the usual optical-sizing move, not a fudge — the mark is meant to
 * look the same weight, which at this size means drawing it bigger.
 */
const CAP_HEIGHT_SMALL = 0.38;
const SMALL_UPTO = 16;
/** Extra space between the two letters, in font units (em = 1000). */
const TRACKING = 20;

/** Supersample factor when rasterising to PNG, for clean antialiasing. */
const SUPERSAMPLE = 10;

/** Ground behind the disc on the apple-touch-icon. Matches --bg. */
const IOS_BG = '#0c0c0d';

const fontBuf = readFileSync(FONT);
const font = opentype.parse(
  fontBuf.buffer.slice(fontBuf.byteOffset, fontBuf.byteOffset + fontBuf.length)
);

/**
 * The initials as outline path data, scaled and centred within a `size` box.
 *
 * Centring uses the glyphs' real bounding box rather than font metrics: the
 * ascender/descender include room for accents and descenders that "AB" does
 * not use, so metric-based centring sits the mark visibly high in the disc.
 */
function monogram(size, capHeight = CAP_HEIGHT) {
  const em = 1000;
  const [first, second] = INITIALS;
  const pathFirst = font.getPath(first, 0, 0, em);
  const pathSecond = font.getPath(
    second,
    font.getAdvanceWidth(first, em) + TRACKING,
    0,
    em
  );

  const combined = new opentype.Path();
  combined.extend(pathFirst);
  combined.extend(pathSecond);
  const box = combined.getBoundingBox();

  const capHeightUnits = box.y2 - box.y1;
  const width = box.x2 - box.x1;
  const scale = (size * capHeight) / capHeightUnits;

  return {
    d: `${pathFirst.toPathData(3)} ${pathSecond.toPathData(3)}`,
    tx: size / 2 - (box.x1 + width / 2) * scale,
    ty: size / 2 - (box.y1 + capHeightUnits / 2) * scale,
    scale,
  };
}

/** The mark as an SVG document. `ground` fills the whole square when set. */
function markSvg(size, ground = null, capHeight = CAP_HEIGHT) {
  const m = monogram(size, capHeight);
  return (
    `<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" ` +
    `viewBox="0 0 ${size} ${size}">` +
    (ground ? `<rect width="${size}" height="${size}" fill="${ground}"/>` : '') +
    `<circle cx="${size / 2}" cy="${size / 2}" r="${(size * DISC_DIAMETER) / 2}" fill="${DISC}"/>` +
    `<g fill="${INK}" transform="translate(${m.tx} ${m.ty}) scale(${m.scale})">` +
    `<path d="${m.d}"/></g></svg>`
  );
}

/**
 * Rasterise the mark at `size`, supersampling everything except the smallest
 * icon — see the comment on `scale` below for why 16px is the exception.
 */
async function raster(size, ground = null) {
  const small = size <= SMALL_UPTO;
  const cap = small ? CAP_HEIGHT_SMALL : CAP_HEIGHT;
  // At 16px, rasterising straight to the target beats supersampling and
  // downsampling: the resampler softens strokes that are already sub-pixel,
  // where the SVG rasteriser's own hinting-free AA holds them together.
  const scale = small ? 1 : SUPERSAMPLE;
  const svg = Buffer.from(markSvg(size * scale, ground, cap));
  const pipeline =
    scale === 1 ? sharp(svg) : sharp(svg).resize(size, size, { kernel: 'lanczos3' });

  // As in the previous photo-based set: palette quantisation is nearly free
  // for an opaque icon but badly lossy once alpha shares the 256 entries.
  return ground
    ? pipeline
        .removeAlpha()
        .png({ palette: true, quality: 100, compressionLevel: 9, effort: 10 })
        .toBuffer()
    : pipeline.png({ palette: false, compressionLevel: 9, effort: 10 }).toBuffer();
}

/**
 * Pack PNG buffers into an ICO. PNG-compressed entries carry their own alpha,
 * so no BMP frames or AND masks are needed; 32bpp declares that alpha.
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

// The vector favicon is authored on a 64-unit canvas: large enough that the
// rounded path data keeps its precision, small enough to stay legible.
writeFileSync(resolve(PUBLIC, 'favicon.svg'), `${markSvg(64)}\n`);

const png16 = await raster(16);
const png32 = await raster(32);
const png192 = await raster(192);
const png512 = await raster(512);
const png180 = await raster(180, IOS_BG);

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

// sharp cannot decode ICO or report on SVG here, so both come off disk.
for (const name of ['favicon.ico', 'favicon.svg']) {
  const { size } = statSync(resolve(PUBLIC, name));
  console.log(`${name.padEnd(22)} ${'vec'.padStart(3)}     ${(size / 1024).toFixed(1)}KB`);
}
