// app/(tabs)/routines.tsx
import React, { useState, useEffect } from 'react';
import ExerciseSearchModal from '../../components/ExerciseSearchModal';
import {
  StyleSheet,
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  TextInput,
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Routine, RoutineExercise } from '../../types';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const STORAGE_KEY = '@routines';

// Routine Card Component with Edit and Delete
const RoutineCard = ({ routine, onDelete, onUse, onEdit }) => {
  const [expanded, setExpanded] = useState(false);

  const handleDelete = () => {
    onDelete(routine.id);
  };

  return (
    <View style={styles.routineCard}>
      <View style={styles.routineHeader}>
        <TouchableOpacity
          style={styles.routineHeaderLeft}
          onPress={() => setExpanded(!expanded)}
          activeOpacity={0.7}>
          <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
          <View>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.routineDay}>
              {routine.day === 'Custom' ? routine.customDayName : routine.day}
            </Text>
          </View>
        </TouchableOpacity>
        <View style={styles.routineHeaderRight}>
          <Text style={styles.exerciseCount}>{routine.exercises.length} exercises</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity onPress={() => onEdit(routine)} style={styles.editButton}>
              <Text style={styles.editButtonText}>✎</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={handleDelete} style={styles.deleteButton}>
              <Text style={styles.deleteButtonText}>🗑</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => onUse(routine)} style={styles.useButton}>
              <Text style={styles.useButtonText}>+</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>

      {expanded && (
        <View style={styles.routineExercises}>
          {routine.exercises.map((exercise, index) => (
            <View key={index} style={styles.routineExerciseItem}>
              <View style={styles.routineExerciseInfo}>
                <Text style={styles.routineExerciseName}>{exercise.name}</Text>
                <Text style={styles.routineExerciseMeta}>
                  {exercise.muscleGroup} • {exercise.sets?.length || exercise.defaultSetCount} sets
                </Text>
              </View>
              
              {/* Show saved sets if they exist */}
              {exercise.sets && exercise.sets.length > 0 && (
                <View style={styles.savedSetsContainer}>
                  <View style={styles.savedSetsHeader}>
                    <Text style={styles.savedSetsHeaderText}>Set</Text>
                    <Text style={styles.savedSetsHeaderText}>Reps</Text>
                    <Text style={styles.savedSetsHeaderText}>Weight</Text>
                  </View>
                  {exercise.sets.map((set) => (
                    <View key={set.setNumber} style={styles.savedSetRow}>
                      <Text style={styles.savedSetText}>{set.setNumber}</Text>
                      <Text style={styles.savedSetText}>{set.reps || '—'}</Text>
                      <Text style={styles.savedSetText}>{set.weight || '—'}</Text>
                    </View>
                  ))}
                </View>
              )}
              
              {exercise.notes && (
                <Text style={styles.routineExerciseNotes}>{exercise.notes}</Text>
              )}
            </View>
          ))}
        </View>
      )}
    </View>
  );
};
// Create/Edit Routine Modal
const CreateEditRoutineModal = ({ visible, onClose, onSave, editingRoutine }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedDay, setSelectedDay] = useState<'Push' | 'Pull' | 'Legs' | 'Custom'>('Push');
  const [customDayName, setCustomDayName] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([]);
  const [showSearchModal, setShowSearchModal] = useState(false);

  const days: ('Push' | 'Pull' | 'Legs' | 'Custom')[] = ['Push', 'Pull', 'Legs', 'Custom'];

  // Load editing routine data when modal opens
  useEffect(() => {
    if (editingRoutine) {
      setRoutineName(editingRoutine.name);
      setSelectedDay(editingRoutine.day);
      setCustomDayName(editingRoutine.customDayName || '');
      setSelectedExercises(editingRoutine.exercises);
    } else {
      resetForm();
    }
  }, [editingRoutine]);

  const handleAddExercise = (exercise: any) => {
    const defaultSetCount = 3;
    const defaultSets = Array.from({ length: defaultSetCount }, (_, i) => ({
      setNumber: i + 1,
      reps: '',
      weight: '',
    }));

    const newExercise: RoutineExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.primaryMuscles?.[0] || 'Other',
      defaultSetCount: defaultSetCount,
      sets: defaultSets,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };
  
  const handleUpdateSet = (exerciseIndex: number, setNumber: number, field: 'reps' | 'weight', value: string) => {
    const updated = [...selectedExercises];
    const exercise = updated[exerciseIndex];
    if (exercise.sets) {
      const setIndex = exercise.sets.findIndex(s => s.setNumber === setNumber);
      if (setIndex !== -1) {
        exercise.sets[setIndex] = { ...exercise.sets[setIndex], [field]: value };
      }
    }
    setSelectedExercises(updated);
  };

  const handleAddSet = (exerciseIndex: number) => {
    const updated = [...selectedExercises];
    const exercise = updated[exerciseIndex];
    const newSetNumber = (exercise.sets?.length || exercise.defaultSetCount) + 1;
    
    if (!exercise.sets) {
      exercise.sets = [];
    }
    
    exercise.sets.push({
      setNumber: newSetNumber,
      reps: '',
      weight: '',
    });
    exercise.defaultSetCount = newSetNumber;
    
    setSelectedExercises(updated);
  };

  const handleRemoveSet = (exerciseIndex: number) => {
    const updated = [...selectedExercises];
    const exercise = updated[exerciseIndex];
    
    if (exercise.sets && exercise.sets.length > 1) {
      exercise.sets = exercise.sets.slice(0, -1);
      exercise.defaultSetCount = exercise.sets.length;
    }
    
    setSelectedExercises(updated);
  };

  const resetForm = () => {
    setRoutineName('');
    setSelectedDay('Push');
    setCustomDayName('');
    setSelectedExercises([]);
  };

  const handleSave = () => {
    if (!routineName.trim()) {
      Alert.alert('Error', 'Please enter a routine name');
      return;
    }
    if (selectedExercises.length === 0) {
      Alert.alert('Error', 'Please add at least one exercise');
      return;
    }
    if (selectedDay === 'Custom' && !customDayName.trim()) {
      Alert.alert('Error', 'Please enter a custom day name');
      return;
    }

    const exercisesWithSets = selectedExercises.map(ex => ({
      ...ex,
      sets: ex.sets || Array.from({ length: ex.defaultSetCount }, (_, i) => ({
        setNumber: i + 1,
        reps: '',
        weight: '',
      })),
    }));

    const routineData: Routine = {
      id: editingRoutine ? editingRoutine.id : Date.now().toString(),
      name: routineName.trim(),
      day: selectedDay,
      customDayName: selectedDay === 'Custom' ? customDayName.trim() : undefined,
      exercises: exercisesWithSets,
      createdAt: editingRoutine ? editingRoutine.createdAt : new Date(),
    };

    onSave(routineData);
    resetForm();
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
            <Text style={styles.modalTitle}>
              {editingRoutine ? 'Edit Routine' : 'Create Routine'}
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Routine Name</Text>
              <TextInput
                style={styles.input}
                value={routineName}
                onChangeText={setRoutineName}
                placeholder="e.g., Upper Body Strength"
                placeholderTextColor="#666"
              />
            </View>

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Day</Text>
              <View style={styles.dayButtons}>
                {days.map((day) => (
                  <TouchableOpacity
                    key={day}
                    style={[
                      styles.dayButton,
                      selectedDay === day && styles.dayButtonSelected,
                    ]}
                    onPress={() => setSelectedDay(day)}>
                    <Text
                      style={[
                        styles.dayButtonText,
                        selectedDay === day && styles.dayButtonTextSelected,
                      ]}>
                      {day}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            {selectedDay === 'Custom' && (
              <View style={styles.inputGroup}>
                <TextInput
                  style={styles.input}
                  value={customDayName}
                  onChangeText={setCustomDayName}
                  placeholder="Enter custom day name"
                  placeholderTextColor="#666"
                />
              </View>
            )}

            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add Exercises</Text>
              <TouchableOpacity
                style={styles.searchButton}
                onPress={() => setShowSearchModal(true)}>
                <Text style={styles.searchButtonPlaceholder}>Search exercises...</Text>
                <Text style={styles.addIcon}>+</Text>
              </TouchableOpacity>
            </View>

            {selectedExercises.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Selected Exercises</Text>
                {selectedExercises.map((exercise, exerciseIndex) => (
                  <View key={exerciseIndex} style={styles.exerciseCard}>
                    <View style={styles.exerciseHeader}>
                      <View style={styles.exerciseHeaderLeft}>
                        <Text style={styles.exerciseName}>{exercise.name}</Text>
                        <Text style={styles.exerciseMeta}>{exercise.muscleGroup}</Text>
                      </View>
                      <View style={styles.exerciseHeaderRight}>
                        <View style={styles.setControls}>
                          <TouchableOpacity
                            style={styles.setControlButton}
                            onPress={() => handleRemoveSet(exerciseIndex)}>
                            <Text style={styles.setControlText}>−</Text>
                          </TouchableOpacity>
                          <Text style={styles.setCount}>
                            {exercise.sets?.length || exercise.defaultSetCount} sets
                          </Text>
                          <TouchableOpacity
                            style={styles.setControlButton}
                            onPress={() => handleAddSet(exerciseIndex)}>
                            <Text style={styles.setControlText}>+</Text>
                          </TouchableOpacity>
                        </View>
                        <TouchableOpacity onPress={() => handleRemoveExercise(exerciseIndex)}>
                          <Text style={styles.removeIcon}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Set Editor Table */}
                    <View style={styles.setsTable}>
                      <View style={styles.setTableHeader}>
                        <Text style={styles.setTableHeaderCell}>Set</Text>
                        <Text style={styles.setTableHeaderCell}>Reps</Text>
                        <Text style={styles.setTableHeaderCell}>Weight (lbs)</Text>
                      </View>
                      
                      {(exercise.sets || Array.from({ length: exercise.defaultSetCount }, (_, i) => ({
                        setNumber: i + 1,
                        reps: '',
                        weight: '',
                      }))).map((set) => (
                        <View key={set.setNumber} style={styles.setRow}>
                          <Text style={styles.setNumberCell}>{set.setNumber}</Text>
                          <TextInput
                            style={styles.setInput}
                            value={set.reps}
                            onChangeText={(value) => 
                              handleUpdateSet(exerciseIndex, set.setNumber, 'reps', value)
                            }
                            placeholder="0"
                            placeholderTextColor="#444"
                            keyboardType="numeric"
                          />
                          <TextInput
                            style={styles.setInput}
                            value={set.weight}
                            onChangeText={(value) => 
                              handleUpdateSet(exerciseIndex, set.setNumber, 'weight', value)
                            }
                            placeholder="0"
                            placeholderTextColor="#444"
                            keyboardType="numeric"
                          />
                        </View>
                      ))}
                    </View>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>
              {editingRoutine ? 'Update Routine' : 'Create Routine'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
      <ExerciseSearchModal
        visible={showSearchModal}
        title="Add Exercise"
        onClose={() => setShowSearchModal(false)}
        onSelect={(exercise) => {
          handleAddExercise(exercise);
          setShowSearchModal(false);
        }}
      />
    </Modal>
  );
};

export default function RoutinesScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [editingRoutine, setEditingRoutine] = useState<Routine | null>(null);

  useEffect(() => {
    loadRoutines();
  }, []);

  const loadRoutines = async () => {
    try {
      const saved = await AsyncStorage.getItem(STORAGE_KEY);
      if (saved) {
        setRoutines(JSON.parse(saved));
      }
    } catch (error) {
      console.error('Failed to load routines');
    }
  };

  const saveRoutines = async (newRoutines: Routine[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(newRoutines));
      setRoutines(newRoutines);
    } catch (error) {
      Alert.alert('Error', 'Failed to save routine');
    }
  };

  const handleCreateRoutine = (newRoutine: Routine) => {
    const updated = [...routines, newRoutine];
    saveRoutines(updated);
    setShowCreateModal(false);
    setEditingRoutine(null);
  };

  const handleEditRoutine = (routine: Routine) => {
    setEditingRoutine(routine);
    setShowCreateModal(true);
  };

  const handleUpdateRoutine = (updatedRoutine: Routine) => {
    const updated = routines.map(r => 
      r.id === updatedRoutine.id ? updatedRoutine : r
    );
    saveRoutines(updated);
    setShowCreateModal(false);
    setEditingRoutine(null);
  };

  const handleDeleteRoutine = (routineId: string) => {
    Alert.alert(
      'Delete Routine',
      'Are you sure you want to delete this routine?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: () => {
            const updated = routines.filter(r => r.id !== routineId);
            saveRoutines(updated);
          },
        },
      ]
    );
  };

  const handleUseRoutine = (routine: Routine) => {
    router.push({
      pathname: '/',
      params: { 
        selectedRoutine: JSON.stringify(routine) 
      }
    });
  };

  const routinesByDay = {
    Push: routines.filter(r => r.day === 'Push'),
    Pull: routines.filter(r => r.day === 'Pull'),
    Legs: routines.filter(r => r.day === 'Legs'),
    Custom: routines.filter(r => r.day === 'Custom'),
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient
        colors={['#0066CC', '#4A9EFF']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Routines</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => {
              setEditingRoutine(null);
              setShowCreateModal(true);
            }}>
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {routinesByDay.Push.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Push Day</Text>
            {routinesByDay.Push.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
                onEdit={handleEditRoutine}
              />
            ))}
          </View>
        )}

        {routinesByDay.Pull.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pull Day</Text>
            {routinesByDay.Pull.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
                onEdit={handleEditRoutine}
              />
            ))}
          </View>
        )}

        {routinesByDay.Legs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legs Day</Text>
            {routinesByDay.Legs.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
                onEdit={handleEditRoutine}
              />
            ))}
          </View>
        )}

        {routinesByDay.Custom.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Days</Text>
            {routinesByDay.Custom.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
                onEdit={handleEditRoutine}
              />
            ))}
          </View>
        )}

        {routines.length === 0 && (
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No routines yet</Text>
            <Text style={styles.emptyStateSubtext}>
              Tap Create to build your first routine
            </Text>
          </View>
        )}
      </ScrollView>

      <CreateEditRoutineModal
        visible={showCreateModal}
        onClose={() => {
          setShowCreateModal(false);
          setEditingRoutine(null);
        }}
        onSave={editingRoutine ? handleUpdateRoutine : handleCreateRoutine}
        editingRoutine={editingRoutine}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000000',
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#FFFFFF',
  },
  createButton: {
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
  },
  createButtonText: {
    color: '#FFFFFF',
    fontWeight: '600',
  },
  content: {
    flex: 1,
    padding: 16,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 12,
    paddingLeft: 4,
  },
  routineCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  routineHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
  },
  routineHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  chevron: {
    color: '#0066CC',
    fontSize: 16,
    marginRight: 12,
  },
  routineName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  routineDay: {
    fontSize: 12,
    color: '#888',
  },
  routineHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseCount: {
    fontSize: 12,
    color: '#888',
  },
  actionButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  editButton: {
    backgroundColor: '#4A9EFF',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  deleteButton: {
    backgroundColor: '#FF3B30',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  deleteButtonText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  useButton: {
    backgroundColor: '#0066CC',
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  useButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
  routineExercises: {
    borderTopWidth: 1,
    borderTopColor: '#333',
    padding: 16,
  },
  routineExerciseItem: {
    marginBottom: 12,
  },
  routineExerciseInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  routineExerciseName: {
    fontSize: 14,
    fontWeight: '500',
    color: '#FFFFFF',
  },
  routineExerciseMeta: {
    fontSize: 12,
    color: '#888',
  },
  routineExerciseNotes: {
    fontSize: 12,
    color: '#666',
    marginTop: 4,
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
  modalScroll: {
    flex: 1,
  },
  inputGroup: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 12,
    color: '#FFFFFF',
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#333',
  },
  dayButtons: {
    flexDirection: 'row',
    gap: 8,
  },
  dayButton: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#333',
    alignItems: 'center',
  },
  dayButtonSelected: {
    backgroundColor: '#0066CC',
    borderColor: '#0066CC',
  },
  dayButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  searchButton: {
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 12,
    borderWidth: 1,
    borderColor: '#333',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  searchButtonPlaceholder: {
    color: '#666',
    fontSize: 16,
  },
  addIcon: {
    color: '#0066CC',
    fontSize: 20,
  },
  savedSetsContainer: {
    marginTop: 8,
    backgroundColor: '#000000',
    borderRadius: 8,
    padding: 8,
  },
  savedSetsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
    marginBottom: 4,
  },
  savedSetsHeaderText: {
    color: '#888',
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
    textAlign: 'center',
  },
  savedSetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 2,
  },
  savedSetText: {
    color: '#0066CC',
    fontSize: 12,
    flex: 1,
    textAlign: 'center',
  },
  exerciseCard: {
    backgroundColor: '#1A1A1A',
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#333',
  },
  exerciseHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  exerciseHeaderLeft: {
    flex: 1,
  },
  exerciseHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  exerciseName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  exerciseMeta: {
    fontSize: 12,
    color: '#888',
  },
  setControls: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  setControlButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#000000',
    borderWidth: 1,
    borderColor: '#0066CC',
    alignItems: 'center',
    justifyContent: 'center',
  },
  setControlText: {
    color: '#0066CC',
    fontSize: 16,
    fontWeight: '600',
  },
  setCount: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '500',
    minWidth: 50,
    textAlign: 'center',
  },
  setsTable: {
    marginTop: 8,
  },
  setTableHeader: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  setTableHeaderCell: {
    flex: 1,
    color: '#888',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  setRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 4,
  },
  setNumberCell: {
    flex: 1,
    color: '#888',
    fontSize: 14,
    textAlign: 'center',
  },
  setInput: {
    flex: 1,
    backgroundColor: '#000000',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 6,
    marginHorizontal: 4,
    color: '#FFFFFF',
    fontSize: 14,
    borderWidth: 1,
    borderColor: '#333',
    textAlign: 'center',
  },
  removeIcon: {
    color: '#0066CC',
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: '#0066CC',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '600',
  },
});