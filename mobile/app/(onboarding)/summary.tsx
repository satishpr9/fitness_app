import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  View,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { nutritionApi } from '../../src/api';
import { NutritionTarget } from '../../src/types';
import { MacroRing } from '../../src/components/MacroRing';
import { Button } from '../../src/components/Button';

export default function SummaryScreen() {
  const router = useRouter();
  const [targets, setTargets] = useState<NutritionTarget | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTargets = async () => {
      try {
        const res = (await nutritionApi.getMyTargets()) as unknown as NutritionTarget;
        setTargets(res);
      } catch {
        // Fallback default targets
        setTargets({
          id: '1',
          userId: '1',
          dailyCalorieTarget: 2150,
          proteinTargetG: 160,
          carbsTargetG: 215,
          fatTargetG: 70,
          fiberTargetG: 30,
          bmi: 23.5,
          bmr: 1720,
          tdee: 2650,
          isCustomOverride: false,
        });
      } finally {
        setLoading(false);
      }
    };

    fetchTargets();
  }, []);

  if (loading || !targets) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
        <Text style={styles.loadingText}>Calculating your personalized nutrition plan...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Celebration Header */}
        <View style={styles.header}>
          <View style={styles.badge}>
            <Ionicons name="sparkles" size={24} color={Colors.primary} />
          </View>
          <Text style={styles.title}>Your Plan is Ready!</Text>
          <Text style={styles.subtitle}>
            Based on your biological metrics and goals, here are your daily targets:
          </Text>
        </View>

        {/* Central Calorie Target Ring */}
        <View style={styles.ringCard}>
          <MacroRing
            size={180}
            strokeWidth={14}
            progress={1}
            color={Colors.primary}
            centerText={String(targets.dailyCalorieTarget)}
            centerSubtext="Daily Calories (kcal)"
          />

          <View style={styles.energyRow}>
            <View style={styles.energyCol}>
              <Text style={styles.energyVal}>{targets.bmr || 1650} kcal</Text>
              <Text style={styles.energyLbl}>Basal Metabolic Rate</Text>
            </View>
            <View style={styles.energyDivider} />
            <View style={styles.energyCol}>
              <Text style={styles.energyVal}>{targets.tdee || 2400} kcal</Text>
              <Text style={styles.energyLbl}>Total Daily Burn (TDEE)</Text>
            </View>
          </View>
        </View>

        {/* Macro Distribution Cards */}
        <Text style={styles.sectionTitle}>Daily Macro Targets</Text>
        <View style={styles.macroGrid}>
          <View style={[styles.macroCard, { borderColor: Colors.protein }]}>
            <Text style={[styles.macroGrams, { color: Colors.protein }]}>
              {targets.proteinTargetG}g
            </Text>
            <Text style={styles.macroLabel}>Protein</Text>
            <Text style={styles.macroCal}>{targets.proteinTargetG * 4} kcal</Text>
          </View>

          <View style={[styles.macroCard, { borderColor: Colors.carbs }]}>
            <Text style={[styles.macroGrams, { color: Colors.carbs }]}>
              {targets.carbsTargetG}g
            </Text>
            <Text style={styles.macroLabel}>Carbs</Text>
            <Text style={styles.macroCal}>{targets.carbsTargetG * 4} kcal</Text>
          </View>

          <View style={[styles.macroCard, { borderColor: Colors.fat }]}>
            <Text style={[styles.macroGrams, { color: Colors.fat }]}>
              {targets.fatTargetG}g
            </Text>
            <Text style={styles.macroLabel}>Fats</Text>
            <Text style={styles.macroCal}>{targets.fatTargetG * 9} kcal</Text>
          </View>

          <View style={[styles.macroCard, { borderColor: Colors.fiber }]}>
            <Text style={[styles.macroGrams, { color: Colors.fiber }]}>
              {targets.fiberTargetG || 30}g
            </Text>
            <Text style={styles.macroLabel}>Fiber</Text>
            <Text style={styles.macroCal}>Digestive Health</Text>
          </View>
        </View>

        <Button
          title="Enter Dashboard"
          onPress={() => router.replace('/(tabs)')}
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
  center: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    ...Typography.body,
    color: Colors.textSecondary,
    marginTop: Spacing.md,
  },
  header: {
    alignItems: 'center',
    marginBottom: Spacing.lg,
  },
  badge: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryMuted,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  title: {
    ...Typography.hero,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.body,
    color: Colors.textSecondary,
    textAlign: 'center',
    marginTop: Spacing.xs,
    maxWidth: 320,
  },
  ringCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.lg,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  energyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.lg,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    width: '100%',
  },
  energyCol: {
    flex: 1,
    alignItems: 'center',
  },
  energyDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  energyVal: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  energyLbl: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.text,
    marginBottom: Spacing.sm,
  },
  macroGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  macroCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
  },
  macroGrams: {
    ...Typography.title1,
    fontWeight: '800',
  },
  macroLabel: {
    ...Typography.captionBold,
    color: Colors.text,
    marginTop: 2,
  },
  macroCal: {
    ...Typography.tiny,
    color: Colors.textMuted,
    marginTop: 2,
  },
});
