
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

const REMINDER_ID_KEY = '@habit_reminder_id';

export async function scheduleDailyReminder(time: string) {
  const match = /^([01]\d|2[0-3]):([0-5]\d)$/.exec(time);

  if (!match) {
    throw new Error('Time must be in HH:MM format.');
  }

  const hour = Number(match[1]);
  const minute = Number(match[2]);

  const permission = await Notifications.requestPermissionsAsync();

  if (!permission.granted) {
    throw new Error('Notification permission was not granted.');
  }

  await Notifications.setNotificationChannelAsync('daily-reminders', {
    name: 'Daily Habit Reminders',
    importance: Notifications.AndroidImportance.HIGH,
    sound: 'default',
  });

  const previousId = await AsyncStorage.getItem(REMINDER_ID_KEY);

  if (previousId) {
    await Notifications.cancelScheduledNotificationAsync(previousId);
  }

  const id = await Notifications.scheduleNotificationAsync({
    content: {
      title: 'Time for your habits! 🌱',
      body: 'Take a few minutes to work on your daily goals.',
      sound: 'default',
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DAILY,
      hour,
      minute,
      channelId: 'daily-reminders',
    },
  });

  await AsyncStorage.setItem(REMINDER_ID_KEY, id);
}

export async function cancelDailyReminder() {
  const id = await AsyncStorage.getItem(REMINDER_ID_KEY);

  if (id) {
    await Notifications.cancelScheduledNotificationAsync(id);
    await AsyncStorage.removeItem(REMINDER_ID_KEY);
  }
}
