import test from 'node:test';
import assert from 'node:assert/strict';
import { validateCorpus } from '../src/content-validation.js';

const base = [
  { id: 'java-main', type: 'concept', since: 8, until: null, status: 'standard', bad: null, good: null, code: 'public static void main(String[] args) {}', related: ['null-pointer-exception'], topics: ['basics'] },
  { id: 'null-pointer-exception', type: 'exception', since: 8, until: null, status: 'standard', bad: 'value.length()', good: 'if (value != null) value.length()', code: null, related: ['java-main'], topics: ['exceptions'] }
];
const ja = {
  'java-main': { title: 'mainメソッド', short: 'Javaプログラムの入口', summary: '...', why: '...', tips: [], tags: ['main'] },
  'null-pointer-exception': { title: 'NullPointerException', short: 'nullを参照した', summary: '...', why: '...', tips: [], tags: ['null'] }
};
const en = {
  'java-main': { title: 'main method', short: 'Entry point of a Java program', summary: '...', why: '...', tips: [], tags: ['main'] },
  'null-pointer-exception': { title: 'NullPointerException', short: 'Dereferenced null', summary: '...', why: '...', tips: [], tags: ['null'] }
};

test('valid corpus has complete locale and references', () => {
  assert.deepEqual(validateCorpus({ articles: base, locales: { ja, en } }), []);
});

test('validator detects duplicate IDs and broken related references', () => {
  const broken = [base[0], { ...base[0] }, { ...base[1], related: ['missing'] }];
  const errors = validateCorpus({ articles: broken, locales: { ja, en } });
  assert.ok(errors.some(error => error.includes('duplicate id')));
  assert.ok(errors.some(error => error.includes('missing related')));
});

test('validator rejects invalid Java version metadata', () => {
  const broken = [{ ...base[0], since: 21, until: 17 }, { ...base[1], status: 'future' }];
  const errors = validateCorpus({ articles: broken, locales: { ja, en } });
  assert.ok(errors.some(error => error.includes('version range')));
  assert.ok(errors.some(error => error.includes('status')));
});
