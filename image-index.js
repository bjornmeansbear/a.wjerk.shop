#!/usr/bin/env node
/**
 * image-index.js — fill images.html with a text list of every image file
 * the site serves, largest first.
 *
 * The page is a ledger for visitors and a to-do list for us: the biggest
 * files are at the top, and anything no page uses is flagged. It lists the
 * images but never loads one (links only, no <img>), so it stays a few KB.
 *
 * Same token shape as page-weight.js and elsewhere.js: images.html in source
 * keeps the literal %IMAGE_INDEX% token forever; only build/ gets the
 * rendered table.
 *
 * How it works, in three steps:
 *   1. Walk BUILD_DIR and collect every image file with its size in bytes
 *      (and pixel dimensions, read straight from the file's header).
 *   2. Read every built .html and .css file and note which ones mention
 *      each image's path. An image nobody mentions is "not used".
 *   3. Sort by size, render one table row per image, and swap the table in
 *      for the token.
 *
 * Sizes here are raw file sizes, which is what an image costs to transfer
 * (images are already compressed, so the server doesn't shrink them again).
 * That makes this total different from the footer's "full site" number,
 * which adds up page visits and counts a shared image once per page.
 *
 * Zero dependencies — node:fs and node:path only.
 *
 * Usage: node image-index.js [dir]
 * Wired into build.sh, right after the copy step and before
 * inject-footer.js (images.html has a %FOOTER% token of its own).
 */

import fs from 'node:fs';
import path from 'node:path';

// ---------------------------------------------------------------- config
const BUILD_DIR = process.argv[2] ?? 'build';
const PAGE = 'images.html';
const TOKEN = '%IMAGE_INDEX%';
const IMAGE_EXT = new Set(['.png', '.jpg', '.jpeg', '.webp', '.gif', '.svg', '.avif', '.ico']);
// dither-images.sh lists each dithered tile next to the photo it was made
// from, one "source|output|width" per line. Reading it here lets the table
// show both halves of that trade.
const DITHER_LIST = 'dither-images.sh';

// ---------------------------------------------------------------- helpers
const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

const humanBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

/** turn a file path into a URL path ("a b.png" → "a%20b.png") */
const toHref = (rel) => rel.split('/').map(encodeURIComponent).join('/');

/**
 * Pixel dimensions, read from the first bytes of the file. Each format
 * stores width and height at a known spot in its header, so there's no
 * need to decode the picture. Returns null for formats with no fixed
 * pixel size (SVG) or ones not handled here (AVIF, ICO).
 */
function dimensions(buf, ext) {
  try {
    if (ext === '.png') {
      return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
    }
    if (ext === '.gif') {
      return { w: buf.readUInt16LE(6), h: buf.readUInt16LE(8) };
    }
    if (ext === '.jpg' || ext === '.jpeg') {
      // A JPEG is a chain of segments, each starting 0xFF + a marker byte.
      // The "start of frame" segment (markers C0–CF, minus three that mean
      // something else) holds the size. Hop segment to segment until it
      // turns up.
      let i = 2;
      while (i < buf.length) {
        if (buf[i] !== 0xff) { i++; continue; }
        const marker = buf[i + 1];
        const isFrame = marker >= 0xc0 && marker <= 0xcf && ![0xc4, 0xc8, 0xcc].includes(marker);
        if (isFrame) return { w: buf.readUInt16BE(i + 7), h: buf.readUInt16BE(i + 5) };
        i += 2 + buf.readUInt16BE(i + 2);
      }
    }
    if (ext === '.webp') {
      // WebP has three flavors, named in bytes 12–15.
      const kind = buf.toString('ascii', 12, 16);
      if (kind === 'VP8 ') {
        return { w: buf.readUInt16LE(26) & 0x3fff, h: buf.readUInt16LE(28) & 0x3fff };
      }
      if (kind === 'VP8L') {
        const bits = buf.readUInt32LE(21);
        return { w: (bits & 0x3fff) + 1, h: ((bits >> 14) & 0x3fff) + 1 };
      }
      if (kind === 'VP8X') {
        return { w: buf.readUIntLE(24, 3) + 1, h: buf.readUIntLE(27, 3) + 1 };
      }
    }
  } catch {
    // a truncated or odd file: fall through and report no dimensions
  }
  return null;
}

function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

// ---------------------------------------------------------------- step 1
const pagePath = path.join(BUILD_DIR, PAGE);
if (!fs.existsSync(pagePath)) {
  console.error(`image-index.js: ${pagePath} not found. Run after build.sh's copy step.`);
  process.exit(1);
}
const pageHtml = fs.readFileSync(pagePath, 'utf8');
if (!pageHtml.includes(TOKEN)) {
  console.error(`image-index.js: no ${TOKEN} token in ${PAGE}.`);
  process.exit(1);
}

const images = [];
const texts = []; // { name, body } for every .html / .css file, to search in step 2

for (const abs of walk(BUILD_DIR)) {
  const rel = path.relative(BUILD_DIR, abs).replace(/\\/g, '/');
  const ext = path.extname(abs).toLowerCase();
  if (IMAGE_EXT.has(ext)) {
    const buf = fs.readFileSync(abs);
    images.push({ rel, ext, bytes: buf.length, dim: dimensions(buf, ext), usedOn: [] });
  } else if ((ext === '.html' || ext === '.css') && rel !== PAGE) {
    // Comments are stripped first: the case-study pages keep copy-paste
    // templates in comments, and a path in a comment isn't a real use.
    const body = fs.readFileSync(abs, 'utf8').replace(/<!--[\s\S]*?-->/g, '');
    texts.push({ name: rel, body });
  }
}

