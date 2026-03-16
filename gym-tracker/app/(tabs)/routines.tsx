// app/routines.tsx
import React, { useState, useEffect } from 'react';
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
  SafeAreaView,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Routine, RoutineExercise } from './types';
import exercisesData from '../../assets/data/exercises.json';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRouter } from 'expo-router';

const STORAGE_KEY = '@routines';

// Routine Card Component
const RoutineCard = ({ routine, onDelete, onUse }) => {
  const [expanded, setExpanded] = useState(false);

  return (
    <View style={styles.routineCard}>
      <TouchableOpacity
        style={styles.routineHeader}
        onPress={() => setExpanded(!expanded)}
        activeOpacity={0.7}>
        <View style={styles.routineHeaderLeft}>
          <Text style={styles.chevron}>{expanded ? '▼' : '▶'}</Text>
          <View>
            <Text style={styles.routineName}>{routine.name}</Text>
            <Text style={styles.routineDay}>
              {routine.day === 'Custom' ? routine.customDayName : routine.day}
            </Text>
          </View>
        </View>
        <View style={styles.routineHeaderRight}>
          <Text style={styles.exerciseCount}>{routine.exercises.length} exercises</Text>
          <TouchableOpacity onPress={() => onUse(routine)} style={styles.useButton}>
            <Text style={styles.useButtonText}>+</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>

      {expanded && (
        <View style={styles.routineExercises}>
          {routine.exercises.map((exercise, index) => (
            <View key={index} style={styles.routineExerciseItem}>
              <View style={styles.routineExerciseInfo}>
                <Text style={styles.routineExerciseName}>{exercise.name}</Text>
                <Text style={styles.routineExerciseMeta}>
                  {exercise.muscleGroup} • {exercise.defaultSetCount} sets
                </Text>
              </View>
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

// Create Routine Modal
const CreateRoutineModal = ({ visible, onClose, onSave }) => {
  const [routineName, setRoutineName] = useState('');
  const [selectedDay, setSelectedDay] = useState<'Push' | 'Pull' | 'Legs' | 'Custom'>('Push');
  const [customDayName, setCustomDayName] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedExercises, setSelectedExercises] = useState<RoutineExercise[]>([]);

  const days: ('Push' | 'Pull' | 'Legs' | 'Custom')[] = ['Push', 'Pull', 'Legs', 'Custom'];

  const filteredExercises = exercisesData.filter(exercise =>
    exercise.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleAddExercise = (exercise) => {
    const newExercise: RoutineExercise = {
      exerciseId: exercise.id,
      name: exercise.name,
      muscleGroup: exercise.primaryMuscles[0] || 'Other',
      defaultSetCount: 3,
    };
    setSelectedExercises([...selectedExercises, newExercise]);
    setSearchQuery('');
  };

  const handleRemoveExercise = (index: number) => {
    setSelectedExercises(selectedExercises.filter((_, i) => i !== index));
  };

  const handleUpdateSetCount = (index: number, count: number) => {
    const updated = [...selectedExercises];
    updated[index].defaultSetCount = Math.min(Math.max(count, 1), 10);
    setSelectedExercises(updated);
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

    const newRoutine: Routine = {
      id: Date.now().toString(),
      name: routineName.trim(),
      day: selectedDay,
      customDayName: selectedDay === 'Custom' ? customDayName.trim() : undefined,
      exercises: selectedExercises,
      createdAt: new Date(),
    };

    onSave(newRoutine);
    // Reset form
    setRoutineName('');
    setSelectedDay('Push');
    setCustomDayName('');
    setSelectedExercises([]);
    setSearchQuery('');
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
            <Text style={styles.modalTitle}>Create Routine</Text>
            <TouchableOpacity onPress={onClose}>
              <Text style={styles.closeButton}>✕</Text>
            </TouchableOpacity>
          </View>

          <ScrollView style={styles.modalScroll}>
            {/* Routine Name */}
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

            {/* Day Selection */}
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

            {/* Custom Day Name */}
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

            {/* Exercise Search */}
            <View style={styles.inputGroup}>
              <Text style={styles.inputLabel}>Add Exercises</Text>
              <TextInput
                style={styles.input}
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholder="Search exercises..."
                placeholderTextColor="#666"
              />
            </View>

            {/* Search Results */}
            {searchQuery.length > 0 && (
              <View style={styles.searchResults}>
                <FlatList
                  data={filteredExercises.slice(0, 5)}
                  keyExtractor={(item) => item.id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={styles.searchResultItem}
                      onPress={() => handleAddExercise(item)}>
                      <View>
                        <Text style={styles.searchResultName}>{item.name}</Text>
                        <Text style={styles.searchResultMuscle}>
                          {item.primaryMuscles?.join(', ')}
                        </Text>
                      </View>
                      <Text style={styles.addIcon}>+</Text>
                    </TouchableOpacity>
                  )}
                />
              </View>
            )}

            {/* Selected Exercises */}
            {selectedExercises.length > 0 && (
              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Selected Exercises</Text>
                {selectedExercises.map((exercise, index) => (
                  <View key={index} style={styles.selectedExerciseItem}>
                    <View style={styles.selectedExerciseInfo}>
                      <Text style={styles.selectedExerciseName}>{exercise.name}</Text>
                      <View style={styles.setCountRow}>
                        <Text style={styles.setCountLabel}>Sets:</Text>
                        <TextInput
                          style={styles.setCountInput}
                          value={exercise.defaultSetCount.toString()}
                          onChangeText={(text) => {
                            const count = parseInt(text) || 0;
                            handleUpdateSetCount(index, count);
                          }}
                          keyboardType="numeric"
                          maxLength={2}
                        />
                      </View>
                    </View>
                    <TouchableOpacity onPress={() => handleRemoveExercise(index)}>
                      <Text style={styles.removeIcon}>−</Text>
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </ScrollView>

          <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
            <Text style={styles.saveButtonText}>Create Routine</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

export default function RoutinesScreen() {
  const router = useRouter();
  const [routines, setRoutines] = useState<Routine[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);

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
    // Navigate back to home screen with the routine data
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
        colors={['#FF6B00', '#FF8C40']}
        style={styles.header}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}>
        <View style={styles.headerContent}>
          <Text style={styles.headerTitle}>Routines</Text>
          <TouchableOpacity
            style={styles.createButton}
            onPress={() => setShowCreateModal(true)}>
            <Text style={styles.createButtonText}>+ Create</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>

      <ScrollView style={styles.content}>
        {/* Push Day */}
        {routinesByDay.Push.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Push Day</Text>
            {routinesByDay.Push.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
              />
            ))}
          </View>
        )}

        {/* Pull Day */}
        {routinesByDay.Pull.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Pull Day</Text>
            {routinesByDay.Pull.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
              />
            ))}
          </View>
        )}

        {/* Legs Day */}
        {routinesByDay.Legs.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Legs Day</Text>
            {routinesByDay.Legs.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
              />
            ))}
          </View>
        )}

        {/* Custom Days */}
        {routinesByDay.Custom.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Custom Days</Text>
            {routinesByDay.Custom.map((routine) => (
              <RoutineCard
                key={routine.id}
                routine={routine}
                onDelete={handleDeleteRoutine}
                onUse={handleUseRoutine}
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

      <CreateRoutineModal
        visible={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleCreateRoutine}
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
    color: '#FF6B00',
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
  useButton: {
    backgroundColor: '#FF6B00',
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
    backgroundColor: '#FF6B00',
    borderColor: '#FF6B00',
  },
  dayButtonText: {
    color: '#888',
    fontSize: 14,
    fontWeight: '500',
  },
  dayButtonTextSelected: {
    color: '#FFFFFF',
  },
  searchResults: {
    maxHeight: 200,
    marginBottom: 20,
  },
  searchResultItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  searchResultName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 2,
  },
  searchResultMuscle: {
    fontSize: 12,
    color: '#888',
  },
  addIcon: {
    color: '#FF6B00',
    fontSize: 20,
  },
  selectedExerciseItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  selectedExerciseInfo: {
    flex: 1,
  },
  selectedExerciseName: {
    fontSize: 14,
    color: '#FFFFFF',
    marginBottom: 4,
  },
  setCountRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  setCountLabel: {
    fontSize: 12,
    color: '#888',
    marginRight: 8,
  },
  setCountInput: {
    backgroundColor: '#000000',
    borderRadius: 4,
    padding: 4,
    width: 40,
    color: '#FF6B00',
    fontSize: 12,
    textAlign: 'center',
    borderWidth: 1,
    borderColor: '#333',
  },
  removeIcon: {
    color: '#FF6B00',
    fontSize: 20,
  },
  saveButton: {
    backgroundColor: '#FF6B00',
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