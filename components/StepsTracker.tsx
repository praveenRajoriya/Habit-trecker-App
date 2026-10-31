import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
  Pressable,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Pedometer } from "expo-sensors";

const DAILY_GOAL = 8000;


export const STEPS_STORAGE_KEY = "@habit_tracker_steps_history_v1";

export type StepsHistory = Record<string, number>;

export function getStepsDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

export default function StepsTracker() {
  const [steps, setSteps] = useState(0);
  const [history, setHistory] = useState<StepsHistory>({});
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [permissionGranted, setPermissionGranted] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const historyRef = useRef<StepsHistory>({});
  const stepsRef = useRef(0);
  const sessionBaseRef = useRef(0);
  const loadedRef = useRef(false);
  const activeDateRef = useRef(getStepsDateKey());

  useEffect(() => {
    let mounted = true;
    let subscription: ReturnType<typeof Pedometer.watchStepCount> | undefined;

    async function startTracking() {
      try {
        setError("");
        setIsAvailable(null);

      
        if (!loadedRef.current) {
          const savedJson = await AsyncStorage.getItem(STEPS_STORAGE_KEY);

          let savedHistory: StepsHistory = {};

          if (savedJson) {
            try {
              const parsed: unknown = JSON.parse(savedJson);

              if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
                savedHistory = parsed as StepsHistory;
              }
            } catch {
              savedHistory = {};
            }
          }

          if (!mounted) return;

          historyRef.current = savedHistory;
          setHistory(savedHistory);

          const todayKey = getStepsDateKey();
          const savedToday = Math.max(
            0,
            Number(savedHistory[todayKey] ?? 0) || 0
          );

          stepsRef.current = savedToday;
          sessionBaseRef.current = savedToday;
          activeDateRef.current = todayKey;

          setSteps(savedToday);
          loadedRef.current = true;
          setIsLoaded(true);
        } else {
          sessionBaseRef.current = stepsRef.current;
          activeDateRef.current = getStepsDateKey();
        }

        const permission = await Pedometer.requestPermissionsAsync();

        if (!mounted) return;

        if (!permission.granted) {
          setPermissionGranted(false);
          setIsAvailable(false);
          setError("Phone settings mein Physical Activity permission allow karo.");
          return;
        }

        setPermissionGranted(true);

        const available = await Pedometer.isAvailableAsync();

        if (!mounted) return;

        setIsAvailable(available);

        if (!available) {
          setError("Is device par step counter sensor available nahi hai.");
          return;
        }

      
        subscription = Pedometer.watchStepCount((result) => {
          if (!mounted) return;

          const todayKey = getStepsDateKey();

          
          if (activeDateRef.current !== todayKey) {
            activeDateRef.current = todayKey;

            const savedToday = Math.max(
              0,
              Number(historyRef.current[todayKey] ?? 0) || 0
            );

            sessionBaseRef.current = savedToday;
          }

          const totalSteps = Math.max(
            0,
            sessionBaseRef.current + result.steps
          );

          stepsRef.current = totalSteps;
          setSteps(totalSteps);

          const updatedHistory = {
            ...historyRef.current,
            [todayKey]: totalSteps,
          };

          historyRef.current = updatedHistory;
          setHistory(updatedHistory);

          
          AsyncStorage.setItem(
            STEPS_STORAGE_KEY,
            JSON.stringify(updatedHistory)
          ).catch(() => {
            if (mounted) {
              setError("Steps save nahi ho paaye. Dobara try karo.");
            }
          });
        });
      } catch {
        if (mounted) {
          setError("Step sensor start nahi hua. Permission aur device check karo.");
          setIsAvailable(false);
        }
      }
    }

    startTracking();

    return () => {
      mounted = false;
      subscription?.remove();
    };
  }, [refreshKey]);

  const progress = Math.min(
    100,
    Math.round((steps / DAILY_GOAL) * 100)
  );

  const distanceKm = ((steps * 0.762) / 1000).toFixed(2);
  const calories = Math.round(steps * 0.04);

  function restartTracking() {
   
    sessionBaseRef.current = stepsRef.current;
    setRefreshKey((value) => value + 1);
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="dark-content" backgroundColor="#F5F7FB" />

      <ScrollView
        contentContainerStyle={styles.container}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR DAILY MOVEMENT</Text>
            <Text style={styles.title}>Step Tracker</Text>
            <Text style={styles.subtitle}>
              Every step counts. Keep moving!
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.shoeIcon}>👟</Text>
          </View>
        </View>

        <View style={styles.heroCard}>
          <View style={styles.statusRow}>
            <View
              style={[
                styles.statusDot,
                {
                  backgroundColor:
                    isAvailable && permissionGranted ? "#4ADE80" : "#FBBF24",
                },
              ]}
            />

            <Text style={styles.statusText}>
              {!isLoaded || isAvailable === null
                ? "Connecting to step sensor..."
                : error
                  ? "Check sensor"
                  : "Live tracking active"}
            </Text>
          </View>

          <Text style={styles.stepLabel}>TODAY'S STEPS</Text>

          <Text style={styles.stepCount}>
            {steps.toLocaleString("en-IN")}
          </Text>

          <Text style={styles.goalText}>
            Daily goal: {DAILY_GOAL.toLocaleString("en-IN")} steps
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[styles.progressFill, { width: `${progress}%` }]}
            />
          </View>

          <View style={styles.progressFooter}>
            <Text style={styles.progressText}>{progress}% completed</Text>
            <Text style={styles.progressText}>
              {Math.max(0, DAILY_GOAL - steps).toLocaleString("en-IN")} left
            </Text>
          </View>

          <View style={styles.goalBadge}>
            <Text style={styles.goalBadgeText}>
              {steps >= DAILY_GOAL
                ? "🎉 Daily goal reached!"
                : "🔥 Keep going, you can do it!"}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>Your Activity</Text>

        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>📍</Text>
            </View>
            <Text style={styles.statValue}>{distanceKm} km</Text>
            <Text style={styles.statLabel}>Estimated distance</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Text style={styles.statEmoji}>🔥</Text>
            </View>
            <Text style={styles.statValue}>{calories}</Text>
            <Text style={styles.statLabel}>Estimated calories</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>📅 Daily history enabled</Text>
          <Text style={styles.infoText}>
            Aaj ke steps date ke saath save hote hain. Calendar tab mein
            kisi bhi saved date ko select karke us din ka total dekh sakte ho.
          </Text>
        </View>

        {error ? (
          <View style={styles.errorCard}>
            <Text style={styles.errorTitle}>Tracker notice</Text>
            <Text style={styles.errorText}>{error}</Text>

            <Pressable
              style={styles.retryButton}
              onPress={restartTracking}
            >
              <Text style={styles.retryText}>Try again</Text>
            </Pressable>
          </View>
        ) : null}

        {!isLoaded ? (
          <ActivityIndicator
            size="small"
            color="#4F46E5"
            style={styles.loader}
          />
        ) : null}

        <Pressable style={styles.resetButton} onPress={restartTracking}>
          <Text style={styles.resetButtonText}>↻ Restart tracking session</Text>
        </Pressable>

        <Text style={styles.footerText}>
          Step counts depend on your phone's sensor and tracking availability.
          Distance and calorie values are estimates.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#F5F7FB",
  },
  container: {
    padding: 20,
    paddingBottom: 36,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginTop: 12,
    marginBottom: 24,
  },
  eyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 2,
    color: "#6366F1",
    marginBottom: 7,
  },
  title: {
    fontSize: 29,
    fontWeight: "800",
    color: "#172033",
  },
  subtitle: {
    fontSize: 13,
    color: "#7B8498",
    marginTop: 6,
  },
  headerIcon: {
    width: 54,
    height: 54,
    borderRadius: 18,
    backgroundColor: "#E7E9FF",
    justifyContent: "center",
    alignItems: "center",
  },
  shoeIcon: {
    fontSize: 27,
  },
  heroCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 28,
    padding: 23,
    marginBottom: 28,
    elevation: 5,
    shadowColor: "#3730A3",
    shadowOpacity: 0.18,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 6 },
  },
  statusRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 27,
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 8,
  },
  statusText: {
    color: "#E0E7FF",
    fontSize: 12,
    fontWeight: "600",
  },
  stepLabel: {
    fontSize: 11,
    letterSpacing: 1.8,
    color: "#C7D2FE",
    fontWeight: "700",
  },
  stepCount: {
    fontSize: 48,
    fontWeight: "800",
    color: "#FFFFFF",
    marginVertical: 7,
    fontVariant: ["tabular-nums"],
  },
  goalText: {
    fontSize: 13,
    color: "#E0E7FF",
    marginBottom: 20,
  },
  progressTrack: {
    height: 9,
    backgroundColor: "#7770EE",
    borderRadius: 10,
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#FFFFFF",
    borderRadius: 10,
  },
  progressFooter: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 10,
  },
  progressText: {
    color: "#E0E7FF",
    fontSize: 11,
    fontWeight: "600",
  },
  goalBadge: {
    marginTop: 22,
    backgroundColor: "#FFFFFF1F",
    padding: 12,
    borderRadius: 14,
  },
  goalBadgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontWeight: "700",
    textAlign: "center",
  },
  sectionTitle: {
    fontSize: 19,
    fontWeight: "800",
    color: "#172033",
    marginBottom: 15,
  },
  statsRow: {
    flexDirection: "row",
    gap: 13,
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 22,
    padding: 17,
    borderWidth: 1,
    borderColor: "#EAECF3",
  },
  statIcon: {
    width: 42,
    height: 42,
    backgroundColor: "#F0F0FF",
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 14,
  },
  statEmoji: {
    fontSize: 21,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: "#202942",
  },
  statLabel: {
    fontSize: 12,
    color: "#828BA0",
    marginTop: 6,
  },
  infoCard: {
    backgroundColor: "#E8F7EF",
    borderRadius: 20,
    padding: 18,
    marginBottom: 18,
  },
  infoTitle: {
    color: "#166534",
    fontWeight: "800",
    fontSize: 14,
    marginBottom: 7,
  },
  infoText: {
    color: "#34734C",
    fontSize: 13,
    lineHeight: 20,
  },
  errorCard: {
    backgroundColor: "#FEF2F2",
    padding: 16,
    borderRadius: 16,
    marginBottom: 16,
  },
  errorTitle: {
    color: "#991B1B",
    fontWeight: "800",
    marginBottom: 6,
  },
  errorText: {
    color: "#B91C1C",
    fontSize: 13,
    lineHeight: 19,
  },
  retryButton: {
    marginTop: 12,
    alignSelf: "flex-start",
    backgroundColor: "#B91C1C",
    borderRadius: 10,
    paddingVertical: 9,
    paddingHorizontal: 15,
  },
  retryText: {
    color: "#FFFFFF",
    fontWeight: "700",
  },
  loader: {
    marginVertical: 10,
  },
  resetButton: {
    alignItems: "center",
    padding: 15,
    borderRadius: 15,
    backgroundColor: "#E8EAF5",
  },
  resetButtonText: {
    color: "#3730A3",
    fontWeight: "700",
    fontSize: 13,
  },
  footerText: {
    color: "#8A92A5",
    fontSize: 11,
    textAlign: "center",
    lineHeight: 17,
    marginTop: 18,
  },
});