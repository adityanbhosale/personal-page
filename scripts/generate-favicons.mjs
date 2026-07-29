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
 * On the crop: me.jpg is a phone screenshot, so the frame includes the Photos
 * UI chrome and the subject sits well above centre. A centred square crop
 * would land on a shirt collar. CROP is therefore hand-placed on the face.
 *
 * On the contrast: the background is bare branches against bright sky, at
 * roughly the same luminance as the face, so at 16-32px the head barely
 * separates from it. The mild linear stretch below buys back enough edge for
 * the eye and jaw to survive the downscale. It is deliberately mild — pushed
 * further, the hair blocks up into a flat silhouette.
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

/** Square crop in source pixels. Source is 1206x2622. */
const CROP = { left: 210, top: 828, width: 720, height: 720 };

/** Contrast slope about mid-grey, and a touch of saturation to hold skin tone. */
const CONTRAST = 1.22;
const SATURATION = 1.08;

/** Square PNG at `size`, as a buffer. */
async function square(size) {
  return sharp(SRC)
    .extract(CROP)
    .linear(CONTRAST, -(128 * (CONTRAST - 1)))
    .modulate({ saturation: SATURATION })
    .resize(size, size, { kernel: 'lanczos3' })
    .flatten({ background: '#ffffff' }) // no alpha: ICO and iOS both want opaque
    .png({ compressionLevel: 9, effort: 10 })
    .toBuffer();
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
