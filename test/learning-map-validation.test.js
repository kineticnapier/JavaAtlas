import test from 'node:test';
import assert from 'node:assert/strict';
import { validateLearningMap } from '../src/learning-map-validation.js';

const articleIds = new Set(['java-main', 'classes', 'null-pointer-exception']);
const map = {
  chapters: [
    {
      id: 'basics',
      title: { ja: 'Java基礎', en: 'Java Basics' },
      nodes: [
        { id: 'java-main', kind: 'main', articleId: 'java-main', prerequisites: [], lane: 0 },
        { id: 'classes', kind: 'main', articleId: 'classes', prerequisites: ['java-main'], lane: 0 },
        { id: 'null-pointer-exception', kind: 'support', articleId: 'null-pointer-exception', attachedTo: 'classes', lane: 1 }
      ]
    }
  ]
};

test('learning map references valid articles and nodes', () => {
  assert.deepEqual(validateLearningMap(map, articleIds), []);
});

test('learning map rejects missing prerequisites and support targets', () => {
  const broken = structuredClone(map);
  broken.chapters[0].nodes[1].prerequisites = ['missing-node'];
  broken.chapters[0].nodes[2].attachedTo = 'missing-main';
  const errors = validateLearningMap(broken, articleIds);
  assert.ok(errors.some(error => error.includes('prerequisite')));
  assert.ok(errors.some(error => error.includes('attachedTo')));
});
