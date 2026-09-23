import test from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { CONTENT_CATEGORIES } from '../src/content-loader.js';

async function readJson(path) {
  return JSON.parse(await readFile(new URL(path, import.meta.url), 'utf8'));
}

test('JavaAtlas learning map references a valid curated path through the corpus', async () => {
  const map = await readJson('../public/content/learning-map.json');
  const articleIds = new Set();

  for (const file of CONTENT_CATEGORIES) {
    const articles = await readJson(`../public/content/articles/${file}`);
    for (const article of articles) articleIds.add(article.id);
  }

  assert.ok(Array.isArray(map.chapters) && map.chapters.length > 0, 'learning map must contain chapters');

  const nodes = map.chapters.flatMap(chapter => chapter.nodes ?? []);
  const nodeIds = nodes.map(node => node.id);

  assert.ok(nodes.length > 0, 'learning map must contain nodes');
  assert.equal(new Set(nodeIds).size, nodeIds.length, 'learning map must not duplicate article nodes across chapters');
  assert.ok(nodes.every(node => articleIds.has(node.id)), 'every learning-map node must reference a real article');

  for (const chapter of map.chapters) {
    const chapterNodes = chapter.nodes ?? [];
    const chapterIds = new Set(chapterNodes.map(node => node.id));
    assert.ok(chapterNodes.length > 0, `${chapter.id}: chapter must not be empty`);

    for (const node of chapterNodes) {
      for (const prerequisite of node.prerequisites ?? []) {
        assert.ok(chapterIds.has(prerequisite), `${chapter.id}/${node.id}: missing prerequisite node ${prerequisite}`);
      }
      if (node.kind === 'support') {
        assert.ok(node.attachedTo, `${chapter.id}/${node.id}: support node must declare attachedTo`);
        assert.ok(chapterIds.has(node.attachedTo), `${chapter.id}/${node.id}: support node must attach within its chapter`);
      }
    }
  }
});
