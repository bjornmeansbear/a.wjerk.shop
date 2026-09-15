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

function essayUrl(title) {
  return `https://bjornpaedia.wjerk.shop/static/${encodeURIComponent(title)}.html`;
}

function renderArenaRow(entry) {
  const cached = arenaCache[entry.slug];
  if (!cached) {
    console.warn(`  ⚠ elsewhere.js: no arena-cache.json entry for "${entry.slug}" — run arena-sync.js. Skipping.`);
    return null;
  }
  const label = ROLE_LABEL[entry.role] ?? 'Research';
  const url = `https://www.are.na/${ARENA_OWNER}/${entry.slug}`;
  const note = entry.note ? ` (${entry.note})` : '';
  return `<li><span class="elsewhereLabel">${label}</span> <a href="${url}">${cached.blocks} blocks on Are.na</a>${note}</li>`;
}

function renderRows(entry) {
  const rows = [];
  if (entry.live) {
    rows.push(`<li><span class="elsewhereLabel">Live</span> <a href="${entry.live}">${entry.live.replace(/^https?:\/\//, '').replace(/\/$/, '')}</a></li>`);
  }
  for (const s of entry.shop ?? []) {
    rows.push(`<li><span class="elsewhereLabel">Get it</span> <a href="${s.url}">${s.label}</a></li>`);
  }
  const tiddlers = Array.isArray(entry.tiddler) ? entry.tiddler : entry.tiddler ? [entry.tiddler] : [];
  for (const title of tiddlers) {
    rows.push(`<li><span class="elsewhereLabel">Essay</span> <a href="${essayUrl(title)}">The full write-up on ${title}</a></li>`);
  }
  for (const a of entry.arena ?? []) {
    const row = renderArenaRow(a);
    if (row) rows.push(row);
  }
  return rows;
}

function slugFromFilename(filename) {
  const m = filename.match(/^case-study-(.+)\.html$/);
  return m ? m[1] : null;
}

let stamped = 0;
for (const filename of fs.readdirSync(BUILD_DIR)) {
  if (!filename.endsWith('.html')) continue;
  const slug = slugFromFilename(filename);
  if (!slug) continue;

  const filePath = path.join(BUILD_DIR, filename);
  const html = fs.readFileSync(filePath, 'utf8');
  if (!html.includes(TOKEN)) continue;

  const entry = connections[slug];
  const rows = entry ? renderRows(entry) : [];
  const block = rows.length ? `<ul class="elsewhere">\n        ${rows.join('\n        ')}\n      </ul>` : '';

  fs.writeFileSync(filePath, html.replace(TOKEN, block));
  stamped++;
}

console.log(`elsewhere.js: stamped ${stamped} page(s).`);
