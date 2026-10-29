/**
 * lib.js — the few helpers the build scripts share. Zero dependencies.
 */

import fs from 'node:fs';
import path from 'node:path';

export const escapeHtml = (str) =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const isAmazon = (url) => /^https?:\/\/(amzn\.to|(www\.)?amazon\.com)\//.test(url);
// Bookshop.org affiliate links carry the shop ID in the path: /a/129137/ISBN.
export const isBookshop = (url) => /^https?:\/\/(www\.)?bookshop\.org\/a\//.test(url);
export const isAffiliate = (url) => isAmazon(url) || isBookshop(url);

export const AFFILIATE_NOTE = {
  bookshop: 'As a Bookshop.org affiliate, I earn from qualifying purchases. Bookshop.org shares its profits with independent bookstores.',
  amazon: 'As an Amazon Associate I earn from qualifying purchases.',
};

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
export const NOTION_API = 'https://api.notion.com/v1';

/** One KEY=value line from .env, for the hand-run sync scripts. */
function envToken(key) {
  const raw = fs.readFileSync('.env', 'utf8');
  for (const line of raw.split('\n')) {
    const m = line.match(new RegExp(`^${key}=(.+)$`));
    if (m) return m[1].trim().replace(/^["']|["']$/g, '');
  }
  throw new Error(`${key} not found in .env`);
}

/** ARENA_ACCESS_TOKEN, for the two hand-run Are.na scripts. */
export const arenaToken = () => envToken('ARENA_ACCESS_TOKEN');

/** NOTION_TOKEN (read-only “wjerk-sync” integration), for works-sync.js. */
export const notionToken = () => envToken('NOTION_TOKEN');
