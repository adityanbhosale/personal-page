/**
 * Build-time generator for the site favicons, cut from the portrait in me.jpg.
 *
 *   node scripts/generate-favicons.mjs
 *
 * Emits into public/:
 *   favicon.ico          16 + 32 packed into one ICO (PNG-encoded entries)
 *   favicon-16x16.png
 *   favicon-32x32.png
 *   apple-touch-icon.png 180x180, opaque — iOS discards alpha anyway
 *
 * No web manifest exists in this project, so the 192/512 pair is deliberately
 * not generated. Add it here alongside a manifest if one is ever introduced.
 *
 * On the crop: CROP is hand-placed to run hairline-to-chin with the face at
 * ~80% of the frame height, centred horizontally on the face rather than on
 * the source frame. Landmarks measured off the 987x1358 source: hairline
 * y=536, chin y=1099, face centre (471, 818).
 *
 * On the tone treatment: the photo is bright to the point of mild
 * overexposure, so the face carries little separation once it is downsampled.
 * Rather than stretching contrast — which blocks the hair into a flat mass and
 * clips the already-hot highlights — the small sizes get a gamma curve that
 * pulls midtones down while pinning both endpoints, plus mild output
 * sharpening after the downscale. This is applied ONLY at 16 and 32, where the
 * pixel budget needs the help; the 180 is left in its natural tone, since at
 * that size the photo reads on its own and sharpening would only add halos.
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

/** Midtone pull for the small sizes: out = 255 * (in/255)^GAMMA, GAMMA > 1. */
const GAMMA = 1.25;
/** Output sharpening radius for the small sizes, applied after the downscale. */
const SHARPEN_SIGMA = 0.8;
/** Above this size the image reads unaided, so it ships untreated. */
const TREAT_UPTO = 32;

/**
 * Applies the midtone curve through a 256-entry LUT. Endpoints map to
 * themselves, so blacks and the sky highlight are left where they are and only
 * the skin tones move.
 */
const LUT = Buffer.alloc(256);
for (let i = 0; i < 256; i++) LUT[i] = Math.round(255 * Math.pow(i / 255, GAMMA));

async function pullMidtones(buf, size) {
  const raw = await sharp(buf).raw().toBuffer();
  for (let i = 0; i < raw.length; i++) raw[i] = LUT[raw[i]];
  return sharp(raw, { raw: { width: size, height: size, channels: 3 } })
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
}

/** Square PNG at `size`, as a buffer. */
async function square(size) {
  let pipeline = sharp(SRC)
    .extract(CROP)
    .resize(size, size, { kernel: 'lanczos3' })
    .flatten({ background: '#ffffff' }); // no alpha: ICO and iOS both want opaque

  const treat = size <= TREAT_UPTO;
  if (treat) pipeline = pipeline.sharpen({ sigma: SHARPEN_SIGMA });

  const buf = await pipeline
    .removeAlpha()
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();

  return treat ? pullMidtones(buf, size) : buf;
}

/**
 * Pack PNG buffers into an ICO. Every target browser has supported
 * PNG-compressed ICO entries for well over a decade, so there is no need to
 * emit BMP frames.
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
    dir.writeUInt16LE(32, at + 6); // bits per pixel
    dir.writeUInt32LE(data.length, at + 8);
    dir.writeUInt32LE(offset, at + 12);
    offset += data.length;
  });

  return Buffer.concat([header, dir, ...entries.map((e) => e.data)]);
}

const png16 = await square(16);
const png32 = await square(32);
const png180 = await square(180);

writeFileSync(resolve(PUBLIC, 'favicon-16x16.png'), png16);
writeFileSync(resolve(PUBLIC, 'favicon-32x32.png'), png32);
writeFileSync(resolve(PUBLIC, 'apple-touch-icon.png'), png180);
writeFileSync(
  resolve(PUBLIC, 'favicon.ico'),
  buildIco([
    { size: 16, data: png16 },
    { size: 32, data: png32 },
  ])
);

for (const name of [
  'favicon.ico',
  'favicon-16x16.png',
  'favicon-32x32.png',
  'apple-touch-icon.png',
]) {
  const { size } = statSync(resolve(PUBLIC, name));
  console.log(`${name.padEnd(22)} ${(size / 1024).toFixed(1)}KB`);
}
