import test from 'node:test';
import assert from 'node:assert/strict';
import {fountainPenPath} from '../src/fountainPen.mjs';

function middleWidth(points) {
  const [front, back] = fountainPenPath(points).split('Q');
  const parse = part => [...part.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)]
    .map(match => [+match[1], +match[2]]);
  const left = parse(front), right = parse(back);
  const middle = Math.floor(left.length / 2);
  return Math.hypot(left[middle][0] - right[right.length - 1 - middle][0],
    left[middle][1] - right[right.length - 1 - middle][1]);
}

test('the angled nib responds chiefly to direction and subtly to speed', () => {
  const broad = middleWidth([[50, 50, 0], [150, 150, 200]]);
  const thin = middleWidth([[50, 150, 0], [150, 50, 200]]);
  const fast = middleWidth([[50, 50, 0], [150, 150, 20]]);
  assert(broad > thin * 2);
  assert(fast < broad && fast > broad * 0.8);
});

test('a dot and a direction change make closed, finite shapes', () => {
  assert.match(fountainPenPath([[80, 80, 0]]), /A5\.2 2\.1/);
  const turn = fountainPenPath([[20, 20, 0], [100, 100, 100], [180, 30, 200]]);
  assert.match(turn, /Q/);
  assert(turn.endsWith('Z'));
  assert(!/NaN|Infinity/.test(turn));
});
