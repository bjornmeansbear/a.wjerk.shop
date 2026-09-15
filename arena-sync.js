#!/usr/bin/env node
/**
 * arena-sync.js — verify Are.na channels referenced in connections.json and
 * cache their block counts.
 *
 * Deliberately NOT wired into build.sh: Cloudflare Pages runs that on every
 * deploy, and this script hits a third-party API — a deploy shouldn't depend
 * on Are.na being reachable, or need ARENA_ACCESS_TOKEN in Cloudflare's build
 * environment. Run this by hand when connections.json changes (like
 * `sh dither-images.sh` for images), commit the resulting arena-cache.json,
 * and elsewhere.js reads that cache at build time — zero network calls in the
 * actual deploy path.
 *
 * v3 only — v2's authenticated endpoints return 410 Gone (Are.na is winding
 * v2 down, are.na/editorial/on-our-api, May 2026). Public channel reads need
 * no token at all, even for `closed` channels, but we send one anyway since
 * some referenced channels may be `private` to this account.
 *
 * Usage: node arena-sync.js
 * Reads: .env (ARENA_ACCESS_TOKEN), connections.json
 * Writes: arena-cache.json
 */

import fs from 'node:fs';

const API_BASE = 'https://api.are.na/v3';

function loadEnvToken() {
  const raw = fs.readFileSync('.env', 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^ARENA_ACCESS_TOKEN=(.+)$/);
    if (m) return m[1].trim();
  }
  throw new Error('ARENA_ACCESS_TOKEN not found in .env');
}

function collectSlugs(connections) {
  const slugs = new Set();
  for (const [key, entry] of Object.entries(connections)) {
    if (key === '_comment') continue;
    for (const a of entry.arena ?? []) slugs.add(a.slug);
  }
  return [...slugs];
}

async function fetchChannel(slug, token) {
  const res = await fetch(`${API_BASE}/channels/${slug}`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) return { ok: false, status: res.status };
  const data = await res.json();
  return {
    ok: true,
    title: data.title,
    blocks: data.counts?.blocks ?? null,
    visibility: data.visibility,
  };
}

async function main() {
  const token = loadEnvToken();
  const connections = JSON.parse(fs.readFileSync('connections.json', 'utf8'));
  const slugs = collectSlugs(connections);

  const cache = {};
  let failures = 0;

  for (const slug of slugs) {
    process.stdout.write(`  ${slug} … `);
    try {
      const result = await fetchChannel(slug, token);
      if (!result.ok) {
        console.log(`✗ HTTP ${result.status}`);
        failures++;
        continue;
      }
      if (result.visibility === 'private') {
        console.log(`✗ private — can't be linked publicly`);
        failures++;
        continue;
      }
      cache[slug] = {
        title: result.title,
        blocks: result.blocks,
        visibility: result.visibility,
        checkedAt: new Date().toISOString(),
      };
      console.log(`✓ ${result.blocks} blocks (${result.visibility})`);
    } catch (err) {
      console.log(`✗ ${err.message}`);
      failures++;
    }
  }

  fs.writeFileSync('arena-cache.json', JSON.stringify(cache, null, 2) + '\n');
  console.log(`\narena-cache.json written: ${Object.keys(cache).length} channel(s).`);
  if (failures > 0) {
    console.warn(`⚠ ${failures} channel(s) failed to verify — check connections.json before the next deploy.`);
    process.exitCode = 1;
  }
}

main();
