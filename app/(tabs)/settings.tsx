
import {
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useHabits } from '../../context/HabitContext';

export default function SettingsScreen() {
  const { habits, isLoaded } = useHabits();

  if (!isLoaded) {
    return <SafeAreaView style={styles.safe}><Text>Loading...</Text></SafeAreaView>;
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <Text style={styles.eyebrow}>MAKE IT YOURS</Text>
        <Text style={styles.title}>Settings</Text>
        <Text style={styles.subtitle}>Your space for better habits.</Text>

        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>🌱</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.profileTitle}>Habit Tracker</Text>
            <Text style={styles.profileSubtitle}>Your daily growth companion</Text>
          </View>
          <Text style={styles.version}>v1.0</Text>
        </View>

        <Text style={styles.sectionTitle}>Your activity</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Habits created</Text>
            <Text style={styles.infoValue}>{habits.length}</Text>
          </View>
          <View style={styles.separator} />
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Total completions</Text>
            <Text style={styles.infoValue}>
              {habits.reduce((sum, h) => sum + h.completedDates.length, 0)}
            </Text>
          </View>
        </View>

        <Text style={styles.sectionTitle}>About the app</Text>
        <View style={styles.infoCard}>
          <View style={styles.aboutRow}>
            <Text style={styles.aboutEmoji}>🎯</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutTitle}>Build consistency</Text>
              <Text style={styles.aboutText}>
                Create habits, track daily progress and review your history.
              </Text>
            </View>
          </View>
          <View style={styles.separator} />
          <View style={styles.aboutRow}>
            <Text style={styles.aboutEmoji}>🔒</Text>
            <View style={{ flex: 1 }}>
              <Text style={styles.aboutTitle}>Saved on your device</Text>
              <Text style={styles.aboutText}>
                Your habits are stored locally using AsyncStorage.
              </Text>
            </View>
          </View>
        </View>

        <Text style={styles.footer}>
          Made for small steps and meaningful progress 💚
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: '#F5F7FB' },
  content: { padding: 20, paddingBottom: 35 },
  eyebrow: { color: '#16A34A', fontWeight: '800', letterSpacing: 1.7, fontSize: 10, marginTop: 12 },
  title: { fontSize: 29, fontWeight: '800', color: '#172033', marginTop: 7 },
  subtitle: { color: '#778196', marginTop: 5, marginBottom: 24 },
  profileCard: { flexDirection: 'row', alignItems: 'center', gap: 13, backgroundColor: '#172B25', padding: 19, borderRadius: 22 },
  avatar: { width: 48, height: 48, borderRadius: 16, backgroundColor: '#D1FAE5', alignItems: 'center', justifyContent: 'center' },
  avatarText: { fontSize: 25 },
  profileTitle: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  profileSubtitle: { color: '#C2D7CB', fontSize: 11, marginTop: 5 },
  version: { color: '#86EFAC', fontSize: 11, fontWeight: '800' },
  sectionTitle: { fontSize: 17, fontWeight: '800', color: '#172033', marginTop: 27, marginBottom: 12 },
  infoCard: { backgroundColor: '#FFFFFF', borderRadius: 19, paddingHorizontal: 17, borderWidth: 1, borderColor: '#E9EEF3' },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 17 },
  infoLabel: { color: '#697589', fontSize: 13 },
  infoValue: { color: '#172033', fontSize: 15, fontWeight: '800' },
  separator: { height: 1, backgroundColor: '#EDF0F4' },
  aboutRow: { flexDirection: 'row', gap: 13, paddingVertical: 17 },
  aboutEmoji: { fontSize: 23 },
  aboutTitle: { color: '#253044', fontWeight: '800', fontSize: 13 },
  aboutText: { color: '#8791A3', fontSize: 12, lineHeight: 18, marginTop: 5 },
  footer: { color: '#9AA4B2', textAlign: 'center', fontSize: 11, marginTop: 28 },
});
