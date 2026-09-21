import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

test('JavaAtlas learning map covers a substantial curated path through the corpus', async () => {
  const map = await readJson('../public/content/learning-map.json');
  const articleIds = new Set();

  for (const file of CONTENT_CATEGORIES) {
    const articles = await readJson(`../public/content/articles/${file}`);
    for (const article of articles) articleIds.add(article.id);
  }

  const nodes = map.chapters.flatMap(chapter => chapter.nodes ?? []);
  const mainNodes = nodes.filter(node => (node.kind ?? 'main') === 'main');
  const nodeIds = nodes.map(node => node.id);

  assert.ok(nodes.length >= 80, `expected at least 80 mapped nodes, got ${nodes.length}`);
  assert.ok(mainNodes.length >= 50, `expected at least 50 main learning nodes, got ${mainNodes.length}`);
  assert.equal(new Set(nodeIds).size, nodeIds.length, 'learning map must not duplicate article nodes across chapters');
  assert.ok(nodes.every(node => articleIds.has(node.id)), 'every learning-map node must reference a real article');

  for (const chapter of map.chapters) {
    const chapterIds = new Set((chapter.nodes ?? []).map(node => node.id));
    assert.ok(chapterIds.size >= 7, `${chapter.id}: expected at least 7 mapped nodes`);
    for (const node of chapter.nodes ?? []) {
      for (const prerequisite of node.prerequisites ?? []) {
        assert.ok(chapterIds.has(prerequisite), `${chapter.id}/${node.id}: missing prerequisite node ${prerequisite}`);
      }
      if (node.kind === 'support') {
        assert.ok(chapterIds.has(node.attachedTo), `${chapter.id}/${node.id}: support node must attach within its chapter`);
      }
    }
  }
});
