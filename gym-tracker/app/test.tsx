import { useEffect, useState, useRef } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Platform, Pressable, ScrollView, StyleSheet, Text, TextInput, View } from "react-native";
import { useRouter } from "expo-router";
import { supabase } from "../lib/supabaseClient";
import exercisesData from "../assets/data/exercises.json";

export default function TestScreen() {
  const router = useRouter();
  const scrollRef = useRef<ScrollView>(null);

  // Users state
  const [loadingUsers, setLoadingUsers] = useState(false);
  const [users, setUsers] = useState<any[]>([]);

  // Routines state
  const [loadingRoutines, setLoadingRoutines] = useState(false);
  const [routines, setRoutines] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);

  // Form state
  const [routineName, setRoutineName] = useState("");
  const [description, setDescription] = useState("");

  // Routine exercises state
  const [selectedRoutineId, setSelectedRoutineId] = useState<number | null>(null);
  const [routineExercises, setRoutineExercises] = useState<any[]>([]);
  const [loadingExercises, setLoadingExercises] = useState(false);
  const [exerciseSearch, setExerciseSearch] = useState("");
  const [showExercisePicker, setShowExercisePicker] = useState(false);

  const [error, setError] = useState<string | null>(null);

  // Filter exercises from JSON based on search
  const filteredExercises = exercisesData.filter(
    (ex) =>
      ex.name &&
      ex.name.toLowerCase().includes(exerciseSearch.toLowerCase())
  );

  // --- Users ---
  const loadUsers = async () => {
    setLoadingUsers(true);
    setError(null);
    const { data, error } = await supabase.from("users").select("*");
    if (error) setError(error.message);
    else setUsers(data ?? []);
    setLoadingUsers(false);
  };

  // --- Routines ---
  const loadRoutines = async () => {
    setLoadingRoutines(true);
    setError(null);
    const { data, error } = await supabase.from("routines").select("*");
    if (error) setError(error.message);
    else setRoutines(data ?? []);
    setLoadingRoutines(false);
  };

  const insertRoutine = async () => {
    if (!routineName) {
      setError("Routine name is required");
      return;
    }
    setError(null);

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setError("Not authenticated");
      return;
    }

    const { error } = await supabase.from("routines").insert({
      routine_name: routineName,
      description: description || null,
      user_id: user.id,
    });

    if (error) {
      setError(error.message);
    } else {
      setRoutineName("");
      setDescription("");
      setShowForm(false);
      loadRoutines();
    }
  };

  const deleteRoutine = async (routineId: number) => {
    setError(null);
    const { error } = await supabase
      .from("routines")
      .delete()
      .eq("routine_id", routineId);

    if (error) setError(error.message);
    else {
      if (selectedRoutineId === routineId) {
        setSelectedRoutineId(null);
        setRoutineExercises([]);
      }
      loadRoutines();
    }
  };

  // --- Routine Exercises ---
  const loadRoutineExercises = async (routineId: number) => {
    setLoadingExercises(true);
    setError(null);
    const { data, error } = await supabase
      .from("routine_exercises")
      .select("*")
      .eq("routine_id", routineId)
      .order("exercise_order", { ascending: true });

    if (error) setError(error.message);
    else setRoutineExercises(data ?? []);
    setLoadingExercises(false);
  };

  const addExerciseToRoutine = async (exercise: any) => {
    if (!selectedRoutineId) return;
    setError(null);

    const nextOrder = routineExercises.length + 1;

    const { error } = await supabase.from("routine_exercises").insert({
      routine_id: selectedRoutineId,
      exercise_id: exercise.id,
      exercise_name: exercise.name,
      exercise_order: nextOrder,
    });

    if (error) {
      setError(error.message);
    } else {
      setShowExercisePicker(false);
      setExerciseSearch("");
      loadRoutineExercises(selectedRoutineId);
    }
  };

  const removeExerciseFromRoutine = async (routineExerciseId: number) => {
    if (!selectedRoutineId) return;
    setError(null);

    const { error } = await supabase
      .from("routine_exercises")
      .delete()
      .eq("routine_exercise_id", routineExerciseId);

    if (error) setError(error.message);
    else loadRoutineExercises(selectedRoutineId);
  };

  const selectRoutine = (routineId: number) => {
    if (selectedRoutineId === routineId) {
      setSelectedRoutineId(null);
      setRoutineExercises([]);
      setShowExercisePicker(false);
    } else {
      setSelectedRoutineId(routineId);
      loadRoutineExercises(routineId);
      setShowExercisePicker(false);
    }
  };

  useEffect(() => {
    loadUsers();
    loadRoutines();
  }, []);

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 20}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.container}
        contentContainerStyle={{ paddingBottom: 100 }}
        keyboardShouldPersistTaps="handled"
      >
        <Pressable onPress={() => router.back()}>
          <Text style={styles.backText}>← Back</Text>
        </Pressable>

        <Text style={styles.title}>Supabase Test</Text>

        {error ? <Text style={styles.errorText}>{error}</Text> : null}

        {/* ---- Users Section ---- */}
        <Text style={styles.sectionTitle}>Users</Text>
        <Pressable style={styles.button} onPress={loadUsers} disabled={loadingUsers}>
          <Text style={styles.buttonText}>{loadingUsers ? "Loading..." : "Load Users"}</Text>
        </Pressable>

        {loadingUsers ? (
          <ActivityIndicator />
        ) : (
          users.map((item, index) => (
            <View key={String(item.user_id ?? index)} style={styles.listItem}>
              <Text>{item.username} — {item.email}</Text>
            </View>
          ))
        )}
        {!loadingUsers && users.length === 0 && (
          <Text style={styles.emptyText}>No users found</Text>
        )}

        {/* ---- Routines Section ---- */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Routines</Text>
          <Pressable
            style={[styles.insertButton, showForm && styles.cancelButton]}
            onPress={() => {
              setShowForm(!showForm);
              setRoutineName("");
              setDescription("");
            }}
          >
            <Text style={styles.buttonText}>{showForm ? "Cancel" : "Create Routine"}</Text>
          </Pressable>
        </View>

        {showForm && (
          <View style={styles.form}>
            <TextInput
              style={styles.input}
              placeholder="Routine Name"
              value={routineName}
              onChangeText={setRoutineName}
              onFocus={() => {
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
              }}
            />
            <TextInput
              style={styles.input}
              placeholder="Description (optional)"
              value={description}
              onChangeText={setDescription}
              onFocus={() => {
                setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
              }}
            />
            <Pressable style={styles.submitButton} onPress={insertRoutine}>
              <Text style={styles.submitText}>Save Routine</Text>
            </Pressable>
          </View>
        )}

        <Pressable style={styles.button} onPress={loadRoutines} disabled={loadingRoutines}>
          <Text style={styles.buttonText}>{loadingRoutines ? "Loading..." : "Load Routines"}</Text>
        </Pressable>

        {loadingRoutines ? (
          <ActivityIndicator />
        ) : (
          routines.map((item, index) => (
            <View key={String(item.routine_id ?? index)}>
              <Pressable
                style={[
                  styles.routineItem,
                  selectedRoutineId === item.routine_id && styles.selectedRoutine,
                ]}
                onPress={() => selectRoutine(item.routine_id)}
              >
                <View style={{ flex: 1 }}>
                  <Text style={styles.routineName}>{item.routine_name}</Text>
                  {item.description ? (
                    <Text style={styles.routineDesc}>{item.description}</Text>
                  ) : null}
                  <Text style={styles.routineDate}>
                    Created: {new Date(item.created_at).toLocaleDateString()}
                  </Text>
                </View>
                <Pressable
                  style={styles.deleteButton}
                  onPress={() => deleteRoutine(item.routine_id)}
                >
                  <Text style={styles.deleteText}>Delete</Text>
                </Pressable>
              </Pressable>

              {/* ---- Exercises for selected routine ---- */}
              {selectedRoutineId === item.routine_id && (
                <View style={styles.exercisesSection}>
                  <View style={styles.sectionHeader}>
                    <Text style={styles.subTitle}>Exercises</Text>
                    <Pressable
                      style={[styles.insertButton, showExercisePicker && styles.cancelButton]}
                      onPress={() => {
                        setShowExercisePicker(!showExercisePicker);
                        setExerciseSearch("");
                      }}
                    >
                      <Text style={styles.buttonText}>
                        {showExercisePicker ? "Cancel" : "Add Exercise"}
                      </Text>
                    </Pressable>
                  </View>

                  {/* Exercise Picker */}
                  {showExercisePicker && (
                    <View style={styles.pickerContainer}>
                      <TextInput
                        style={styles.input}
                        placeholder="Search exercises..."
                        value={exerciseSearch}
                        onChangeText={setExerciseSearch}
                        autoCapitalize="none"
                        onFocus={() => {
                          setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 300);
                        }}
                      />
                      <ScrollView
                        style={styles.pickerList}
                        nestedScrollEnabled={true}
                        keyboardShouldPersistTaps="handled"
                      >
                        {filteredExercises.slice(0, 50).map((ex) => (
                          <Pressable
                            key={ex.id}
                            style={styles.pickerItem}
                            onPress={() => addExerciseToRoutine(ex)}
                          >
                            <View style={{ flex: 1 }}>
                              <Text style={styles.pickerName}>{ex.name}</Text>
                              <Text style={styles.pickerMeta}>
                                {ex.primaryMuscles?.join(", ")} • {ex.equipment ?? "none"}
                              </Text>
                            </View>
                            <Text style={styles.addText}>+ Add</Text>
                          </Pressable>
                        ))}
                        {filteredExercises.length > 50 && (
                          <Text style={styles.emptyText}>
                            Showing 50 of {filteredExercises.length} — refine your search
                          </Text>
                        )}
                        {filteredExercises.length === 0 && (
                          <Text style={styles.emptyText}>No exercises found</Text>
                        )}
                      </ScrollView>
                    </View>
                  )}

                  {/* Current exercises in routine */}
                  {loadingExercises ? (
                    <ActivityIndicator />
                  ) : routineExercises.length === 0 ? (
                    <Text style={styles.emptyText}>No exercises added yet</Text>
                  ) : (
                    routineExercises.map((ex, i) => (
                      <View key={String(ex.routine_exercise_id ?? i)} style={styles.exerciseItem}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.exerciseOrder}>#{ex.exercise_order}</Text>
                          <Text style={styles.exerciseName}>{ex.exercise_name}</Text>
                        </View>
                        <Pressable
                          style={styles.deleteButton}
                          onPress={() => removeExerciseFromRoutine(ex.routine_exercise_id)}
                        >
                          <Text style={styles.deleteText}>Remove</Text>
                        </Pressable>
                      </View>
                    ))
                  )}
                </View>
              )}
            </View>
          ))
        )}
        {!loadingRoutines && routines.length === 0 && (
          <Text style={styles.emptyText}>No routines found</Text>
        )}
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 12,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  subTitle: {
    fontSize: 16,
    fontWeight: "600",
  },
  backText: {
    fontSize: 16,
    color: "#3b82f6",
    fontWeight: "600",
    marginBottom: 8,
  },
  form: {
    gap: 8,
    marginTop: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    fontSize: 16,
  },
  button: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#e2e8f0",
    marginTop: 8,
  },
  insertButton: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#86efac",
  },
  cancelButton: {
    backgroundColor: "#fca5a5",
  },
  submitButton: {
    alignSelf: "flex-start",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: "#3b82f6",
  },
  submitText: {
    color: "#fff",
    fontWeight: "600",
  },
  deleteButton: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
    backgroundColor: "#fca5a5",
  },
  deleteText: {
    fontWeight: "600",
    color: "#991b1b",
  },
  buttonText: {
    fontWeight: "600",
  },
  listItem: {
    paddingVertical: 6,
  },
  routineItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e7eb",
  },
  selectedRoutine: {
    backgroundColor: "#eff6ff",
    borderRadius: 8,
    paddingHorizontal: 8,
  },
  routineName: {
    fontSize: 16,
    fontWeight: "600",
  },
  routineDesc: {
    fontSize: 14,
    color: "#6b7280",
  },
  routineDate: {
    fontSize: 12,
    color: "#9ca3af",
  },
  exercisesSection: {
    marginLeft: 12,
    marginTop: 8,
    marginBottom: 12,
    paddingLeft: 12,
    borderLeftWidth: 2,
    borderLeftColor: "#3b82f6",
  },
  exerciseItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  exerciseOrder: {
    fontSize: 12,
    color: "#9ca3af",
    fontWeight: "600",
  },
  exerciseName: {
    fontSize: 15,
    fontWeight: "600",
  },
  exerciseId: {
    fontSize: 12,
    color: "#9ca3af",
  },
  pickerContainer: {
    marginTop: 8,
    gap: 8,
  },
  pickerList: {
    maxHeight: 300,
    borderWidth: 1,
    borderColor: "#e5e7eb",
    borderRadius: 8,
  },
  pickerItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#f3f4f6",
  },
  pickerName: {
    fontSize: 14,
    fontWeight: "600",
  },
  pickerMeta: {
    fontSize: 12,
    color: "#6b7280",
  },
  addText: {
    color: "#3b82f6",
    fontWeight: "600",
    fontSize: 14,
  },
  emptyText: {
    textAlign: "center",
    color: "#9ca3af",
    marginTop: 12,
    paddingVertical: 8,
  },
  errorText: {
    color: "red",
    marginBottom: 8,
  },
});