import test from 'node:test';
import assert from 'node:assert/strict';
import {brushPenPath} from '../src/brushPen.mjs';

function widthAt(points, fraction = 0.5) {
  const [front, back] = brushPenPath(points).split('Q');
  const parse = part => [...part.matchAll(/(-?\d+(?:\.\d+)?) (-?\d+(?:\.\d+)?)/g)]
    .map(match => [+match[1], +match[2]]);
  const left = parse(front), right = parse(back);
  const index = Math.round((left.length - 1) * fraction);
  return Math.hypot(left[index][0] - right[right.length - 1 - index][0],
    left[index][1] - right[right.length - 1 - index][1]);
}

test('brush width responds chiefly to speed with a gentle directional bias', () => {
  const slow = widthAt([[50, 50, 0], [150, 150, 200]]);
  const upward = widthAt([[50, 150, 0], [150, 50, 200]]);
  const fast = widthAt([[50, 50, 0], [150, 150, 20]]);
  assert(slow > fast * 2);
  assert(slow > upward && slow < upward * 1.2);
});

test('brush tips taper while short marks and dots stay visible', () => {
  const line = [[20, 20, 0], [180, 20, 200]];
  assert(widthAt(line, 0) < widthAt(line) * 0.5);
  assert(widthAt(line, 1) < widthAt(line) * 0.5);
  assert(widthAt([[20, 20, 0], [25, 20, 20]]) > 3);
  assert.match(brushPenPath([[80, 80, 0]]), /A3\.2 3\.2/);
  const turn = brushPenPath([[20, 20, 0], [100, 100, 100], [180, 30, 200]]);
  assert.match(turn, /Q/);
  assert(turn.endsWith('Z'));
  assert(!/NaN|Infinity/.test(turn));
});
