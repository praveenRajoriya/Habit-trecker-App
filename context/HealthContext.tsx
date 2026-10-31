
import AsyncStorage from '@react-native-async-storage/async-storage';
import React, {
  createContext,
  useContext,
  useEffect,
  useState,
} from 'react';

type DailyWater = {
  date: string;
  amount: number;
};

type HealthContextType = {
  waterGoal: number;
  todayWater: number;
  addWater: (amount: number) => void;
  setWaterGoal: (goal: number) => void;
  resetTodayWater: () => void;
  isHealthLoaded: boolean;
};

const STORAGE_KEY = '@habit_tracker_health_v1';
const DEFAULT_WATER_GOAL = 2000;

const HealthContext = createContext<HealthContextType | undefined>(
  undefined
);

function getTodayKey(): string {
  const today = new Date();

  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const day = String(today.getDate()).padStart(2, '0');

  return `${year}-${month}-${day}`;
}

export function HealthProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [waterGoal, setWaterGoalState] = useState(DEFAULT_WATER_GOAL);
  const [waterHistory, setWaterHistory] = useState<DailyWater[]>([]);
  const [isHealthLoaded, setIsHealthLoaded] = useState(false);

  useEffect(() => {
    async function loadHealthData() {
      try {
        const saved = await AsyncStorage.getItem(STORAGE_KEY);

        if (saved) {
          const data = JSON.parse(saved);

          if (typeof data.waterGoal === 'number' && data.waterGoal > 0) {
            setWaterGoalState(data.waterGoal);
          }

          if (Array.isArray(data.waterHistory)) {
            setWaterHistory(data.waterHistory);
          }
        }
      } catch (error) {
        console.error('Could not load health data:', error);
      } finally {
        setIsHealthLoaded(true);
      }
    }

    loadHealthData();
  }, []);

  useEffect(() => {
    if (!isHealthLoaded) return;

    const data = {
      waterGoal,
      waterHistory,
    };

    AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(data)).catch(
      (error) => console.error('Could not save health data:', error)
    );
  }, [waterGoal, waterHistory, isHealthLoaded]);

  const todayWater =
    waterHistory.find((item) => item.date === getTodayKey())?.amount ?? 0;

  function addWater(amount: number) {
    if (!Number.isFinite(amount) || amount <= 0) return;

    const today = getTodayKey();

    setWaterHistory((current) => {
      const existing = current.find((item) => item.date === today);

      if (existing) {
        return current.map((item) =>
          item.date === today
            ? { ...item, amount: item.amount + amount }
            : item
        );
      }

      return [...current, { date: today, amount }];
    });
  }

  function setWaterGoal(goal: number) {
    if (!Number.isFinite(goal) || goal <= 0) return;

    setWaterGoalState(Math.round(goal));
  }

  function resetTodayWater() {
    const today = getTodayKey();

    setWaterHistory((current) =>
      current.filter((item) => item.date !== today)
    );
  }

  return (
    <HealthContext.Provider
      value={{
        waterGoal,
        todayWater,
        addWater,
        setWaterGoal,
        resetTodayWater,
        isHealthLoaded,
      }}
    >
      {children}
    </HealthContext.Provider>
  );
}

export function useHealth() {
  const context = useContext(HealthContext);

  if (!context) {
    throw new Error('useHealth must be used inside HealthProvider');
  }

  return context;
}

