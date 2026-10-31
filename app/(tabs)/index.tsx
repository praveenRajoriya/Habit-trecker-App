
import { useState } from 'react';
import {
  Alert,
  Modal,
  Pressable,
  SafeAreaView,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useHabits, getTodayKey } from '../../context/HabitContext';
import WaterTracker from '../../components/WaterTracker';
import StepsTracker from '../../components/StepsTracker';

const GREEN = '#16A34A';
const BG = '#F5F7FB';

export default function HomeScreen() {
  const {
    habits,
    isLoaded,
    addHabit,
    editHabit,
    deleteHabit,
    toggleHabit,
  } = useHabits();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  const today = getTodayKey();
  const completed = habits.filter((h) =>
    h.completedDates.includes(today)
  ).length;
  const percent = habits.length
    ? Math.round((completed / habits.length) * 100)
    : 0;

  function openAdd() {
    setEditingId(null);
    setTitle('');
    setModalVisible(true);
  }

  function openEdit(id: string, currentTitle: string) {
    setEditingId(id);
    setTitle(currentTitle);
    setModalVisible(true);
  }

  function saveHabit() {
    if (!title.trim()) {
      Alert.alert('Habit name required', 'Please enter a habit name.');
      return;
    }

    if (editingId) {
      editHabit(editingId, title);
    } else {
      addHabit(title);
    }

    setModalVisible(false);
    setTitle('');
    setEditingId(null);
  }

  function confirmDelete(id: string, name: string) {
    Alert.alert('Delete habit?', `Delete "${name}" permanently?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => deleteHabit(id),
      },
    ]);
  }

  if (!isLoaded) {
    return (
      <SafeAreaView style={styles.center}>
        <Text style={styles.loading}>Loading your habits...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <ScrollView contentContainerStyle={styles.content}>
        <View style={styles.header}>
          <View>
            <Text style={styles.eyebrow}>YOUR PERSONAL SPACE</Text>
            <Text style={styles.title}>Good day! 🌱</Text>
            <Text style={styles.subtitle}>Small steps, big changes.</Text>
          </View>
          <View style={styles.avatar}>
            <Text style={styles.avatarText}>H</Text>
          </View>
        </View>

        <View style={styles.progressCard}>
          <View style={styles.progressTop}>
            <View>
              <Text style={styles.progressLabel}>TODAY'S PROGRESS</Text>
              <Text style={styles.progressNumber}>
                {completed}
                <Text style={styles.progressTotal}> / {habits.length}</Text>
              </Text>
              <Text style={styles.progressMessage}>
                {habits.length === 0
                  ? 'Add your first habit to get started.'
                  : completed === habits.length
                    ? 'Amazing! All habits completed 🎉'
                    : 'Keep going. You are doing great!'}
              </Text>
            </View>
            <View style={styles.percentCircle}>
              <Text style={styles.percentText}>{percent}%</Text>
            </View>
          </View>

          <View style={styles.track}>
            <View style={[styles.fill, { width: `${percent}%` }]} />
          </View>
        </View>

        {/* Water Tracker */}
        <WaterTracker />
        <StepsTracker />

        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionTitle}>My habits</Text>
            <Text style={styles.sectionSubtitle}>Build your daily routine</Text>
          </View>
          <Pressable style={styles.addButton} onPress={openAdd}>
            <Text style={styles.addButtonText}>＋ Add</Text>
          </Pressable>
        </View>

        {habits.length === 0 ? (
          <View style={styles.emptyCard}>
            <Text style={styles.emptyEmoji}>🌿</Text>
            <Text style={styles.emptyTitle}>Start with one habit</Text>
            <Text style={styles.emptyText}>
              Reading, exercise, water, or anything you want to improve.
            </Text>
            <Pressable style={styles.primaryButton} onPress={openAdd}>
              <Text style={styles.primaryButtonText}>Create my first habit</Text>
            </Pressable>
          </View>
        ) : (
          habits.map((habit, index) => {
            const done = habit.completedDates.includes(today);

            return (
              <View key={habit.id} style={styles.habitCard}>
                <Pressable
                  style={[styles.check, done && styles.checkDone]}
                  onPress={() => toggleHabit(habit.id, today)}
                >
                  <Text style={styles.checkText}>{done ? '✓' : ''}</Text>
                </Pressable>

                <Pressable
                  style={styles.habitInfo}
                  onPress={() => toggleHabit(habit.id, today)}
                >
                  <Text style={[styles.habitTitle, done && styles.doneTitle]}>
                    {habit.title}
                  </Text>
                  <Text style={styles.habitSub}>
                    {done ? 'Completed today' : 'Tap to mark complete'}
                  </Text>
                </Pressable>

                <Pressable
                  style={styles.moreButton}
                  onPress={() =>
                    Alert.alert(habit.title, 'Choose an action', [
                      {
                        text: 'Edit',
                        onPress: () => openEdit(habit.id, habit.title),
                      },
                      {
                        text: 'Delete',
                        style: 'destructive',
                        onPress: () => confirmDelete(habit.id, habit.title),
                      },
                      { text: 'Cancel', style: 'cancel' },
                    ])
                  }
                >
                  <Text style={styles.moreText}>•••</Text>
                </Pressable>
              </View>
            );
          })
        )}

        <View style={styles.tipCard}>
          <Text style={styles.tipEmoji}>💡</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.tipTitle}>Today's reminder</Text>
            <Text style={styles.tipText}>
              Consistency matters more than perfection. Show up for yourself.
            </Text>
          </View>
        </View>
      </ScrollView>

      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>
              {editingId ? 'Edit habit' : 'Create a habit'}
            </Text>
            <Text style={styles.modalSubtitle}>
              What would you like to do every day?
            </Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Read for 20 minutes"
              placeholderTextColor="#9CA3AF"
              value={title}
              onChangeText={setTitle}
              autoFocus
              maxLength={60}
              onSubmitEditing={saveHabit}
            />
            <Pressable style={styles.primaryButton} onPress={saveHabit}>
              <Text style={styles.primaryButtonText}>
                {editingId ? 'Save changes' : 'Create habit'}
              </Text>
            </Pressable>
            <Pressable
              style={styles.cancelButton}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.cancelText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: BG },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loading: { color: '#64748B', fontSize: 16 },
  content: { padding: 20, paddingBottom: 36 },
  header: {
    flexDirection: 'row', justifyContent: 'space-between',
    alignItems: 'center', marginTop: 12, marginBottom: 24,
  },
  eyebrow: { fontSize: 10, letterSpacing: 1.8, color: GREEN, fontWeight: '800' },
  title: { fontSize: 29, fontWeight: '800', color: '#172033', marginTop: 7 },
  subtitle: { color: '#778196', marginTop: 5, fontSize: 14 },
  avatar: {
    height: 48, width: 48, borderRadius: 17, backgroundColor: '#DCFCE7',
    justifyContent: 'center', alignItems: 'center',
  },
  avatarText: { fontSize: 21, color: GREEN, fontWeight: '800' },
  progressCard: {
    backgroundColor: '#172B25', borderRadius: 25, padding: 22, marginBottom: 28,
  },
  progressTop: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
  },
  progressLabel: { color: '#B7D9C6', fontSize: 10, letterSpacing: 1.2, fontWeight: '700' },
  progressNumber: { fontSize: 39, fontWeight: '800', color: '#FFFFFF', marginTop: 7 },
  progressTotal: { fontSize: 20, color: '#9BB9A9', fontWeight: '500' },
  progressMessage: { color: '#D4E5DB', fontSize: 12, marginTop: 5 },
  percentCircle: {
    width: 66, height: 66, borderRadius: 33, borderWidth: 4,
    borderColor: '#86EFAC', justifyContent: 'center', alignItems: 'center',
  },
  percentText: { color: '#FFFFFF', fontSize: 16, fontWeight: '800' },
  track: { height: 7, backgroundColor: '#3D5148', borderRadius: 10, marginTop: 22 },
  fill: { height: 7, backgroundColor: '#86EFAC', borderRadius: 10 },
  sectionHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 15,
  },
  sectionTitle: { fontSize: 21, fontWeight: '800', color: '#172033' },
  sectionSubtitle: { color: '#8791A3', fontSize: 12, marginTop: 4 },
  addButton: { backgroundColor: '#DCFCE7', paddingHorizontal: 16, paddingVertical: 11, borderRadius: 13 },
  addButtonText: { color: '#15803D', fontWeight: '800', fontSize: 13 },
  emptyCard: {
    backgroundColor: '#FFFFFF', padding: 24, borderRadius: 22,
    alignItems: 'center', borderWidth: 1, borderColor: '#E9EEF3',
  },
  emptyEmoji: { fontSize: 35 },
  emptyTitle: { fontSize: 18, fontWeight: '800', color: '#172033', marginTop: 12 },
  emptyText: { color: '#7B8797', textAlign: 'center', lineHeight: 21, marginTop: 7, marginBottom: 18 },
  primaryButton: { backgroundColor: GREEN, padding: 15, borderRadius: 13, alignItems: 'center' },
  primaryButtonText: { color: '#FFFFFF', fontWeight: '800', fontSize: 14 },
  habitCard: {
    flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFFFFF',
    borderRadius: 18, padding: 15, marginBottom: 11,
    borderWidth: 1, borderColor: '#E9EEF3',
  },
  check: {
    width: 27, height: 27, borderRadius: 9, borderWidth: 2,
    borderColor: '#CDD5DF', justifyContent: 'center', alignItems: 'center',
  },
  checkDone: { backgroundColor: GREEN, borderColor: GREEN },
  checkText: { color: '#FFFFFF', fontWeight: '900', fontSize: 17 },
  habitInfo: { flex: 1, marginLeft: 13 },
  habitTitle: { fontSize: 15, fontWeight: '700', color: '#202B3C' },
  doneTitle: { color: '#8A96A7', textDecorationLine: 'line-through' },
  habitSub: { fontSize: 11, color: '#8994A4', marginTop: 5 },
  moreButton: { padding: 8 },
  moreText: { fontWeight: '800', color: '#8A96A7', letterSpacing: 1 },
  tipCard: {
    flexDirection: 'row', gap: 12, backgroundColor: '#FFF7E6',
    borderRadius: 18, padding: 16, marginTop: 16,
  },
  tipEmoji: { fontSize: 24 },
  tipTitle: { fontSize: 14, color: '#815B18', fontWeight: '800' },
  tipText: { fontSize: 12, color: '#927543', marginTop: 5, lineHeight: 18 },
  modalOverlay: {
    flex: 1, backgroundColor: 'rgba(15,23,42,0.45)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF', borderTopLeftRadius: 28, borderTopRightRadius: 28,
    padding: 24, paddingBottom: 34,
  },
  modalTitle: { fontSize: 23, fontWeight: '800', color: '#172033' },
  modalSubtitle: { color: '#778196', marginTop: 7, marginBottom: 20 },
  input: {
    borderWidth: 1, borderColor: '#DCE3EA', borderRadius: 13,
    padding: 15, fontSize: 15, color: '#172033', marginBottom: 17,
  },
  cancelButton: { alignItems: 'center', padding: 15, marginTop: 3 },
  cancelText: { color: '#687386', fontWeight: '700' },
});
