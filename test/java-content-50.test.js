import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONTENT_CATEGORIES, loadLocalizedContent } from '../src/content-loader.js';
import { buildQuestChapter } from '../src/quest-map.js';

async function readJson(path) { return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8')); }

test('JavaAtlas config is Java-specific', async () => {
  const config = await readJson('../public/language.config.json');
  assert.equal(config.id, 'java'); assert.equal(config.name, 'Java'); assert.equal(config.site.title, 'Java Atlas');
  assert.equal(config.syntax.prismLanguage, 'java'); assert.equal(config.storagePrefix, 'java-atlas');
});

test('JavaAtlas corpus has valid articles, references, and ja/en locale parity', async () => {
  const ids = new Set();
  let count = 0;

  for (const file of CONTENT_CATEGORIES) {
    const base = await readJson(`../public/content/articles/${file}`);
    const ja = await readJson(`../public/content/locales/ja/${file}`);
    const en = await readJson(`../public/content/locales/en/${file}`);

    for (const article of base) {
      count += 1;
      assert.ok(article.id && article.type, `${file}: invalid article`);
      assert.ok(Number.isInteger(article.since) && article.since >= 1, `${article.id}: missing Java since version`);
      assert.ok(Array.isArray(article.topics) && article.topics.length > 0, `${article.id}: missing topics`);
      assert.ok(Array.isArray(article.related), `${article.id}: related must be an array`);
      assert.ok(article.related.length >= 2, `${article.id}: expected at least two related articles`);
      assert.ok(!ids.has(article.id), `duplicate id: ${article.id}`);
      ids.add(article.id);

      for (const [locale, entry] of [['ja', ja[article.id]], ['en', en[article.id]]]) {
        assert.ok(entry, `${article.id}: missing ${locale} locale`);
        assert.equal(typeof entry.why, 'string', `${article.id}: missing ${locale} why`);
        assert.ok(entry.why.trim(), `${article.id}: empty ${locale} why`);
        assert.equal(typeof entry.tips, 'string', `${article.id}: missing ${locale} tips`);
        assert.ok(entry.tips.trim(), `${article.id}: empty ${locale} tips`);
        assert.doesNotMatch(entry.title, /Example/i, `${article.id}: example title remains`);
      }
    }

    assert.deepEqual(new Set(Object.keys(ja)), new Set(base.map(article => article.id)), `${file}: ja locale parity mismatch`);
    assert.deepEqual(new Set(Object.keys(en)), new Set(base.map(article => article.id)), `${file}: en locale parity mismatch`);
  }

  assert.ok(count > 0, 'Java corpus must not be empty');

  for (const file of CONTENT_CATEGORIES) {
    const base = await readJson(`../public/content/articles/${file}`);
    for (const article of base) {
      for (const related of article.related) assert.ok(ids.has(related), `${article.id}: missing related article ${related}`);
    }
  }
});

test('the shipped Java corpus can be localized at runtime in ja and en', async () => {
  async function fetchJson(path) { return readJson(`../public/${path.replace(/^\.\//, '')}`); }
  const expectedCount = (await Promise.all(CONTENT_CATEGORIES.map(file => readJson(`../public/content/articles/${file}`))))
    .reduce((sum, group) => sum + group.length, 0);
  const ja = await loadLocalizedContent({ fetchJson, locale: 'ja' });
  const en = await loadLocalizedContent({ fetchJson, locale: 'en' });
  assert.equal(ja.articles.length, expectedCount);
  assert.equal(en.articles.length, expectedCount);
  assert.ok(expectedCount > 0);
  assert.equal(ja.articles[0].requestedLocale, 'ja');
  assert.equal(en.articles[0].requestedLocale, 'en');
  assert.ok(ja.articles.every(article => article.why && article.tips));
  assert.ok(en.articles.every(article => article.why && article.tips));
});

test('learning-map main nodes inherit representative code from their article', () => {
  const articles = [{ id: 'hello-world', type: 'code', title: 'Hello', short: 'Hello', code: 'System.out.println("Hello");' }];
  const chapter = { id: 'basics', nodes: [{ id: 'hello-world', kind: 'main' }] };
  const graph = buildQuestChapter(articles, chapter);
  assert.equal(graph.nodes[0].code, 'System.out.println("Hello");');
});
