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
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import Svg, { Circle } from 'react-native-svg';
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

// Circular progress gauge component matching the screenshot
const CircularProgress: React.FC<{ percentage: number; size?: number; strokeWidth?: number }> = ({
  percentage,
  size = 62,
  strokeWidth = 5.5,
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const clamped = Math.min(Math.max(percentage, 0), 100);
  const strokeDashoffset = circumference - (circumference * clamped) / 100;

  return (
    <View style={{ width: size, height: size, justifyContent: 'center', alignItems: 'center' }}>
      <Svg width={size} height={size}>
        {/* Background track circle */}
        <Circle
          stroke="#252C3D"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
        />
        {/* Neon lime progress circle */}
        <Circle
          stroke="#B5FF14"
          fill="none"
          cx={size / 2}
          cy={size / 2}
          r={radius}
          strokeWidth={strokeWidth}
          strokeDasharray={`${circumference} ${circumference}`}
          strokeDashoffset={strokeDashoffset}
          strokeLinecap="round"
          transform={`rotate(-90 ${size / 2} ${size / 2})`}
        />
      </Svg>
      <View style={{ position: 'absolute', alignItems: 'center', justifyContent: 'center' }}>
        <Text style={styles.circularText}>
          {Math.round(clamped)}
          <Text style={styles.circularPercent}>%</Text>
        </Text>
      </View>
    </View>
  );
};

// Default full workout plan matching the exact screenshot design
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

  const [plans, setPlans] = useState<WorkoutPlan[]>([DEFAULT_WORKOUT_PLAN]);
  const [activePlan, setActivePlan] = useState<WorkoutPlan>(DEFAULT_WORKOUT_PLAN);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(0);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Completed exercise IDs to dynamically calculate progress matching the screenshot (3 of 8 completed = ~35%)
  const [completedExerciseIds, setCompletedExerciseIds] = useState<string[]>([
    'ex_goblet',
    'ex_pushups',
    'ex_bench',
  ]);

  // Active Logging Session Modal
  const [isLoggingSession, setIsLoggingSession] = useState(false);
  const [activeSets, setActiveSets] = useState<ActiveSetState[]>([]);
  const [savingLog, setSavingLog] = useState(false);

  // 3D Visual Step-by-Step Guide Modal
  const [guideExercise, setGuideExercise] = useState<{ name: string; muscleGroup?: string } | null>(null);

  const fetchWorkouts = async () => {
    try {
      const res = (await workoutsApi.getWorkoutPlans()) as unknown as any;
      const items: WorkoutPlan[] = Array.isArray(res) ? res : res?.items || [];
      setPlans(items.length > 0 ? items : [DEFAULT_WORKOUT_PLAN]);

      let active = items.find((p) => p.status === 'ACTIVE') || items[0] || null;

      // If active plan has no days populated, fetch detail
      if (active && (!active.days || active.days.length === 0)) {
        try {
          const detailed = (await workoutsApi.getWorkoutPlan(active.id)) as unknown as WorkoutPlan;
          if (detailed && detailed.days && detailed.days.length > 0) {
            active = detailed;
          }
        } catch {
          // Ignore
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
  const exerciseItems = useMemo(() => currentDay?.exercises || [], [currentDay]);
  const totalCount = exerciseItems.length || 8;
  const completedCount = useMemo(() => {
    return exerciseItems.filter((e) => completedExerciseIds.includes(e.exerciseId || e.id)).length;
  }, [exerciseItems, completedExerciseIds]);

  // Dynamic progress percentage matching screenshot (e.g. 3/8 = ~35-37%)
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 35;

  // Next up exercise ID (the first exercise in the list that is NOT yet completed)
  const nextUpExerciseId = useMemo(() => {
    const uncompleted = exerciseItems.find((e) => !completedExerciseIds.includes(e.exerciseId || e.id));
    return uncompleted ? uncompleted.exerciseId || uncompleted.id : null;
  }, [exerciseItems, completedExerciseIds]);

  // Toggle exercise completion
  const toggleExerciseCompleted = (exId: string) => {
    setCompletedExerciseIds((prev) =>
      prev.includes(exId) ? prev.filter((id) => id !== exId) : [...prev, exId],
    );
  };

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
    <SafeAreaView style={styles.safeArea}>
      {/* Top App Bar with Brand & User Avatar matching screenshot */}
      <View style={styles.topAppBar}>
        <TouchableOpacity
          onPress={() => router.canGoBack() ? router.back() : null}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
          style={styles.navBtn}
        >
          <Ionicons name="arrow-back" size={24} color="#FFFFFF" />
        </TouchableOpacity>

        {/* PulseFit Brand Logo */}
        <View style={styles.brandContainer}>
          <Text style={styles.brandPulse}>
            Pulse<Text style={styles.brandFit}>Fit</Text>
          </Text>
        </View>

        {/* Right Actions: More Menu & Avatar */}
        <View style={styles.headerRightActions}>
          <TouchableOpacity style={styles.moreBtn}>
            <Ionicons name="ellipsis-vertical" size={20} color="#FFFFFF" />
          </TouchableOpacity>
          <View style={styles.avatarCircle}>
            <Image
              source={
                user?.avatarUrl
                  ? { uri: user.avatarUrl }
                  : require('../../assets/exercises/hero_workout_card.jpg')
              }
              style={styles.avatarImage}
            />
          </View>
        </View>
      </View>

      {/* Screen Title */}
      <Text style={styles.screenTitle}>{activePlan?.name || 'Strength Workout'}</Text>

      {/* Day Split Tabs */}
      <View style={styles.tabsWrap}>
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
                <Text style={[styles.dayTabName, isSelected ? styles.dayTabNameActive : null]}>
                  {day.dayName}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* Main Scroll Content */}
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
        {/* Featured Hero Workout Card matching screenshot */}
        <View style={styles.heroCard}>
          <Image
            source={require('../../assets/exercises/hero_workout_card.jpg')}
            style={styles.heroImage}
            resizeMode="cover"
          />

          <View style={styles.heroContent}>
            {/* Top Row: Title & Circular Gauge */}
            <View style={styles.heroTopRow}>
              <View style={{ flex: 1, paddingRight: Spacing.xs }}>
                <Text style={styles.heroTitle} numberOfLines={2}>
                  {currentDay?.dayName || 'Full Body Strength'}
                </Text>
              </View>
              <CircularProgress percentage={completionPercentage} size={60} strokeWidth={5.5} />
            </View>

            {/* Meta Row: Intermediate • 45 min • 320 kcal */}
            <View style={styles.heroMetaRow}>
              <View style={styles.metaItem}>
                <Ionicons name="bar-chart" size={13} color="#B5FF14" />
                <Text style={styles.metaText}>{activePlan?.difficulty || 'Intermediate'}</Text>
              </View>
              <Text style={styles.metaDot}>•</Text>
              <View style={styles.metaItem}>
                <Ionicons name="time-outline" size={13} color="#B5FF14" />
                <Text style={styles.metaText}>{currentDay?.targetDurationMinutes || 45} min</Text>
              </View>
              <Text style={styles.metaDot}>•</Text>
              <View style={styles.metaItem}>
                <Ionicons name="flame" size={13} color="#FF7A00" />
                <Text style={styles.metaText}>320 kcal</Text>
              </View>
            </View>

            {/* Big Neon Lime Action Button */}
            <TouchableOpacity
              activeOpacity={0.88}
              onPress={startLoggingSession}
              style={styles.heroActionBtn}
            >
              <Ionicons name="play" size={16} color="#0B0F19" />
              <Text style={styles.heroActionBtnText}>
                {completedCount > 0 && completedCount < totalCount ? 'Resume Workout' : 'Start Workout'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Today's Workout Section Header matching screenshot */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Today's Workout</Text>
          <Text style={styles.sectionSubtitle}>
            {completedCount} of {totalCount} exercises completed
          </Text>

          {/* Horizontal Progress Bar */}
          <View style={styles.progressBarTrack}>
            <View style={[styles.progressBarFill, { width: `${completionPercentage}%` }]} />
          </View>
        </View>

        {/* Exercises List Cards matching screenshot */}
        {currentDay ? (
          <View style={styles.exercisesList}>
            {currentDay.exercises?.map((item, exIdx) => {
              const exIdentifier = item.exerciseId || item.id;
              const isCompleted = completedExerciseIds.includes(exIdentifier);
              const isNextUp = nextUpExerciseId === exIdentifier;
              const imageSource =
                EXERCISE_3D_ASSETS[item.exercise?.name || ''] ||
                EXERCISE_3D_ASSETS['Goblet Squat'] ||
                EXERCISE_3D_ASSETS['Barbell Back Squat'];

              return (
                <TouchableOpacity
                  key={item.id || exIdx}
                  activeOpacity={0.85}
                  onPress={() =>
                    setGuideExercise({
                      name: item.exercise?.name || 'Exercise',
                      muscleGroup: item.exercise?.muscleGroup,
                    })
                  }
                  style={[
                    styles.exerciseCard,
                    isNextUp ? styles.exerciseCardNextUp : null,
                  ]}
                >
                  {/* Left 3D Exercise Image Thumbnail */}
                  <View style={styles.exerciseThumbBox}>
                    <Image source={imageSource} style={styles.exerciseThumbImage} resizeMode="cover" />
                  </View>

                  {/* Middle Info: Name & Sets x Reps */}
                  <View style={styles.exerciseInfo}>
                    <Text style={styles.exerciseNameText} numberOfLines={1}>
                      {item.exercise?.name}
                    </Text>
                    <Text style={styles.exerciseMetaText}>
                      {item.sets} sets × {item.durationSeconds ? `${item.durationSeconds} sec` : `${item.reps || 12} reps`}
                    </Text>
                  </View>

                  {/* Right Status Action */}
                  {isCompleted ? (
                    <TouchableOpacity
                      onPress={() => toggleExerciseCompleted(exIdentifier)}
                      style={styles.completedBadge}
                    >
                      <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                    </TouchableOpacity>
                  ) : isNextUp ? (
                    <View style={styles.nextUpWrapper}>
                      <View style={styles.nextUpBadge}>
                        <Text style={styles.nextUpText}>Next up</Text>
                      </View>
                      <Ionicons name="chevron-forward" size={18} color="#FFFFFF" />
                    </View>
                  ) : (
                    <TouchableOpacity
                      onPress={() => toggleExerciseCompleted(exIdentifier)}
                      style={{ padding: 4 }}
                    >
                      <Ionicons name="chevron-forward" size={20} color="#64748B" />
                    </TouchableOpacity>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ) : (
          <View style={styles.emptyContainer}>
            <View style={styles.emptyIconBox}>
              <Ionicons name="barbell-outline" size={48} color="#B5FF14" />
            </View>
            <Text style={styles.emptyTitle}>Ready to Train?</Text>
            <Text style={styles.emptySubtitle}>
              Tap below to load your personalized Strength Workout plan.
            </Text>
            <TouchableOpacity onPress={fetchWorkouts} style={styles.emptyBtn}>
              <Ionicons name="refresh" size={18} color="#0B0F19" />
              <Text style={styles.emptyBtnText}>Load Workout Plan</Text>
            </TouchableOpacity>
          </View>
        )}
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

      {/* 3D Anatomical Step-by-Step Exercise Visual Guide */}
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
    backgroundColor: '#0A0D14',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Top Navigation Bar
  topAppBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
  },
  navBtn: {
    width: 36,
    height: 36,
    justifyContent: 'center',
    alignItems: 'center',
  },
  brandContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandPulse: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: -0.5,
  },
  brandFit: {
    fontSize: 22,
    fontWeight: '900',
    fontStyle: 'italic',
    color: '#B5FF14',
  },
  headerRightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  moreBtn: {
    width: 32,
    height: 32,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarCircle: {
    width: 34,
    height: 34,
    borderRadius: 17,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
  },
  // Screen Sub-Header Title
  screenTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginTop: 4,
    marginBottom: Spacing.xs,
  },
  // Tabs row
  tabsWrap: {
    paddingVertical: 6,
    marginBottom: 4,
  },
  dayTabsContainer: {
    paddingHorizontal: Spacing.md,
    gap: Spacing.xs,
  },
  dayTab: {
    paddingVertical: 6,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.full,
    backgroundColor: '#151924',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  dayTabActive: {
    backgroundColor: 'rgba(181, 255, 20, 0.15)',
    borderColor: '#B5FF14',
  },
  dayTabName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#8E9BAE',
  },
  dayTabNameActive: {
    color: '#B5FF14',
    fontWeight: '700',
  },
  scrollContent: {
    paddingHorizontal: Spacing.md,
    paddingBottom: Spacing.xl * 2,
  },
  // Hero Workout Card
  heroCard: {
    flexDirection: 'row',
    backgroundColor: '#141722',
    borderRadius: 20,
    overflow: 'hidden',
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  heroImage: {
    width: 125,
    height: 160,
  },
  heroContent: {
    flex: 1,
    padding: Spacing.md,
    justifyContent: 'space-between',
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  heroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 22,
  },
  circularText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
  },
  circularPercent: {
    fontSize: 10,
    color: '#A0AEC0',
    fontWeight: '700',
  },
  heroMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginVertical: 4,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  metaText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#94A3B8',
  },
  metaDot: {
    fontSize: 12,
    color: '#64748B',
  },
  heroActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#B5FF14',
    paddingVertical: 9,
    paddingHorizontal: Spacing.md,
    borderRadius: BorderRadius.md,
    gap: 6,
    marginTop: 6,
  },
  heroActionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0B0F19',
    letterSpacing: 0.3,
  },
  // Today's Workout Section Header
  sectionHeader: {
    marginBottom: Spacing.md,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 2,
  },
  sectionSubtitle: {
    fontSize: 13,
    fontWeight: '500',
    color: '#8E9BAE',
    marginBottom: Spacing.xs,
  },
  progressBarTrack: {
    height: 6,
    width: '100%',
    backgroundColor: '#1E2432',
    borderRadius: 3,
    overflow: 'hidden',
    marginTop: 4,
  },
  progressBarFill: {
    height: '100%',
    backgroundColor: '#B5FF14',
    borderRadius: 3,
  },
  // Exercises List
  exercisesList: {
    gap: Spacing.sm,
  },
  exerciseCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#151924',
    borderRadius: 16,
    paddingHorizontal: Spacing.md,
    paddingVertical: 10,
    borderWidth: 1.5,
    borderColor: 'transparent',
  },
  exerciseCardNextUp: {
    borderColor: '#1D64F2',
    backgroundColor: '#131828',
  },
  exerciseThumbBox: {
    width: 52,
    height: 52,
    borderRadius: 12,
    overflow: 'hidden',
    backgroundColor: '#202636',
    marginRight: Spacing.md,
  },
  exerciseThumbImage: {
    width: '100%',
    height: '100%',
  },
  exerciseInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  exerciseNameText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 3,
  },
  exerciseMetaText: {
    fontSize: 12,
    color: '#8E9BAE',
    fontWeight: '500',
  },
  completedBadge: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#84CC16',
    justifyContent: 'center',
    alignItems: 'center',
  },
  nextUpWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  nextUpBadge: {
    backgroundColor: '#1D64F2',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  nextUpText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  // Empty state
  emptyContainer: {
    padding: Spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#151924',
    borderRadius: BorderRadius.lg,
    marginTop: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  emptyIconBox: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(181, 255, 20, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  emptyTitle: {
    ...Typography.title2,
    color: Colors.text,
    marginBottom: Spacing.xs,
    textAlign: 'center',
  },
  emptySubtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginBottom: Spacing.lg,
    lineHeight: 22,
  },
  emptyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#B5FF14',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.lg,
    borderRadius: BorderRadius.full,
    gap: Spacing.xs,
  },
  emptyBtnText: {
    ...Typography.bodyBold,
    color: '#0B0F19',
  },
  // Logger Modal
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
    color: '#B5FF14',
  },
  logExCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  logExHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  logExName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  mini3DBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 229, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(0, 229, 255, 0.35)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: BorderRadius.sm,
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
    backgroundColor: '#B5FF14',
  },
});