// ---------------------------------------------------------------- step 2
// "Used" means the file's path shows up in a page or the stylesheet. The
// character before the path can't be a letter, digit, - or _, so that
// "i/logo.png" doesn't count as a use of "mini/logo.png".
const escapeRegex = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
for (const img of images) {
  const variants = [...new Set([img.rel, toHref(img.rel)])].map(escapeRegex).join('|');
  const pattern = new RegExp(`(^|[^A-Za-z0-9_-])(${variants})(?![A-Za-z0-9_-])`);
  for (const t of texts) {
    if (pattern.test(t.body)) img.usedOn.push(t.name);
  }
}

// Dither pairs: which photo each dithered tile came from, and the reverse.
const ditherSource = new Map(); // output path → source path
const ditherOutput = new Map(); // source path → output path
if (fs.existsSync(DITHER_LIST)) {
  for (const line of fs.readFileSync(DITHER_LIST, 'utf8').split('\n')) {
    const m = line.trim().match(/^(i\/[^|]+)\|(i\/[^|]+)\|\d+$/);
    if (m) {
      ditherSource.set(m[2], m[1]);
      ditherOutput.set(m[1], m[2]);
    }
  }
}
const byRel = new Map(images.map((img) => [img.rel, img]));

// Images pulled from other servers. We can't weigh these without fetching
// them, so they're listed separately with no size.
const hotlinks = new Map(); // url → [pages]
for (const t of texts) {
  if (!t.name.endsWith('.html')) continue;
  for (const m of t.body.matchAll(/<img\b[^>]*\bsrc=["'](https?:\/\/[^"']+)["']/gi)) {
    if (!hotlinks.has(m[1])) hotlinks.set(m[1], []);
    if (!hotlinks.get(m[1]).includes(t.name)) hotlinks.get(m[1]).push(t.name);
  }
}

// ---------------------------------------------------------------- step 3
images.sort((a, b) => b.bytes - a.bytes || a.rel.localeCompare(b.rel));

const pageLinks = (names) =>
  names.map((n) => (n.endsWith('.html') ? `<a href="${toHref(n)}">${escapeHtml(n)}</a>` : escapeHtml(n))).join(', ');

const rows = images.map((img) => {
  const notes = [];
  if (ditherSource.has(img.rel)) {
    const src = byRel.get(ditherSource.get(img.rel));
    notes.push(`Dithered from ${escapeHtml(ditherSource.get(img.rel))}${src ? ` (${humanBytes(src.bytes)})` : ''}`);
  }
  if (ditherOutput.has(img.rel)) {
    notes.push(`Source for ${escapeHtml(ditherOutput.get(img.rel))}`);
  }
  const note = notes.length ? `<br><small>${notes.join('. ')}</small>` : '';
  const pixels = img.dim ? `${img.dim.w} × ${img.dim.h}` : img.ext === '.svg' ? 'vector' : '—';
  const used = img.usedOn.length ? pageLinks(img.usedOn) : '<strong>Not used on any page</strong>';
  return `          <tr>
            <td>${humanBytes(img.bytes)}</td>
            <td><a href="${toHref(img.rel)}">${escapeHtml(img.rel)}</a>${note}</td>
            <td>${pixels}</td>
            <td>${used}</td>
          </tr>`;
});

const total = images.reduce((sum, img) => sum + img.bytes, 0);
const unused = images.filter((img) => img.usedOn.length === 0);
const unusedBytes = unused.reduce((sum, img) => sum + img.bytes, 0);

let out = `<p>${images.length} image files, ${humanBytes(total)} in all.${
  unused.length
    ? ` ${unused.length} of them (${humanBytes(unusedBytes)}) are not used on any page.`
    : ' Every one is used on a page.'
}</p>

      <div class="tableScroll">
        <table>
          <caption>Every image file served from this site, largest first</caption>
          <thead>
            <tr>
              <th scope="col">Size</th>
              <th scope="col">File</th>
              <th scope="col">Pixels</th>
              <th scope="col">Used on</th>
            </tr>
          </thead>
          <tbody>
${rows.join('\n')}
          </tbody>
        </table>
      </div>`;

if (hotlinks.size) {
  const items = [...hotlinks.entries()]
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([url, pages]) => `        <li><a href="${escapeHtml(url)}">${escapeHtml(url)}</a><br><small>Used on ${pageLinks(pages)}</small></li>`);
  out += `

      <h2>Loaded from other servers</h2>
      <p>${hotlinks.size} more images come from someone else’s server. Their sizes aren’t known here, so they are missing from the total above and from the footer’s page weights.</p>
      <ul>
${items.join('\n')}
      </ul>`;
}

fs.writeFileSync(pagePath, pageHtml.replaceAll(TOKEN, () => out));

console.log(
  `image-index.js: ${images.length} images, ${humanBytes(total)}` +
    (unused.length ? `; ${unused.length} unused (${humanBytes(unusedBytes)})` : '') +
    (hotlinks.size ? `; ${hotlinks.size} hotlinked` : '') +
    '.'
);
