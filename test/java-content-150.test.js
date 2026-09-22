import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

test('JavaAtlas next content batch brings the corpus to 320 articles', async () => {
  assert.ok(CONTENT_CATEGORIES.includes('java-expansion-023.json'));
  let count = 0;
  for (const file of CONTENT_CATEGORIES) {
    const articles = await readJson(`../public/content/articles/${file}`);
    count += articles.length;
  }
  assert.equal(count, 320);
});
