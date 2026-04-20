// types/index.ts
export interface RoutineSet {
  setNumber: number;
  reps: string;
  weight: string;
}

export interface Set {
  setNumber: number;
  reps: string;
  weight: string;
  completed?: boolean;
}

export interface Exercise {
  id: string;
  name: string;
  muscleGroup: string;
  setCount: string;
  sets: Set[];
  notes?: string;
}

export interface RoutineExercise {
  exerciseId: string;
  name: string;
  muscleGroup: string;
  defaultSetCount: number;
  notes?: string;
  sets?: RoutineSet[];  
}

/** Optional cardio slots on a routine; duration is the last template / “previous” value. */
export interface RoutineCardio {
  id: string;
  type: "bike" | "treadmill" | "stair-master" | "elliptical" | "running" | "other";
  duration: string;
  unit: 'min' | 'hr';
  calories: string;
}

export interface Routine {
  id: string;
  name: string;
  day: 'Push' | 'Pull' | 'Legs' | 'Custom';
  customDayName?: string;
  exercises: RoutineExercise[];
  /** If empty/undefined, no cardio block is shown during a workout. */
  cardio?: RoutineCardio[];
  createdAt: Date;
  lastPerformed?: Date;
}

export interface WorkoutLog {
  id: string;
  routineId?: string;
  routineName: string;
  date: Date;
  exercises: Exercise[];
  duration?: number; // in minutes
  notes?: string;
}