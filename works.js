#!/usr/bin/env node
/**
 * works.js — fill works.html with every public project from works.json,
 * newest first.
 *
 * Same token shape as elsewhere.js: works.html in source keeps the literal
 * %WORKS% token forever; only build/ gets the rendered list. works.json is
 * written by the hand-run works-sync.js — this script never calls Notion,
 * so a deploy never depends on it.
 *
 * The rendered list is the whole page: with scripts off a visitor gets
 * every project, newest first. list.js (vendor/list.min.js, the copy
 * bjornpaedia uses) only adds search and re-sorting on top, and the
 * controls for those stay hidden until it loads.
 *
 * Zero dependencies — node:fs and node:path only.
 *
 * Usage: node works.js [dir]
 * Wired into build.sh, after elsewhere.js.
 */

import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml, isAmazon, isBookshop, isAffiliate, AFFILIATE_NOTE } from './lib.js';

const BUILD_DIR = process.argv[2] ?? 'build';
const PAGE = 'works.html';
const TOKEN = '%WORKS%';

const { works } = JSON.parse(fs.readFileSync('works.json', 'utf8'));

const years = (w) => (w.yearEnd && w.yearEnd !== w.year ? `${w.year}–${w.yearEnd}` : `${w.year}`);

/**
 * Sort key, as a string so list.js can compare it directly: the year a
 * project finished (the end of a range), then its Completed date when there
 * is one (works-sync.js only keeps a Completed date that falls in that
 * year). "2025-04-03" sorts after "2025", so dated rows sit above undated
 * ones from the same year in the default newest-first order.
 */
const when = (w) => w.completed ?? `${w.yearEnd ?? w.year}`;

/** Where the title links: the case study here, else the live site, else nowhere. */
const home = (w) => (w.caseStudy ? `case-study-${w.caseStudy}.html` : w.site ?? null);

function credits(w) {
  const parts = [];
  if (w.for?.length) parts.push(`For ${w.for.join(', ')}`);
  if (w.with?.length) parts.push(`with ${w.with.join(', ')}`);
  if (w.studio?.length) parts.push(`at ${w.studio.join(', ')}`);
  return parts.join(' · ');
}

function links(w) {
  const out = [];
  const add = (label, url, text) => {
    const rel = isAffiliate(url) ? ' rel="sponsored"' : '';
    out.push(`<li><span class="elsewhereLabel">${escapeHtml(label)}</span> <a href="${escapeHtml(url)}"${rel}>${escapeHtml(text)}</a></li>`);
  };
  const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  const store = (url) => (isAmazon(url) ? 'Amazon' : isBookshop(url) ? 'Bookshop.org' : bare(url).split('/')[0]);
  // The site is already the title link when there's no case study.
  if (w.site && w.caseStudy) add('Live', w.site, bare(w.site));
  if (w.shop) add('Get it', w.shop, store(w.shop));
  if (w.repo) add('Source', w.repo, bare(w.repo));
  if (w.archive) add('Archived', w.archive, 'Wayback Machine copy');
  for (const l of w.links ?? []) add(l.label, l.url, l.text);
  return out;
}

function renderWork(w) {
  const href = home(w);
  const title = href ? `<a href="${escapeHtml(href)}">${escapeHtml(w.title)}</a>` : escapeHtml(w.title);
  const meta = [`<span class="years">${years(w)}</span>`];
  if (w.kind) meta.push(`<span class="kind">${escapeHtml(w.kind)}</span>`);
  const by = credits(w);
  const extra = links(w);
  return [
    `<li class="work" data-when="${when(w)}">`,
    `  <p class="workMeta">${meta.join(' · ')}</p>`,
    `  <h2 class="title">${title}</h2>`,
    w.oneLiner && `  <p class="oneLiner">${escapeHtml(w.oneLiner)}</p>`,
    by && `  <p class="credits">${escapeHtml(by)}</p>`,
    extra.length && `  <ul class="elsewhere">${extra.join('')}</ul>`,
    '</li>',
  ].filter(Boolean).join('\n          ');
}

const sorted = [...works].sort((a, b) => when(b).localeCompare(when(a)) || a.title.localeCompare(b.title));
const shops = works.flatMap((w) => [w.shop, ...(w.links ?? []).map((l) => l.url)]).filter(Boolean);
const notes = [
  shops.some(isBookshop) && AFFILIATE_NOTE.bookshop,
  shops.some(isAmazon) && AFFILIATE_NOTE.amazon,
].filter(Boolean);

const block = [
  `<ul class="list worksList">`,
  `        ${sorted.map(renderWork).join('\n        ')}`,
  `      </ul>`,
  ...notes.map((n) => `      <p class="affiliateNote">${n}</p>`),
].join('\n');

const file = path.join(BUILD_DIR, PAGE);
const html = fs.readFileSync(file, 'utf8');
if (!html.includes(TOKEN)) throw new Error(`works.js: no ${TOKEN} token in ${file}`);
fs.writeFileSync(file, html.replace(TOKEN, () => block).replaceAll('%WORKS_COUNT%', String(works.length)));
console.log(`works.js: ${works.length} project(s) on ${PAGE}.`);
