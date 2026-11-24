import { copyFileSync, mkdirSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

const imagePath = new URL('./entry.png', import.meta.url);
const outputDir = process.env.MAKEFUN_OUTPUT_DIR ?? '/output';
const outputFile = join(outputDir, 'entry.png');

const stat = statSync(imagePath);
if (stat.size === 0 || stat.size > 1_048_576) {
  throw new Error(`Invalid entry.png size: ${stat.size} bytes`);
}

const bytes = readFileSync(imagePath);
const isPng = bytes.length >= 24 && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47;
const isJpeg = bytes.length >= 4 && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff;
if (!isPng && !isJpeg) {
  throw new Error('entry.png must be a whole PNG or JPEG image');
}
if (isPng) {
  const width = bytes.readUInt32BE(16);
  const height = bytes.readUInt32BE(20);
  if (width > 1024 || height > 1024) {
    throw new Error(`PNG dimensions ${width}x${height} exceed 1024x1024`);
  }
}

mkdirSync(outputDir, { recursive: true });
copyFileSync(imagePath, outputFile);
