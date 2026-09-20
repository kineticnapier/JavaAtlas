import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

test('JavaAtlas config is Java-specific', async () => {
  const config = await readJson('../public/language.config.json');
  assert.equal(config.id, 'java');
  assert.equal(config.name, 'Java');
  assert.equal(config.site.title, 'Java Atlas');
  assert.equal(config.syntax.prismLanguage, 'java');
  assert.equal(config.storagePrefix, 'java-atlas');
});

test('JavaAtlas ships exactly 50 real articles with ja/en locale parity', async () => {
  const ids = new Set();
  let count = 0;

  for (const file of CONTENT_CATEGORIES) {
    const base = await readJson(`../public/content/articles/${file}`);
    const ja = await readJson(`../public/content/locales/ja/${file}`);
    const en = await readJson(`../public/content/locales/en/${file}`);

    for (const article of base) {
      count += 1;
      assert.ok(article.id && article.type, `${file}: invalid article`);
      assert.ok(Number.isInteger(article.since) && article.since >= 8, `${article.id}: missing Java since version`);
      assert.ok(Array.isArray(article.topics) && article.topics.length > 0, `${article.id}: missing topics`);
      assert.ok(Array.isArray(article.related), `${article.id}: related must be an array`);
      assert.ok(!ids.has(article.id), `duplicate id: ${article.id}`);
      ids.add(article.id);

      assert.ok(ja[article.id], `${article.id}: missing ja locale`);
      assert.ok(en[article.id], `${article.id}: missing en locale`);
      assert.doesNotMatch(ja[article.id].title, /Example/i, `${article.id}: example title remains`);
      assert.doesNotMatch(en[article.id].title, /Example/i, `${article.id}: example title remains`);
    }

    assert.deepEqual(new Set(Object.keys(ja)), new Set(base.map(article => article.id)), `${file}: ja locale parity mismatch`);
    assert.deepEqual(new Set(Object.keys(en)), new Set(base.map(article => article.id)), `${file}: en locale parity mismatch`);
  }

  assert.equal(count, 50);

  for (const file of CONTENT_CATEGORIES) {
    const base = await readJson(`../public/content/articles/${file}`);
    for (const article of base) {
      for (const related of article.related) assert.ok(ids.has(related), `${article.id}: missing related article ${related}`);
    }
  }
});
