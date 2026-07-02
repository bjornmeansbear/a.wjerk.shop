#!/usr/bin/env node
/**
 * page-weight.js — page-weight stat generator
 *
 * This is a static hand-written HTML site (no SvelteKit/Vite build step —
 * see SPEC.md history). Run by build.sh AFTER it assembles build/, against
 * that build/ directory — never against source. Two passes:
 *
 *   PASS 1: walk every .html file in BUILD_DIR, resolve the assets it
 *           references, and compute the *transfer* size of a typical
 *           default-path visit:
 *             - text assets (html/css/js/svg/json) → brotli-compressed size
 *             - binary assets (images/fonts)       → raw file size
 *             - <picture>/srcset → count ONE candidate per image, chosen
 *               by TYPICAL_VIEWPORT_WIDTH (mobile-first honesty)
 *             - lazy-loaded images are included by default (worst honest
 *               case for a full read); set COUNT_LAZY = false to measure
 *               above-the-fold-only
 *             - cross-origin image refs (e.g. hotlinked Flickr/MICA URLs)
 *               are NOT counted — we can't know their transfer size without
 *               fetching them, so pages using them will under-report until
 *               those images are self-hosted per SPEC.md §3/§6
 *   PASS 2: string-replace footer placeholder tokens in build/*.html:
 *             %PAGE_WEIGHT%  → that page's transfer size, human-readable
 *             %SITE_WEIGHT%  → whole-site total, human-readable
 *           This is destructive, but that's fine here: build/ is a fresh,
 *           disposable copy (see build.sh STEP 1-2) regenerated from
 *           source every run, so source's tokens are never touched.
 *
 * Output: BUILD_DIR/page-weight-manifest.json
 *   { generated, coefficientNote, pages: { "/route": bytes }, totalBytes }
 *
 * Zero dependencies — node:fs, node:path, node:zlib only.
 * Parsing is regex-based and tuned for our own predictable markup, not
 * arbitrary HTML. If markup patterns change, revisit the regexes.
 *
 * Usage:  node page-weight.js [dir]
 * Wired into build.sh (see STEP 4 there).
 */

import fs from 'node:fs';
import path from 'node:path';
import zlib from 'node:zlib';

// ---------------------------------------------------------------- config
const BUILD_DIR = process.argv[2] ?? 'build';
const TYPICAL_VIEWPORT_WIDTH = 800; // px — srcset candidate selection
const COUNT_LAZY = true;            // include loading="lazy" images
const TEXT_EXT = new Set(['.html', '.css', '.js', '.mjs', '.svg', '.json', '.xml', '.txt', '.webmanifest']);
const PAGE_TOKEN = '%PAGE_WEIGHT%';
const SITE_TOKEN = '%SITE_WEIGHT%';

// ---------------------------------------------------------------- helpers
const brotliSize = (buf) =>
  zlib.brotliCompressSync(buf, {
    params: { [zlib.constants.BROTLI_PARAM_QUALITY]: 5 }, // ≈ CDN on-the-fly level
  }).length;

const humanBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

/** transfer size of one asset file; returns 0 if missing (warns) */
const sizeCache = new Map();
function assetTransferSize(absPath) {
  if (sizeCache.has(absPath)) return sizeCache.get(absPath);
  let bytes = 0;
  try {
    const buf = fs.readFileSync(absPath);
    bytes = TEXT_EXT.has(path.extname(absPath).toLowerCase()) ? brotliSize(buf) : buf.length;
  } catch {
    console.warn(`  ⚠ missing asset: ${absPath}`);
  }
  sizeCache.set(absPath, bytes);
  return bytes;
}

