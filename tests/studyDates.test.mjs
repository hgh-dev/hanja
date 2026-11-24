import {test} from 'node:test';import assert from 'node:assert/strict';import {eligible} from '../src/studyDates.mjs';import {selectQuestions} from '../src/logic.mjs';
test('local today and Monday-based weeks select only dated completed characters',()=>{
 const now=new Date(2026,10,24,12);const done=['a','b','c','d','old'];const dates={a:new Date(2026,10,24).toISOString(),b:new Date(2026,10,23).toISOString(),c:new Date(2026,10,16).toISOString(),d:new Date(2026,10,15).toISOString()};
 assert.deepEqual(eligible(done,dates,'today',now),['a']);assert.deepEqual(eligible(done,dates,'thisWeek',now),['a','b']);assert.deepEqual(eligible(done,dates,'lastWeek',now),['c']);assert.deepEqual(eligible(done,dates,'all',now),done);
});
test('requested question count is bounded by available completed characters',()=>{assert.equal(selectQuestions(['a','b','c'],()=>0,2).length,2);assert.equal(selectQuestions(['a','b','c'],()=>0,100).length,3);});
