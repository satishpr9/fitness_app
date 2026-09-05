import React, { useCallback, useMemo, useState } from 'react';
import {
  ActivityIndicator,
  Image,
  Modal,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Defs, LinearGradient as SvgLinearGradient, Stop, Rect, Circle } from 'react-native-svg';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { workoutsApi } from '../../src/api';
import { WorkoutDay, WorkoutPlan } from '../../src/types';
import { Button } from '../../src/components/Button';
import { useAuth } from '../../src/context/AuthContext';
import {
  Exercise3DGuideModal,
  EXERCISE_3D_ASSETS,
} from '../../src/components/Exercise3DGuideModal';

interface ActiveSetState {
  exerciseId: string;
  setNumber: number;
  weightKg: string;
  repsCompleted: string;
  rpeRating: number;
  completed: boolean;
}

// Default structured workout plan
const DEFAULT_WORKOUT_PLAN: WorkoutPlan = {
  id: 'starter-plan-1',
  name: 'Strength Workout',
  description: 'Full body muscle builder with optimal volume and progressive overload',
  durationWeeks: 6,
  difficulty: 'Intermediate',
  goal: 'Full Body Strength',
  status: 'ACTIVE',
  createdAt: new Date().toISOString(),
  days: [
    {
      id: 'd1',
      dayNumber: 1,
      dayName: 'Full Body Strength',
      isRestDay: false,
      targetDurationMinutes: 45,
      exercises: [
        {
          id: 'de_goblet',
          exerciseId: 'ex_goblet',
          exercise: { id: 'ex_goblet', name: 'Goblet Squat', muscleGroup: 'LEGS', equipment: 'DUMBBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Hold dumbbell at chest level', 'Descend to parallel with vertical chest', 'Drive through mid-foot to stand'], isGlobal: true },
          orderInDay: 1,
          sets: 3,
          reps: 12,
          targetWeightKg: 20,
          restTimeSeconds: 60,
        },
        {
          id: 'de_pushups',
          exerciseId: 'ex_pushups',
          exercise: { id: 'ex_pushups', name: 'Push-ups', muscleGroup: 'CHEST', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', category: 'STRENGTH', instructions: ['Place hands shoulder-width apart', 'Lower chest to floor with elbows at 45 degrees', 'Press explosively back up'], isGlobal: true },
          orderInDay: 2,
          sets: 3,
          reps: 12,
          targetWeightKg: 0,
          restTimeSeconds: 60,
        },
        {
          id: 'de_row',
          exerciseId: 'ex_row',
          exercise: { id: 'ex_row', name: 'Dumbbell Row', muscleGroup: 'BACK', equipment: 'DUMBBELL', difficulty: 'INTERMEDIATE', category: 'HYPERTROPHY', instructions: ['Support knee and hand on flat bench', 'Pull dumbbell to hip while squeezing lat', 'Lower with controlled eccentric'], isGlobal: true },
          orderInDay: 3,
          sets: 3,
          reps: 12,
          targetWeightKg: 22,
          restTimeSeconds: 60,
        },
        {
          id: 'de_lunges',
          exerciseId: 'ex_lunges',
          exercise: { id: 'ex_lunges', name: 'Reverse Lunges', muscleGroup: 'LEGS', equipment: 'DUMBBELL', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Step backward into lunge until both knees reach 90 degrees', 'Push through front heel to return'], isGlobal: true },
          orderInDay: 4,
          sets: 3,
          reps: 12,
          targetWeightKg: 14,
          restTimeSeconds: 60,
        },
        {
          id: 'de_plank',
          exerciseId: 'ex_plank',
          exercise: { id: 'ex_plank', name: 'Plank Hold', muscleGroup: 'CORE', equipment: 'BODYWEIGHT', difficulty: 'BEGINNER', category: 'ENDURANCE', instructions: ['Hold rigid forearm bridge from head to heels', 'Brace core 360 degrees and breathe steadily'], isGlobal: true },
          orderInDay: 5,
          sets: 3,
          reps: 1,
          durationSeconds: 45,
          restTimeSeconds: 45,
        },
        {
          id: 'de_bench',
          exerciseId: 'ex_bench',
          exercise: { id: 'ex_bench', name: 'Barbell Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Lower bar to mid chest with control', 'Press explosively to lockout'], isGlobal: true },
          orderInDay: 6,
          sets: 3,
          reps: 10,
          targetWeightKg: 60,
          restTimeSeconds: 90,
        },
        {
          id: 'de_lat',
          exerciseId: 'ex_lat',
          exercise: { id: 'ex_lat', name: 'Lat Pulldown', muscleGroup: 'BACK', equipment: 'CABLE', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Pull bar smoothly to upper chest', 'Squeeze lats for 1 second at bottom'], isGlobal: true },
          orderInDay: 7,
          sets: 3,
          reps: 10,
          targetWeightKg: 45,
          restTimeSeconds: 60,
        },
        {
          id: 'de_ohp',
          exerciseId: 'ex_ohp',
          exercise: { id: 'ex_ohp', name: 'Overhead Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'BARBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Press bar vertically overhead to full lockout', 'Brace glutes and core to protect spine'], isGlobal: true },
          orderInDay: 8,
          sets: 3,
          reps: 10,
          targetWeightKg: 35,
          restTimeSeconds: 60,
        },
      ],
    },
    {
      id: 'd2',
      dayNumber: 2,
      dayName: 'Chest & Triceps Power',
      isRestDay: false,
      targetDurationMinutes: 50,
      exercises: [
        {
          id: 'de1',
          exerciseId: 'ex1',
          exercise: { id: 'ex1', name: 'Barbell Bench Press', muscleGroup: 'CHEST', equipment: 'BARBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Lower bar to mid chest with control', 'Press explosively to lockout'], isGlobal: true },
          orderInDay: 1,
          sets: 4,
          reps: 8,
          targetWeightKg: 65,
          restTimeSeconds: 90,
        },
        {
          id: 'de2',
          exerciseId: 'ex2',
          exercise: { id: 'ex2', name: 'Incline Dumbbell Press', muscleGroup: 'CHEST', equipment: 'DUMBBELL', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Set bench to 30 degrees', 'Press dumbbells with neutral wrist'], isGlobal: true },
          orderInDay: 2,
          sets: 3,
          reps: 10,
          targetWeightKg: 22,
          restTimeSeconds: 60,
        },
        {
          id: 'de3',
          exerciseId: 'ex3',
          exercise: { id: 'ex3', name: 'Triceps Rope Pushdown', muscleGroup: 'TRICEPS', equipment: 'CABLE', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Extend arms fully downward', 'Spread rope at contraction'], isGlobal: true },
          orderInDay: 3,
          sets: 3,
          reps: 12,
          targetWeightKg: 18,
          restTimeSeconds: 60,
        },
      ],
    },
    {
      id: 'd3',
      dayNumber: 3,
      dayName: 'Back & Biceps Thickness',
      isRestDay: false,
      targetDurationMinutes: 50,
      exercises: [
        {
          id: 'de4',
          exerciseId: 'ex4',
          exercise: { id: 'ex4', name: 'Barbell Deadlift', muscleGroup: 'BACK', equipment: 'BARBELL', difficulty: 'ADVANCED', category: 'STRENGTH', instructions: ['Keep spine neutral and chest up', 'Drive heels into the floor'], isGlobal: true },
          orderInDay: 1,
          sets: 4,
          reps: 6,
          targetWeightKg: 90,
          restTimeSeconds: 120,
        },
        {
          id: 'de5',
          exerciseId: 'ex5',
          exercise: { id: 'ex5', name: 'Lat Pulldown', muscleGroup: 'BACK', equipment: 'CABLE', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Pull bar down to upper chest', 'Squeeze lats for 1 second'], isGlobal: true },
          orderInDay: 2,
          sets: 3,
          reps: 10,
          targetWeightKg: 50,
          restTimeSeconds: 60,
        },
        {
          id: 'de6',
          exerciseId: 'ex6',
          exercise: { id: 'ex6', name: 'Barbell Biceps Curl', muscleGroup: 'BICEPS', equipment: 'BARBELL', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Keep elbows pinned to your sides', 'Curl bar up to chest level'], isGlobal: true },
          orderInDay: 3,
          sets: 3,
          reps: 12,
          targetWeightKg: 20,
          restTimeSeconds: 60,
        },
      ],
    },
    {
      id: 'd4',
      dayNumber: 4,
      dayName: 'Legs & Shoulders Hypertrophy',
      isRestDay: false,
      targetDurationMinutes: 55,
      exercises: [
        {
          id: 'de8',
          exerciseId: 'ex8',
          exercise: { id: 'ex8', name: 'Barbell Back Squat', muscleGroup: 'LEGS', equipment: 'BARBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Squat to parallel depth', 'Drive up while maintaining vertical torso'], isGlobal: true },
          orderInDay: 1,
          sets: 4,
          reps: 8,
          targetWeightKg: 75,
          restTimeSeconds: 90,
        },
        {
          id: 'de9',
          exerciseId: 'ex9',
          exercise: { id: 'ex9', name: 'Leg Press', muscleGroup: 'LEGS', equipment: 'MACHINE', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Lower sled until knees reach 90 degrees', 'Press without locking knees'], isGlobal: true },
          orderInDay: 2,
          sets: 3,
          reps: 10,
          targetWeightKg: 110,
          restTimeSeconds: 75,
        },
        {
          id: 'de10',
          exerciseId: 'ex10',
          exercise: { id: 'ex10', name: 'Overhead Shoulder Press', muscleGroup: 'SHOULDERS', equipment: 'BARBELL', difficulty: 'INTERMEDIATE', category: 'STRENGTH', instructions: ['Press bar directly overhead', 'Lock out elbows at peak'], isGlobal: true },
          orderInDay: 3,
          sets: 3,
          reps: 10,
          targetWeightKg: 35,
          restTimeSeconds: 60,
        },
        {
          id: 'de11',
          exerciseId: 'ex11',
          exercise: { id: 'ex11', name: 'Lateral Raises', muscleGroup: 'SHOULDERS', equipment: 'DUMBBELL', difficulty: 'BEGINNER', category: 'HYPERTROPHY', instructions: ['Raise arms to shoulder height', 'Lower with 2-second eccentric'], isGlobal: true },
          orderInDay: 4,
          sets: 3,
          reps: 15,
          targetWeightKg: 8,
          restTimeSeconds: 45,
        },
      ],
    },
  ],
};

export default function WorkoutScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const { width } = useWindowDimensions();

  const [activePlan, setActivePlan] = useState<WorkoutPlan>(DEFAULT_WORKOUT_PLAN);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [selectedMuscleFilter, setSelectedMuscleFilter] = useState<string>('ALL');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Completed exercise tracking
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([
    'ex_goblet',
    'ex_pushups',
    'ex_bench',
  ]);

  // Live Workout Session Modal state
  const [isLoggingSession, setIsLoggingSession] = useState(false);
  const [activeSets, setActiveSets] = useState<ActiveSetState[]>([]);
  const [savingLog, setSavingLog] = useState(false);

  // 3D Visual Step-by-Step Guide Modal
  const [guideExercise, setGuideExercise] = useState<{ name: string; muscleGroup?: string } | null>(null);

  const fetchWorkouts = async () => {
    try {
      const res = (await workoutsApi.getWorkoutPlans()) as unknown as any;
      const items: WorkoutPlan[] = Array.isArray(res) ? res : res?.items || [];

      let active = items.find((p) => p.status === 'ACTIVE') || items[0] || null;

      if (active && (!active.days || active.days.length === 0)) {
        try {
          const detailed = (await workoutsApi.getWorkoutPlan(active.id)) as unknown as WorkoutPlan;
          if (detailed && detailed.days && detailed.days.length > 0) {
            active = detailed;
          }
        } catch {
          // Keep active
        }
      }

      if (active && active.days && active.days.length > 0) {
        setActivePlan(active);
      } else {
        setActivePlan(DEFAULT_WORKOUT_PLAN);
      }
    } catch {
      setActivePlan(DEFAULT_WORKOUT_PLAN);
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

  // Exercises list for current day
  const allDayExercises = useMemo(() => currentDay?.exercises || [], [currentDay]);
  const totalCount = allDayExercises.length;
  const completedCount = useMemo(() => {
    return allDayExercises.filter((e) => completedExerciseIds.includes(e.exerciseId || e.id)).length;
  }, [allDayExercises, completedExerciseIds]);

  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  // Muscle groups present today for clean filter tabs
  const availableMuscles = useMemo(() => {
    const set = new Set<string>();
    allDayExercises.forEach((item) => {
      if (item.exercise?.muscleGroup) {
        set.add(item.exercise.muscleGroup.toUpperCase());
      }
    });
    return Array.from(set);
  }, [allDayExercises]);

  // Filtered exercises based on selected muscle group
  const displayedExercises = useMemo(() => {
    if (selectedMuscleFilter === 'ALL') return allDayExercises;
    return allDayExercises.filter(
      (item) => item.exercise?.muscleGroup?.toUpperCase() === selectedMuscleFilter,
    );
  }, [allDayExercises, selectedMuscleFilter]);

  // Next up exercise ID (the first uncompleted exercise)
  const nextUpExerciseId = useMemo(() => {
    const uncompleted = allDayExercises.find((e) => !completedExerciseIds.includes(e.exerciseId || e.id));
    return uncompleted ? uncompleted.exerciseId || uncompleted.id : null;
  }, [allDayExercises, completedExerciseIds]);

  const toggleExerciseCompleted = (exId: string) => {
    setCompletedExerciseIds((prev) =>
      prev.includes(exId) ? prev.filter((id) => id !== exId) : [...prev, exId],
    );
  };

  const startLoggingSession = () => {
    if (!currentDay || currentDay.isRestDay) return;

    const initialSets: ActiveSetState[] = [];
    currentDay.exercises.forEach((ex) => {
      for (let s = 1; s <= ex.sets; s++) {
        initialSets.push({
          exerciseId: ex.exerciseId,
          setNumber: s,
          weightKg: String(ex.targetWeightKg || 20),
          repsCompleted: String(ex.reps || 10),
          rpeRating: 8,
          completed: completedExerciseIds.includes(ex.exerciseId),
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
        <ActivityIndicator size="large" color="#B5FF14" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea} edges={['top']}>
      {/* 1. Sleek Top Navigation Header */}
      <View style={styles.headerBar}>
        <View style={styles.brandRow}>
          <View style={styles.brandLogoBox}>
            <Ionicons name="flash" size={16} color="#0B0F19" />
          </View>
          <View>
            <Text style={styles.brandTitle}>
              PULSE<Text style={{ color: '#B5FF14' }}>FIT</Text>
            </Text>
            <Text style={styles.brandSubtitle}>
              {activePlan?.name || 'Workout Program'}
            </Text>
          </View>
        </View>

        <View style={styles.headerRightButtons}>
          <TouchableOpacity
            style={styles.headerIconBtn}
            onPress={() => {
              setRefreshing(true);
              fetchWorkouts();
            }}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          >
            <Ionicons name="refresh" size={18} color="#94A3B8" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.avatarPill}
            onPress={() => router.push('/(tabs)/profile')}
          >
            <Image
              source={
                user?.avatarUrl
                  ? { uri: user.avatarUrl }
                  : require('../../assets/exercises/hero_workout_card.jpg')
              }
              style={styles.avatarThumb}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* 2. Modern Segmented Day Selector Bar */}
      <View style={styles.daySelectorWrapper}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.daySelectorScroll}
        >
          {activePlan?.days?.map((day, idx) => {
            const isSelected = selectedDayIndex === idx;
            // Count completed for that day if selected
            const isFinished =
              isSelected && totalCount > 0 && completedCount === totalCount;

            return (
              <TouchableOpacity
                key={day.id || idx}
                activeOpacity={0.8}
                onPress={() => {
                  setSelectedDayIndex(idx);
                  setSelectedMuscleFilter('ALL');
                }}
                style={[
                  styles.dayChip,
                  isSelected ? styles.dayChipActive : styles.dayChipInactive,
                ]}
              >
                <View style={styles.dayChipTopRow}>
                  <Text
                    style={[
                      styles.dayChipNumber,
                      isSelected ? styles.dayChipNumberActive : null,
                    ]}
                  >
                    Day {day.dayNumber || idx + 1}
                  </Text>
                  {isFinished ? (
                    <Ionicons name="checkmark-circle" size={12} color="#B5FF14" />
                  ) : isSelected ? (
                    <View style={styles.dayActiveDot} />
                  ) : null}
                </View>

                <Text
                  style={[
                    styles.dayChipLabel,
                    isSelected ? styles.dayChipLabelActive : null,
                  ]}
                  numberOfLines={1}
                >
                  {day.dayName.split(' ')[0]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Scrollable View */}
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.mainScroll}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={() => {
              setRefreshing(true);
              fetchWorkouts();
            }}
            tintColor="#B5FF14"
          />
        }
      >
        {/* 3. High-Impact Clean Hero Overview Card */}
        {currentDay && !currentDay.isRestDay ? (
          <View style={styles.heroBanner}>
            {/* Background Athlete Artwork */}
            <Image
              source={require('../../assets/exercises/hero_workout_card.jpg')}
              style={styles.heroBannerImage}
              resizeMode="cover"
            />

            {/* Gradient Dark Vignette */}
            <Svg style={StyleSheet.absoluteFill}>
              <Defs>
                <SvgLinearGradient id="heroGrad" x1="0" y1="0" x2="1" y2="1">
                  <Stop offset="0%" stopColor="#0B0F19" stopOpacity="0.82" />
                  <Stop offset="50%" stopColor="#0B0F19" stopOpacity="0.70" />
                  <Stop offset="100%" stopColor="#0B0F19" stopOpacity="0.94" />
                </SvgLinearGradient>
              </Defs>
              <Rect width="100%" height="100%" fill="url(#heroGrad)" />
            </Svg>

            <View style={styles.heroBannerContent}>
              {/* Top Tag & Difficulty */}
              <View style={styles.heroTopMetaRow}>
                <View style={styles.heroTagBadge}>
                  <Text style={styles.heroTagBadgeText}>
                    WEEK 1 • DAY {currentDay.dayNumber || selectedDayIndex + 1}
                  </Text>
                </View>
                <View style={styles.heroDifficultyBadge}>
                  <Ionicons name="stats-chart" size={11} color="#B5FF14" />
                  <Text style={styles.heroDifficultyText}>
                    {activePlan?.difficulty || 'Intermediate'}
                  </Text>
                </View>
              </View>

              {/* Day Routine Title */}
              <Text style={styles.heroMainTitle} numberOfLines={2}>
                {currentDay.dayName}
              </Text>

              {/* 3 Clean Metric Badges */}
              <View style={styles.metricBadgesRow}>
                <View style={styles.metricItem}>
                  <Ionicons name="time-outline" size={14} color="#B5FF14" />
                  <Text style={styles.metricValue}>
                    {currentDay.targetDurationMinutes || 45} <Text style={styles.metricUnit}>min</Text>
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Ionicons name="flame" size={14} color="#FF7A00" />
                  <Text style={styles.metricValue}>
                    320 <Text style={styles.metricUnit}>kcal</Text>
                  </Text>
                </View>

                <View style={styles.metricDivider} />

                <View style={styles.metricItem}>
                  <Ionicons name="barbell-outline" size={14} color="#38BDF8" />
                  <Text style={styles.metricValue}>
                    {totalCount} <Text style={styles.metricUnit}>moves</Text>
                  </Text>
                </View>
              </View>

              {/* Integrated Progress Bar */}
              <View style={styles.heroProgressSection}>
                <View style={styles.heroProgressLabels}>
                  <Text style={styles.heroProgressSummary}>
                    {completedCount} of {totalCount} completed
                  </Text>
                  <Text style={styles.heroProgressPercent}>{completionPercentage}%</Text>
                </View>
                <View style={styles.progressTrack}>
                  <View
                    style={[
                      styles.progressFill,
                      { width: `${Math.max(completionPercentage, 4)}%` },
                    ]}
                  />
                </View>
              </View>

              {/* Start / Resume Session Button */}
              <TouchableOpacity
                activeOpacity={0.88}
                onPress={startLoggingSession}
                style={styles.startSessionButton}
              >
                <Ionicons name="play" size={16} color="#0B0F19" />
                <Text style={styles.startSessionButtonText}>
                  {completedCount > 0 && completedCount < totalCount
                    ? 'Resume Workout Session'
                    : 'Start Workout Session'}
                </Text>
                <Ionicons name="chevron-forward" size={16} color="#0B0F19" />
              </TouchableOpacity>
            </View>
          </View>
        ) : null}

        {/* Rest Day State */}
        {currentDay && currentDay.isRestDay ? (
          <View style={styles.restDayCard}>
            <View style={styles.restDayIconBox}>
              <Ionicons name="leaf-outline" size={36} color="#38BDF8" />
            </View>
            <Text style={styles.restDayTitle}>Active Recovery Day</Text>
            <Text style={styles.restDayBody}>
              Rest and recovery is when muscle protein synthesis occurs. Focus on
              hydration, light stretching, and hitting your target macros today.
            </Text>
            <View style={styles.recoveryTipBox}>
              <Ionicons name="water" size={18} color="#38BDF8" />
              <Text style={styles.recoveryTipText}>
                Aim for at least 2.5L of clean water and 8 hours of sleep.
              </Text>
            </View>
          </View>
        ) : null}

        {/* 4. Filter Tabs & Exercise List Section */}
        {currentDay && !currentDay.isRestDay ? (
          <View style={styles.exercisesSection}>
            {/* Section Header with count */}
            <View style={styles.sectionHeaderRow}>
              <View>
                <Text style={styles.sectionHeading}>Exercise Routine</Text>
                <Text style={styles.sectionSub}>
                  Tap 3D Form button to learn proper biomechanics
                </Text>
              </View>
            </View>

            {/* Muscle Group Filter Chips */}
            {availableMuscles.length > 1 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.filterRow}
              >
                <TouchableOpacity
                  onPress={() => setSelectedMuscleFilter('ALL')}
                  style={[
                    styles.filterChip,
                    selectedMuscleFilter === 'ALL' ? styles.filterChipActive : null,
                  ]}
                >
                  <Text
                    style={[
                      styles.filterChipText,
                      selectedMuscleFilter === 'ALL' ? styles.filterChipTextActive : null,
                    ]}
                  >
                    All ({allDayExercises.length})
                  </Text>
                </TouchableOpacity>

                {availableMuscles.map((muscle) => {
                  const count = allDayExercises.filter(
                    (e) => e.exercise?.muscleGroup?.toUpperCase() === muscle,
                  ).length;
                  const isActive = selectedMuscleFilter === muscle;
                  return (
                    <TouchableOpacity
                      key={muscle}
                      onPress={() => setSelectedMuscleFilter(muscle)}
                      style={[styles.filterChip, isActive ? styles.filterChipActive : null]}
                    >
                      <Text
                        style={[
                          styles.filterChipText,
                          isActive ? styles.filterChipTextActive : null,
                        ]}
                      >
                        {muscle} ({count})
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>
            )}

            {/* Clean Exercise Cards List */}
            <View style={styles.cardsStack}>
              {displayedExercises.map((item, index) => {
                const exId = item.exerciseId || item.id;
                const isCompleted = completedExerciseIds.includes(exId);
                const isNextUp = nextUpExerciseId === exId;
                const imageSource =
                  EXERCISE_3D_ASSETS[item.exercise?.name || ''] ||
                  EXERCISE_3D_ASSETS['Goblet Squat'] ||
                  EXERCISE_3D_ASSETS['Barbell Back Squat'];

                return (
                  <View
                    key={item.id || index}
                    style={[
                      styles.cleanCard,
                      isCompleted ? styles.cleanCardCompleted : null,
                      isNextUp && !isCompleted ? styles.cleanCardNextUp : null,
                    ]}
                  >
                    {/* Left 3D Thumbnail with overlay */}
                    <TouchableOpacity
                      activeOpacity={0.85}
                      onPress={() =>
                        setGuideExercise({
                          name: item.exercise?.name || 'Exercise',
                          muscleGroup: item.exercise?.muscleGroup,
                        })
                      }
                      style={styles.thumbWrapper}
                    >
                      <Image
                        source={imageSource}
                        style={styles.exerciseImage}
                        resizeMode="cover"
                      />
                      <View style={styles.thumb3DBadge}>
                        <Ionicons name="cube-outline" size={10} color="#00E5FF" />
                        <Text style={styles.thumb3DText}>3D</Text>
                      </View>
                    </TouchableOpacity>

                    {/* Middle Info Column */}
                    <TouchableOpacity
                      activeOpacity={0.7}
                      onPress={() =>
                        setGuideExercise({
                          name: item.exercise?.name || 'Exercise',
                          muscleGroup: item.exercise?.muscleGroup,
                        })
                      }
                      style={styles.cardInfo}
                    >
                      {/* Muscle & Next Up Badges */}
                      <View style={styles.cardBadgesRow}>
                        <View style={styles.muscleBadge}>
                          <Text style={styles.muscleBadgeText}>
                            {item.exercise?.muscleGroup || 'STRENGTH'}
                          </Text>
                        </View>
                        {isNextUp && !isCompleted && (
                          <View style={styles.nextUpPill}>
                            <Text style={styles.nextUpPillText}>Next up</Text>
                          </View>
                        )}
                      </View>

                      {/* Title */}
                      <Text style={styles.cardTitle} numberOfLines={1}>
                        {item.exercise?.name}
                      </Text>

                      {/* Reps & Sets Details */}
                      <View style={styles.cardSpecsRow}>
                        <Text style={styles.cardSpecHighlight}>
                          {item.sets} Sets
                        </Text>
                        <Text style={styles.cardSpecDot}>•</Text>
                        <Text style={styles.cardSpecMuted}>
                          {item.durationSeconds
                            ? `${item.durationSeconds}s hold`
                            : `${item.reps || 12} reps`}
                        </Text>
                        {!!item.targetWeightKg && item.targetWeightKg > 0 && (
                          <>
                            <Text style={styles.cardSpecDot}>•</Text>
                            <Text style={styles.cardSpecMuted}>{item.targetWeightKg} kg</Text>
                          </>
                        )}
                      </View>
                    </TouchableOpacity>

                    {/* Right Interactive Actions */}
                    <View style={styles.cardRightActions}>
                      {/* Quick 3D Form Modal trigger */}
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() =>
                          setGuideExercise({
                            name: item.exercise?.name || 'Exercise',
                            muscleGroup: item.exercise?.muscleGroup,
                          })
                        }
                        style={styles.form3DBtn}
                      >
                        <Ionicons name="eye-outline" size={15} color="#38BDF8" />
                        <Text style={styles.form3DBtnText}>Form</Text>
                      </TouchableOpacity>

                      {/* Completion Toggle Circle */}
                      <TouchableOpacity
                        activeOpacity={0.75}
                        onPress={() => toggleExerciseCompleted(exId)}
                        style={[
                          styles.checkTarget,
                          isCompleted ? styles.checkTargetCompleted : null,
                        ]}
                      >
                        <Ionicons
                          name={isCompleted ? 'checkmark' : 'checkmark-outline'}
                          size={18}
                          color={isCompleted ? '#0B0F19' : '#64748B'}
                        />
                      </TouchableOpacity>
                    </View>
                  </View>
                );
              })}
            </View>
          </View>
        ) : null}

        {/* Empty State when no days exist */}
        {!currentDay && (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="barbell-outline" size={42} color="#B5FF14" />
            </View>
            <Text style={styles.emptyTitle}>Ready to Train?</Text>
            <Text style={styles.emptySubtitle}>
              Your personalized strength and conditioning routine is ready to begin.
            </Text>
            <TouchableOpacity onPress={fetchWorkouts} style={styles.emptyBtn}>
              <Ionicons name="refresh" size={18} color="#0B0F19" />
              <Text style={styles.emptyBtnText}>Load Workout Routine</Text>
            </TouchableOpacity>
          </View>
        )}
      </ScrollView>

      {/* 5. Live Workout Logging Modal */}
      <Modal visible={isLoggingSession} animationType="slide">
        <SafeAreaView style={styles.loggerModal}>
          <View style={styles.loggerHeader}>
            <TouchableOpacity
              onPress={() => setIsLoggingSession(false)}
              style={styles.loggerCloseBtn}
            >
              <Ionicons name="close" size={22} color="#FFFFFF" />
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.loggerTitle}>{currentDay?.dayName}</Text>
              <Text style={styles.loggerSubtitle}>Live Performance Logging</Text>
            </View>
            <TouchableOpacity onPress={finishWorkoutSession} disabled={savingLog}>
              <Text style={styles.loggerDoneText}>Finish</Text>
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={{ padding: 16 }}>
            {currentDay?.exercises?.map((ex, exIdx) => {
              const setsForEx = activeSets.filter((s) => s.exerciseId === ex.exerciseId);

              return (
                <View key={ex.id || exIdx} style={styles.logExCard}>
                  <View style={styles.logExHeaderRow}>
                    <Text style={styles.logExName}>
                      {exIdx + 1}. {ex.exercise?.name}
                    </Text>
                    <TouchableOpacity
                      onPress={() =>
                        setGuideExercise({
                          name: ex.exercise?.name || 'Exercise',
                          muscleGroup: ex.exercise?.muscleGroup,
                        })
                      }
                      style={styles.mini3DBtn}
                    >
                      <Ionicons name="cube-outline" size={13} color="#00E5FF" />
                      <Text style={styles.mini3DBtnText}>3D Form</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Table Column Headers */}
                  <View style={styles.tableHeader}>
                    <Text style={[styles.colHeader, { width: 44 }]}>SET</Text>
                    <Text style={[styles.colHeader, { flex: 1 }]}>KG</Text>
                    <Text style={[styles.colHeader, { flex: 1 }]}>REPS</Text>
                    <Text style={[styles.colHeader, { width: 50 }]}>RPE</Text>
                    <Text style={[styles.colHeader, { width: 44 }]}>DONE</Text>
                  </View>

                  {setsForEx.map((s) => (
                    <View
                      key={s.setNumber}
                      style={[styles.tableRow, s.completed ? styles.tableRowDone : null]}
                    >
                      <Text style={[styles.setNumText, { width: 44 }]}>{s.setNumber}</Text>

                      <TextInput
                        value={s.weightKg}
                        onChangeText={(val) =>
                          updateSetValue(s.exerciseId, s.setNumber, 'weightKg', val)
                        }
                        keyboardType="decimal-pad"
                        style={styles.tableInput}
                      />

                      <TextInput
                        value={s.repsCompleted}
                        onChangeText={(val) =>
                          updateSetValue(s.exerciseId, s.setNumber, 'repsCompleted', val)
                        }
                        keyboardType="number-pad"
                        style={styles.tableInput}
                      />

                      <TextInput
                        value={String(s.rpeRating)}
                        onChangeText={(val) =>
                          updateSetValue(
                            s.exerciseId,
                            s.setNumber,
                            'rpeRating',
                            parseInt(val) || 8,
                          )
                        }
                        keyboardType="number-pad"
                        style={[styles.tableInput, { width: 50 }]}
                      />

                      <TouchableOpacity
                        onPress={() => toggleSetCompleted(s.exerciseId, s.setNumber)}
                        style={[styles.setCheckBtn, s.completed ? styles.setCheckBtnActive : null]}
                      >
                        <Ionicons
                          name={s.completed ? 'checkmark' : 'ellipse-outline'}
                          size={18}
                          color={s.completed ? '#0B0F19' : '#64748B'}
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
              style={{ marginTop: 16, marginBottom: 40 }}
            />
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* 6. Interactive 3D Step-by-Step Anatomical Guide */}
      <Exercise3DGuideModal
        visible={!!guideExercise}
        exerciseName={guideExercise?.name || ''}
        muscleGroup={guideExercise?.muscleGroup}
        onClose={() => setGuideExercise(null)}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },

  // 1. Sleek Top Bar
  headerBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 10,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  brandLogoBox: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#B5FF14',
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  brandSubtitle: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '500',
  },
  headerRightButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: '#151D2F',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  avatarPill: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#B5FF14',
  },
  avatarThumb: {
    width: '100%',
    height: '100%',
  },

  // 2. Modern Segmented Day Selector Bar
  daySelectorWrapper: {
    paddingVertical: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.05)',
  },
  daySelectorScroll: {
    paddingHorizontal: 16,
    gap: 8,
  },
  dayChip: {
    width: 80,
    paddingVertical: 8,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#121826',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
    justifyContent: 'center',
  },
  dayChipActive: {
    backgroundColor: '#192236',
    borderColor: '#B5FF14',
  },
  dayChipInactive: {},
  dayChipTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 2,
  },
  dayChipNumber: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  dayChipNumberActive: {
    color: '#B5FF14',
  },
  dayActiveDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#B5FF14',
  },
  dayChipLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: '#94A3B8',
  },
  dayChipLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  // Main Scrollable Area
  mainScroll: {
    paddingHorizontal: 16,
    paddingTop: 14,
    paddingBottom: 40,
  },

  // 3. Hero Overview Card
  heroBanner: {
    borderRadius: 20,
    overflow: 'hidden',
    backgroundColor: '#141A28',
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  heroBannerImage: {
    ...StyleSheet.absoluteFillObject,
    opacity: 0.45,
  },
  heroBannerContent: {
    padding: 18,
  },
  heroTopMetaRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  heroTagBadge: {
    backgroundColor: 'rgba(181, 255, 20, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(181, 255, 20, 0.3)',
  },
  heroTagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B5FF14',
    letterSpacing: 0.8,
  },
  heroDifficultyBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: 'rgba(11, 15, 25, 0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  heroDifficultyText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#E2E8F0',
  },
  heroMainTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    lineHeight: 28,
    marginBottom: 12,
  },
  metricBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.75)',
    borderRadius: 12,
    paddingVertical: 8,
    paddingHorizontal: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  metricItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  metricValue: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  metricUnit: {
    fontSize: 11,
    fontWeight: '500',
    color: '#94A3B8',
  },
  metricDivider: {
    width: 1,
    height: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
  },
  heroProgressSection: {
    marginBottom: 14,
  },
  heroProgressLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  heroProgressSummary: {
    fontSize: 12,
    color: '#94A3B8',
    fontWeight: '600',
  },
  heroProgressPercent: {
    fontSize: 12,
    color: '#B5FF14',
    fontWeight: '800',
  },
  progressTrack: {
    height: 6,
    backgroundColor: '#1E293B',
    borderRadius: 3,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#B5FF14',
    borderRadius: 3,
  },
  startSessionButton: {
    backgroundColor: '#B5FF14',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: 46,
    borderRadius: 12,
    gap: 8,
  },
  startSessionButtonText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#0B0F19',
    letterSpacing: 0.3,
  },

  // Rest Day View
  restDayCard: {
    backgroundColor: '#131826',
    borderRadius: 20,
    padding: 24,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
    marginBottom: 20,
  },
  restDayIconBox: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: 'rgba(56, 189, 248, 0.12)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  restDayTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
  },
  restDayBody: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 16,
  },
  recoveryTipBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(56, 189, 248, 0.08)',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.2)',
  },
  recoveryTipText: {
    fontSize: 12,
    color: '#38BDF8',
    fontWeight: '600',
    flexShrink: 1,
  },

  // 4. Exercise Section & Filter
  exercisesSection: {
    marginTop: 4,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  sectionHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.2,
  },
  sectionSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  filterRow: {
    gap: 8,
    marginBottom: 14,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#141A28',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  filterChipActive: {
    backgroundColor: 'rgba(181, 255, 20, 0.12)',
    borderColor: '#B5FF14',
  },
  filterChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#8E9BAE',
  },
  filterChipTextActive: {
    color: '#B5FF14',
    fontWeight: '700',
  },

  // Cards List
  cardsStack: {
    gap: 10,
  },
  cleanCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#131826',
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cleanCardCompleted: {
    borderColor: 'rgba(181, 255, 20, 0.2)',
    backgroundColor: '#121926',
  },
  cleanCardNextUp: {
    borderColor: '#38BDF8',
    backgroundColor: '#131D2E',
  },
  thumbWrapper: {
    width: 60,
    height: 60,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#1C2333',
    marginRight: 12,
    position: 'relative',
  },
  exerciseImage: {
    width: '100%',
    height: '100%',
  },
  thumb3DBadge: {
    position: 'absolute',
    bottom: 3,
    left: 3,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(11, 15, 25, 0.85)',
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 4,
    gap: 2,
    borderWidth: 0.5,
    borderColor: 'rgba(0, 229, 255, 0.4)',
  },
  thumb3DText: {
    fontSize: 8,
    fontWeight: '800',
    color: '#00E5FF',
  },
  cardInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  cardBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  muscleBadge: {
    backgroundColor: '#1C2333',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  muscleBadgeText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#94A3B8',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
  },
  nextUpPill: {
    backgroundColor: '#0284C7',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  nextUpPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  cardTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  cardSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cardSpecHighlight: {
    fontSize: 11,
    fontWeight: '700',
    color: '#B5FF14',
  },
  cardSpecDot: {
    fontSize: 10,
    color: '#475569',
  },
  cardSpecMuted: {
    fontSize: 11,
    color: '#8E9BAE',
    fontWeight: '500',
  },
  cardRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginLeft: 6,
  },
  form3DBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(56, 189, 248, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(56, 189, 248, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    gap: 3,
  },
  form3DBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#38BDF8',
  },
  checkTarget: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1E2536',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  checkTargetCompleted: {
    backgroundColor: '#B5FF14',
    borderColor: '#B5FF14',
  },

  // Empty State
  emptyContainer: {
    padding: 32,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#131826',
    borderRadius: 18,
    marginTop: 20,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  emptyIconBox: {
    width: 72,
    height: 72,
    borderRadius: 36,
    backgroundColor: 'rgba(181, 255, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 6,
    textAlign: 'center',
  },
  emptySubtitle: {
    fontSize: 13,
    color: '#94A3B8',
    textAlign: 'center',
    marginBottom: 20,
    lineHeight: 20,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B5FF14',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 22,
    gap: 6,
  },
  emptyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0F19',
  },

  // 5. Live Workout Logger Modal
  loggerModal: {
    flex: 1,
    backgroundColor: '#0B0F19',
  },
  loggerHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.08)',
  },
  loggerCloseBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loggerTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  loggerSubtitle: {
    fontSize: 11,
    color: '#B5FF14',
    fontWeight: '600',
  },
  loggerDoneText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#B5FF14',
  },
  logExCard: {
    backgroundColor: '#131826',
    borderRadius: 14,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.06)',
  },
  logExHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  logExName: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  mini3DBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    gap: 4,
  },
  mini3DBtnText: {
    color: '#00E5FF',
    fontSize: 11,
    fontWeight: '700',
  },
  tableHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.06)',
    gap: 8,
  },
  colHeader: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '700',
    textAlign: 'center',
  },
  tableRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    gap: 8,
  },
  tableRowDone: {
    opacity: 0.5,
  },
  setNumText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#94A3B8',
    textAlign: 'center',
  },
  tableInput: {
    flex: 1,
    height: 36,
    backgroundColor: '#1A2133',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 8,
    color: '#FFFFFF',
    textAlign: 'center',
    fontSize: 14,
    fontWeight: '600',
  },
  setCheckBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#1A2133',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  setCheckBtnActive: {
    backgroundColor: '#B5FF14',
    borderColor: '#B5FF14',
  },
});
