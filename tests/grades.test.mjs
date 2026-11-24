import {test} from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {rows,grade7Groups} from '../src/catalog.mjs';
// Fixed membership snapshot cross-checked against the two sources in CATALOG-SOURCES.md.
const grade7='家歌間江車工空口旗氣記男內農答道冬動同洞登來力老里林立每面名命問文物方百夫不事算上色夕姓世少所手數市時植食心安語然午右有育邑入子字自場全前電正祖足左主住重地紙直千天川草村秋春出便平下夏漢海花話活孝後休';
test('grade membership covers 50 basic and 100 additional characters, without losing old progress IDs',()=>{
  assert.equal(rows.filter(r=>r.grade===8).length,50);
  assert.equal(rows.filter(r=>r.grade===7).length,100);
  assert.deepEqual(new Set(rows.filter(r=>r.grade===7).map(r=>r.id)),new Set(grade7));
  assert.equal(rows.find(r=>r.id==='王').grade,8);
  assert.equal(rows.find(r=>r.id==='少').grade,7);
  assert.equal(grade7Groups.find(g=>g.name==='계절과 시간').characters.slice(0,4),'春夏秋冬');
  const oldIDs='校敎九國軍金南女年大東六萬母木門民白父北四山三生西先小少水室十五外月二人一日長弟中靑寸七土八學韓兄火';
  assert([...oldIDs].every(id=>rows.some(r=>r.id===id)));
});
test('generated catalog matches source grades, topic order, and readings',()=>{
  const packaged=JSON.parse(readFileSync('src/data.json'));
  assert.equal(packaged.length,rows.length);
  assert.deepEqual(packaged.map(({strokes,...row})=>row),rows);
});
