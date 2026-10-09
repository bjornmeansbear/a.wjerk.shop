#!/usr/bin/env node
/**
 * elsewhere.js — stamp a per-page "Elsewhere" block (Live / Shop / Essay /
 * Research links) into build/*.html from connections.json + arena-cache.json.
 *
 * Same token-replacement shape as page-weight.js: source keeps the literal
 * %ELSEWHERE% token forever, only build/ gets the rendered HTML, so this is
 * safe to re-run every deploy. Zero dependencies — node:fs only.
 *
 * arena-cache.json is produced by the separate, manually-run arena-sync.js —
 * this script only reads it, never calls Are.na itself, so a deploy never
 * depends on a third-party API being up.
 *
 * Usage: node elsewhere.js [dir]
 * Wired into build.sh, after page-weight.js.
 */

import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml } from './lib.js';

const BUILD_DIR = process.argv[2] ?? 'build';
const TOKEN = '%ELSEWHERE%';
const ARENA_OWNER = 'kristian-bjornard';

const ROLE_LABEL = {
  sourcing: 'How it was made',
  bibliography: 'Further reading',
  archive: 'Visual archive',
  moodboard: 'Mood board',
};

const connections = JSON.parse(fs.readFileSync('connections.json', 'utf8'));
const arenaCache = fs.existsSync('arena-cache.json')
  ? JSON.parse(fs.readFileSync('arena-cache.json', 'utf8'))
  : {};

const isAmazon = (url) => /^https?:\/\/(amzn\.to|(www\.)?amazon\.com)\//.test(url);

function essayUrl(title) {
  // The static export's filenames contain literal "%20" etc., so the server
  // path needs the title encoded twice (single-encoded URLs 404).
  return `https://bjornpaedia.wjerk.shop/static/${encodeURIComponent(encodeURIComponent(title))}.html`;
}

function renderArenaRow(entry) {
  const cached = arenaCache[entry.slug];
  if (!cached) {
    console.warn(`  ⚠ elsewhere.js: no arena-cache.json entry for "${entry.slug}" — run arena-sync.js. Skipping.`);
    return null;
  }
  const label = ROLE_LABEL[entry.role] ?? 'Research';
  const url = `https://www.are.na/${ARENA_OWNER}/${entry.slug}`;
  const note = entry.note ? ` (${escapeHtml(entry.note)})` : '';
  return `<li><span class="elsewhereLabel">${label}</span> <a href="${url}">${cached.blocks} blocks on Are.na</a>${note}</li>`;
}

function renderRows(entry) {
  const rows = [];
  if (entry.live) {
    rows.push(`<li><span class="elsewhereLabel">Live</span> <a href="${escapeHtml(entry.live)}">${escapeHtml(entry.live.replace(/^https?:\/\//, '').replace(/\/$/, ''))}</a></li>`);
  }
  for (const s of entry.shop ?? []) {
    const rel = isAmazon(s.url) ? ' rel="sponsored"' : '';
    rows.push(`<li><span class="elsewhereLabel">Get it</span> <a href="${escapeHtml(s.url)}"${rel}>${escapeHtml(s.label)}</a></li>`);
  }
  const tiddlers = Array.isArray(entry.tiddler) ? entry.tiddler : entry.tiddler ? [entry.tiddler] : [];
  for (const title of tiddlers) {
    // Just the title: a case study can list several wiki pages, and some are
    // short notes, so "the full write-up on" was repetitive and not always true.
    rows.push(`<li><span class="elsewhereLabel">Essay</span> <a href="${essayUrl(title)}">${escapeHtml(title)}</a></li>`);
  }
  for (const a of entry.arena ?? []) {
    const row = renderArenaRow(a);
    if (row) rows.push(row);
  }
  if ((entry.shop ?? []).some((s) => isAmazon(s.url))) {
    rows.push('<li class="affiliateNote">As an Amazon Associate I earn from qualifying purchases.</li>');
  }
  return rows;
}

function slugFromFilename(filename) {
  const m = filename.match(/^case-study-(.+)\.html$/);
  return m ? m[1] : null;
}

const pageSlugs = new Set();
let stamped = 0;
for (const filename of fs.readdirSync(BUILD_DIR)) {
  if (!filename.endsWith('.html')) continue;
  const slug = slugFromFilename(filename);
  if (!slug) continue;
  pageSlugs.add(slug);

  const filePath = path.join(BUILD_DIR, filename);
  const html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes(TOKEN)) continue;

  const entry = connections[slug];
  const rows = entry ? renderRows(entry) : [];
  const block = rows.length ? `<ul class="elsewhere">\n        ${rows.join('\n        ')}\n      </ul>` : '';

  // Function replacer: a string would treat "$&" etc. in titles/labels as patterns.
  fs.writeFileSync(filePath, html.replace(TOKEN, () => block));
  stamped++;
}

// A key with no page is almost always a typo in connections.json — its links
// would silently never appear.
for (const key of Object.keys(connections)) {
  if (key !== '_comment' && !pageSlugs.has(key)) {
    console.warn(`  ⚠ elsewhere.js: connections.json key "${key}" matches no case-study-${key}.html page.`);
  }
}

console.log(`elsewhere.js: stamped ${stamped} page(s).`);
