#!/usr/bin/env node
/**
 * dither.js — Atkinson-dither a source image to a 1-bit PNG.
 *
 * ImageMagick has no built-in Atkinson dither (only FloydSteinberg and
 * Riemersma — see SPEC.md §3/§8), so this implements Atkinson's classic
 * Mac/HyperCard algorithm directly: 6 neighbors, 1/8 error each, 2/8 lost
 * (the "cleaner, more contrasty" signature vs. Floyd-Steinberg's 16ths).
 * ImageMagick is used only for image codec I/O (decode to raw grayscale,
 * encode raw back to PNG) — it already has one installed for this project.
 *
 * Deliberately dithers on gamma-encoded (sRGB) values, not linear light:
 * that's what the original classic-Mac implementation did, and it's the
 * period-accurate choice for the aesthetic being asked for here.
 *
 * Usage: node dither.js <input> <output.png> [width]
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const [, , input, output, widthArg] = process.argv;
if (!input || !output) {
  console.error('Usage: node dither.js <input> <output.png> [width]');
  process.exit(1);
}
const width = widthArg ? Number(widthArg) : 800;

// Atkinson diffusion offsets (dx, dy) relative to current pixel, each 1/8:
//       X  1  1
//    1  1  1
//       1
const OFFSETS = [
  [1, 0], [2, 0],
  [-1, 1], [0, 1], [1, 1],
  [0, 2],
];

const tmpGray = path.join(os.tmpdir(), `dither-gray-${process.pid}.png`);
try {
  // -normalize stretches the tonal range to fill 0-255 before dithering.
  // Without it, source photos that don't already span the full range (e.g.
  // a light background with only subtle midtones) collapse almost entirely
  // to white under a flat 50% threshold, losing real detail.
  execFileSync('magick', [input, '-resize', `${width}x`, '-colorspace', 'Gray', '-normalize', '-depth', '8', tmpGray]);

  const dims = execFileSync('magick', ['identify', '-format', '%w %h', tmpGray], { encoding: 'utf8' });
  const [w, h] = dims.trim().split(/\s+/).map(Number);

  const raw = execFileSync('magick', [tmpGray, '-depth', '8', 'gray:-'], { maxBuffer: 1024 * 1024 * 64 });

  const px = Float32Array.from(raw);
  for (let y = 0; y < h; y++) {
    for (let x = 0; x < w; x++) {
      const i = y * w + x;
      const old = px[i];
      const quantized = old < 128 ? 0 : 255;
      const err = (old - quantized) / 8;
      px[i] = quantized;
      for (const [dx, dy] of OFFSETS) {
        const nx = x + dx, ny = y + dy;
        if (nx >= 0 && nx < w && ny >= 0 && ny < h) px[ny * w + nx] += err;
      }
    }
  }

  const outBuf = Buffer.from(Uint8Array.from(px, (v) => Math.max(0, Math.min(255, Math.round(v)))));
  execFileSync('magick', ['-size', `${w}x${h}`, '-depth', '8', 'gray:-', 'png:' + output], {
    input: outBuf,
    maxBuffer: 1024 * 1024 * 64,
  });

  console.log(`${output}  (${w}x${h})`);
} finally {
  fs.rmSync(tmpGray, { force: true });
}
