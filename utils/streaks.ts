
import type { Habit } from '../context/HabitContext';
import { getDateKey } from '../context/HabitContext';

function shiftDate(dateKey: string, amount: number): string {
  const date = new Date(`${dateKey}T12:00:00`);
  date.setDate(date.getDate() + amount);
  return getDateKey(date);
}

export function getCurrentStreak(habit: Habit): number {
  const completed = new Set(habit.completedDates);
  let streak = 0;
  let dateKey = getDateKey();

  // If today's habit is not completed yet,
  // allow the streak to continue from yesterday.
  if (!completed.has(dateKey)) {
    dateKey = shiftDate(dateKey, -1);
  }

  while (completed.has(dateKey)) {
    streak++;
    dateKey = shiftDate(dateKey, -1);
  }

  return streak;
}

export function getBestStreak(habit: Habit): number {
  const completed = [...new Set(habit.completedDates)].sort();

  if (completed.length === 0) return 0;

  let best = 1;
  let current = 1;

  for (let i = 1; i < completed.length; i++) {
    if (shiftDate(completed[i - 1], 1) === completed[i]) {
      current++;
    } else {
      current = 1;
    }

    best = Math.max(best, current);
  }

  return best;
}

export function getWeeklyCompletionRate(habits: Habit[]): number {
  if (habits.length === 0) return 0;

  let possible = 0;
  let completed = 0;
  const today = getDateKey();

  for (let offset = 0; offset < 7; offset++) {
    const dateKey = shiftDate(today, -offset);

    for (const habit of habits) {
      possible++;
      if (habit.completedDates.includes(dateKey)) {
        completed++;
      }
    }
  }

  return possible === 0
    ? 0
    : Math.round((completed / possible) * 100);
}
