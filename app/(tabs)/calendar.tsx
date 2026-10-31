import React, { useCallback, useState } from "react";
import {
  ActivityIndicator,
  Pressable,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  View,
} from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import { useHabits } from "../../context/HabitContext";
import { STEPS_STORAGE_KEY, StepsHistory, getStepsDateKey } from "../../components/StepsTracker";

const DAILY_STEP_GOAL = 8000;

const WEEKDAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function getMonthTitle(date: Date) {
  return date.toLocaleDateString("en-IN", {
    month: "long",
    year: "numeric",
  });
}

function getMonthDays(date: Date): Array<Date | null> {
  const year = date.getFullYear();
  const month = date.getMonth();

  const firstDay = new Date(year, month, 1);
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Monday = 0, Tuesday = 1, ... Sunday = 6.
  const mondayFirstOffset = (firstDay.getDay() + 6) % 7;

  const cells: Array<Date | null> = [];

  for (let i = 0; i < mondayFirstOffset; i++) {
    cells.push(null);
  }

  for (let day = 1; day <= daysInMonth; day++) {
    cells.push(new Date(year, month, day));
  }

  while (cells.length % 7 !== 0) {
    cells.push(null);
  }

  return cells;
}

function formatSelectedDate(date: Date) {
  return date.toLocaleDateString("en-IN", {
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export default function CalendarScreen() {
  const { habits, isLoaded } = useHabits();

  const [displayMonth, setDisplayMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });

  const [selectedDate, setSelectedDate] = useState(getStepsDateKey());
  const [stepsHistory, setStepsHistory] = useState<StepsHistory>({});
  const [historyLoaded, setHistoryLoaded] = useState(false);

  // Refresh history whenever the Calendar tab becomes active.
  useFocusEffect(
    useCallback(() => {
      let active = true;

      async function loadStepsHistory() {
        try {
          const saved = await AsyncStorage.getItem(STEPS_STORAGE_KEY);

          if (!active) return;

          if (saved) {
            try {
              const parsed: unknown = JSON.parse(saved);

              if (
                parsed &&
                typeof parsed === "object" &&
                !Array.isArray(parsed)
              ) {
                setStepsHistory(parsed as StepsHistory);
              } else {
                setStepsHistory({});
              }
            } catch {
              setStepsHistory({});
            }
          } else {
            setStepsHistory({});
          }
        } catch {
          if (active) {
            setStepsHistory({});
          }
        } finally {
          if (active) {
            setHistoryLoaded(true);
          }
        }
      }

      loadStepsHistory();

      return () => {
        active = false;
      };
    }, [])
  );

  const todayKey = getStepsDateKey();
  const selectedSteps = Math.max(
    0,
    Number(stepsHistory[selectedDate] ?? 0) || 0
  );

  const selectedDateHabits = habits.filter((habit) =>
    habit.completedDates.includes(selectedDate)
  );

  const completedCount = selectedDateHabits.length;

  const habitPercent = habits.length
    ? Math.round((completedCount / habits.length) * 100)
    : 0;

  const stepPercent = Math.min(
    100,
    Math.round((selectedSteps / DAILY_STEP_GOAL) * 100)
  );

  const calendarDays = getMonthDays(displayMonth);

  function changeMonth(direction: number) {
    setDisplayMonth((current) => {
      return new Date(
        current.getFullYear(),
        current.getMonth() + direction,
        1
      );
    });
  }

  function selectDay(date: Date) {
    setSelectedDate(getStepsDateKey(date));
  }

  function selectToday() {
    const today = new Date();

    setDisplayMonth(
      new Date(today.getFullYear(), today.getMonth(), 1)
    );
    setSelectedDate(getStepsDateKey(today));
  }

  if (!isLoaded || !historyLoaded) {
    return (
      <SafeAreaView style={styles.loadingScreen}>
        <ActivityIndicator size="large" color="#4F46E5" />
        <Text style={styles.loadingText}>Loading your calendar...</Text>
      </SafeAreaView>
    );
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
            <Text style={styles.eyebrow}>YOUR PROGRESS</Text>
            <Text style={styles.title}>Calendar</Text>
            <Text style={styles.subtitle}>
              Your habits and steps, day by day.
            </Text>
          </View>

          <View style={styles.headerIcon}>
            <Text style={styles.headerEmoji}>📅</Text>
          </View>
        </View>

        {/* Month selector */}
        <View style={styles.calendarCard}>
          <View style={styles.monthHeader}>
            <Pressable
              style={styles.monthButton}
              onPress={() => changeMonth(-1)}
            >
              <Text style={styles.monthButtonText}>‹</Text>
            </Pressable>

            <Text style={styles.monthTitle}>
              {getMonthTitle(displayMonth)}
            </Text>

            <Pressable
              style={styles.monthButton}
              onPress={() => changeMonth(1)}
            >
              <Text style={styles.monthButtonText}>›</Text>
            </Pressable>
          </View>

          <View style={styles.weekdaysRow}>
            {WEEKDAYS.map((weekday) => (
              <View key={weekday} style={styles.weekdayCell}>
                <Text style={styles.weekdayText}>{weekday}</Text>
              </View>
            ))}
          </View>

          <View style={styles.daysGrid}>
            {calendarDays.map((date, index) => {
              if (!date) {
                return (
                  <View
                    key={`empty-${index}`}
                    style={styles.dayCell}
                  />
                );
              }

              const dateKey = getStepsDateKey(date);
              const isToday = dateKey === todayKey;
              const isSelected = dateKey === selectedDate;
              const daySteps = Math.max(
                0,
                Number(stepsHistory[dateKey] ?? 0) || 0
              );

              const stepGoalReached = daySteps >= DAILY_STEP_GOAL;

              const completedHabits = habits.filter((habit) =>
                habit.completedDates.includes(dateKey)
              ).length;

              const hasCompletedHabits = completedHabits > 0;
              const hasSteps = daySteps > 0;

              return (
                <Pressable
                  key={dateKey}
                  style={[
                    styles.dayCell,
                    isSelected && styles.selectedDayCell,
                    isToday && !isSelected && styles.todayDayCell,
                  ]}
                  onPress={() => selectDay(date)}
                >
                  <Text
                    style={[
                      styles.dayNumber,
                      isSelected && styles.selectedDayNumber,
                      isToday && !isSelected && styles.todayDayNumber,
                    ]}
                  >
                    {date.getDate()}
                  </Text>

                  <View style={styles.dayIndicators}>
                    {hasCompletedHabits ? (
                      <View
                        style={[
                          styles.indicator,
                          styles.habitIndicator,
                        ]}
                      />
                    ) : null}

                    {hasSteps ? (
                      <View
                        style={[
                          styles.indicator,
                          stepGoalReached
                            ? styles.goalIndicator
                            : styles.stepsIndicator,
                        ]}
                      />
                    ) : null}
                  </View>
                </Pressable>
              );
            })}
          </View>

          <View style={styles.legend}>
            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, styles.habitIndicator]}
              />
              <Text style={styles.legendText}>Habits completed</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, styles.stepsIndicator]}
              />
              <Text style={styles.legendText}>Steps recorded</Text>
            </View>

            <View style={styles.legendItem}>
              <View
                style={[styles.legendDot, styles.goalIndicator]}
              />
              <Text style={styles.legendText}>Step goal reached</Text>
            </View>
          </View>

          <Pressable style={styles.todayButton} onPress={selectToday}>
            <Text style={styles.todayButtonText}>Go to today</Text>
          </Pressable>
        </View>

        {/* Selected date summary */}
        <View style={styles.dateHeading}>
          <Text style={styles.sectionEyebrow}>DAILY SUMMARY</Text>
          <Text style={styles.sectionTitle}>
            {selectedDate === todayKey
              ? "Today's activity"
              : formatSelectedDate(
                  new Date(`${selectedDate}T12:00:00`)
                )}
          </Text>
        </View>

        {/* Steps summary */}
        <View style={styles.stepsCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.summaryIcon}>
              <Text style={styles.summaryEmoji}>👟</Text>
            </View>

            <View style={styles.summaryHeading}>
              <Text style={styles.summaryTitle}>Steps</Text>
              <Text style={styles.summarySubtitle}>
                Daily goal: {DAILY_STEP_GOAL.toLocaleString("en-IN")}
              </Text>
            </View>

            <Text style={styles.stepsPercent}>{stepPercent}%</Text>
          </View>

          <Text style={styles.bigSteps}>
            {selectedSteps.toLocaleString("en-IN")}
          </Text>

          <Text style={styles.smallSteps}>
            {selectedSteps === 0
              ? "No steps recorded for this date yet."
              : selectedSteps >= DAILY_STEP_GOAL
                ? "🎉 You reached your daily step goal!"
                : `${(DAILY_STEP_GOAL - selectedSteps).toLocaleString(
                    "en-IN"
                  )} steps left to reach your goal.`}
          </Text>

          <View style={styles.progressTrack}>
            <View
              style={[
                styles.progressFill,
                { width: `${stepPercent}%` },
              ]}
            />
          </View>
        </View>

        {/* Habit summary */}
        <View style={styles.habitsCard}>
          <View style={styles.summaryTopRow}>
            <View style={styles.habitSummaryIcon}>
              <Text style={styles.summaryEmoji}>🌱</Text>
            </View>

            <View style={styles.summaryHeading}>
              <Text style={styles.summaryTitle}>Habit progress</Text>
              <Text style={styles.summarySubtitle}>
                {completedCount} of {habits.length} habits completed
              </Text>
            </View>

            <Text style={styles.habitPercent}>{habitPercent}%</Text>
          </View>

          <View style={styles.habitProgressTrack}>
            <View
              style={[
                styles.habitProgressFill,
                { width: `${habitPercent}%` },
              ]}
            />
          </View>

          {habits.length === 0 ? (
            <Text style={styles.emptyText}>
              You haven't added any habits yet.
            </Text>
          ) : (
            <View style={styles.habitList}>
              {habits.map((habit) => {
                const done = habit.completedDates.includes(selectedDate);

                return (
                  <View key={habit.id} style={styles.habitRow}>
                    <View
                      style={[
                        styles.habitCheck,
                        done && styles.habitCheckDone,
                      ]}
                    >
                      <Text
                        style={[
                          styles.habitCheckText,
                          done && styles.habitCheckTextDone,
                        ]}
                      >
                        {done ? "✓" : ""}
                      </Text>
                    </View>

                    <Text
                      style={[
                        styles.habitName,
                        done && styles.habitNameDone,
                      ]}
                    >
                      {habit.title}
                    </Text>

                    <Text
                      style={[
                        styles.habitStatus,
                        done && styles.habitStatusDone,
                      ]}
                    >
                      {done ? "Done" : "Not done"}
                    </Text>
                  </View>
                );
              })}
            </View>
          )}
        </View>

        <Text style={styles.footer}>
          Your steps history is stored on this device. Dates without recorded
          steps may show zero.
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
  loadingScreen: {
    flex: 1,
    backgroundColor: "#F5F7FB",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#7B8498",
    marginTop: 12,
    fontSize: 14,
  },
  container: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
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
    fontSize: 30,
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
    alignItems: "center",
    justifyContent: "center",
  },
  headerEmoji: {
    fontSize: 26,
  },
  calendarCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 25,
    padding: 17,
    borderWidth: 1,
    borderColor: "#EAECF3",
    marginBottom: 27,
  },
  monthHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 22,
  },
  monthButton: {
    width: 38,
    height: 38,
    borderRadius: 13,
    backgroundColor: "#F0F0FF",
    alignItems: "center",
    justifyContent: "center",
  },
  monthButtonText: {
    fontSize: 29,
    lineHeight: 32,
    color: "#4F46E5",
  },
  monthTitle: {
    fontSize: 18,
    fontWeight: "800",
    color: "#202942",
  },
  weekdaysRow: {
    flexDirection: "row",
    marginBottom: 9,
  },
  weekdayCell: {
    width: `${100 / 7}%`,
    alignItems: "center",
  },
  weekdayText: {
    fontSize: 11,
    fontWeight: "700",
    color: "#8A92A5",
  },
  daysGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  dayCell: {
    width: `${100 / 7}%`,
    height: 53,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 13,
    marginBottom: 4,
  },
  selectedDayCell: {
    backgroundColor: "#4F46E5",
  },
  todayDayCell: {
    borderWidth: 1.5,
    borderColor: "#4F46E5",
  },
  dayNumber: {
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  selectedDayNumber: {
    color: "#FFFFFF",
    fontWeight: "800",
  },
  todayDayNumber: {
    color: "#4F46E5",
    fontWeight: "800",
  },
  dayIndicators: {
    height: 7,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    marginTop: 4,
  },
  indicator: {
    width: 5,
    height: 5,
    borderRadius: 3,
  },
  habitIndicator: {
    backgroundColor: "#16A34A",
  },
  stepsIndicator: {
    backgroundColor: "#818CF8",
  },
  goalIndicator: {
    backgroundColor: "#F59E0B",
  },
  legend: {
    borderTopWidth: 1,
    borderTopColor: "#F0F1F6",
    paddingTop: 15,
    marginTop: 12,
    gap: 10,
  },
  legendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  legendText: {
    fontSize: 11,
    color: "#7B8498",
  },
  todayButton: {
    marginTop: 16,
    alignItems: "center",
    paddingVertical: 12,
    borderRadius: 13,
    backgroundColor: "#F0F0FF",
  },
  todayButtonText: {
    color: "#4F46E5",
    fontWeight: "800",
    fontSize: 13,
  },
  dateHeading: {
    marginBottom: 15,
  },
  sectionEyebrow: {
    fontSize: 10,
    fontWeight: "800",
    letterSpacing: 1.8,
    color: "#6366F1",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 21,
    fontWeight: "800",
    color: "#172033",
  },
  stepsCard: {
    backgroundColor: "#4F46E5",
    borderRadius: 24,
    padding: 20,
    marginBottom: 17,
  },
  summaryTopRow: {
    flexDirection: "row",
    alignItems: "center",
  },
  summaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#FFFFFF24",
    alignItems: "center",
    justifyContent: "center",
  },
  summaryEmoji: {
    fontSize: 22,
  },
  summaryHeading: {
    flex: 1,
    marginLeft: 12,
  },
  summaryTitle: {
    fontSize: 15,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  summarySubtitle: {
    fontSize: 11,
    color: "#E0E7FF",
    marginTop: 4,
  },
  stepsPercent: {
    color: "#FFFFFF",
    fontSize: 14,
    fontWeight: "800",
  },
  bigSteps: {
    fontSize: 38,
    fontWeight: "800",
    color: "#FFFFFF",
    marginTop: 23,
  },
  smallSteps: {
    color: "#E0E7FF",
    fontSize: 12,
    lineHeight: 19,
    marginTop: 6,
    marginBottom: 19,
  },
  progressTrack: {
    height: 8,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#7770EE",
  },
  progressFill: {
    height: "100%",
    borderRadius: 8,
    backgroundColor: "#FFFFFF",
  },
  habitsCard: {
    backgroundColor: "#FFFFFF",
    borderRadius: 23,
    padding: 18,
    borderWidth: 1,
    borderColor: "#EAECF3",
  },
  habitSummaryIcon: {
    width: 43,
    height: 43,
    borderRadius: 14,
    backgroundColor: "#E8F7EF",
    alignItems: "center",
    justifyContent: "center",
  },
  habitPercent: {
    color: "#16A34A",
    fontWeight: "800",
    fontSize: 14,
  },
  habitProgressTrack: {
    height: 7,
    borderRadius: 7,
    overflow: "hidden",
    backgroundColor: "#E8F7EF",
    marginTop: 18,
    marginBottom: 8,
  },
  habitProgressFill: {
    height: "100%",
    borderRadius: 7,
    backgroundColor: "#16A34A",
  },
  habitList: {
    marginTop: 7,
  },
  habitRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: 1,
    borderBottomColor: "#F0F1F6",
  },
  habitCheck: {
    width: 24,
    height: 24,
    borderRadius: 8,
    borderWidth: 1.5,
    borderColor: "#D0D5DD",
    alignItems: "center",
    justifyContent: "center",
  },
  habitCheckDone: {
    backgroundColor: "#16A34A",
    borderColor: "#16A34A",
  },
  habitCheckText: {
    fontSize: 14,
    fontWeight: "800",
    color: "#FFFFFF",
  },
  habitCheckTextDone: {
    color: "#FFFFFF",
  },
  habitName: {
    flex: 1,
    marginLeft: 11,
    fontSize: 13,
    fontWeight: "600",
    color: "#344054",
  },
  habitNameDone: {
    color: "#166534",
  },
  habitStatus: {
    fontSize: 10,
    fontWeight: "700",
    color: "#98A2B3",
  },
  habitStatusDone: {
    color: "#16A34A",
  },
  emptyText: {
    fontSize: 13,
    color: "#7B8498",
    marginTop: 18,
    lineHeight: 20,
  },
  footer: {
    textAlign: "center",
    fontSize: 11,
    lineHeight: 17,
    color: "#8A92A5",
    marginTop: 20,
  },
});