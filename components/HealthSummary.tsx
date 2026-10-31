import React, { useCallback, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";

import { useHealth } from "../context/HealthContext";
import {
  STEPS_STORAGE_KEY,
  StepsHistory,
  getStepsDateKey,
} from "./StepsTracker";

const DAILY_STEPS_GOAL = 8000;

export default function HealthSummary() {
  const { todayWater, waterGoal, isHealthLoaded } = useHealth();

  const [todaySteps, setTodaySteps] = useState(0);
  const [stepsLoaded, setStepsLoaded] = useState(false);

  const loadSteps = useCallback(async () => {
    try {
      const savedData = await AsyncStorage.getItem(STEPS_STORAGE_KEY);

      if (savedData) {
        const history: StepsHistory = JSON.parse(savedData);
        const todayKey = getStepsDateKey();

        setTodaySteps(history[todayKey] ?? 0);
      } else {
        setTodaySteps(0);
      }
    } catch (error) {
      console.error("Error loading steps summary:", error);
    } finally {
      setStepsLoaded(true);
    }
  }, []);

  useFocusEffect(
    useCallback(() => {
      loadSteps();
    }, [loadSteps])
  );

  if (!isHealthLoaded || !stepsLoaded) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#7357F6" />
        <Text style={styles.loadingText}>Loading health summary...</Text>
      </View>
    );
  }

  const safeWaterGoal = Math.max(waterGoal, 1);

  const waterProgress = Math.min(
    (todayWater / safeWaterGoal) * 100,
    100
  );

  const stepsProgress = Math.min(
    (todaySteps / DAILY_STEPS_GOAL) * 100,
    100
  );

  const overallProgress = Math.round(
    (waterProgress + stepsProgress) / 2
  );

  const formatLitres = (ml: number) => (ml / 1000).toFixed(2);

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.eyebrow}>YOUR DAILY WELLNESS</Text>
      <Text style={styles.title}>Health Summary</Text>
      <Text style={styles.subtitle}>
        Small healthy habits make a big difference.
      </Text>

      {/* Overall progress */}
      <View style={styles.overallCard}>
        <Text style={styles.overallLabel}>Today's overall progress</Text>

        <View style={styles.progressRow}>
          <Text style={styles.overallPercent}>
            {overallProgress}%
          </Text>
          <Text style={styles.overallCaption}>of your daily goals</Text>
        </View>

        <View style={styles.overallTrack}>
          <View
            style={[
              styles.overallFill,
              { width: `${overallProgress}%` },
            ]}
          />
        </View>

        <Text style={styles.overallFooter}>
          {overallProgress >= 100
            ? "Amazing! Both daily goals are complete."
            : "Keep going. You're building healthy habits!"}
        </Text>
      </View>

      {/* Water card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, styles.waterIconBox]}>
            <Text style={styles.emoji}>💧</Text>
          </View>

          <View style={styles.cardHeading}>
            <Text style={styles.cardTitle}>Water Intake</Text>
            <Text style={styles.cardSubtitle}>Stay hydrated</Text>
          </View>

          <Text style={styles.percent}>
            {Math.round(waterProgress)}%
          </Text>
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.mainValue}>
            {formatLitres(todayWater)} L
          </Text>
          <Text style={styles.goalValue}>
            of {formatLitres(waterGoal)} L
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.waterFill,
              { width: `${waterProgress}%` },
            ]}
          />
        </View>

        <Text style={styles.helperText}>
          {todayWater >= waterGoal
            ? "Water goal completed!"
            : `${Math.max(0, waterGoal - todayWater)} ml left to reach your goal`}
        </Text>
      </View>

      {/* Steps card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={[styles.iconBox, styles.stepsIconBox]}>
            <Text style={styles.emoji}>👟</Text>
          </View>

          <View style={styles.cardHeading}>
            <Text style={styles.cardTitle}>Steps Walked</Text>
            <Text style={styles.cardSubtitle}>Keep moving</Text>
          </View>

          <Text style={styles.percent}>
            {Math.round(stepsProgress)}%
          </Text>
        </View>

        <View style={styles.valueRow}>
          <Text style={styles.mainValue}>
            {todaySteps.toLocaleString("en-IN")}
          </Text>
          <Text style={styles.goalValue}>
            of {DAILY_STEPS_GOAL.toLocaleString("en-IN")}
          </Text>
        </View>

        <View style={styles.track}>
          <View
            style={[
              styles.stepsFill,
              { width: `${stepsProgress}%` },
            ]}
          />
        </View>

        <Text style={styles.helperText}>
          {todaySteps >= DAILY_STEPS_GOAL
            ? "Daily steps goal completed!"
            : `${(DAILY_STEPS_GOAL - todaySteps).toLocaleString(
                "en-IN"
              )} steps left to reach your goal`}
        </Text>
      </View>

      <View style={styles.tipCard}>
        <Text style={styles.tipTitle}>✨ Daily reminder</Text>
        <Text style={styles.tipText}>
          Drink water regularly and take walking breaks throughout
          your day. Consistency matters more than perfection.
        </Text>
      </View>

      <Text style={styles.note}>
        Steps are based on the data saved by your Steps Tracker.
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F6F7FB",
  },
  content: {
    padding: 20,
    paddingBottom: 36,
  },
  loading: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F6F7FB",
  },
  loadingText: {
    marginTop: 12,
    color: "#6B7280",
  },
  eyebrow: {
    fontSize: 11,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#7357F6",
    marginTop: 8,
  },
  title: {
    fontSize: 30,
    fontWeight: "800",
    color: "#171923",
    marginTop: 8,
  },
  subtitle: {
    fontSize: 14,
    color: "#777D8B",
    marginTop: 6,
    marginBottom: 22,
  },
  overallCard: {
    backgroundColor: "#252044",
    borderRadius: 24,
    padding: 22,
    marginBottom: 18,
  },
  overallLabel: {
    color: "#D7D2F4",
    fontSize: 14,
    fontWeight: "600",
  },
  progressRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 10,
    marginBottom: 16,
  },
  overallPercent: {
    color: "#FFFFFF",
    fontSize: 42,
    fontWeight: "800",
  },
  overallCaption: {
    color: "#D7D2F4",
    fontSize: 13,
    marginLeft: 10,
  },
  overallTrack: {
    height: 9,
    backgroundColor: "#494265",
    borderRadius: 10,
    overflow: "hidden",
  },
  overallFill: {
    height: "100%",
    backgroundColor: "#B6A5FF",
    borderRadius: 10,
  },
  overallFooter: {
    color: "#E0DCF5",
    fontSize: 12,
    marginTop: 14,
    lineHeight: 18,
  },
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 19,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "#ECEEF4",
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
  },
  waterIconBox: {
    backgroundColor: "#E6F4FF",
  },
  stepsIconBox: {
    backgroundColor: "#EDE8FF",
  },
  emoji: {
    fontSize: 24,
  },
  cardHeading: {
    flex: 1,
    marginLeft: 12,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "800",
    color: "#242633",
  },
  cardSubtitle: {
    fontSize: 12,
    color: "#858A98",
    marginTop: 4,
  },
  percent: {
    fontSize: 15,
    fontWeight: "800",
    color: "#7357F6",
  },
  valueRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginTop: 22,
    marginBottom: 14,
  },
  mainValue: {
    fontSize: 27,
    fontWeight: "800",
    color: "#222433",
  },
  goalValue: {
    fontSize: 13,
    color: "#858A98",
    marginLeft: 8,
  },
  track: {
    height: 9,
    backgroundColor: "#ECEEF4",
    borderRadius: 10,
    overflow: "hidden",
  },
  waterFill: {
    height: "100%",
    backgroundColor: "#35A9F4",
    borderRadius: 10,
  },
  stepsFill: {
    height: "100%",
    backgroundColor: "#8065F6",
    borderRadius: 10,
  },
  helperText: {
    fontSize: 12,
    color: "#777D8B",
    marginTop: 12,
  },
  tipCard: {
    backgroundColor: "#EDE9FF",
    borderRadius: 20,
    padding: 18,
    marginTop: 2,
  },
  tipTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#49359B",
  },
  tipText: {
    fontSize: 13,
    lineHeight: 21,
    color: "#5E5488",
    marginTop: 8,
  },
  note: {
    fontSize: 11,
    color: "#969AA6",
    textAlign: "center",
    marginTop: 18,
  },
});