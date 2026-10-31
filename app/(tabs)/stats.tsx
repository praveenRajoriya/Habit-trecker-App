
import React, { useCallback, useState } from 'react';
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ActivityIndicator,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from 'expo-router';

import { useHabits, getDateKey } from '../../context/HabitContext';
import { useHealth } from '../../context/HealthContext';
import {
  STEPS_STORAGE_KEY,
  StepsHistory,
  getStepsDateKey,
} from '../../components/StepsTracker';

const GREEN = '#16A34A';
const STEPS_GOAL = 8000;

export default function StatsScreen() {
  const { habits, isLoaded } = useHabits();
  const { todayWater, waterGoal, isHealthLoaded } = useHealth();

  const [todaySteps, setTodaySteps] = useState(0);
  const [stepsLoaded, setStepsLoaded] = useState(false);

  const today = getDateKey();

  const loadSteps = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem(STEPS_STORAGE_KEY);

      if (saved) {
        const history: StepsHistory = JSON.parse(saved);
        setTodaySteps(history[getStepsDateKey()] ?? 0);
      } else {
        setTodaySteps(0);
      }
    } catch (error) {
      console.error('Unable to load steps:', error);
    } finally {
      setStepsLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSteps();
    }, [loadSteps])
  );

  const completedToday = habits.filter((h) =>
    h.completedDates.includes(today)
  ).length;

  const todayPercent = habits.length
    ? Math.round((completedToday / habits.length) * 100)
    : 0;

  const totalCompletions = habits.reduce(
    (sum, habit) => sum + habit.completedDates.length,
    0
  );

  const week = Array.from({ length: 7 }, (_, i) => {
    const date = new Date();
    date.setDate(date.getDate() - (6 - i));
    const key = getDateKey(date);

    const count = habits.filter((h) =>
      h.completedDates.includes(key)
    ).length;

    return {
      key,
      label: date.toLocaleDateString('en-US', {
        weekday: 'short',
      }),
      count,
      percent: habits.length ? count / habits.length : 0,
    };
  });

  const bestDay = week.reduce(
    (best, day) => (day.count > best.count ? day : best),
    week[0]
  );

  const activeDays = week.filter((day) => day.count > 0).length;

  if (!isLoaded || !isHealthLoaded || !stepsLoaded) {
    return (
      <SafeAreaView style={styles.loading}>
        <ActivityIndicator size="large" color={GREEN} />
        <Text style={styles.loadingText}>
          Loading your statistics...
        </Text>
      </SafeAreaView>
    );
  }

  const safeWaterGoal = Math.max(waterGoal, 1);

  const waterPercent = Math.min(
    Math.round((todayWater / safeWaterGoal) * 100),
    100
  );

  const stepsPercent = Math.min(
    Math.round((todaySteps / STEPS_GOAL) * 100),
    100
  );

  const healthPercent = Math.round(
    (waterPercent + stepsPercent) / 2
  );

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <Text style={styles.eyebrow}>YOUR JOURNEY</Text>
        <Text style={styles.title}>Statistics</Text>
        <Text style={styles.subtitle}>
          Your habits and health, all in one place.
        </Text>

        {/* HEALTH SUMMARY */}
        <View style={styles.healthHero}>
          <Text style={styles.healthEyebrow}>
            TODAY'S HEALTH PROGRESS
          </Text>

          <Text style={styles.healthNumber}>
            {healthPercent}%
          </Text>

          <Text style={styles.healthDescription}>
            Combined progress of water and steps goals
          </Text>

          <View style={styles.healthTrack}>
            <View
              style={[
                styles.healthFill,
                { width: `${healthPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* WATER CARD */}
        <View style={styles.healthCard}>
          <View style={styles.healthCardHeader}>
            <View style={styles.waterIcon}>
              <Text style={styles.iconEmoji}>💧</Text>
            </View>

            <View style={styles.healthCardHeading}>
              <Text style={styles.healthCardTitle}>
                Water Intake
              </Text>
              <Text style={styles.healthCardSubtitle}>
                Daily hydration goal
              </Text>
            </View>

            <Text style={styles.healthPercent}>
              {waterPercent}%
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amount}>
              {(todayWater / 1000).toFixed(2)} L
            </Text>
            <Text style={styles.amountGoal}>
              / {(waterGoal / 1000).toFixed(2)} L
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.waterFill,
                { width: `${waterPercent}%` },
              ]}
            />
          </View>

          <Text style={styles.healthHint}>
            {todayWater >= waterGoal
              ? '🎉 Water goal completed!'
              : `${Math.max(0, waterGoal - todayWater)} ml left to reach your goal`}
          </Text>
        </View>

        {/* STEPS CARD */}
        <View style={styles.healthCard}>
          <View style={styles.healthCardHeader}>
            <View style={styles.stepsIcon}>
              <Text style={styles.iconEmoji}>👟</Text>
            </View>

            <View style={styles.healthCardHeading}>
              <Text style={styles.healthCardTitle}>
                Steps Walked
              </Text>
              <Text style={styles.healthCardSubtitle}>
                Daily walking goal
              </Text>
            </View>

            <Text style={styles.healthPercent}>
              {stepsPercent}%
            </Text>
          </View>

          <View style={styles.amountRow}>
            <Text style={styles.amount}>
              {todaySteps.toLocaleString('en-IN')}
            </Text>
            <Text style={styles.amountGoal}>
              / {STEPS_GOAL.toLocaleString('en-IN')}
            </Text>
          </View>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.stepsFill,
                { width: `${stepsPercent}%` },
              ]}
            />
          </View>

          <Text style={styles.healthHint}>
            {todaySteps >= STEPS_GOAL
              ? '🎉 Steps goal completed!'
              : `${(STEPS_GOAL - todaySteps).toLocaleString('en-IN')} steps left to reach your goal`}
          </Text>
        </View>

        {/* EXISTING HABIT STATISTICS */}
        <Text style={styles.sectionTitle}>Habit Statistics</Text>

        <View style={styles.hero}>
          <Text style={styles.heroLabel}>
            TODAY'S COMPLETION
          </Text>

          <Text style={styles.heroNumber}>
            {todayPercent}%
          </Text>

          <Text style={styles.heroText}>
            {completedToday} of {habits.length} habits completed
          </Text>

          <View style={styles.track}>
            <View
              style={[
                styles.fill,
                { width: `${todayPercent}%` },
              ]}
            />
          </View>
        </View>

        <View style={styles.grid}>
          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🌱</Text>
            <Text style={styles.statNumber}>{habits.length}</Text>
            <Text style={styles.statLabel}>Total habits</Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>✓</Text>
            <Text style={styles.statNumber}>
              {totalCompletions}
            </Text>
            <Text style={styles.statLabel}>
              Total completions
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>📅</Text>
            <Text style={styles.statNumber}>
              {activeDays}/7
            </Text>
            <Text style={styles.statLabel}>
              Active days this week
            </Text>
          </View>

          <View style={styles.statCard}>
            <Text style={styles.statEmoji}>🏆</Text>
            <Text style={styles.statNumber}>
              {bestDay?.count ?? 0}
            </Text>
            <Text style={styles.statLabel}>
              Best day completions
            </Text>
          </View>
        </View>

        {/* WEEKLY CHART */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Weekly activity</Text>
          <Text style={styles.cardSubtitle}>
            Completed habits each day
          </Text>

          <View style={styles.chart}>
            {week.map((day) => (
              <View key={day.key} style={styles.barColumn}>
                <Text style={styles.barNumber}>
                  {day.count}
                </Text>

                <View style={styles.barArea}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(
                          day.percent * 100,
                          5
                        )}%`,
                        backgroundColor:
                          day.key === today
                            ? GREEN
                            : '#86D6A1',
                      },
                    ]}
                  />
                </View>

                <Text style={styles.barLabel}>
                  {day.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.note}>
          <Text style={styles.noteEmoji}>✨</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.noteTitle}>
              Keep building momentum
            </Text>
            <Text style={styles.noteText}>
              Every completed habit is a step towards the person
              you want to become.
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: '#F5F7FB',
  },
  content: {
    padding: 20,
    paddingBottom: 35,
  },
  loading: {
    flex: 1,
    backgroundColor: '#F5F7FB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    marginTop: 12,
    color: '#778196',
  },
  eyebrow: {
    color: GREEN,
    fontWeight: '800',
    letterSpacing: 1.7,
    fontSize: 10,
    marginTop: 12,
  },
  title: {
    fontSize: 29,
    fontWeight: '800',
    color: '#172033',
    marginTop: 7,
  },
  subtitle: {
    color: '#778196',
    marginTop: 5,
    marginBottom: 22,
  },
  healthHero: {
    backgroundColor: '#252044',
    borderRadius: 23,
    padding: 22,
    marginBottom: 16,
  },
  healthEyebrow: {
    color: '#D4CFFA',
    fontSize: 10,
    letterSpacing: 1.4,
    fontWeight: '800',
  },
  healthNumber: {
    color: '#FFFFFF',
    fontSize: 43,
    fontWeight: '900',
    marginTop: 8,
  },
  healthDescription: {
    color: '#D4CFFA',
    fontSize: 12,
    marginTop: 4,
  },
  healthTrack: {
    height: 8,
    backgroundColor: '#494265',
    borderRadius: 10,
    overflow: 'hidden',
    marginTop: 20,
  },
  healthFill: {
    height: '100%',
    backgroundColor: '#B6A5FF',
    borderRadius: 10,
  },
  healthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 21,
    padding: 18,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E9EEF3',
  },
  healthCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  waterIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#E1F3FF',
  },
  stepsIcon: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#EDE8FF',
  },
  iconEmoji: {
    fontSize: 23,
  },
  healthCardHeading: {
    flex: 1,
    marginLeft: 12,
  },
  healthCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#172033',
  },
  healthCardSubtitle: {
    fontSize: 11,
    color: '#8791A3',
    marginTop: 4,
  },
  healthPercent: {
    color: '#7357F6',
    fontSize: 14,
    fontWeight: '800',
  },
  amountRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: 20,
    marginBottom: 12,
  },
  amount: {
    color: '#172033',
    fontSize: 27,
    fontWeight: '900',
  },
  amountGoal: {
    color: '#8791A3',
    fontSize: 12,
    marginLeft: 7,
  },
  progressTrack: {
    height: 8,
    backgroundColor: '#ECEEF4',
    borderRadius: 10,
    overflow: 'hidden',
  },
  waterFill: {
    height: '100%',
    backgroundColor: '#35A9F4',
    borderRadius: 10,
  },
  stepsFill: {
    height: '100%',
    backgroundColor: '#8065F6',
    borderRadius: 10,
  },
  healthHint: {
    fontSize: 11,
    color: '#778196',
    marginTop: 11,
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: '800',
    color: '#172033',
    marginTop: 16,
    marginBottom: 15,
  },
  hero: {
    backgroundColor: '#172B25',
    borderRadius: 23,
    padding: 22,
  },
  heroLabel: {
    color: '#B7D9C6',
    fontSize: 10,
    letterSpacing: 1.3,
    fontWeight: '800',
  },
  heroNumber: {
    color: '#FFFFFF',
    fontSize: 44,
    fontWeight: '900',
    marginTop: 8,
  },
  heroText: {
    color: '#D4E5DB',
    fontSize: 12,
    marginTop: 4,
  },
  track: {
    height: 7,
    backgroundColor: '#3D5148',
    borderRadius: 10,
    marginTop: 20,
    overflow: 'hidden',
  },
  fill: {
    height: '100%',
    backgroundColor: '#86EFAC',
    borderRadius: 10,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginTop: 17,
  },
  statCard: {
    width: '48%',
    flexGrow: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 19,
    padding: 17,
    borderWidth: 1,
    borderColor: '#E9EEF3',
  },
  statEmoji: {
    fontSize: 21,
    color: GREEN,
  },
  statNumber: {
    fontSize: 28,
    fontWeight: '900',
    color: '#172033',
    marginTop: 11,
  },
  statLabel: {
    fontSize: 11,
    color: '#7D899A',
    marginTop: 5,
  },
  chartCard: {
    backgroundColor: '#FFFFFF',
    padding: 19,
    borderRadius: 22,
    marginTop: 18,
    borderWidth: 1,
    borderColor: '#E9EEF3',
  },
  cardTitle: {
    fontSize: 17,
    color: '#172033',
    fontWeight: '800',
  },
  cardSubtitle: {
    color: '#8791A3',
    fontSize: 12,
    marginTop: 5,
  },
  chart: {
    flexDirection: 'row',
    height: 165,
    justifyContent: 'space-between',
    marginTop: 20,
  },
  barColumn: {
    flex: 1,
    alignItems: 'center',
  },
  barNumber: {
    fontSize: 10,
    color: '#7D899A',
    fontWeight: '700',
  },
  barArea: {
    height: 112,
    width: 19,
    justifyContent: 'flex-end',
    marginTop: 5,
  },
  bar: {
    width: 19,
    minHeight: 5,
    borderRadius: 7,
  },
  barLabel: {
    color: '#8791A3',
    fontSize: 10,
    marginTop: 8,
  },
  note: {
    flexDirection: 'row',
    gap: 12,
    padding: 17,
    backgroundColor: '#DCFCE7',
    borderRadius: 18,
    marginTop: 18,
  },
  noteEmoji: {
    fontSize: 23,
  },
  noteTitle: {
    color: '#166534',
    fontWeight: '800',
    fontSize: 13,
  },
  noteText: {
    color: '#39764F',
    fontSize: 12,
    lineHeight: 18,
    marginTop: 5,
  },
});