/** resolve a URL reference found in HTML to an absolute path in BUILD_DIR */
function resolveRef(ref, htmlDir) {
  if (!ref || /^(https?:)?\/\//.test(ref) || ref.startsWith('data:') || ref.startsWith('#')) return null;
  const clean = ref.split(/[?#]/)[0];
  return clean.startsWith('/')
    ? path.join(BUILD_DIR, clean)
    : path.join(htmlDir, clean);
}

/** pick one srcset candidate closest to (>=) TYPICAL_VIEWPORT_WIDTH */
function pickSrcsetCandidate(srcset) {
  const candidates = srcset
    .split(',')
    .map((s) => s.trim())
    .map((s) => {
      const m = s.match(/^(\S+)\s+(\d+)w$/);
      return m ? { url: m[1], w: Number(m[2]) } : { url: s.split(/\s+/)[0], w: Infinity };
    })
    .sort((a, b) => a.w - b.w);
  return (candidates.find((c) => c.w >= TYPICAL_VIEWPORT_WIDTH) ?? candidates.at(-1))?.url ?? null;
}

// ---------------------------------------------------------------- pass 1
function collectAssets(rawHtml, htmlDir) {
  // Strip HTML comments first: templates like the "PROJECT ROW TEMPLATE" /
  // "PROCESS LOG ENTRY TEMPLATE" blocks intentionally live in comments with
  // placeholder src="[[...]]" values that aren't real assets.
  const html = rawHtml.replace(/<!--[\s\S]*?-->/g, '');
  const refs = new Set();

  // stylesheets, preloads, modulepreload
  for (const m of html.matchAll(/<link\b[^>]*\bhref=["']([^"']+)["'][^>]*>/gi)) {
    const tag = m[0];
    if (/rel=["'](stylesheet|preload|modulepreload|icon)["']/i.test(tag)) refs.add(m[1]);
  }
  // scripts
  for (const m of html.matchAll(/<script\b[^>]*\bsrc=["']([^"']+)["']/gi)) refs.add(m[1]);

  // images — one candidate per <img> (srcset-aware); skip lazy if configured
  for (const m of html.matchAll(/<img\b[^>]*>/gi)) {
    const tag = m[0];
    if (!COUNT_LAZY && /loading=["']lazy["']/i.test(tag)) continue;
    const srcset = tag.match(/\bsrcset=["']([^"']+)["']/i)?.[1];
    const src = tag.match(/\bsrc=["']([^"']+)["']/i)?.[1];
    const chosen = srcset ? pickSrcsetCandidate(srcset) : src;
    if (chosen) refs.add(chosen);
  }
  // <source srcset> inside <picture>: skipped deliberately — we count the
  // <img> fallback candidate once. For AVIF-first pipelines the AVIF is
  // usually SMALLER than the fallback, so this errs slightly heavy. Honest.

  let total = 0;
  for (const ref of refs) {
    const abs = resolveRef(ref, htmlDir);
    if (abs) total += assetTransferSize(abs);
  }
  return total;
}

function* walkHtml(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walkHtml(p);
    else if (entry.name.endsWith('.html')) yield p;
  }
}

// ---------------------------------------------------------------- main
if (!fs.existsSync(BUILD_DIR)) {
  console.error(`Build directory "${BUILD_DIR}" not found. Run the build first.`);
  process.exit(1);
}

const pages = {};
let siteTotal = 0;

for (const htmlPath of walkHtml(BUILD_DIR)) {
  const html = fs.readFileSync(htmlPath, 'utf8');
  const pageBytes = brotliSize(Buffer.from(html)) + collectAssets(html, path.dirname(htmlPath));
  const route =
    '/' +
    path
      .relative(BUILD_DIR, htmlPath)
      .replace(/index\.html$/, '')
      .replace(/\.html$/, '')
      .replace(/\\/g, '/');
  pages[route] = pageBytes;
  siteTotal += pageBytes;
}

// pass 2: token replacement — destructive, but build/ is disposable (see
// header comment), so this never touches source.
for (const htmlPath of walkHtml(BUILD_DIR)) {
  const route =
    '/' +
    path
      .relative(BUILD_DIR, htmlPath)
      .replace(/index\.html$/, '')
      .replace(/\.html$/, '')
      .replace(/\\/g, '/');
  const html = fs.readFileSync(htmlPath, 'utf8');
  if (!html.includes(PAGE_TOKEN) && !html.includes(SITE_TOKEN)) continue;
  const rendered = html
    .replaceAll(PAGE_TOKEN, humanBytes(pages[route] ?? 0))
    .replaceAll(SITE_TOKEN, humanBytes(siteTotal));
  fs.writeFileSync(htmlPath, rendered);
}

const manifest = {
  generated: new Date().toISOString(),
  note: `Transfer sizes: text brotli-compressed (q5), binaries raw. One srcset candidate per image at ${TYPICAL_VIEWPORT_WIDTH}px viewport. Lazy images ${COUNT_LAZY ? 'included' : 'excluded'}.`,
  totalBytes: siteTotal,
  totalHuman: humanBytes(siteTotal),
  pages: Object.fromEntries(
    Object.entries(pages)
      .sort(([, a], [, b]) => b - a)
      .map(([r, b]) => [r, { bytes: b, human: humanBytes(b) }])
  ),
};
fs.writeFileSync(path.join(BUILD_DIR, 'page-weight-manifest.json'), JSON.stringify(manifest, null, 2));

console.log(`\nSite total (sum of all pages, default path): ${humanBytes(siteTotal)}`);
for (const [route, { human }] of Object.entries(manifest.pages)) {
  console.log(`  ${human.padStart(9)}  ${route}`);
}
console.log(`\nManifest → ${path.join(BUILD_DIR, 'page-weight-manifest.json')}`);
