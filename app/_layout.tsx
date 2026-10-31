import { Stack } from 'expo-router';
import { HabitProvider } from '../context/HabitContext';
import { HealthProvider } from '../context/HealthContext';

export default function RootLayout() {
  return (
    <HabitProvider>
      <HealthProvider>
        <Stack screenOptions={{ headerShown: false }} />
      </HealthProvider>
    </HabitProvider>
  );
}