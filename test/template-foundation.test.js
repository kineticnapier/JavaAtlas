import test from 'node:test';
import assert from 'node:assert/strict';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';
import { matchesArticle } from '../src/article-search.js';

test('JavaAtlas loads the Java content corpus shards', () => {
  assert.deepEqual(CONTENT_CATEGORIES, ['java-core.json', 'java-expansion-001.json', 'java-expansion-002.json', 'java-expansion-003.json', 'java-expansion-004.json', 'java-expansion-005.json', 'java-expansion-006.json', 'java-expansion-007.json', 'java-expansion-008.json', 'java-expansion-009.json', 'java-expansion-010.json', 'java-expansion-011.json', 'java-expansion-012.json', 'java-expansion-013.json', 'java-expansion-014.json', 'java-expansion-015.json']);
});

test('article search remains reusable', () => {
  const rows = [
    { id: 'stream', title: 'Stream map/filter', short: 'Transform values', tags: ['stream'], topics: [] },
    { id: 'other', title: 'Other', short: 'Nothing', tags: [], topics: [] }
  ];
  assert.deepEqual(rows.filter(item => matchesArticle(item, 'stream')).map(item => item.id), ['stream']);
});
