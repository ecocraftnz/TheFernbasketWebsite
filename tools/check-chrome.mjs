#!/usr/bin/env node
// Every page must carry the same chrome: the top bar, the watermarks, the logo
// mark, the footer and the stylesheet links. This compares those blocks across
// all pages under public/ and fails on the first difference, so a change made
// to one page and not the others cannot be merged unnoticed.
//
//   node tools/check-chrome.mjs
//
// No dependencies. Exit code 1 on any difference.

import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const root = new URL('../public/', import.meta.url).pathname;

function pages(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (name === 'assets') continue;
    if (statSync(p).isDirectory()) out.push(...pages(p));
    else if (name === 'index.html') out.push(p);
  }
  return out.sort();
}

// Each block: a name and how to find it. `all` blocks may appear more than
// once on a page (the homepage has two watermark layers); the first is the
// one compared.
const BLOCKS = [
  ['top bar', /<header class="topbar">[\s\S]*?<\/header>/],
  ['watermarks', /<div class="watermarks"[\s\S]*?<\/div>/],
  ['logo mark', /<div class="mark">[\s\S]*?<\/div>/],
  ['footer', /<footer class="footer">[\s\S]*?<\/footer>/],
  ['chrome stylesheet', /<link rel="stylesheet" href="\/chrome\.css">/],
  ['theme script (head)', /<script>\s*\(function \(\) \{\s*try \{[\s\S]*?<\/script>/],
  ['fonts', /<link href="https:\/\/fonts\.googleapis\.com[^>]*>/],
];

// Whitespace between tags differs with indentation depth; compare the markup
// with that flattened, so only real differences count.
const flat = (html) => html.replace(/\s+/g, ' ').replace(/> </g, '><').trim();

const files = pages(root);
let failed = false;
const first = {};
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  const name = relative(root, file);
  for (const [label, re] of BLOCKS) {
    const m = html.match(re);
    if (!m) {
      console.error(`FAIL ${name}: no ${label}`);
      failed = true;
      continue;
    }
    const got = flat(m[0]);
    if (!(label in first)) {
      first[label] = { got, name };
    } else if (first[label].got !== got) {
      console.error(`FAIL ${name}: ${label} differs from ${first[label].name}\n  ${first[label].name}: ${first[label].got.slice(0, 160)}\n  ${name}: ${got.slice(0, 160)}`);
      failed = true;
    }
  }
}
if (failed) process.exit(1);
console.log(`chrome identical across ${files.length} pages: ${files.map((f) => relative(root, f)).join(', ')}`);
