
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

export type Habit = {
  id: string;
  title: string;
  completedDates: string[];
};

type HabitContextType = {
  habits: Habit[];
  isLoaded: boolean;
  addHabit: (title: string) => void;
  editHabit: (id: string, title: string) => void;
  deleteHabit: (id: string) => void;
  toggleHabit: (id: string, date: string) => void;
};

const STORAGE_KEY = '@habit_tracker_v2';

const HabitContext = createContext<HabitContextType | undefined>(
  undefined
);

export function HabitProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [habits, setHabits] = useState<Habit[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    async function loadHabits() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const parsed = JSON.parse(saved);

          const migrated: Habit[] = parsed.map((item: any) => ({
            id: String(item.id),
            title: String(item.title),
            completedDates: Array.isArray(item.completedDates)
              ? item.completedDates
              : item.completed
                ? [getTodayKey()]
                : [],
          }));

          setHabits(migrated);
        }
      } catch (error) {
        console.error('Could not load habits:', error);
      } finally {
        setIsLoaded(true);
      }
    }

    loadHabits();
  }, []);


  useEffect(() => {
    if (!isLoaded) return;

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(habits)).catch(
      (error) => console.error('Could not save habits:', error)
    );
  }, [habits, isLoaded]);

  function addHabit(title: string) {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    const newHabit: Habit = {
      id: `${Date.now()}-${Math.random()}`,
      title: cleanTitle,
      completedDates: [],
    };

    setHabits((current) => [...current, newHabit]);
  }

  function editHabit(id: string, title: string) {
    const cleanTitle = title.trim();
    if (!cleanTitle) return;

    setHabits((current) =>
      current.map((habit) =>
        habit.id === id ? { ...habit, title: cleanTitle } : habit
      )
    );
  }

  function deleteHabit(id: string) {
    setHabits((current) =>
      current.filter((habit) => habit.id !== id)
    );
  }

  function toggleHabit(id: string, date: string) {
    setHabits((current) =>
      current.map((habit) => {
        if (habit.id !== id) return habit;

        const alreadyCompleted = habit.completedDates.includes(date);

        return {
          ...habit,
          completedDates: alreadyCompleted
            ? habit.completedDates.filter((item) => item !== date)
            : [...habit.completedDates, date],
        };
      })
    );
  }

  return (
    <HabitContext.Provider
      value={{
        habits,
        isLoaded,
        addHabit,
        editHabit,
        deleteHabit,
        toggleHabit,
      }}
    >
      {children}
    </HabitContext.Provider>
  );
}

export function useHabits() {
  const context = useContext(HabitContext);

  if (!context) {
    throw new Error('useHabits must be used inside HabitProvider');
  }

  return context;
}

export function getDateKey(date: Date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function getTodayKey() {
  return getDateKey(new Date());
}
