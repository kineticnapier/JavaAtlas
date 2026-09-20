import test from 'node:test';
import assert from 'node:assert/strict';
import { isArticleCompatible, parseVersionState, serializeVersionState } from '../src/versioning.js';

test('version compatibility honors since/until boundaries', () => {
  assert.equal(isArticleCompatible({ since: 8, until: null, status: 'standard' }, 8), true);
  assert.equal(isArticleCompatible({ since: 16, until: null, status: 'standard' }, 11), false);
  assert.equal(isArticleCompatible({ since: 8, until: 17, status: 'standard' }, 21), false);
});

test('preview content is hidden unless explicitly enabled', () => {
  const article = { since: 27, until: null, status: 'preview' };
  assert.equal(isArticleCompatible(article, 27), false);
  assert.equal(isArticleCompatible(article, 27, { includePreview: true }), true);
});

test('version URL state round-trips supported releases', () => {
  for (const version of [8, 11, 17, 21, 25, 27]) {
    assert.equal(parseVersionState(`?version=${version}`), version);
    assert.equal(serializeVersionState(version), `version=${version}`);
  }
  assert.equal(parseVersionState('?version=999'), null);
});
