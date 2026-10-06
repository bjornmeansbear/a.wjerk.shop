#!/usr/bin/env node
/**
 * arena-inventory.js — regenerate arena-inventory.md, the table of every
 * Are.na channel on this account, grouped by slug prefix.
 *
 * arena-inventory.md lists private channels by name, and those names (clients,
 * family, institutional work) shouldn't be in this public repo. It's written to
 * ../a.wjerk.shop-private/ when that repo is cloned alongside, else to a
 * gitignored local file. This script is how you get it back on any machine
 * that has the token.
 *
 * Like arena-sync.js, run by hand and NOT part of build.sh.
 *
 * The `role` and `concept` columns are hand-filled (see connections.md in the private repo). If
 * an arena-inventory.md already exists, those two values are carried over by
 * slug, so re-running only refreshes counts, dates, visibility and new or
 * removed channels.
 *
 * Usage: node arena-inventory.js
 * Reads: .env (ARENA_ACCESS_TOKEN), existing arena-inventory.md (optional)
 * Writes: ../a.wjerk.shop-private/arena-inventory.md, or ./arena-inventory.md
 *
 * Endpoint: GET /v3/search?query=*&type=Channel&scope=my — there is no
 * per-user channel list. Search results carry counts.contents, not `length`.
 * The User-Agent header is needed or Cloudflare rejects the request.
 */

import fs from 'node:fs';

const API_BASE = 'https://api.are.na/v3';
// Lives in the private notes repo when it's cloned next to this one; falls back
// to a gitignored local file otherwise.
const PRIVATE_DIR = new URL('../a.wjerk.shop-private/', import.meta.url).pathname;
const OUT = fs.existsSync(PRIVATE_DIR) ? `${PRIVATE_DIR}arena-inventory.md` : 'arena-inventory.md';

function loadEnvToken() {
  const raw = fs.readFileSync('.env', 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^ARENA_ACCESS_TOKEN=(.+)$/);
    if (m) return m[1].trim();
  }
  throw new Error('ARENA_ACCESS_TOKEN not found in .env');
}

async function fetchAllChannels(token) {
  const channels = [];
  let page = 1;
  while (page) {
    const url = `${API_BASE}/search?query=*&type=Channel&scope=my&per=100&page=${page}`;
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${token}`, 'User-Agent': 'a.wjerk.shop arena-inventory.js' },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status} on page ${page}: ${(await res.text()).slice(0, 200)}`);
    const body = await res.json();
    channels.push(...body.data);
    process.stdout.write(`  page ${page}: ${channels.length} channels\n`);
    page = body.meta?.next_page ?? null;
  }
  return channels;
}

// Existing hand-filled columns, keyed by slug.
function readHandFilled() {
  const kept = new Map();
  if (!fs.existsSync(OUT)) return kept;
  for (const line of fs.readFileSync(OUT, 'utf8').split('\n')) {
    const cells = line.split('|').map((c) => c.trim());
    const m = cells[1]?.match(/^`(.+)`$/);
    if (m && cells.length >= 9 && (cells[6] || cells[7])) kept.set(m[1], { role: cells[6], concept: cells[7] });
  }
  return kept;
}

const SECTIONS = [
  ['shirt-', 'shirt- — objects, mostly derived from lectures'],
  ['workshop-', 'workshop-'],
  ['lecture-', 'lecture- — research behind a talk'],
  ['wjerk-', 'wjerk- — client & studio work'],
  ['project-', 'project- — class briefs, NOT portfolio projects'],
  [null, 'unprefixed — personal projects and pre-convention channels'],
];

const day = (iso) => (iso ?? '').slice(0, 10);

function render(channels, kept) {
  const rows = channels
    .map((c) => ({
      slug: c.slug,
      blocks: c.counts?.contents ?? 0,
      vis: c.visibility,
      created: day(c.created_at),
      updated: day(c.updated_at),
    }))
    .sort((a, b) => b.blocks - a.blocks || a.slug.localeCompare(b.slug));

  const tally = (v) => rows.filter((r) => r.vis === v).length;
  const prefixed = (r) => SECTIONS.some(([p]) => p && r.slug.startsWith(p));

  const out = [
    '# Are.na inventory',
    '',
    `All ${rows.length} channels, pulled ${new Date().toISOString().slice(0, 10)} by \`node arena-inventory.js\``,
    '(v3 `GET /v3/search?query=*&type=Channel&scope=my`, token from `.env`).',
    'Gitignored — it names private channels. Regenerate with the script; `role` and `concept` are kept by slug.',
    '',
    `**${tally('closed')} closed · ${tally('public')} public · ${tally('private')} private**`,
    '',
    'Two columns to fill by hand: **role** (`sourcing` / `bibliography` / `archive` / `working` /',
    '`moodboard`) and **concept**. See `connections.md` for what those mean.',
    '',
  ];

  for (const [prefix, title] of SECTIONS) {
    const group = rows.filter((r) => (prefix ? r.slug.startsWith(prefix) : !prefixed(r)));
    if (!group.length) continue;
    out.push(`## ${title} (${group.length})`, '', '| slug | blocks | vis | created | updated | role | concept |', '|---|---|---|---|---|---|---|');
    for (const r of group) {
      const k = kept.get(r.slug) ?? { role: '', concept: '' };
      out.push(`| \`${r.slug}\` | ${r.blocks} | ${r.vis} | ${r.created} | ${r.updated} | ${k.role} | ${k.concept} |`);
    }
    out.push('');
  }
  return out.join('\n');
}

async function main() {
  const token = loadEnvToken();
  const kept = readHandFilled();
  const channels = await fetchAllChannels(token);
  fs.writeFileSync(OUT, render(channels, kept));
  console.log(`\n${OUT} written: ${channels.length} channels, ${kept.size} hand-filled row(s) preserved.`);
}

main();
