import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  RefreshControl,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useFocusEffect, useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { dashboardApi } from '../../src/api';
import { DashboardData } from '../../src/types';
import { MacroBar, MacroRing } from '../../src/components/MacroRing';
import { WaterTrackerCard } from '../../src/components/WaterTrackerCard';

export default function DashboardScreen() {
  const router = useRouter();
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchDashboard = async () => {
    try {
      const res = (await dashboardApi.getDashboard()) as unknown as DashboardData;
      setData(res);
    } catch {
      // Fallback demo state if backend is offline
      setData({
        greeting: 'Good Morning 👋',
        userName: 'Athlete',
        tier: 'FREE',
        weight: { current: 74, target: 70 },
        calories: { consumed: 1250, target: 2150, remaining: 900 },
        macros: {
          protein: { consumed: 95, target: 160 },
          carbs: { consumed: 130, target: 215 },
          fat: { consumed: 40, target: 70 },
        },
        todayMeals: {
          breakfastLogged: true,
          lunchLogged: true,
          snackLogged: false,
          dinnerLogged: false,
        },
        todayWorkout: {
          isCompleted: false,
          planTitle: '4-Day Hypertrophy Split',
          todaySessionName: 'Chest & Triceps Power',
          isRestDay: false,
          exercisesCount: 5,
        },
        water: {
          consumedMl: 1750,
          targetMl: 3000,
          glassesConsumed: 7,
          targetGlasses: 12,
        },
        streak: {
          workoutsThisWeek: 3,
        },
      });
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, []),
  );

  const onRefresh = () => {
    setRefreshing(true);
    fetchDashboard();
  };

  if (loading && !data) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const calProgress = data ? data.calories.consumed / (data.calories.target || 1) : 0;

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={Colors.primary} />}
      >
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.greetingText}>{data?.greeting}</Text>
            <Text style={styles.userName}>{data?.userName}</Text>
          </View>

          <View style={styles.headerRight}>
            <View style={styles.streakBadge}>
              <Ionicons name="flame" size={18} color={Colors.carbs} />
              <Text style={styles.streakText}>{data?.streak.workoutsThisWeek} Workouts</Text>
            </View>

            {data?.tier === 'PREMIUM' && (
              <View style={styles.proBadge}>
                <Ionicons name="star" size={14} color="#0B0F19" />
                <Text style={styles.proBadgeText}>PRO</Text>
              </View>
            )}
          </View>
        </View>

        {/* Nutrition Card with MacroRing & MacroBars */}
        <View style={styles.nutritionCard}>
          <View style={styles.cardTitleRow}>
            <Text style={styles.cardTitle}>Daily Nutrition</Text>
            <TouchableOpacity onPress={() => router.push('/(tabs)/diet')}>
              <Text style={styles.actionLink}>Log Food +</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.nutritionContent}>
            {/* Donut Ring */}
            <View style={styles.ringWrapper}>
              <MacroRing
                size={140}
                strokeWidth={12}
                progress={calProgress}
                color={Colors.primary}
                centerText={String(data?.calories.remaining ?? 0)}
                centerSubtext="kcal left"
              />
            </View>

            {/* Macro Bars */}
            <View style={styles.macroBars}>
              <MacroBar
                label="Protein"
                consumed={data?.macros.protein.consumed ?? 0}
                target={data?.macros.protein.target ?? 150}
                color={Colors.protein}
              />
              <MacroBar
                label="Carbs"
                consumed={data?.macros.carbs.consumed ?? 0}
                target={data?.macros.carbs.target ?? 200}
                color={Colors.carbs}
              />
              <MacroBar
                label="Fat"
                consumed={data?.macros.fat.consumed ?? 0}
                target={data?.macros.fat.target ?? 65}
                color={Colors.fat}
              />
            </View>
          </View>

          {/* Meal Status Row */}
          <View style={styles.mealStatusRow}>
            {[
              { label: 'Breakfast', done: data?.todayMeals.breakfastLogged },
              { label: 'Lunch', done: data?.todayMeals.lunchLogged },
              { label: 'Snack', done: data?.todayMeals.snackLogged },
              { label: 'Dinner', done: data?.todayMeals.dinnerLogged },
            ].map((m) => (
              <View key={m.label} style={styles.mealStatusItem}>
                <Ionicons
                  name={m.done ? 'checkmark-circle' : 'ellipse-outline'}
                  size={16}
                  color={m.done ? Colors.primary : Colors.textMuted}
                />
                <Text style={[styles.mealStatusText, m.done ? styles.mealStatusDone : null]}>
                  {m.label}
                </Text>
              </View>
            ))}
          </View>
        </View>

        {/* Today's Workout Card */}
        <TouchableOpacity
          activeOpacity={0.85}
          onPress={() => router.push('/(tabs)/workout')}
          style={styles.workoutCard}
        >
          <View style={styles.workoutIconCircle}>
            <Ionicons name="barbell" size={24} color={Colors.purple} />
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.workoutHeaderRow}>
              <Text style={styles.workoutPlanTitle}>{data?.todayWorkout.planTitle || 'Today\'s Training'}</Text>
              {data?.todayWorkout.isCompleted && (
                <View style={styles.completedBadge}>
                  <Text style={styles.completedBadgeText}>COMPLETED</Text>
                </View>
              )}
            </View>
            <Text style={styles.workoutSessionName}>{data?.todayWorkout.todaySessionName}</Text>
            <Text style={styles.workoutMeta}>
              {data?.todayWorkout.isRestDay
                ? 'Active Recovery Day 🌿'
                : `${data?.todayWorkout.exercisesCount} Exercises Scheduled`}
            </Text>
          </View>

          <Ionicons name="chevron-forward" size={20} color={Colors.textSecondary} />
        </TouchableOpacity>

        {/* Water Tracker Widget */}
        <WaterTrackerCard
          consumedMl={data?.water.consumedMl ?? 0}
          targetMl={data?.water.targetMl ?? 2500}
          onWaterUpdated={(newMl) => {
            if (data) {
              setData({
                ...data,
                water: {
                  ...data.water,
                  consumedMl: newMl,
                },
              });
            }
          }}
        />

        {/* Quick Weight & Target Summary Card */}
        <View style={styles.weightCard}>
          <View style={styles.weightCol}>
            <Text style={styles.weightLabel}>Current Weight</Text>
            <Text style={styles.weightValue}>{data?.weight.current} kg</Text>
          </View>
          <View style={styles.weightDivider} />
          <View style={styles.weightCol}>
            <Text style={styles.weightLabel}>Goal Weight</Text>
            <Text style={[styles.weightValue, { color: Colors.primary }]}>
              {data?.weight.target} kg
            </Text>
          </View>
          <View style={styles.weightDivider} />
          <View style={styles.weightCol}>
            <Text style={styles.weightLabel}>Difference</Text>
            <Text style={[styles.weightValue, { color: Colors.accent }]}>
              {Math.abs(Number(((data?.weight.current ?? 0) - (data?.weight.target ?? 0)).toFixed(1)))} kg
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  scrollContent: {
    padding: Spacing.md,
  },
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  greetingText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  userName: {
    ...Typography.title1,
    color: Colors.text,
  },
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  streakBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  streakText: {
    ...Typography.tiny,
    color: Colors.carbs,
    fontWeight: '700',
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
    gap: 2,
  },
  proBadgeText: {
    ...Typography.tiny,
    color: '#0B0F19',
    fontWeight: '800',
  },
  nutritionCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  cardTitle: {
    ...Typography.title3,
    color: Colors.text,
  },
  actionLink: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  nutritionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  ringWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  macroBars: {
    flex: 1,
  },
  mealStatusRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.md,
    paddingTop: Spacing.sm,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  mealStatusItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  mealStatusText: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
  mealStatusDone: {
    color: Colors.text,
    fontWeight: '600',
  },
  workoutCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
    gap: Spacing.md,
  },
  workoutIconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.purpleMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  workoutHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  workoutPlanTitle: {
    ...Typography.tiny,
    color: Colors.purple,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  completedBadge: {
    backgroundColor: Colors.primaryMuted,
    paddingVertical: 2,
    paddingHorizontal: 6,
    borderRadius: 4,
  },
  completedBadgeText: {
    ...Typography.tiny,
    color: Colors.primary,
    fontWeight: '800',
  },
  workoutSessionName: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginTop: 2,
  },
  workoutMeta: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  weightCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  weightCol: {
    flex: 1,
    alignItems: 'center',
  },
  weightLabel: {
    ...Typography.tiny,
    color: Colors.textSecondary,
  },
  weightValue: {
    ...Typography.bodyBold,
    color: Colors.text,
    marginTop: 2,
  },
  weightDivider: {
    width: 1,
    height: 28,
    backgroundColor: Colors.border,
  },
});
