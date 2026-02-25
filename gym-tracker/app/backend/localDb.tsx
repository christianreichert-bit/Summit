import { useState } from "react";

type User = {
  user_id: string;
  username: string;
  email: string;
  created_at: string;
};

type Routine = {
  routine_id: number;
  routine_name: string;
  description: string | null;
  user_id: string;
  created_at: string;
};

type RoutineExercise = {
  routine_exercise_id: number;
  routine_id: number;
  exercise_id: string;
  exercise_name: string;
  exercise_order: number;
};

type RoutineExerciseSet = {
  routine_set_id: number;
  routine_exercise_id: number;
  set_number: number;
  target_weight: number | null;
  target_reps: number | null;
  is_warmup: boolean;
};

let localUsers: User[] = [];
let localRoutines: Routine[] = [];
let localRoutineExercises: RoutineExercise[] = [];
let localRoutineExerciseSets: RoutineExerciseSet[] = [];
let localSession: { user: { id: string; email: string } } | null = null;

let nextRoutineId = 1;
let nextRoutineExerciseId = 1;
let nextRoutineSetId = 1;

export const localDb = {
  // Auth
  signUp: async (email: string, password: string, username: string) => {
    const userId = `local-${Date.now()}`;
    const user: User = {
      user_id: userId,
      username,
      email,
      created_at: new Date().toISOString(),
    };
    localUsers.push(user);
    localSession = { user: { id: userId, email } };
    return { data: { user: { id: userId } }, error: null };
  },

  signIn: async (email: string, _password: string) => {
    const user = localUsers.find((u) => u.email === email);
    if (!user) {
      return { data: null, error: { message: "User not found" } };
    }
    localSession = { user: { id: user.user_id, email } };
    return { data: { user: { id: user.user_id } }, error: null };
  },

  signOut: async () => {
    localSession = null;
  },

  getSession: async () => {
    return { data: { session: localSession } };
  },

  getUser: async () => {
    return { data: { user: localSession?.user ?? null } };
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    return {
      data: {
        subscription: {
          unsubscribe: () => {},
        },
      },
    };
  },

  // Users
  getUsers: async () => {
    return { data: localUsers, error: null };
  },

  // Routines
  getRoutines: async () => {
    const userId = localSession?.user?.id;
    const data = localRoutines.filter((r) => r.user_id === userId);
    return { data, error: null };
  },

  insertRoutine: async (routine: { routine_name: string; description: string | null; user_id: string }) => {
    const newRoutine: Routine = {
      routine_id: nextRoutineId++,
      ...routine,
      created_at: new Date().toISOString(),
    };
    localRoutines.push(newRoutine);
    return { error: null };
  },

  deleteRoutine: async (routineId: number) => {
    // Delete sets for exercises in this routine
    const exerciseIds = localRoutineExercises
      .filter((re) => re.routine_id === routineId)
      .map((re) => re.routine_exercise_id);
    localRoutineExerciseSets = localRoutineExerciseSets.filter(
      (s) => !exerciseIds.includes(s.routine_exercise_id)
    );
    localRoutineExercises = localRoutineExercises.filter((re) => re.routine_id !== routineId);
    localRoutines = localRoutines.filter((r) => r.routine_id !== routineId);
    return { error: null };
  },

  // Routine Exercises
  getRoutineExercises: async (routineId: number) => {
    const data = localRoutineExercises
      .filter((re) => re.routine_id === routineId)
      .sort((a, b) => a.exercise_order - b.exercise_order);
    return { data, error: null };
  },

  insertRoutineExercise: async (exercise: {
    routine_id: number;
    exercise_id: string;
    exercise_name: string;
    exercise_order: number;
  }) => {
    const newExercise: RoutineExercise = {
      routine_exercise_id: nextRoutineExerciseId++,
      ...exercise,
    };
    localRoutineExercises.push(newExercise);
    return { error: null };
  },

  deleteRoutineExercise: async (routineExerciseId: number) => {
    // Also delete associated sets
    localRoutineExerciseSets = localRoutineExerciseSets.filter(
      (s) => s.routine_exercise_id !== routineExerciseId
    );
    localRoutineExercises = localRoutineExercises.filter(
      (re) => re.routine_exercise_id !== routineExerciseId
    );
    return { error: null };
  },

  // Routine Exercise Sets (template sets)
  getRoutineExerciseSets: async (routineExerciseId: number) => {
    const data = localRoutineExerciseSets
      .filter((s) => s.routine_exercise_id === routineExerciseId)
      .sort((a, b) => a.set_number - b.set_number);
    return { data, error: null };
  },

  insertRoutineExerciseSet: async (set: {
    routine_exercise_id: number;
    set_number: number;
    target_weight: number | null;
    target_reps: number | null;
    is_warmup: boolean;
  }) => {
    const newSet: RoutineExerciseSet = {
      routine_set_id: nextRoutineSetId++,
      ...set,
    };
    localRoutineExerciseSets.push(newSet);
    return { error: null };
  },

  deleteRoutineExerciseSet: async (routineSetId: number) => {
    localRoutineExerciseSets = localRoutineExerciseSets.filter(
      (s) => s.routine_set_id !== routineSetId
    );
    return { error: null };
  },

  updateRoutineExerciseSet: async (
    routineSetId: number,
    updates: { target_reps?: number | null; target_weight?: number | null; is_warmup?: boolean }
  ) => {
    localRoutineExerciseSets = localRoutineExerciseSets.map((s) =>
      s.routine_set_id === routineSetId ? { ...s, ...updates } : s
    );
    return { error: null };
  },
};