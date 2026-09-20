import test from 'node:test';
import assert from 'node:assert/strict';
import { searchArticles } from '../src/search.js';
import { createPersonalStore } from '../src/storage.js';

const articles = [
  { id:'npe', title:'NullPointerException', short:'null access', tags:['null'], topics:['exceptions'], summary:'hidden body phrase' },
  { id:'stream-map', title:'Stream map', short:'transform stream values', tags:['map'], topics:['streams'], summary:'another phrase' }
];

test('search uses discovery metadata but not long-form summary text', () => {
  assert.deepEqual(searchArticles(articles, 'streams').map(a => a.id), ['stream-map']);
  assert.deepEqual(searchArticles(articles, 'hidden body phrase'), []);
});

test('favorites and recents remain in the provided local storage adapter', () => {
  const data = new Map();
  const storage = { getItem:key => data.get(key) ?? null, setItem:(key,value) => data.set(key,value) };
  const store = createPersonalStore(storage);
  assert.deepEqual(store.toggleFavorite('npe'), ['npe']);
  assert.deepEqual(store.pushRecent('npe'), ['npe']);
  assert.deepEqual(store.pushRecent('stream-map'), ['stream-map','npe']);
  assert.deepEqual(store.getFavorites(), ['npe']);
});
