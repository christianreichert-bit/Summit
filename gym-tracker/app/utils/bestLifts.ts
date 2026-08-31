export type BestLifts = {
  squat: number;
  deadlift: number;
  bench: number;
};

function matchesLift(kind: keyof BestLifts, exerciseName: string): boolean {
  const name = exerciseName.toLowerCase();
  if (kind === "squat") return name.includes("squat");
  if (kind === "deadlift") return name.includes("deadlift");
  if (kind === "bench") return name.includes("bench press") || (name.includes("bench") && name.includes("press"));
  return false;
}

/** Max completed set weight (lbs stored) per big-three lift category. */
export function computeBestLifts(
  exercises: Array<{ session_exercise_id: number; exercise_name: string; exercise_type?: string }>,
  setsByExercise: Record<number, Array<{ weight: number | null; completed?: boolean }>>
): BestLifts {
  const best: BestLifts = { squat: 0, deadlift: 0, bench: 0 };

  for (const ex of exercises) {
    if (ex.exercise_type === "cardio") continue;
    const kinds = (["squat", "deadlift", "bench"] as const).filter((k) => matchesLift(k, ex.exercise_name));
    if (kinds.length === 0) continue;

    for (const set of setsByExercise[ex.session_exercise_id] ?? []) {
      if (!set.completed || set.weight == null) continue;
      for (const kind of kinds) {
        if (set.weight > best[kind]) best[kind] = set.weight;
      }
    }
  }

  return best;
}
