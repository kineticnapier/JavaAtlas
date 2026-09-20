import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';
import { matchesArticle } from '../src/article-search.js';

test('JavaAtlas loads the Java core corpus shard', () => {
  assert.deepEqual(CONTENT_CATEGORIES, ['java-core.json']);
});

test('article search remains reusable', () => {
  const rows = [
    { id: 'stream', title: 'Stream map/filter', short: 'Transform values', tags: ['stream'], topics: [] },
    { id: 'other', title: 'Other', short: 'Nothing', tags: [], topics: [] }
  ];
  assert.deepEqual(rows.filter(item => matchesArticle(item, 'stream')).map(item => item.id), ['stream']);
});
