import test from 'node:test';
import { readFile } from 'node:fs/promises';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';
const readJson = async p => JSON.parse(await readFile(new URL(p, import.meta.url), 'utf8'));
test('diagnose content invariants', async () => {
  const ids = new Set(); const dup = []; const missing = []; let count = 0;
  for (const file of CONTENT_CATEGORIES) {
    const base = await readJson(`../public/content/articles/${file}`); const ja = await readJson(`../public/content/locales/ja/${file}`); const en = await readJson(`../public/content/locales/en/${file}`);
    count += base.length;
    for (const a of base) { if (ids.has(a.id)) dup.push(a.id); ids.add(a.id); if (!ja[a.id] || !en[a.id]) missing.push(`${a.id}:locale`); }
    for (const key of Object.keys(ja)) if (!base.some(a => a.id === key)) missing.push(`${key}:extra-ja`);
    for (const key of Object.keys(en)) if (!base.some(a => a.id === key)) missing.push(`${key}:extra-en`);
  }
  for (const file of CONTENT_CATEGORIES) for (const a of await readJson(`../public/content/articles/${file}`)) for (const r of a.related) if (!ids.has(r)) missing.push(`${a.id}->${r}`);
  const map = await readJson('../public/content/learning-map.json'); const nodes = map.chapters.flatMap(c => c.nodes ?? []);
  if (count !== 300 || dup.length || missing.length || nodes.length < Math.ceil(count * .45)) console.log(`::error::DIAG count=${count} nodes=${nodes.length} dup=${dup.join(',')} missing=${missing.join(',')}`);
});
