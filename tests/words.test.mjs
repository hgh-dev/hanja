import {test} from 'node:test';
import assert from 'node:assert/strict';
import {rows} from '../src/catalog.mjs';
import {words} from '../src/words.mjs';
test('every character has two or three distinct words with its Hanja and explanations', () => {
  assert.deepEqual(new Set(Object.keys(words)), new Set(rows.map(row => row.id)));
  for (const {id} of rows) {
    assert(words[id].length >= 2 && words[id].length <= 3, id);
    assert.equal(new Set(words[id].map(word => word.label)).size, words[id].length, id);
    for (const word of words[id]) {
      assert(word.spelling.includes(id), `${id}: ${word.label}`);
      assert(word.label && word.meaning && word.explanation, id);
    }
  }
});
