import React, { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { onboardingApi } from '../../src/api';
import { ActivityLevel, FitnessGoal, WorkoutExperience } from '../../src/types';
import { Button } from '../../src/components/Button';

const GOALS: { key: FitnessGoal; label: string; desc: string; icon: any }[] = [
  { key: 'WEIGHT_LOSS', label: 'Lose Fat', desc: '-500 kcal daily deficit', icon: 'flame-outline' },
  { key: 'MUSCLE_GAIN', label: 'Build Muscle', desc: '+350 kcal surplus & high protein', icon: 'barbell-outline' },
  { key: 'MAINTENANCE', label: 'Maintain Weight', desc: 'Sustain energy & balance', icon: 'infinite-outline' },
  { key: 'GENERAL_FITNESS', label: 'General Fitness', desc: 'Overall health & stamina', icon: 'heart-outline' },
  { key: 'STRENGTH', label: 'Power & Strength', desc: 'Heavy lifts & progressive overload', icon: 'trophy-outline' },
];

const ACTIVITY_LEVELS: { key: ActivityLevel; label: string; multiplier: string }[] = [
  { key: 'SEDENTARY', label: 'Sedentary', multiplier: 'Desk job, little exercise (1.2x)' },
  { key: 'LIGHTLY_ACTIVE', label: 'Lightly Active', multiplier: '1-3 light sessions/week (1.375x)' },
  { key: 'MODERATELY_ACTIVE', label: 'Moderately Active', multiplier: '3-5 moderate sessions/week (1.55x)' },
  { key: 'VERY_ACTIVE', label: 'Very Active', multiplier: '6-7 intense sessions/week (1.725x)' },
];

export default function Step2GoalsScreen() {
  const router = useRouter();

  const [fitnessGoal, setFitnessGoal] = useState<FitnessGoal>('WEIGHT_LOSS');
  const [activityLevel, setActivityLevel] = useState<ActivityLevel>('MODERATELY_ACTIVE');
  const [workoutExperience, setWorkoutExperience] = useState<WorkoutExperience>('INTERMEDIATE');
  const [workoutDaysPerWeek, setWorkoutDaysPerWeek] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    setLoading(true);
    setError(null);
    try {
      await onboardingApi.updateFitnessGoals({
        fitnessGoal,
        activityLevel,
        workoutExperience,
        workoutDaysPerWeek,
        workoutDurationMinutes: 45,
        availableEquipment: ['Dumbbells', 'Barbell', 'Bodyweight'],
      });
      router.push('/(onboarding)/step3-diet');
    } catch (err: any) {
      setError(err.message || 'Failed to save fitness goals');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepBadge}>Step 2 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '50%' }]} />
          </View>
        </View>

        <Text style={styles.title}>What's your primary goal?</Text>
        <Text style={styles.subtitle}>
          This determines your calorie surplus/deficit and macro percentage split.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Goal Cards */}
        <View style={styles.cardList}>
          {GOALS.map((g) => (
            <TouchableOpacity
              key={g.key}
              onPress={() => setFitnessGoal(g.key)}
              style={[styles.optionCard, fitnessGoal === g.key ? styles.optionCardActive : null]}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name={g.icon}
                  size={24}
                  color={fitnessGoal === g.key ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, fitnessGoal === g.key ? styles.cardTitleActive : null]}>
                  {g.label}
                </Text>
                <Text style={styles.cardDesc}>{g.desc}</Text>
              </View>
              {fitnessGoal === g.key && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Activity Level */}
        <Text style={styles.sectionTitle}>Daily Activity Level</Text>
        <View style={styles.cardList}>
          {ACTIVITY_LEVELS.map((a) => (
            <TouchableOpacity
              key={a.key}
              onPress={() => setActivityLevel(a.key)}
              style={[styles.optionCard, activityLevel === a.key ? styles.optionCardActive : null]}
            >
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, activityLevel === a.key ? styles.cardTitleActive : null]}>
                  {a.label}
                </Text>
                <Text style={styles.cardDesc}>{a.multiplier}</Text>
              </View>
              {activityLevel === a.key && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Workout Days per Week */}
        <Text style={styles.sectionTitle}>Target Workout Days / Week</Text>
        <View style={styles.daysRow}>
          {[1, 2, 3, 4, 5, 6, 7].map((days) => (
            <TouchableOpacity
              key={days}
              onPress={() => setWorkoutDaysPerWeek(days)}
              style={[styles.dayChip, workoutDaysPerWeek === days ? styles.dayChipActive : null]}
            >
              <Text
                style={[styles.dayChipText, workoutDaysPerWeek === days ? styles.dayChipTextActive : null]}
              >
                {days}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue to Nutrition Preferences"
          onPress={handleNext}
          loading={loading}
          size="lg"
          style={{ marginTop: Spacing.xl }}
        />
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
    padding: Spacing.lg,
  },
  stepHeader: {
    marginBottom: Spacing.md,
  },
  stepBadge: {
    ...Typography.captionBold,
    color: Colors.primary,
    marginBottom: Spacing.xs,
  },
  progressTrack: {
    height: 4,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 2,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary,
    borderRadius: 2,
  },
  title: {
    ...Typography.hero,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.xs,
    marginBottom: Spacing.lg,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.text,
    marginTop: Spacing.lg,
    marginBottom: Spacing.sm,
  },
  cardList: {
    gap: Spacing.sm,
  },
  optionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  optionCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  cardIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  cardTitleActive: {
    color: Colors.primary,
  },
  cardDesc: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  daysRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  dayChip: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  dayChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  dayChipText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  dayChipTextActive: {
    color: '#0B0F19',
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.dangerMuted,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    marginBottom: Spacing.md,
    gap: Spacing.xs,
  },
  errorText: {
    ...Typography.caption,
    color: Colors.danger,
    flex: 1,
  },
});
