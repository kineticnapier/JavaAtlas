import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';
import { validateCorpus } from '../src/content-validation.js';
import { validateLearningMap } from '../src/learning-map-validation.js';

async function json(path) {
  return JSON.parse(await readFile(new URL(`../${path}`, import.meta.url), 'utf8'));
}

test('shipped content and locales are internally consistent', async () => {
  const articleGroups = await Promise.all(CONTENT_CATEGORIES.map(file => json(`public/content/articles/${file}`)));
  const localeGroups = {};
  for (const locale of ['ja', 'en']) {
    localeGroups[locale] = Object.assign({}, ...(await Promise.all(CONTENT_CATEGORIES.map(file => json(`public/content/locales/${locale}/${file}`)))));
  }
  const articles = articleGroups.flat();
  assert.deepEqual(validateCorpus({ articles, locales: localeGroups }), []);
});

test('shipped learning map only references shipped articles and valid nodes', async () => {
  const articleGroups = await Promise.all(CONTENT_CATEGORIES.map(file => json(`public/content/articles/${file}`)));
  const ids = new Set(articleGroups.flat().map(article => article.id));
  const map = await json('public/content/learning-map.json');
  assert.deepEqual(validateLearningMap(map, ids), []);
});
