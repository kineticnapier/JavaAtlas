import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';
import { matchesArticle } from '../src/article-search.js';

test('JavaAtlas loads an extensible Java content corpus', () => {
  assert.ok(CONTENT_CATEGORIES.includes('java-core.json'));
  assert.ok(CONTENT_CATEGORIES.length >= 1);
  assert.equal(new Set(CONTENT_CATEGORIES).size, CONTENT_CATEGORIES.length, 'content shard names must be unique');
  assert.ok(CONTENT_CATEGORIES.every(file => file.endsWith('.json')), 'content shards must be JSON files');
});

test('article search remains reusable', () => {
  const rows = [
    { id: 'stream', title: 'Stream map/filter', short: 'Transform values', tags: ['stream'], topics: [] },
    { id: 'other', title: 'Other', short: 'Nothing', tags: [], topics: [] }
  ];
  assert.deepEqual(rows.filter(item => matchesArticle(item, 'stream')).map(item => item.id), ['stream']);
});
