import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { workoutsApi } from '../../src/api';
import { WorkoutDay, WorkoutPlan } from '../../src/types';
import { Button } from '../../src/components/Button';

interface ActiveSetState {
  exerciseId: string;
  setNumber: number;
  weightKg: string;
  repsCompleted: string;
  rpeRating: number;
  completed: boolean;
}

export default function WorkoutScreen() {
  const [plans, setPlans] = useState<WorkoutPlan[]>([]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan | null>(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Active Logging Session Modal
  const [isLoggingSession, setIsLoggingSession] = useState(false);
  const [activeSets, setActiveSets] = useState<ActiveSetState[]>([]);
  const [savingLog, setSavingLog] = useState(false);

  const fetchWorkouts = async () => {
    try {
      const res = (await workoutsApi.getWorkoutPlans()) as unknown as any;
      const items: WorkoutPlan[] = Array.isArray(res) ? res : res?.items || [];
      setPlans(items);
      const active = items.find((p) => p.status === 'ACTIVE') || items[0] || null;
      setActivePlan(active);
    } catch {
      // Fallback demo plan if backend is offline
      const demoPlan: WorkoutPlan = {
        id: '1',
        name: '4-Day Hypertrophy Split',
        description: 'Upper / Lower body mass builder with optimal volume',
        durationWeeks: 6,
        difficulty: 'INTERMEDIATE',
        goal: 'Muscle Hypertrophy',
        status: 'ACTIVE',
        createdAt: new Date().toISOString(),
        days: [
          {
            id: 'd1',
            dayNumber: 1,
            dayName: 'Chest & Triceps Power',
            isRestDay: false,
            targetDurationMinutes: 50,
            exercises: [
              {
                id: 'de1',
                exerciseId: 'ex1',
                exercise: { id: 'ex1', name: 'Barbell Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Lower bar to mid chest', 'Press explosively'], isGlobal: true },
                orderInDay: 1,
                sets: 4,
                reps: 8,
                targetWeightKg: 75,
                restTimeSeconds: 90,
              },
              {
                id: 'de2',
                exerciseId: 'ex2',
                exercise: { id: 'ex2', name: 'Incline Dumbbell Press', muscleGroup: 'CHEST', equipment: 'DUMBBELL', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Set bench 30 deg', 'Press dumbbells with control'], isGlobal: true },
                orderInDay: 2,
                sets: 3,
                reps: 10,
                targetWeightKg: 24,
                restTimeSeconds: 60,
              },
              {
                id: 'de3',
                exerciseId: 'ex3',
                exercise: { id: 'ex3', name: 'Triceps Rope Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Extend arms fully downward'], isGlobal: true },
                orderInDay: 3,
                sets: 3,
                reps: 12,
                targetWeightKg: 20,
                restTimeSeconds: 60,
              },
            ],
          },
          {
            id: 'd2',
            dayNumber: 2,
            dayName: 'Back & Biceps Thickness',
            isRestDay: false,
            targetDurationMinutes: 50,
            exercises: [
              {
                id: 'de4',
                exerciseId: 'ex4',
                exercise: { id: 'ex4', name: 'Barbell Deadlift', muscleGroup: 'BACK', equipment: 'BARBELL', difficulty: 'ADVANCED', category: 'STRENGTH', instructions: ['Keep spine neutral', 'Drive through heels'], isGlobal: true },
                orderInDay: 1,
                sets: 4,
                reps: 6,
                targetWeightKg: 110,
                restTimeSeconds: 120,
              },
              {
                id: 'de5',
                exerciseId: 'ex5',
                exercise: { id: 'ex5', name: 'Lat Pulldown', muscleGroup: 'BACK', equipment: 'CABLE', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Pull to upper chest', 'Squeeze lats'], isGlobal: true },
                orderInDay: 2,
                sets: 3,
                reps: 10,
                targetWeightKg: 55,
                restTimeSeconds: 60,
              },
            ],
          },
          {
            id: 'd3',
            dayNumber: 3,
            dayName: 'Active Recovery & Core',
            isRestDay: true,
            targetDurationMinutes: 30,
            exercises: [],
          },
          {
            id: 'd4',
            dayNumber: 4,
            dayName: 'Legs & Shoulders Hypertrophy',
            isRestDay: false,
            targetDurationMinutes: 55,
            exercises: [
              {
                id: 'de6',
                exerciseId: 'ex6',
                exercise: { id: 'ex6', name: 'Barbell Back Squat', muscleGroup: 'LEGS', equipment: 'BARBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Squat to parallel', 'Keep chest high'], isGlobal: true },
                orderInDay: 1,
                sets: 4,
                reps: 8,
                targetWeightKg: 85,
                restTimeSeconds: 90,
              },
            ],
          },
        ],
      };
      setActivePlan(demoPlan);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchWorkouts();
    }, []),
  );

  const currentDay: WorkoutDay | undefined = activePlan?.days?.[selectedDayIndex];

  const startLoggingSession = () => {
    if (!currentDay || currentDay.isRestDay) return;

    // Initialize set tracking array
    const initialSets: ActiveSetState[] = [];
    currentDay.exercises.forEach((ex) => {
      for (let s = 1; s <= ex.sets; s++) {
        initialSets.push({
          exerciseId: ex.exerciseId,
          setNumber: s,
          weightKg: String(ex.targetWeightKg || 20),
          repsCompleted: String(ex.reps || 10),
          rpeRating: 8,
          completed: false,
        });
      }
    });

    setActiveSets(initialSets);
    setIsLoggingSession(true);
  };

  const toggleSetCompleted = (exerciseId: string, setNumber: number) => {
    setActiveSets((prev) =>
      prev.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber
          ? { ...s, completed: !s.completed }
          : s,
      ),
    );
  };

  const updateSetValue = (
    exerciseId: string,
    setNumber: number,
    field: 'weightKg' | 'repsCompleted' | 'rpeRating',
    val: any,
  ) => {
    setActiveSets((prev) =>
      prev.map((s) =>
        s.exerciseId === exerciseId && s.setNumber === setNumber ? { ...s, [field]: val } : s,
      ),
    );
  };

  const finishWorkoutSession = async () => {
    if (!currentDay) return;
    setSavingLog(true);

    const logPayload = {
      workoutPlanId: activePlan?.id,
      name: currentDay.dayName,
      date: new Date().toISOString().split('T')[0],
      startedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
      completedAt: new Date().toISOString(),
      durationMinutes: 45,
      perceivedExertionRpe: 8,
      exercises: activeSets.map((s) => ({
        exerciseId: s.exerciseId,
        setNumber: s.setNumber,
        repsCompleted: parseInt(s.repsCompleted) || 10,
        weightKg: parseFloat(s.weightKg) || 0,
        rpe: s.rpeRating,
      })),
    };

    try {
      await workoutsApi.logWorkoutSession(logPayload);
      setIsLoggingSession(false);
      fetchWorkouts();
    } catch {
      setIsLoggingSession(false);
    } finally {
      setSavingLog(false);
    }
  };

  if (loading && !activePlan) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Top Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.headerSubtitle}>Active Workout Plan</Text>
          <Text style={styles.headerTitle}>{activePlan?.name}</Text>
        </View>

        {currentDay && !currentDay.isRestDay && (
          <TouchableOpacity onPress={startLoggingSession} style={styles.startBtn}>
            <Ionicons name="play" size={16} color="#0B0F19" />
            <Text style={styles.startBtnText}>Start Workout</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* Day Split Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.dayTabsContainer}
      >
        {activePlan?.days?.map((day, idx) => {
          const isSelected = selectedDayIndex === idx;
          return (
            <TouchableOpacity
              key={day.id || idx}
              onPress={() => setSelectedDayIndex(idx)}
              style={[styles.dayTab, isSelected ? styles.dayTabActive : null]}
            >
              <Text style={[styles.dayTabNum, isSelected ? styles.dayTabNumActive : null]}>
                Day {day.dayNumber}
              </Text>
              <Text
                numberOfLines={1}
                style={[styles.dayTabName, isSelected ? styles.dayTabNameActive : null]}
              >
                {day.isRestDay ? 'Rest' : day.dayName.split(' ')[0]}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Selected Day Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchWorkouts(); }} tintColor={Colors.primary} />
        }
      >
        {currentDay ? (
          <View>
            {/* Day Header Summary */}
            <View style={styles.dayCard}>
              <View style={styles.dayCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sessionTitle}>{currentDay.dayName}</Text>
                  <Text style={styles.sessionMeta}>
                    {currentDay.isRestDay
                      ? 'Recovery & Mobility'
                      : `${currentDay.exercises?.length || 0} Exercises • ~${currentDay.targetDurationMinutes} mins`}
                  </Text>
                </View>

                {currentDay.isRestDay ? (
                  <View style={styles.restBadge}>
                    <Ionicons name="leaf" size={16} color={Colors.primary} />
                    <Text style={styles.restBadgeText}>REST DAY</Text>
                  </View>
                ) : (
                  <TouchableOpacity onPress={startLoggingSession} style={styles.quickStartBtn}>
                    <Ionicons name="play-circle" size={32} color={Colors.primary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>

            {/* Exercises List */}
            {currentDay.isRestDay ? (
              <View style={styles.restDayCard}>
                <Ionicons name="cafe-outline" size={48} color={Colors.primary} />
                <Text style={styles.restDayTitle}>Active Rest & Recovery</Text>
                <Text style={styles.restDayDesc}>
                  Your muscles grow during rest periods. Focus on hydration, 8 hours of sleep, and light stretching.
                </Text>
              </View>
            ) : (
              <View style={styles.exercisesList}>
                {currentDay.exercises?.map((item, exIdx) => (
                  <View key={item.id || exIdx} style={styles.exerciseCard}>
                    <View style={styles.exHeader}>
                      <View style={styles.orderBadge}>
                        <Text style={styles.orderText}>{exIdx + 1}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.exName}>{item.exercise?.name}</Text>
                        <Text style={styles.exTarget}>
                          {item.sets} Sets × {item.reps} Reps • {item.targetWeightKg ? `${item.targetWeightKg} kg` : 'Bodyweight'}
                        </Text>
                      </View>
                      <View style={styles.restTimeBadge}>
                        <Ionicons name="timer-outline" size={14} color={Colors.textMuted} />
                        <Text style={styles.restTimeText}>{item.restTimeSeconds}s</Text>
                      </View>
                    </View>

                    {item.exercise?.instructions && item.exercise.instructions.length > 0 && (
                      <View style={styles.instructionsBox}>
                        <Text style={styles.instructionsText}>
                          💡 {item.exercise.instructions.join(' • ')}
                        </Text>
                      </View>
                    )}
                  </View>
                ))}
              </View>
            )}
          </View>
        ) : null}
      </ScrollView>

      {/* Live Workout Session Logger Modal */}
      <Modal visible={isLoggingSession} animationType="slide">
        <SafeAreaView style={styles.loggerModal}>
          <View style={styles.loggerHeader}>
            <TouchableOpacity onPress={() => setIsLoggingSession(false)}>
              <Ionicons name="close" size={24} color={Colors.text} />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.loggerTitle}>{currentDay?.dayName}</Text>
              <Text style={styles.loggerSubtitle}>Live Performance Logging</Text>
            </View>
            <TouchableOpacity onPress={finishWorkoutSession} disabled={savingLog}>
              <Text style={styles.doneBtnText}>Finish</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: Spacing.md }}>
            {currentDay?.exercises?.map((ex, exIdx) => {
              const setsForEx = activeSets.filter((s) => s.exerciseId === ex.exerciseId);

              return (
                <View key={ex.id || exIdx} style={styles.logExCard}>
                  <Text style={styles.logExName}>
                    {exIdx + 1}. {ex.exercise?.name}
                  </Text>

                  {/* Table Header */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.colHeader, { width: 40 }]}>SET</Text>
                    <Text style={[styles.colHeader, { flex: 1 }]}>KG</Text>
                    <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
                    <Text style={[styles.colHeader, { width: 50 }]}>RPE</Text>
                    <Text style={[styles.colHeader, { width: 40 }]}>DONE</Text>
                  </View>

                  {setsForEx.map((s) => (
                    <View
                      key={s.setNumber}
                      style={[styles.tableRow, s.completed ? styles.tableRowDone : null]}
                    >
                      <Text style={[styles.setNumText, { width: 40 }]}>{s.setNumber}</Text>

                      {/* Weight Input */}
                      <TextInput
                        value={s.weightKg}
                        onChangeText={(val) => updateSetValue(s.exerciseId, s.setNumber, 'weightKg', val)}
                        keyboardType="decimal-pad"
                        style={styles.tableInput}
                      />

                      {/* Reps Input */}
                      <TextInput
                        value={s.repsCompleted}
                        onChangeText={(val) => updateSetValue(s.exerciseId, s.setNumber, 'repsCompleted', val)}
                        keyboardType="number-pad"
                        style={styles.tableInput}
                      />

                      {/* RPE Rating Input */}
                      <TextInput
                        value={String(s.rpeRating)}
                        onChangeText={(val) => updateSetValue(s.exerciseId, s.setNumber, 'rpeRating', parseInt(val) || 8)}
                        keyboardType="number-pad"
                        style={[styles.tableInput, { width: 45 }]}
                      />

                      {/* Checkbox */}
                      <TouchableOpacity
                        onPress={() => toggleSetCompleted(s.exerciseId, s.setNumber)}
                        style={[styles.checkBtn, s.completed ? styles.checkBtnActive : null]}
                      >
                        <Ionicons
                          name={s.completed ? 'checkmark' : 'ellipse-outline'}
                          size={18}
                          color={s.completed ? '#0B0F19' : Colors.textMuted}
                        />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              );
            })}

            <Button
              title="Complete & Save Workout Session"
              onPress={finishWorkoutSession}
              loading={savingLog}
              size="lg"
              style={{ marginTop: Spacing.lg, marginBottom: Spacing.xl }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  headerSubtitle: {
    ...Typography.tiny,
    color: Colors.purple,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  headerTitle: {
    ...Typography.title2,
    color: Colors.text,
  },
  startBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 8,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  startBtnText: {
    ...Typography.captionBold,
    color: '#0B0F19',
  },
  dayTabsContainer: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs,
    gap: Spacing.xs + 2,
  },
  dayTab: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: 'center',
  },
  dayTabActive: {
    backgroundColor: Colors.purpleMuted,
    borderColor: Colors.purple,
  },
  dayTabNum: {
    ...Typography.tiny,
    color: Colors.textMuted,
    fontWeight: '600',
  },
  dayTabNumActive: {
    color: Colors.purple,
  },
  dayTabName: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  dayTabNameActive: {
    color: Colors.text,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  dayCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  dayCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  sessionTitle: {
    ...Typography.title3,
    color: Colors.text,
  },
  sessionMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  restBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  restBadgeText: {
    ...Typography.tiny,
    color: Colors.primary,
    fontWeight: '800',
  },
  quickStartBtn: {
    padding: Spacing.xs,
  },
  restDayCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.xl,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  restDayTitle: {
    ...Typography.title2,
    color: Colors.text,
  },
  restDayDesc: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    lineHeight: 22,
  },
  exercisesList: {
    gap: Spacing.sm,
  },
  exerciseCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  exHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  orderBadge: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  orderText: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  exName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  exTarget: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  restTimeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.sm,
    gap: 2,
  },
  restTimeText: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
  instructionsBox: {
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  instructionsText: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    lineHeight: 16,
  },
  loggerModal: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  loggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  loggerTitle: {
    ...Typography.title3,
    color: Colors.text,
  },
  loggerSubtitle: {
    ...Typography.tiny,
    color: Colors.purple,
  },
  doneBtnText: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  logExCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logExName: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: Spacing.xs,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    gap: Spacing.xs,
  },
  colHeader: {
    ...Typography.tiny,
    color: Colors.textMuted,
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.xs,
    gap: Spacing.xs,
  },
  tableRowDone: {
    opacity: 0.6,
  },
  setNumText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    textAlign: 'center',
  },
  tableInput: {
    flex: 1,
    height: 36,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.sm,
    color: Colors.text,
    textAlign: 'center',
    fontSize: 15,
    fontWeight: '600',
  },
  checkBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkBtnActive: {
    backgroundColor: Colors.primary,
  },
});
