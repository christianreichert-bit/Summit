// app/index.tsx
import React, { useState, useEffect } from 'react';
import { useRouter, useLocalSearchParams } from 'expo-router';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  FlatList,
  KeyboardAvoidingView,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Routine, Exercise, WorkoutLograck } from './types';
import exercisesData from '../assets/data/exercises.json';
import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@workout_logs';

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

    // Create updated exercise with new sets
    const updatedExercise = {
      ...exercise,
      setCount: newCount.toString(),
      sets: newSets,
    };
    
    // Call onUpdateSet for each set to update parent state
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

// Routine Selection Modal
const RoutineSelectModal = ({ visible, onClose, onSelectRoutine, routines }) => {
  const [selectedRoutine, setSelectedRoutine] = useState<Routine | null>(null);

  const handleSelect = () => {
    if (selectedRoutine) {
      onSelectRoutine(selectedRoutine);
      setSelectedRoutine(null);
      onClose();
    }
  };

  return (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}>
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Add Routine</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <FlatList
            data={routines}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                style={[
                  styles.routineListItem,
                  selectedRoutine?.id === item.id && styles.routineListItemSelected,
                ]}
                onPress={() => setSelectedRoutine(item)}>
                <View style={styles.routineListItemContent}>
                  <Text style={styles.routineListItemName}>{item.name}</Text>
                  <Text style={styles.routineListItemDay}>
                    {item.day === 'Custom' ? item.customDayName : item.day} • {item.exercises.length} exercises
                  </Text>
                </View>
                {selectedRoutine?.id === item.id && (
                  <Text style={styles.checkmark}>✓</Text>
                )}
              </TouchableOpacity>
            )}
          />

          <TouchableOpacity
            style={[styles.addButton, !selectedRoutine && styles.addButtonDisabled]}
            onPress={handleSelect}
            disabled={!selectedRoutine}>
            <Text style={styles.addButtonText}>Add to Today</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function TodayScreen() {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [exercises, setExercises] = useState<Exercise[]>(initialExercises);
  const [showRoutineModal, setShowRoutineModal] = useState(false);
  const [routines, setRoutines] = useState<Routine[]>([]);

  // Load routines and check for routine from params
  useEffect(() => {
    loadRoutines();
    loadTodaysWorkout();
  }, []);

  // Check if a routine was passed from the routines screen
  useEffect(() => {
    if (params.selectedRoutine) {
      try {
        const routine = JSON.parse(params.selectedRoutine as string);
        addRoutineToToday(routine);
      } catch (error) {
        console.error('Failed to parse routine', error);
      }
    }
  }, [params.selectedRoutine]);

  const loadRoutines = async () => {
    try {
      const saved = await AsyncStorage.getItem('@routines');
      if (saved) {
        setRoutines(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load routines');
    }
  };

  const loadTodaysWorkout = async () => {
    try {
      const today = new Date().toDateString();
      const logs = await AsyncStorage.getItem(STORAGE_KEY);
      if (logs) {
        const parsed = JSON.parse(logs);
        const todaysLog = parsed.find(log => 
          new Date(log.date).toDateString() === today
        );
        if (todaysLog && todaysLog.exercises.length > 0) {
          setExercises(todaysLog.exercises);
        }
      }
    } catch (error) {
      console.error('Failed to load today\'s workout');
    }
  };

  const saveWorkout = async () => {
    try {
      const existing = await AsyncStorage.getItem(STORAGE_KEY);
      const logs = existing ? JSON.parse(existing) : [];
      
      const today = new Date();
      const existingIndex = logs.findIndex(log => 
        new Date(log.date).toDateString() === today.toDateString()
      );

      const workoutLog = {
        id: existingIndex >= 0 ? logs[existingIndex].id : Date.now().toString(),
        routineName: 'Custom Workout',
        date: today,
        exercises: exercises,
      };

      if (existingIndex >= 0) {
        logs[existingIndex] = workoutLog;
      } else {
        logs.push(workoutLog);
      }

      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(logs));
      Alert.alert('Success', 'Workout saved!');
    } catch (error) {
      Alert.alert('Error', 'Failed to save workout');
    }
  };

  const handleRemoveExercise = (exerciseId: string) => {
    setExercises(exercises.filter((ex) => ex.id !== exerciseId));
  };

  const handleUpdateSet = (exerciseId: string, setNumber: number, field: string, value: any) => {
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
  };

  const handleToggleSet = (exerciseId: string, setNumber: number) => {
    setExercises(
      exercises.map((exercise) => {
        if (exercise.id === exerciseId) {
          return {
            ...exercise,
            sets: exercise.sets.map((set) =>
              set.setNumber === setNumber
                ? { ...set, completed: !set.completed }
                : set
            ),
          };
        }
        return exercise;
      })
    );
  };

  const addRoutineToToday = (routine: Routine) => {
    const newExercises: Exercise[] = routine.exercises.map((re, index) => ({
      id: Date.now().toString() + index + Math.random(),
      name: re.name,
      muscleGroup: re.muscleGroup,
      setCount: re.defaultSetCount.toString(),
      sets: Array.from({ length: re.defaultSetCount }, (_, i) => ({
        setNumber: i + 1,
        reps: '10',
        weight: '',
        completed: false,
      })),
    }));
    
    setExercises([...exercises, ...newExercises]);
    Alert.alert('Success', `Added "${routine.name}" to today's workout!`);
  };

  const handleAddRoutine = (routine: Routine) => {
    addRoutineToToday(routine);
    setShowRoutineModal(false);
  };

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
            <Text style={styles.sectionTitle}>Today's Workout</Text>
            <View style={styles.headerButtons}>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={saveWorkout}>
                <Text style={styles.iconButtonText}>💾</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => setShowRoutineModal(true)}>
                <Text style={styles.iconButtonText}>📋</Text>
              </TouchableOpacity>
            </View>
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
              <Text style={styles.emptyStateText}>No exercises yet</Text>
              <Text style={styles.emptyStateSubtext}>
                Tap the 📋 button to add a routine
              </Text>
            </View>
          )}
        </View>
      </ScrollView>

      <RoutineSelectModal
        visible={showRoutineModal}
        onClose={() => setShowRoutineModal(false)}
        onSelectRoutine={handleAddRoutine}
        routines={routines}
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
});