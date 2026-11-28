// Results are stored newest first. The latest answer decides whether a
// character still needs more study, without showing duplicates.
export function reviewIds(results) {
  const latest = new Map();
  for (const result of results) {
    for (const answer of result.answers) {
      if (!latest.has(answer.id)) latest.set(answer.id, answer.correct);
    }
  }
  return [...latest].filter(([, correct]) => !correct).map(([id]) => id);
}
