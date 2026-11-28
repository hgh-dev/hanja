import {test} from 'node:test';
import assert from 'node:assert/strict';
import {reviewIds} from '../src/review.mjs';

test('home review follows the latest test judgment for each character', () => {
  const results = [
    {answers:[{id:'山',correct:true},{id:'水',correct:false},{id:'木',correct:false}]},
    {answers:[{id:'山',correct:false},{id:'水',correct:false},{id:'日',correct:true}]},
  ];
  assert.deepEqual(reviewIds(results),['水','木']);
  assert.deepEqual(reviewIds(results.slice(1)),['山','水']);
  assert.deepEqual(reviewIds([]),[]);
});
