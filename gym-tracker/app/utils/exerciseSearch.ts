/**
 * Normalize exercise names and search text: lowercase, strip punctuation,
 * collapse whitespace so "Barbell-Bench Press" and "bench press" align.
 */
export function normalizeForSearch(raw: string): string {
  return raw
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
    .replace(/\s+/g, ' ');
}

function scoreExercise(
  nameNorm: string,
  queryNorm: string,
  tokens: string[]
): number {
  for (const t of tokens) {
    if (!nameNorm.includes(t)) return -1;
  }

  let score = 0;

  if (nameNorm === queryNorm) {
    score += 1_000_000;
  } else if (nameNorm.startsWith(queryNorm)) {
    score += 800_000;
  } else if (queryNorm.length >= 2 && nameNorm.includes(queryNorm)) {
    score += 600_000;
  }

  let positionSum = 0;
  for (const t of tokens) {
    const i = nameNorm.indexOf(t);
    positionSum += i;
    if (i === 0 || nameNorm[i - 1] === ' ') {
      score += 50_000;
    }
  }
  score += Math.max(0, 10_000 - positionSum);
  score += Math.max(0, 500 - nameNorm.length);

  return score;
}

/** Ranked search: every query word must appear in the normalized name; best matches first. */
export function searchExercisesByName<T extends { name?: string | null }>(
  exercises: T[],
  query: string,
  limit = 25
): T[] {
  const queryNorm = normalizeForSearch(query);
  if (!queryNorm) return [];

  const tokens = queryNorm.split(' ').filter(Boolean);
  if (tokens.length === 0) return [];

  const ranked: { ex: T; score: number }[] = [];

  for (const ex of exercises) {
    if (!ex.name) continue;
    const nameNorm = normalizeForSearch(ex.name);
    const s = scoreExercise(nameNorm, queryNorm, tokens);
    if (s < 0) continue;
    ranked.push({ ex, score: s });
  }

  ranked.sort((a, b) => b.score - a.score);
  return ranked.slice(0, limit).map((r) => r.ex);
}
