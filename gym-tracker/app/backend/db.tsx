import { supabase } from "./supabaseClient";
import { localDb } from "./localDb";

const SUPABASE_URL = process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;

export const isOnline = !!(SUPABASE_URL && SUPABASE_ANON_KEY);

export const db = {
  // Auth
  signUp: async (email: string, password: string, username: string) => {
    if (isOnline) {
      const { data, error: signUpError } = await supabase.auth.signUp({ email, password });
      if (signUpError) return { data: null, error: signUpError };
      if (data.user) {
        const { error: insertError } = await supabase.from("users").insert({
          user_id: data.user.id,
          username,
          email,
          password_hash: "managed_by_supabase_auth",
        });
        if (insertError) return { data: null, error: insertError };
      }
      return { data, error: null };
    }
    return localDb.signUp(email, password, username);
  },

  signIn: async (email: string, password: string) => {
    if (isOnline) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      return { error };
    }
    return localDb.signIn(email, password);
  },

  signOut: async () => {
    if (isOnline) {
      await supabase.auth.signOut();
    } else {
      await localDb.signOut();
    }
  },

  getSession: async () => {
    if (isOnline) {
      return supabase.auth.getSession();
    }
    return localDb.getSession();
  },

  getUser: async () => {
    if (isOnline) {
      return supabase.auth.getUser();
    }
    return localDb.getUser();
  },

  onAuthStateChange: (callback: (event: string, session: any) => void) => {
    if (isOnline) {
      return supabase.auth.onAuthStateChange(callback);
    }
    return localDb.onAuthStateChange(callback);
  },

  // Users
  getUsers: async () => {
    if (isOnline) {
      return supabase.from("users").select("*");
    }
    return localDb.getUsers();
  },

  // Routines
  getRoutines: async () => {
    if (isOnline) {
      return supabase.from("routines").select("*");
    }
    return localDb.getRoutines();
  },

  insertRoutine: async (routine: { routine_name: string; description: string | null; user_id: string }) => {
    if (isOnline) {
      return supabase.from("routines").insert(routine);
    }
    return localDb.insertRoutine(routine);
  },

  deleteRoutine: async (routineId: number) => {
    if (isOnline) {
      return supabase.from("routines").delete().eq("routine_id", routineId);
    }
    return localDb.deleteRoutine(routineId);
  },

  // Routine Exercises
  getRoutineExercises: async (routineId: number) => {
    if (isOnline) {
      return supabase
        .from("routine_exercises")
        .select("*")
        .eq("routine_id", routineId)
        .order("exercise_order", { ascending: true });
    }
    return localDb.getRoutineExercises(routineId);
  },

  insertRoutineExercise: async (exercise: {
    routine_id: number;
    exercise_id: string;
    exercise_name: string;
    exercise_order: number;
  }) => {
    if (isOnline) {
      return supabase.from("routine_exercises").insert(exercise);
    }
    return localDb.insertRoutineExercise(exercise);
  },

  deleteRoutineExercise: async (routineExerciseId: number) => {
    if (isOnline) {
      return supabase.from("routine_exercises").delete().eq("routine_exercise_id", routineExerciseId);
    }
    return localDb.deleteRoutineExercise(routineExerciseId);
  },

  // Routine Exercise Sets (template sets)
  getRoutineExerciseSets: async (routineExerciseId: number) => {
    if (isOnline) {
      return supabase
        .from("routine_exercise_sets")
        .select("*")
        .eq("routine_exercise_id", routineExerciseId)
        .order("set_number", { ascending: true });
    }
    return localDb.getRoutineExerciseSets(routineExerciseId);
  },

  insertRoutineExerciseSet: async (set: {
    routine_exercise_id: number;
    set_number: number;
    target_weight: number | null;
    target_reps: number | null;
    is_warmup: boolean;
  }) => {
    if (isOnline) {
      return supabase.from("routine_exercise_sets").insert(set);
    }
    return localDb.insertRoutineExerciseSet(set);
  },

  deleteRoutineExerciseSet: async (routineSetId: number) => {
    if (isOnline) {
      return supabase.from("routine_exercise_sets").delete().eq("routine_set_id", routineSetId);
    }
    return localDb.deleteRoutineExerciseSet(routineSetId);
  },

  updateRoutineExerciseSet: async (
    routineSetId: number,
    updates: { target_reps?: number | null; target_weight?: number | null; is_warmup?: boolean }
  ) => {
    if (isOnline) {
      return supabase
        .from("routine_exercise_sets")
        .update(updates)
        .eq("routine_set_id", routineSetId);
    }
    return localDb.updateRoutineExerciseSet(routineSetId, updates);
  },
};