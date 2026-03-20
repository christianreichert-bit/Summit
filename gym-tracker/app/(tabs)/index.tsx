// app/(tabs)/index.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'expo-router';
import { Pressable } from 'react-native';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  TextInput,
  SafeAreaView,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Routine, Exercise, WorkoutLog } from '../../types';
import exercisesData from '../../assets/data/exercises.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../backend/supabaseClient';
import ExerciseSearchModal from '../../components/ExerciseSearchModal';

const STORAGE_KEY = '@workout_logs';
const SESSION_KEY = '@currentSessionId';

// Get today's date formatted
const getTodaysDate = () => {
  const date = new Date();
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

// Get current time
const getCurrentTime = () => {
  const date = new Date();
  return date.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
  });
};

// Set Row Component
const SetRow = ({ set, onUpdateSet, onToggleComplete }) => {
  const [reps, setReps] = useState(set.reps);
  const [weight, setWeight] = useState(set.weight);

  useEffect(() => {
    setReps(set.reps);
    setWeight(set.weight);
  }, [set]);

  const handleRepsChange = (text) => {
    setReps(text);
    onUpdateSet(set.setNumber, 'reps', text);
  };

  const handleWeightChange = (text) => {
    setWeight(text);
    onUpdateSet(set.setNumber, 'weight', text);
  };

  return (
    <View style={[styles.setRow, set.completed && styles.setRowCompleted]}>
      <TouchableOpacity
        style={[styles.checkbox, set.completed && styles.checkboxCompleted]}
        onPress={() => onToggleComplete(set.setNumber)}>
        {set.completed && <Text style={styles.checkmark}>✓</Text>}
      </TouchableOpacity>
      <View style={styles.setNumberCell}>
        <Text style={styles.setNumberText}>{set.setNumber}</Text>
      </View>
      <View style={styles.setInputCell}>
        <TextInput
          style={[styles.setInput, set.completed && styles.inputCompleted]}
          value={reps}
          onChangeText={handleRepsChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#444"
          selectionColor="#0066CC"
          editable={!set.completed}
        />
      </View>
      <View style={styles.setInputCell}>
        <TextInput
          style={[styles.setInput, set.completed && styles.inputCompleted]}
          value={weight}
          onChangeText={handleWeightChange}
          keyboardType="numeric"
          placeholder="0"
          placeholderTextColor="#444"
          selectionColor="#0066CC"
          editable={!set.completed}
        />
      </View>
    </View>
  );
};

// Exercise Card Component
const ExerciseCard = ({
  exercise,
  onRemove,
  onUpdateSet,
  onToggleSet,
  onAddSet,
  onRemoveSet,
  onReplace = (_id: string) => {},
}) => {
  const [expanded, setExpanded] = useState(true);

  const handleUpdateSet = (setNumber, field, value) => {
    onUpdateSet(setNumber, field, value);
  };

  const completedCount = exercise.sets.filter(s => s.completed).length;

  return (
    <View style={styles.exerciseCard}>
      {/* Exercise Header */}
      <TouchableOpacity
        style={styles.exerciseHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}>
        <View style={styles.exerciseHeaderLeft}>
          <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
          <View style={styles.exerciseInfo}>
            <Text style={styles.exerciseName}>{exercise.name}</Text>
            <View style={styles.exerciseMetaRow}>
              <View style={styles.setCountContainer}>
                <Text style={styles.setCountValue}>{exercise.sets.length}</Text>
                <Text style={styles.exerciseMeta}>sets</Text>
              </View>
              <View style={styles.setAdjustControls}>
                <TouchableOpacity
                  style={styles.setAdjustButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onRemoveSet(exercise.id);
                  }}>
                  <Text style={styles.setAdjustButtonText}>−</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.setAdjustButton}
                  onPress={(e) => {
                    e.stopPropagation();
                    onAddSet(exercise.id);
                  }}>
                  <Text style={styles.setAdjustButtonText}>+</Text>
                </TouchableOpacity>
              </View>
              <Text style={styles.exerciseMeta}>• {exercise.muscleGroup}</Text>
              {completedCount > 0 && (
                <Text style={styles.completedBadge}>
                  • {completedCount}/{exercise.sets.length} done
                </Text>
              )}
            </View>
          </View>
        </View>
        
        <View style={styles.exerciseActions}>
          <TouchableOpacity
            style={styles.replaceButton}
            onPress={(e) => {
              e.stopPropagation();
              onReplace(exercise.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.replaceIcon}>⟳</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.removeButton}
            onPress={(e) => {
              e.stopPropagation();
              onRemove(exercise.id);
            }}
            hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
            <Text style={styles.removeIcon}>−</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {/* Expanded Sets Table */}
      {expanded && (
        <View style={styles.setsTable}>
          {/* Table Header */}
          <View style={styles.tableHeader}>
            <View style={styles.checkboxPlaceholder} />
            <View style={styles.setNumberCell}>
              <Text style={styles.tableHeaderText}>Set</Text>
            </View>
            <View style={styles.setInputCell}>
              <Text style={styles.tableHeaderText}>Reps</Text>
            </View>
            <View style={styles.setInputCell}>
              <Text style={styles.tableHeaderText}>Lbs</Text>
            </View>
          </View>

          {/* Table Rows */}
          {exercise.sets.map((set) => (
            <SetRow
              key={set.setNumber}
              set={set}
              onUpdateSet={(setNum, field, value) => handleUpdateSet(setNum, field, value)}
              onToggleComplete={(setNum) => onToggleSet(exercise.id, setNum)}
            />
          ))}
        </View>
      )}
    </View>
  );
};

