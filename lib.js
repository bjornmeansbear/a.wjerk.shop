/**
 * lib.js — the few helpers the build scripts share. Zero dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';

export const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const humanBytes = (n) => {
  if (n < 1024) return `${n} B`;
  if (n < 1024 * 1024) return `${(n / 1024).toFixed(0)} KB`;
  return `${(n / (1024 * 1024)).toFixed(2)} MB`;
};

/** Every file under dir, recursively, as paths that start with dir. */
export function* walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) yield* walk(p);
    else yield p;
  }
}

export const ARENA_API = 'https://api.are.na/v3';

/** ARENA_ACCESS_TOKEN from .env, for the two hand-run Are.na scripts. */
export function arenaToken() {
  const raw = fs.readFileSync('.env', 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(/^ARENA_ACCESS_TOKEN=(.+)$/);
    if (m) return m[1].trim();
  }
  throw new Error('ARENA_ACCESS_TOKEN not found in .env');
}
