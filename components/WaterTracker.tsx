
import React, { useState } from 'react';
import {
  Alert,
  Keyboard,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useHealth } from '../context/HealthContext';

export default function WaterTracker() {
  const {
    waterGoal,
    todayWater,
    addWater,
    setWaterGoal,
    resetTodayWater,
    isHealthLoaded,
  } = useHealth();

  const [goalInput, setGoalInput] = useState(String(waterGoal));

  const progress = waterGoal > 0
    ? Math.min(todayWater / waterGoal, 1)
    : 0;

  function saveGoal() {
    const goal = Number(goalInput);

    if (!Number.isFinite(goal) || goal < 250 || goal > 10000) {
      Alert.alert(
        'Invalid goal',
        'Please enter a goal between 250 and 10000 ml.'
      );
      return;
    }

    setWaterGoal(goal);
    setGoalInput(String(Math.round(goal)));
    Keyboard.dismiss();
  }

  function handleReset() {
    Alert.alert(
      'Reset today’s water?',
      'This will clear only today’s water intake.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Reset',
          style: 'destructive',
          onPress: resetTodayWater,
        },
      ]
    );
  }

  if (!isHealthLoaded) {
    return (
      <View style={styles.card}>
        <Text style={styles.loading}>Loading water data...</Text>
      </View>
    );
  }

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Text style={styles.eyebrow}>DAILY WELLNESS</Text>
          <Text style={styles.title}>Drink Water</Text>
        </View>

        <View style={styles.iconCircle}>
          <Text style={styles.waterIcon}>💧</Text>
        </View>
      </View>

      <View style={styles.amountRow}>
        <Text style={styles.amount}>
          {(todayWater / 1000).toFixed(2)}
        </Text>
        <Text style={styles.unit}>L consumed</Text>
      </View>

      <Text style={styles.goalText}>
        Goal: {(waterGoal / 1000).toFixed(2)} L
      </Text>

      <View style={styles.progressBackground}>
        <View
          style={[
            styles.progressFill,
            { width: `${progress * 100}%` },
          ]}
        />
      </View>

      <Text style={styles.progressText}>
        {Math.round(progress * 100)}% completed
        {todayWater >= waterGoal ? ' 🎉 Goal reached!' : ''}
      </Text>

      <Text style={styles.sectionLabel}>ADD WATER</Text>

      <View style={styles.buttonRow}>
        <Pressable
          style={styles.waterButton}
          onPress={() => addWater(250)}
        >
          <Text style={styles.buttonText}>+250 ml</Text>
        </Pressable>

        <Pressable
          style={styles.waterButton}
          onPress={() => addWater(500)}
        >
          <Text style={styles.buttonText}>+500 ml</Text>
        </Pressable>
      </View>

      <Text style={styles.sectionLabel}>DAILY GOAL (ML)</Text>

      <View style={styles.goalRow}>
        <TextInput
          style={styles.goalInput}
          value={goalInput}
          onChangeText={setGoalInput}
          keyboardType="number-pad"
          placeholder="2000"
          maxLength={5}
        />

        <Pressable style={styles.saveButton} onPress={saveGoal}>
          <Text style={styles.saveButtonText}>Save Goal</Text>
        </Pressable>
      </View>

      {todayWater > 0 && (
        <Pressable
          style={styles.resetButton}
          onPress={handleReset}
        >
          <Text style={styles.resetText}>Reset today’s intake</Text>
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    padding: 20,
    marginVertical: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  eyebrow: {
    color: '#0284C7',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1.2,
  },
  title: {
    color: '#0F172A',
    fontSize: 23,
    fontWeight: '800',
    marginTop: 5,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 16,
    backgroundColor: '#E0F2FE',
    alignItems: 'center',
    justifyContent: 'center',
  },
  waterIcon: {
    fontSize: 25,
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 22,
  },
  amount: {
    color: '#0369A1',
    fontSize: 36,
    fontWeight: '800',
  },
  unit: {
    color: '#64748B',
    fontSize: 14,
    marginLeft: 8,
  },
  goalText: {
    color: '#64748B',
    fontSize: 13,
    marginTop: 4,
  },
  progressBackground: {
    height: 10,
    backgroundColor: '#E0F2FE',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 18,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#0284C7',
    borderRadius: 10,
  },
  progressText: {
    color: '#0369A1',
    fontSize: 13,
    fontWeight: '700',
    marginTop: 9,
  },
  sectionLabel: {
    color: '#64748B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 1,
    marginTop: 22,
    marginBottom: 10,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 10,
  },
  waterButton: {
    flex: 1,
    backgroundColor: '#E0F2FE',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
  },
  buttonText: {
    color: '#0369A1',
    fontWeight: '800',
    fontSize: 14,
  },
  goalRow: {
    flexDirection: 'row',
    gap: 10,
  },
  goalInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#CBD5E1',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 11,
    fontSize: 16,
    color: '#0F172A',
  },
  saveButton: {
    backgroundColor: '#0F172A',
    borderRadius: 12,
    paddingHorizontal: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  saveButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
  },
  resetButton: {
    alignSelf: 'center',
    paddingTop: 18,
    paddingBottom: 2,
  },
  resetText: {
    color: '#DC2626',
    fontSize: 13,
    fontWeight: '600',
  },
  loading: {
    color: '#64748B',
    padding: 10,
  },
});
