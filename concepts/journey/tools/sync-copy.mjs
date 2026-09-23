// Copies CONFIG's text into the page's static HTML, so the page reads the
// same with JavaScript off. Run after editing copy in CONFIG:
//
//   node concepts/journey/tools/sync-copy.mjs
//
// No dependencies. The page itself needs no build step; this only keeps
// the no-JavaScript fallback text in step with CONFIG.
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const file = join(dirname(fileURLToPath(import.meta.url)), '..', 'index.html');
let html = readFileSync(file, 'utf8');

// Pull the CONFIG object literal out of the script by brace matching.
const start = html.indexOf('const CONFIG = {');
if (start < 0) throw new Error('CONFIG not found');
let i = html.indexOf('{', start), depth = 0, inStr = null;
for (; i < html.length; i++) {
  const ch = html[i], prev = html[i - 1];
  if (inStr) { if (ch === inStr && prev !== '\\') inStr = null; continue; }
  if (ch === "'" || ch === '"' || ch === '`') { inStr = ch; continue; }
  if (ch === '/' && html[i + 1] === '/') { i = html.indexOf('\n', i); continue; }
  if (ch === '/' && html[i + 1] === '*') { i = html.indexOf('*/', i) + 1; continue; }
  if (ch === '{') depth++;
  if (ch === '}' && --depth === 0) break;
}
const CONFIG = new Function('return ' + html.slice(html.indexOf('{', start), i + 1))();
const esc = s => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const get = (o, path) => path.split('.').reduce((a, k) => (a == null ? a : a[k]), o);
let n = 0;

html = html.replace(/(<(\w+)\b[^>]*\bdata-copy="([^"]+)"[^>]*>)([\s\S]*?)(<\/\2>)/g, (m, open, tag, key, inner, close) => {
  const v = get(CONFIG.copy, key);
  if (typeof v !== 'string') { console.warn('no CONFIG.copy.' + key); return m; }
  n++; return open + esc(v) + close;
});
html = html.replace(/(<ul\b[^>]*\bdata-copy-list="([^"]+)"[^>]*>)[\s\S]*?(<\/ul>)/g, (m, open, key, close) => {
  const arr = get(CONFIG.copy, key) || [];
  n++; return open + arr.map(t => '<li>' + esc(t) + '</li>').join('') + close;
});
html = html.replace(/(<div\b[^>]*\bdata-faq\b[^>]*>)[\s\S]*?(<\/div>)/, (m, open, close) => {
  n++; return open + CONFIG.copy.faq.items.map(q => '<details><summary>' + esc(q.q) + '</summary><p>' + esc(q.a) + '</p></details>').join('') + close;
});
html = html.replace(/<a\b([^>]*)\bdata-cta\b([^>]*)>[\s\S]*?<\/a>/g, (m, a, b) => {
  n++; return ('<a' + a + 'data-cta' + b + '>').replace(/href="[^"]*"/, 'href="' + esc(CONFIG.cta.href) + '"') + esc(CONFIG.cta.label) + '</a>';
});
html = html.replace(/(<p\b[^>]*\bdata-cta-note\b[^>]*>)[\s\S]*?(<\/p>)/g, (m, open, close) => { n++; return open + esc(CONFIG.cta.note) + close; });

writeFileSync(file, html);
console.log('synced ' + n + ' blocks of copy from CONFIG into the HTML');
