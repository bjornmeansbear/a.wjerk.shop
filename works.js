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
 * The rendered table is the whole page: with scripts off a visitor gets
 * every project, newest first, one row each. list.js (vendor/list.min.js,
 * the copy bjornpaedia uses) only adds search and click-to-sort headers on
 * top; the search box stays hidden until it loads.
 *
 * Zero dependencies — node:fs and node:path only.
 *
 * Usage: node works.js [dir]
 * Wired into build.sh, after elsewhere.js.
 */

import fs from 'node:fs';
import path from 'node:path';
import { escapeHtml, isAffiliate } from './lib.js';

const BUILD_DIR = process.argv[2] ?? 'build';
const PAGE = 'works.html';
const TOKEN = '%WORKS%';

const { works } = JSON.parse(fs.readFileSync('works.json', 'utf8'));

const years = (w) => (w.yearEnd && w.yearEnd !== w.year ? `${w.year}–${w.yearEnd}` : `${w.year}`);

/**
 * Sort key, as a string so list.js can compare it directly: the year a
 * project finished (the end of a range), then its Completed date when there
 * is one and it falls in that year. "2025-04-03" sorts after "2025", so dated rows sit above undated
 * ones from the same year in the default newest-first order.
 */
const when = (w) => {
  const end = `${w.yearEnd ?? w.year}`;
  // A Completed date from another year (The Libre Designer's is its 2018
  // start) would move the row out of its year, so it only breaks ties.
  return w.completed?.startsWith(end) ? w.completed : end;
};

/**
 * Where the title links: the case study here, else the live site, else the
 * project's page on the old portfolio site, else nowhere.
 */
const home = (w) => (w.caseStudy ? `case-study-${w.caseStudy}.html` : w.site ?? w.oldPortfolio ?? null);

function credits(w) {
  const parts = [];
  if (w.for?.length) parts.push(`For ${w.for.join(', ')}`);
  if (w.with?.length) parts.push(`with ${w.with.join(', ')}`);
  if (w.studio?.length) parts.push(`at ${w.studio.join(', ')}`);
  return parts.join(' · ');
}

/**
 * The Links column shows only the short label (“Get it →”), so a row stays
 * one line. The full description goes in aria-label and title; the label
 * starts with the visible text, so voice control can still find the link
 * by what it says on screen (WCAG 2.5.3).
 */
function links(w) {
  const out = [];
  const add = (label, url, text) => {
    // Affiliate links stay on the case study, beside the disclosure the
    // affiliate agreements require. Listing them here would mean carrying
    // that disclosure on this page too.
    if (isAffiliate(url)) return;
    const full = escapeHtml(`${label}: ${text}`);
    out.push(`<a href="${escapeHtml(url)}" aria-label="${full}" title="${full}">${escapeHtml(label)}<span aria-hidden="true"> →</span></a>`);
  };
  const bare = (url) => url.replace(/^https?:\/\/(www\.)?/, '').replace(/\/$/, '');
  // The site is already the title link when there's no case study.
  if (w.site && w.caseStudy) add('Live', w.site, bare(w.site));
  if (w.shop) add('Get it', w.shop, bare(w.shop).split('/')[0]);
  if (w.repo) add('Source', w.repo, bare(w.repo));
  if (w.archive) add('Archived', w.archive, 'Wayback Machine copy');
  // Only as a separate link when the title already goes somewhere else.
  if (w.oldPortfolio && (w.caseStudy || w.site)) add('Old site', w.oldPortfolio, 'kristian.bjornard.com');
  for (const l of w.links ?? []) add(l.label, l.url, l.text);
  return out;
}

/** One table row. The class names double as list.js's search/sort fields. */
function renderWork(w) {
  const href = home(w);
  const title = href ? `<a href="${escapeHtml(href)}">${escapeHtml(w.title)}</a>` : escapeHtml(w.title);
  const by = credits(w);
  const about = [
    w.oneLiner && `<span class="oneLiner">${escapeHtml(w.oneLiner)}</span>`,
    by && `<span class="credits">${escapeHtml(by)}</span>`,
  ].filter(Boolean).join(' ');
  return [
    `<tr data-when="${when(w)}">`,
    `  <td class="years">${years(w)}</td>`,
    `  <th scope="row" class="title">${title}</th>`,
    `  <td class="kind">${escapeHtml(w.kind ?? '')}</td>`,
    `  <td class="about">${about}</td>`,
    `  <td class="links">${links(w).join(' ')}</td>`,
    '</tr>',
  ].join('\n          ');
}

const sorted = [...works].sort((a, b) => when(b).localeCompare(when(a)) || a.title.localeCompare(b.title));

// The page's inline script turns the headers with data-sort into sort
// buttons once list.js loads. Without it they stay plain headers, and
// aria-sort still truthfully says the rows are newest first.
const block = [
  `<table class="worksTable">`,
  `        <thead>`,
  `          <tr>`,
  `            <th scope="col" data-sort="when" aria-sort="descending">Year</th>`,
  `            <th scope="col" data-sort="title">Title</th>`,
  `            <th scope="col" data-sort="kind">Kind</th>`,
  `            <th scope="col">About</th>`,
  `            <th scope="col" class="links">Links</th>`,
  `          </tr>`,
  `        </thead>`,
  `        <tbody class="list worksList">`,
  `        ${sorted.map(renderWork).join('\n        ')}`,
  `        </tbody>`,
  `      </table>`,
].join('\n');

const file = path.join(BUILD_DIR, PAGE);
const html = fs.readFileSync(file, 'utf8');
if (!html.includes(TOKEN)) throw new Error(`works.js: no ${TOKEN} token in ${file}`);
fs.writeFileSync(file, html.replace(TOKEN, () => block).replaceAll('%WORKS_COUNT%', String(works.length)));
console.log(`works.js: ${works.length} project(s) on ${PAGE}.`);
