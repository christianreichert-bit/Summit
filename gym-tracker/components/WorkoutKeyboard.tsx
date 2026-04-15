import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Animated, Platform } from 'react-native';

type WorkoutKeyboardProps = {
  visible: boolean;
  value: string;
  field: 'reps' | 'weight';
  fieldKey: string;
  onValueChange: (val: string) => void;
  onStepUp: () => void;
  onStepDown: () => void;
  onMoveLeft: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
  onMoveRight: () => void;
  onDone: () => void;
};

const SLIDE_HEIGHT = 280;

export default function WorkoutKeyboard({
  visible,
  value,
  field,
  fieldKey,
  onValueChange,
  onStepUp,
  onStepDown,
  onMoveLeft,
  onMoveUp,
  onMoveDown,
  onMoveRight,
  onDone,
}: WorkoutKeyboardProps) {
  const slideAnim = useRef(new Animated.Value(SLIDE_HEIGHT)).current;
  const [freshStart, setFreshStart] = useState(true);

  useEffect(() => {
    Animated.timing(slideAnim, {
      toValue: visible ? 0 : SLIDE_HEIGHT,
      duration: 210,
      useNativeDriver: true,
    }).start();
  }, [visible]);

  // Reset when active field/set changes
  useEffect(() => {
    setFreshStart(true);
  }, [fieldKey]);

  const step = field === 'reps' ? 1 : 5;
  const max = field === 'reps' ? 99 : 999;
  const displayLabel = field === 'reps' ? 'reps' : 'lbs';

  const handleDigit = (digit: string) => {
    let newValue: string;
    if (freshStart) {
      newValue = digit;
      setFreshStart(false);
    } else {
      newValue = value === '0' || value === '' ? digit : value + digit;
    }
    const parsed = parseInt(newValue, 10);
    if (parsed > max) return;
    onValueChange(newValue);
  };

  const handleBackspace = () => {
    setFreshStart(false);
    const trimmed = value.slice(0, -1);
    onValueChange(trimmed === '' ? '0' : trimmed);
  };

  const DIGIT_ROWS = [
    ['7', '8', '9'],
    ['4', '5', '6'],
    ['1', '2', '3'],
  ];

  return (
    <Animated.View
      style={[styles.container, { transform: [{ translateY: slideAnim }] }]}
      pointerEvents={visible ? 'auto' : 'none'}>

      {/* Stepper row */}
      <View style={styles.stepperRow}>
        <TouchableOpacity style={styles.stepButton} onPress={onStepDown} activeOpacity={0.7}>
          <Text style={styles.stepButtonText}>−{step}</Text>
        </TouchableOpacity>

        <View style={styles.valueDisplay}>
          <Text style={styles.valueText}>{value || '0'}</Text>
          <Text style={styles.valueLabel}> {displayLabel}</Text>
        </View>

        <TouchableOpacity style={styles.stepButton} onPress={onStepUp} activeOpacity={0.7}>
          <Text style={styles.stepButtonText}>+{step}</Text>
        </TouchableOpacity>
      </View>

      {/* Digit rows */}
      {DIGIT_ROWS.map((row) => (
        <View key={row.join('')} style={styles.digitRow}>
          {row.map((digit) => (
            <TouchableOpacity
              key={digit}
              style={styles.digitButton}
              onPress={() => handleDigit(digit)}
              activeOpacity={0.6}>
              <Text style={styles.digitText}>{digit}</Text>
            </TouchableOpacity>
          ))}
        </View>
      ))}

      {/* Bottom row: spacer | 0 | backspace */}
      <View style={styles.digitRow}>
        <View style={[styles.digitButton, styles.digitButtonEmpty]} />
        <TouchableOpacity
          style={styles.digitButton}
          onPress={() => handleDigit('0')}
          activeOpacity={0.6}>
          <Text style={styles.digitText}>0</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.digitButton}
          onPress={handleBackspace}
          activeOpacity={0.6}>
          <Text style={styles.digitText}>⌫</Text>
        </TouchableOpacity>
      </View>

      {/*Nav row */}
      <View style={styles.navRow}>
        <TouchableOpacity style={styles.navButton} onPress={onMoveLeft} activeOpacity={0.7}>
          <Text style={styles.navText}>←</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onMoveUp} activeOpacity={0.7}>
          <Text style={styles.navText}>↑</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onMoveDown} activeOpacity={0.7}>
          <Text style={styles.navText}>↓</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.navButton} onPress={onMoveRight} activeOpacity={0.7}>
          <Text style={styles.navText}>→</Text>
        </TouchableOpacity>
      </View>

      {/*Done button*/}
      <TouchableOpacity style={styles.doneButton} onPress={onDone} activeOpacity={0.8}>
        <Text style={styles.doneButtonText}>Done</Text>
      </TouchableOpacity>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: Platform.OS === 'ios' ? 5 : 0,
    backgroundColor: '#1A1A1A',
    borderTopWidth: 1,
    borderTopColor: '#444',
    paddingHorizontal: 8,
    paddingTop: 7,
    paddingBottom: 0,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  stepButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#444',
    paddingVertical: 7,
    alignItems: 'center',
  },
  stepButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  valueDisplay: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'center',
    backgroundColor: '#000000',
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: '#0066CC',
    paddingVertical: 5,
    paddingHorizontal: 8,
  },
  valueText: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '700',
  },
  valueLabel: {
    color: '#888',
    fontSize: 12,
    fontWeight: '500',
  },
  digitRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  digitButton: {
    flex: 1,
    backgroundColor: '#2A2A2A',
    borderRadius: 8,
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  digitButtonEmpty: {
    backgroundColor: 'transparent',
    borderWidth: 0,
  },
  digitText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '600',
  },
  navRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 6,
  },
  navButton: {
    flex: 1,
    backgroundColor: '#252525',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#3A3A3A',
    paddingVertical: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  navText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
  doneButton: {
    backgroundColor: '#0066CC',
    borderRadius: 8,
    paddingVertical: 9,
    alignItems: 'center',
    marginTop: 0,
    marginBottom: 5,
  },
  doneButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
});