export default function TodayScreen() {
  const router = useRouter();
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);
  const [showExerciseModal, setShowExerciseModal] = useState(false);
  const [replaceExerciseId, setReplaceExerciseId] = useState<string | null>(null);

  // Load session status and user ID on mount
  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    setLoading(true);
    try {
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);

      const sessionId = await AsyncStorage.getItem(SESSION_KEY);
      
      if (sessionId) {
        await loadSession(sessionId);
        setCurrentSessionId(sessionId);
      } else {
        await loadRoutines(storedUserId);
      }
    } catch (error) {
      console.error('Failed to initialize screen:', error);
      Alert.alert('Error', 'Failed to load data');
    } finally {
      setLoading(false);
    }
  };

  const loadRoutines = async (uid: string | null) => {
    try {
      const saved = await AsyncStorage.getItem('@routines');
      if (saved) {
        const parsedRoutines = JSON.parse(saved);
        setRoutines(parsedRoutines);
      } else {
        setRoutines([]);
      }
    } catch (error) {
      console.error('Failed to load routines:', error);
      Alert.alert('Error', 'Failed to load routines');
    }
  };

  const loadSession = async (sessionId: string) => {
    try {
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .select('*')
        .eq('session_id', sessionId)
        .single();

      if (sessionError) throw sessionError;

      const { data: sessionExercises, error: exercisesError } = await supabase
        .from('session_exercises')
        .select(`
          *,
          session_exercise_sets (*)
        `)
        .eq('session_id', sessionId)
        .order('exercise_order');

      if (exercisesError) throw exercisesError;

      setSessionData(session);

      const transformedExercises: Exercise[] = sessionExercises.map(ex => ({
        id: ex.session_exercise_id,
        name: ex.exercise_name,
        muscleGroup: 'General',
        setCount: ex.session_exercise_sets?.length.toString() || '3',
        sets: ex.session_exercise_sets?.map((set: any) => ({
          setNumber: set.set_number,
          reps: set.reps?.toString() || '',
          weight: set.weight?.toString() || '',
          completed: set.completed || false,
        })) || [],
      }));

      setExercises(transformedExercises);
    } catch (error) {
      console.error('Failed to load session:', error);
      Alert.alert('Error', 'Failed to load session');
      await AsyncStorage.removeItem(SESSION_KEY);
      setCurrentSessionId(null);
      await loadRoutines(userId);
    }
  };

  const handleStartSession = async () => {
    if (!selectedRoutine) {
      Alert.alert('Error', 'Please select a routine');
      return;
    }
    
    if (!userId) {
      Alert.alert('Not Logged In', 'Please log in first to start a workout session');
      return;
    }

    setLoading(true);
    try {
      console.log('Starting session for routine:', selectedRoutine.name);
      console.log('User ID:', userId);
      
      const now = new Date();
      const sessionDate = now.toISOString().split('T')[0];
      const startTime = now.toISOString().split('T')[1].split('.')[0];
      
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          routine_id: null,
          session_name: selectedRoutine.name,
          session_date: sessionDate,
          start_time: startTime,
        })
        .select()
        .single();

      if (sessionError) {
        console.error('Session error:', sessionError);
        throw sessionError;
      }
      
      console.log('Session created:', session);

      const sessionExercises = selectedRoutine.exercises.map((ex, index) => ({
        session_id: session.session_id,
        exercise_id: ex.exerciseId || ex.name,
        exercise_name: ex.name,
        exercise_order: index + 1,
      }));

      console.log('Creating exercises:', sessionExercises);

      const { data: createdExercises, error: exercisesError } = await supabase
        .from('session_exercises')
        .insert(sessionExercises)
        .select();

      if (exercisesError) {
        console.error('Exercises error:', exercisesError);
        throw exercisesError;
      }

      console.log('Exercises created:', createdExercises);

      // Create sets using saved data if available
      const allSets = createdExercises.flatMap((ex, index) => {
        const routineEx = selectedRoutine.exercises[index];
        
        if (routineEx.sets && routineEx.sets.length > 0) {
          return routineEx.sets.map(set => ({
            session_exercise_id: ex.session_exercise_id,
            set_number: set.setNumber,
            weight: set.weight ? parseFloat(set.weight) : null,
            reps: set.reps ? parseInt(set.reps) : null,
            is_warmup: false,
            completed: false,
          }));
        } else {
          const setCount = routineEx?.defaultSetCount || 3;
          return Array.from({ length: setCount }, (_, i) => ({
            session_exercise_id: ex.session_exercise_id,
            set_number: i + 1,
            weight: null,
            reps: null,
            is_warmup: false,
            completed: false,
          }));
        }
      });

      console.log('Creating sets:', allSets);

      const { error: setsError } = await supabase
        .from('session_exercise_sets')
        .insert(allSets);

      if (setsError) {
        console.error('Sets error:', setsError);
        throw setsError;
      }

      console.log('Sets created successfully');

      await AsyncStorage.setItem(SESSION_KEY, session.session_id);
      setCurrentSessionId(session.session_id);
      
      await loadSession(session.session_id);
      console.log('Session loaded successfully');
    } catch (error: any) {
      console.error('Failed to start session:', error);
      Alert.alert('Error', error.message || 'Failed to start workout session');
    } finally {
      setLoading(false);
    }
  };

  const handleEndSession = async () => {
    if (!currentSessionId) return;
    
    try {
      const endTime = new Date().toISOString().split('T')[1].split('.')[0];
      
      await supabase
        .from('workout_sessions')
        .update({ end_time: endTime })
        .eq('session_id', currentSessionId);

      await AsyncStorage.removeItem(SESSION_KEY);
      
      setCurrentSessionId(null);
      setExercises([]);
      setSelectedRoutine(null);
      setSessionData(null);
      
      await loadRoutines(userId);
    } catch (error) {
      console.error('Failed to end session:', error);
      Alert.alert('Error', 'Failed to end session');
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const handleAddExercise = async (selectedEx: any) => {
    if (!currentSessionId) return;
    try {
      const { data: createdEx, error: exError } = await supabase
        .from('session_exercises')
        .insert({
          session_id: currentSessionId,
          exercise_id: selectedEx.id,
          exercise_name: selectedEx.name,
          exercise_order: exercises.length + 1,
        })
        .select()
        .single();

      if (exError) throw exError;

      const defaultSets = Array.from({ length: 3 }, (_, i) => ({
        session_exercise_id: createdEx.session_exercise_id,
        set_number: i + 1,
        weight: null,
        reps: null,
        is_warmup: false,
        completed: false,
      }));

      const { error: setsError } = await supabase
        .from('session_exercise_sets')
        .insert(defaultSets);

      if (setsError) throw setsError;

      const newExercise: Exercise = {
        id: createdEx.session_exercise_id,
        name: selectedEx.name,
        muscleGroup: selectedEx.primaryMuscles?.[0] || 'General',
        setCount: '3',
        sets: defaultSets.map((s) => ({
          setNumber: s.set_number,
          reps: '',
          weight: '',
          completed: false,
        })),
      };
      setExercises((prev) => [...prev, newExercise]);
    } catch (error: any) {
      console.error('Failed to add exercise:', error);
      Alert.alert('Error', 'Failed to add exercise');
    }
  };

  const handleReplaceExercise = async (exerciseId: string, selectedEx: any) => {
    try {
      await supabase
        .from('session_exercises')
        .update({
          exercise_id: selectedEx.id,
          exercise_name: selectedEx.name,
        })
        .eq('session_exercise_id', exerciseId);

      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? { ...ex, name: selectedEx.name, muscleGroup: selectedEx.primaryMuscles?.[0] || 'General' }
            : ex
        )
      );
    } catch (error: any) {
      console.error('Failed to replace exercise:', error);
      Alert.alert('Error', 'Failed to replace exercise');
    }
  };

  const handleExerciseSelected = async (selectedEx: any) => {
    setShowExerciseModal(false);
    if (replaceExerciseId) {
      await handleReplaceExercise(replaceExerciseId, selectedEx);
    } else {
      await handleAddExercise(selectedEx);
    }
    setReplaceExerciseId(null);
  };

  const handleAddSet = async (exerciseId: string) => {
    try {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      const newSetNumber = exercise.sets.length + 1;

      const { error } = await supabase
        .from('session_exercise_sets')
        .insert({
          session_exercise_id: exerciseId,
          set_number: newSetNumber,
          weight: null,
          reps: null,
          is_warmup: false,
          completed: false,
        });

      if (error) throw error;

      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                setCount: (ex.sets.length + 1).toString(),
                sets: [
                  ...ex.sets,
                  {
                    setNumber: newSetNumber,
                    reps: '',
                    weight: '',
                    completed: false,
                  },
                ],
              }
            : ex
        )
      );
    } catch (error) {
      console.error('Failed to add set:', error);
      Alert.alert('Error', 'Failed to add set');
    }
  };

  const handleRemoveSet = async (exerciseId: string) => {
    try {
      const exercise = exercises.find((ex) => ex.id === exerciseId);
      if (!exercise) return;

      if (exercise.sets.length <= 1) {
        Alert.alert('Minimum Reached', 'Each exercise needs at least 1 set.');
        return;
      }

      const lastSetNumber = exercise.sets.length;

      const { error } = await supabase
        .from('session_exercise_sets')
        .delete()
        .eq('session_exercise_id', exerciseId)
        .eq('set_number', lastSetNumber);

      if (error) throw error;

      setExercises((prev) =>
        prev.map((ex) =>
          ex.id === exerciseId
            ? {
                ...ex,
                setCount: (ex.sets.length - 1).toString(),
                sets: ex.sets.slice(0, -1),
              }
            : ex
        )
      );
    } catch (error) {
      console.error('Failed to remove set:', error);
      Alert.alert('Error', 'Failed to remove set');
    }
  };

  const handleUpdateSet = async (exerciseId: string, setNumber: number, field: string, value: any) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.setNumber === setNumber ? { ...set, [field]: value } : set
            ),
          };
        }
        return exercise;
      })
    );

    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (!exercise) return;

      const { data: setData, error } = await supabase
        .from('session_exercise_sets')
        .select('session_set_id')
        .eq('session_exercise_id', exerciseId)
        .eq('set_number', setNumber)
        .single();

      if (error || !setData) {
        console.error('Failed to find set:', error);
        return;
      }

      await supabase
        .from('session_exercise_sets')
        .update({ [field]: value })
        .eq('session_set_id', setData.session_set_id);
    } catch (error) {
      console.error('Failed to update set:', error);
    }
  };

  const handleToggleSet = async (exerciseId: string, setNumber: number) => {
    const exercise = exercises.find(ex => ex.id === exerciseId);
    if (!exercise) return;

    const set = exercise.sets.find(s => s.setNumber === setNumber);
    if (!set) return;

    const newCompleted = !set.completed;

    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map((s) =>
              s.setNumber === setNumber
                ? { ...s, completed: newCompleted }
                : s
            ),
          };
        }
        return exercise;
      })
    );

    try {
      const { data: setData, error } = await supabase
        .from('session_exercise_sets')
        .select('session_set_id')
        .eq('session_exercise_id', exerciseId)
        .eq('set_number', setNumber)
        .single();

      if (error || !setData) {
        console.error('Failed to find set:', error);
        return;
      }

      await supabase
        .from('session_exercise_sets')
        .update({
          completed: newCompleted,
          reps: newCompleted ? (parseInt(set.reps) || null) : null,
          weight: newCompleted ? (parseFloat(set.weight) || null) : null,
        })
        .eq('session_set_id', setData.session_set_id);
    } catch (error) {
      console.error('Failed to save set:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem(SESSION_KEY);
      
      await supabase.auth.signOut();
      
      setUserId(null);
      setCurrentSessionId(null);
      setExercises([]);
      setRoutines([]);
      setSelectedRoutine(null);
      
      Alert.alert('Signed Out', 'You have been signed out successfully');
    } catch (error) {
      console.error('Failed to sign out:', error);
      Alert.alert('Error', 'Failed to sign out');
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#0066CC" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!currentSessionId) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#0066CC', '#4A9EFF']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.selectionTitle}>Start a Workout</Text>
              <Text style={styles.selectionSubtitle}>Select a routine to begin</Text>
            </View>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleSignOut}>
              <Text style={styles.signOutButtonText}>Sign Out</Text>
            </TouchableOpacity>
          </View>
        </LinearGradient>

        <ScrollView style={styles.routineSelectionContainer}>
          {routines.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No routines found</Text>
              <Text style={styles.emptyStateSubtext}>
                Create a routine first in the Routines tab
              </Text>
            </View>
          ) : (
            routines.map((routine) => (
              <TouchableOpacity
                key={routine.id}
                style={[
                  styles.routineCard,
                  selectedRoutine?.id === routine.id && styles.routineCardSelected,
                ]}
                onPress={() => setSelectedRoutine(routine)}>
                <View style={styles.routineCardContent}>
                  <Text style={styles.routineCardName}>{routine.name}</Text>
                  <Text style={styles.routineCardInfo}>
                    {routine.exercises.length} exercises
                  </Text>
                  {selectedRoutine?.id === routine.id && (
                    <Text style={styles.selectedCheckmark}>✓ Selected</Text>
                  )}
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>

        {selectedRoutine && (
          <View style={styles.startButtonContainer}>
            <TouchableOpacity
              style={styles.startButton}
              onPress={handleStartSession}
              disabled={loading}>
              {loading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.startButtonText}>Start Workout</Text>
              )}
            </TouchableOpacity>
          </View>
        )}
      </SafeAreaView>
    );
  }

  const completedSets = exercises.reduce(
    (acc, ex) => acc + ex.sets.filter((s) => s.completed).length,
    0
  );
  const totalSets = exercises.reduce((acc, ex) => acc + ex.sets.length, 0);
  const progress = totalSets > 0 ? (completedSets / totalSets) * 100 : 0;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled">
        
        <LinearGradient
          colors={['#0066CC', '#4A9EFF']}
          style={styles.header}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}>
          <View style={styles.dateTimeContainer}>
            <View>
              <Text style={styles.dateText}>{getTodaysDate()}</Text>
              <Text style={styles.timeText}>{getCurrentTime()}</Text>
            </View>
            <View style={styles.progressBadge}>
              <Text style={styles.progressBadgeText}>
                {completedSets}/{totalSets}
              </Text>
            </View>
          </View>
          
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </LinearGradient>

        <View style={styles.exercisesContainer}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{sessionData?.session_name || 'Workout'}</Text>
            <TouchableOpacity
              style={styles.endSessionButton}
              onPress={handleEndSession}>
              <Text style={styles.endSessionButtonText}>End Workout</Text>
            </TouchableOpacity>
          </View>

          {exercises.map((exercise) => (
            <ExerciseCard
              key={exercise.id}
              exercise={exercise}
              onRemove={handleRemoveExercise}
              onUpdateSet={(setNum, field, value) =>
                handleUpdateSet(exercise.id, setNum, field, value)
              }
              onToggleSet={handleToggleSet}
              onAddSet={handleAddSet}
              onRemoveSet={handleRemoveSet}
              onReplace={(id) => {
                setReplaceExerciseId(id);
                setShowExerciseModal(true);
              }}
            />
          ))}

          {exercises.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exercises in this routine</Text>
            </View>
          )}

          <TouchableOpacity
            style={styles.addExerciseButton}
            onPress={() => {
              setReplaceExerciseId(null);
              setShowExerciseModal(true);
            }}>
            <Text style={styles.addExerciseButtonText}>+ Add Exercise</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <ExerciseSearchModal
        visible={showExerciseModal}
        title={replaceExerciseId ? 'Replace Exercise' : 'Add Exercise'}
        onClose={() => {
          setShowExerciseModal(false);
          setReplaceExerciseId(null);
        }}
        onSelect={handleExerciseSelected}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  scrollContent: {
    paddingBottom: 30,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 20 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  dateText: {
    fontSize: 16,
    fontWeight: '500',
    color: '#FFFFFF',
    opacity: 0.9,
  },
  timeText: {
    fontSize: 14,
    color: '#FFFFFF',
    opacity: 0.7,
    marginTop: 4,
  },
  progressBadge: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  progressBadgeText: {
    color: '#FFFFFF',
    fontWeight: '600',
    fontSize: 14,
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255,255,255,0.3)',
    borderRadius: 2,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#FFFFFF',
  },
  exercisesContainer: {
    paddingHorizontal: 16,
    paddingTop: 20,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  headerButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  iconButton: {
    backgroundColor: '#1A1A1A',
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  iconButtonText: {
    fontSize: 20,
  },
  exerciseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  exerciseHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chevron: {
    color: '#0066CC',
    fontSize: 16,
    marginRight: 8,
  },
  exerciseInfo: {
    flex: 1,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  exerciseMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  setCountContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#000000',
    borderRadius: 4,
    paddingHorizontal: 4,
    marginRight: 8,
    borderWidth: 1,
    borderColor: '#333',
  },
  setCountInput: {
    color: '#0066CC',
    fontSize: 12,
    fontWeight: '600',
    padding: 2,
    width: 24,
    textAlign: 'center',
  },
  setCountValue: {
    color: '#0066CC',
    fontSize: 12,
    fontWeight: '700',
    marginRight: 4,
    minWidth: 18,
    textAlign: 'center',
  },
  setAdjustControls: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 8,
    gap: 6,
  },
  setAdjustButton: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#444',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#000000',
  },
  setAdjustButtonText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    lineHeight: 15,
  },
  exerciseMeta: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  completedBadge: {
    fontSize: 12,
    color: '#4CAF50',
  },
  removeButton: {
    padding: 4,
  },
  removeIcon: {
    color: '#0066CC',
    fontSize: 20,
    fontWeight: 'bold',
  },
  exerciseActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  replaceButton: {
    padding: 4,
  },
  replaceIcon: {
    color: '#888',
    fontSize: 20,
    fontWeight: 'bold',
  },
  addExerciseButton: {
    borderWidth: 1,
    borderColor: '#0066CC',
    borderStyle: 'dashed',
    borderRadius: 12,
    padding: 14,
    alignItems: 'center',
    marginTop: 4,
    marginBottom: 8,
  },
  addExerciseButtonText: {
    color: '#0066CC',
    fontSize: 15,
    fontWeight: '600',
  },
  setsTable: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
    backgroundColor: '#121212',
    borderBottomLeftRadius: 12,
    borderBottomRightRadius: 12,
  },
  tableHeader: {
    flexDirection: 'row',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  checkboxPlaceholder: {
    width: 24,
    marginRight: 8,
  },
  tableHeaderText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#888',
    textTransform: 'uppercase',
  },
  setRow: {
    flexDirection: 'row',
    marginBottom: 10,
    alignItems: 'center',
  },
  setRowCompleted: {
    opacity: 0.6,
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxCompleted: {
    backgroundColor: '#0066CC',
  },
  checkmark: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: 'bold',
  },
  setNumberCell: {
    width: 40,
    alignItems: 'flex-start',
  },
  setInputCell: {
    flex: 1,
    alignItems: 'center',
  },
  setNumberText: {
    fontSize: 14,
    color: '#888',
  },
  setInput: {
    backgroundColor: '#000000',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    width: '80%',
    color: '#FFFFFF',
    fontSize: 14,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  inputCompleted: {
    opacity: 0.5,
    textDecorationLine: 'line-through',
  },
  emptyState: {
    padding: 40,
    alignItems: 'center',
  },
  emptyStateText: {
    color: '#888',
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
  },
  emptyStateSubtext: {
    color: '#666',
    fontSize: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.95)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#1A1A1A',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 20,
    height: '90%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  closeButton: {
    color: '#0066CC',
    fontSize: 24,
  },
  routineListItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    marginBottom: 12,
  },
  routineListItemSelected: {
    borderColor: '#0066CC',
    backgroundColor: 'rgba(0,102,204,0.1)',
  },
  routineListItemContent: {
    flex: 1,
  },
  routineListItemName: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  routineListItemDay: {
    fontSize: 14,
    color: '#888',
  },
  addButton: {
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  addButtonDisabled: {
    opacity: 0.5,
  },
  addButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#000000',
  },
  loadingText: {
    color: '#FFFFFF',
    fontSize: 16,
    marginTop: 16,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  selectionTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  selectionSubtitle: {
    fontSize: 16,
    color: '#FFFFFF',
    opacity: 0.8,
  },
  signOutButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  signOutButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
  routineSelectionContainer: {
    flex: 1,
    padding: 16,
  },
  routineCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    padding: 20,
    marginBottom: 12,
    borderWidth: 2,
    borderColor: '#333',
  },
  routineCardSelected: {
    borderColor: '#0066CC',
    backgroundColor: 'rgba(0,102,204,0.1)',
  },
  routineCardContent: {
    gap: 8,
  },
  routineCardName: {
    fontSize: 20,
    fontWeight: '600',
    color: '#FFFFFF',
  },
  routineCardInfo: {
    fontSize: 14,
    color: '#888',
  },
  selectedCheckmark: {
    fontSize: 14,
    color: '#0066CC',
    fontWeight: '600',
    marginTop: 4,
  },
  startButtonContainer: {
    padding: 16,
    backgroundColor: '#000000',
    borderTopWidth: 1,
    borderTopColor: '#333',
  },
  startButton: {
    backgroundColor: '#0066CC',
    padding: 18,
    borderRadius: 12,
    alignItems: 'center',
  },
  startButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
  },
  endSessionButton: {
    backgroundColor: '#0066CC',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
  },
  endSessionButtonText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '600',
  },
});