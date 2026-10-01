#!/usr/bin/env node
/**
 * inject-footer.js — replace the literal %FOOTER% token in build/*.html with
 * _partials/footer.html, so the case-study footer lives in exactly one place.
 *
 * Same token shape as page-weight.js and elsewhere.js: source keeps the
 * literal token forever, only build/ gets the rendered HTML. The homepage
 * keeps its own inline footer (different content), so it has no token.
 *
 * Fails the build if a case-study page is missing the token — that means a
 * hand-pasted footer has crept back in and will drift.
 *
 * Usage: node inject-footer.js [dir]
 * Wired into build.sh, before the year stamp and page-weight.js (the partial
 * contains the currentYear and %PAGE_WEIGHT% / %SITE_WEIGHT% tokens).
 */

import fs from 'node:fs';
import path from 'node:path';

const BUILD_DIR = process.argv[2] ?? 'build';
const TOKEN = '%FOOTER%';
const footer = fs.readFileSync('_partials/footer.html', 'utf8').trimEnd();

let injected = 0;
const missing = [];

for (const name of fs.readdirSync(BUILD_DIR).filter((f) => f.endsWith('.html'))) {
  const file = path.join(BUILD_DIR, name);
  const html = fs.readFileSync(file, 'utf8');
  if (html.includes(TOKEN)) {
    fs.writeFileSync(file, html.replaceAll(TOKEN, () => footer));
    injected++;
  } else if (name.startsWith('case-study-')) {
    missing.push(name);
  }
}

console.log(`inject-footer.js: stamped ${injected} page(s).`);
if (missing.length) {
  console.error(`inject-footer.js: no ${TOKEN} token in: ${missing.join(', ')}`);
  process.exit(1);
}
