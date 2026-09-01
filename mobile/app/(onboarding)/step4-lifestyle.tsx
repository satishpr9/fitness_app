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
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';

export default function Step4LifestyleScreen() {
  const router = useRouter();
  const { refreshProfile } = useAuth();

  const [sleepHours, setSleepHours] = useState<number>(8);
  const [waterTargetMl, setWaterTargetMl] = useState<number>(3000);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFinish = async () => {
    setLoading(true);
    setError(null);
    try {
      await onboardingApi.updateLifestyle({
        sleepDurationHours: sleepHours,
        dailyWaterTargetMl: waterTargetMl,
      });
      await refreshProfile();
      router.replace('/(onboarding)/summary');
    } catch (err: any) {
      setError(err.message || 'Failed to complete onboarding');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepBadge}>Step 4 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '100%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Lifestyle & Recovery</Text>
        <Text style={styles.subtitle}>
          Quality sleep and hydration are the foundation of athletic recovery and metabolic health.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Sleep Duration */}
        <Text style={styles.sectionTitle}>Average Nightly Sleep</Text>
        <View style={styles.sleepRow}>
          {[5, 6, 7, 8, 9, 10].map((hours) => (
            <TouchableOpacity
              key={hours}
              onPress={() => setSleepHours(hours)}
              style={[styles.sleepChip, sleepHours === hours ? styles.sleepChipActive : null]}
            >
              <Text
                style={[styles.sleepChipText, sleepHours === hours ? styles.sleepChipTextActive : null]}
              >
                {hours}h
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        {/* Water Target Selector */}
        <Text style={styles.sectionTitle}>Daily Hydration Target</Text>
        <View style={styles.waterCardList}>
          {[
            { ml: 2000, label: '2.0 Liters', desc: '8 Glasses • Light Activity' },
            { ml: 2500, label: '2.5 Liters', desc: '10 Glasses • Standard Daily' },
            { ml: 3000, label: '3.0 Liters', desc: '12 Glasses • Active / Training (Recommended)' },
            { ml: 3500, label: '3.5 Liters', desc: '14 Glasses • Heavy Training / Hot Climate' },
          ].map((w) => (
            <TouchableOpacity
              key={w.ml}
              onPress={() => setWaterTargetMl(w.ml)}
              style={[styles.waterCard, waterTargetMl === w.ml ? styles.waterCardActive : null]}
            >
              <View style={styles.waterIconCircle}>
                <Ionicons
                  name="water"
                  size={22}
                  color={waterTargetMl === w.ml ? Colors.accent : Colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text
                  style={[styles.waterTitle, waterTargetMl === w.ml ? styles.waterTitleActive : null]}
                >
                  {w.label}
                </Text>
                <Text style={styles.waterDesc}>{w.desc}</Text>
              </View>
              {waterTargetMl === w.ml && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.accent} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Calculate My Custom Plan"
          onPress={handleFinish}
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
  sleepRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  sleepChip: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: Colors.surface,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  sleepChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  sleepChipText: {
    ...Typography.bodyBold,
    color: Colors.textSecondary,
  },
  sleepChipTextActive: {
    color: '#0B0F19',
  },
  waterCardList: {
    gap: Spacing.sm,
  },
  waterCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.md,
  },
  waterCardActive: {
    borderColor: Colors.accent,
    backgroundColor: Colors.accentMuted,
  },
  waterIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceLight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  waterTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  waterTitleActive: {
    color: Colors.accent,
  },
  waterDesc: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
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
