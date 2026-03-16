// app/(tabs)/index.tsx
import React, { useState, useEffect } from 'react';
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
import { Routine, Exercise, WorkoutLog } from '../types';  // If types in root
import exercisesData from '../../assets/data/exercises.json';  // If assets in root
import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from './backend/supabaseClient';

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

// Sample initial exercises
const initialExercises: Exercise[] = [
  {
    id: '1',
    name: 'Barbell Bench Press',
    muscleGroup: 'Chest',
    setCount: '3',
    sets: [
      { setNumber: 1, reps: '10', weight: '135', completed: false },
      { setNumber: 2, reps: '8', weight: '155', completed: false },
      { setNumber: 3, reps: '6', weight: '175', completed: false },
    ],
  },
  {
    id: '2',
    name: 'Barbell Squat',
    muscleGroup: 'Legs',
    setCount: '3',
    sets: [
      { setNumber: 1, reps: '10', weight: '185', completed: false },
      { setNumber: 2, reps: '8', weight: '205', completed: false },
      { setNumber: 3, reps: '6', weight: '225', completed: false },
    ],
  },
];

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
          selectionColor="#FF6B00"
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
          selectionColor="#FF6B00"
          editable={!set.completed}
        />
      </View>
    </View>
  );
};

// Exercise Card Component
const ExerciseCard = ({ exercise, onRemove, onUpdateSet, onToggleSet }) => {
  const [expanded, setExpanded] = useState(true);
  const [setCountInput, setSetCountInput] = useState(exercise.setCount);

  useEffect(() => {
    setSetCountInput(exercise.setCount);
  }, [exercise.setCount]);

  const handleSetCountChange = (text) => {
    setSetCountInput(text);
  };

  const handleSetCountSubmit = () => {
    let newCount = parseInt(setCountInput) || 0;
    newCount = Math.min(Math.max(newCount, 1), 10);
    setSetCountInput(newCount.toString());
    
    // Update sets
    const currentSets = exercise.sets;
    let newSets = [];
    
    if (newCount > currentSets.length) {
      newSets = [...currentSets];
      for (let i = currentSets.length + 1; i <= newCount; i++) {
        newSets.push({
          setNumber: i,
          reps: '10',
          weight: '',
          completed: false,
        });
      }
    } else if (newCount < currentSets.length) {
      newSets = currentSets.slice(0, newCount);
    } else {
      newSets = currentSets;
    }

    // Update each set
    newSets.forEach((set, index) => {
      onUpdateSet(set.setNumber, 'setNumber', index + 1);
    });
  };

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
                <TextInput
                  style={styles.setCountInput}
                  value={setCountInput}
                  onChangeText={handleSetCountChange}
                  onBlur={handleSetCountSubmit}
                  onSubmitEditing={handleSetCountSubmit}
                  keyboardType="numeric"
                  maxLength={2}
                  selectionColor="#FF6B00"
                />
                <Text style={styles.exerciseMeta}>sets</Text>
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
        
        <TouchableOpacity
          style={styles.removeButton}
          onPress={(e) => {
            e.stopPropagation();
            onRemove(exercise.id);
          }}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}>
          <Text style={styles.removeIcon}>−</Text>
        </TouchableOpacity>
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
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [sessionData, setSessionData] = useState<any>(null);

  // Load session status and user ID on mount
  useEffect(() => {
    initializeScreen();
  }, []);

  const initializeScreen = async () => {
    setLoading(true);
    try {
      // Get user ID from AsyncStorage
      const storedUserId = await AsyncStorage.getItem('userId');
      setUserId(storedUserId);

      // Check if there's an active session
      const sessionId = await AsyncStorage.getItem(SESSION_KEY);
      
      if (sessionId) {
        // Load active session data
        await loadSession(sessionId);
        setCurrentSessionId(sessionId);
      } else {
        // No active session, load routines for selection
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
      // Fetch session data with exercises and sets
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

      // Transform to Exercise format
      const transformedExercises: Exercise[] = sessionExercises.map(ex => ({
        id: ex.session_exercise_id,
        name: ex.exercise_name,
        muscleGroup: 'General', // You may want to fetch this
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
      // Clear invalid session
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
      const sessionDate = now.toISOString().split('T')[0]; // YYYY-MM-DD
      const startTime = now.toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
      
      console.log('Session date:', sessionDate);
      console.log('Start time:', startTime);
      
      // Create workout session (routine_id is nullable since routines are in AsyncStorage)
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: userId,
          routine_id: null, // Routine is in AsyncStorage, not in DB
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

      // Create session exercises
      const sessionExercises = selectedRoutine.exercises.map((ex, index) => ({
        session_id: session.session_id,
        exercise_id: ex.exerciseId || ex.name, // Use exerciseId or name as fallback
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

      // Create default sets for each exercise
      const allSets = createdExercises.flatMap((ex, index) => {
        const routineEx = selectedRoutine.exercises[index];
        const setCount = routineEx?.defaultSetCount || 3;
        return Array.from({ length: setCount }, (_, i) => ({
          session_exercise_id: ex.session_exercise_id,
          set_number: i + 1,
          weight: null,
          reps: null,
          is_warmup: false,
          completed: false,
        }));
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

      // Save session ID to AsyncStorage
      await AsyncStorage.setItem(SESSION_KEY, session.session_id);
      setCurrentSessionId(session.session_id);
      
      console.log('Loading session...');
      // Load the session
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
      const endTime = new Date().toISOString().split('T')[1].split('.')[0]; // HH:MM:SS
      
      // Update session end time
      await supabase
        .from('workout_sessions')
        .update({ end_time: endTime })
        .eq('session_id', currentSessionId);

      // Clear session from AsyncStorage
      await AsyncStorage.removeItem(SESSION_KEY);
      
      // Reset all state to show routine selection
      setCurrentSessionId(null);
      setExercises([]);
      setSelectedRoutine(null);
      setSessionData(null);
      
      // Reload routines for selection
      await loadRoutines(userId);
    } catch (error) {
      console.error('Failed to end session:', error);
      Alert.alert('Error', 'Failed to end session');
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const handleUpdateSet = async (exerciseId: string, setNumber: number, field: string, value: any) => {
    // Update local state
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

    // Update in database
    try {
      const exercise = exercises.find(ex => ex.id === exerciseId);
      if (!exercise) return;

      const set = exercise.sets.find(s => s.setNumber === setNumber);
      if (!set) return;

      // Get the session_set_id from database
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

    // Update local state
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

    // Update completed status in database
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
      // Clear user data from AsyncStorage
      await AsyncStorage.removeItem('userId');
      await AsyncStorage.removeItem(SESSION_KEY);
      
      // Sign out from Supabase
      await supabase.auth.signOut();
      
      // Reset state
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

  // Show loading screen
  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B00" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show routine selection screen if no active session
  if (!currentSessionId) {
    return (
      <SafeAreaView style={styles.container}>
        <LinearGradient
          colors={['#FF6B00', '#FF8C40']}
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

  // Show active workout session
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
        
        {/* Header with Date and Progress */}
        <LinearGradient
          colors={['#FF6B00', '#FF8C40']}
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
          
          {/* Progress Bar */}
          <View style={styles.progressBar}>
            <View style={[styles.progressFill, { width: `${progress}%` }]} />
          </View>
        </LinearGradient>

        {/* Exercises List */}
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
            />
          ))}

          {exercises.length === 0 && (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No exercises in this routine</Text>
            </View>
          )}
        </View>
      </ScrollView>
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
    color: '#FF6B00',
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
    color: '#FF6B00',
    fontSize: 12,
    fontWeight: '600',
    padding: 2,
    width: 24,
    textAlign: 'center',
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
    color: '#FF6B00',
    fontSize: 20,
    fontWeight: 'bold',
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
    borderColor: '#FF6B00',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
  },
  checkboxCompleted: {
    backgroundColor: '#FF6B00',
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
  // Modal Styles
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
    color: '#FF6B00',
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
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255,107,0,0.1)',
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
    backgroundColor: '#FF6B00',
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
  // Loading Screen
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
  // Routine Selection Screen
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
    borderColor: '#FF6B00',
    backgroundColor: 'rgba(255,107,0,0.1)',
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
    color: '#FF6B00',
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
    backgroundColor: '#FF6B00',
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
    backgroundColor: '#FF3B30',
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