import React, { useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
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
import { Gender } from '../../src/types';
import { Button } from '../../src/components/Button';
import { Input } from '../../src/components/Input';

export default function Step1PersonalScreen() {
  const router = useRouter();

  const [age, setAge] = useState('26');
  const [gender, setGender] = useState<Gender>('MALE');
  const [heightCm, setHeightCm] = useState('175');
  const [currentWeightKg, setCurrentWeightKg] = useState('74');
  const [targetWeightKg, setTargetWeightKg] = useState('70');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleNext = async () => {
    const ageNum = parseInt(age);
    const heightNum = parseFloat(heightCm);
    const weightNum = parseFloat(currentWeightKg);
    const targetNum = targetWeightKg ? parseFloat(targetWeightKg) : undefined;

    if (!ageNum || !heightNum || !weightNum) {
      setError('Please provide valid age, height, and current weight');
      return;
    }

    setLoading(true);
    setError(null);
    try {
      await onboardingApi.updatePersonalInfo({
        age: ageNum,
        gender,
        heightCm: heightNum,
        currentWeightKg: weightNum,
        targetWeightKg: targetNum,
      });
      router.push('/(onboarding)/step2-goals');
    } catch (err: any) {
      setError(err.message || 'Failed to save personal info');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          {/* Step Indicator */}
          <View style={styles.stepHeader}>
            <Text style={styles.stepBadge}>Step 1 of 4</Text>
            <View style={styles.progressTrack}>
              <View style={[styles.progressFill, { width: '25%' }]} />
            </View>
          </View>

          <Text style={styles.title}>Tell us about yourself</Text>
          <Text style={styles.subtitle}>
            We use these biological metrics to calculate your BMR and baseline energy needs accurately.
          </Text>

          {error && (
            <View style={styles.errorBox}>
              <Ionicons name="alert-circle" size={18} color={Colors.danger} />
              <Text style={styles.errorText}>{error}</Text>
            </View>
          )}

          {/* Gender Selector */}
          <Text style={styles.fieldLabel}>Biological Sex</Text>
          <View style={styles.genderRow}>
            {(['MALE', 'FEMALE', 'OTHER'] as Gender[]).map((g) => (
              <TouchableOpacity
                key={g}
                onPress={() => setGender(g)}
                style={[styles.genderCard, gender === g ? styles.genderCardActive : null]}
              >
                <Ionicons
                  name={g === 'MALE' ? 'male' : g === 'FEMALE' ? 'female' : 'person'}
                  size={24}
                  color={gender === g ? Colors.primary : Colors.textSecondary}
                />
                <Text
                  style={[styles.genderText, gender === g ? styles.genderTextActive : null]}
                >
                  {g === 'MALE' ? 'Male' : g === 'FEMALE' ? 'Female' : 'Other'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Numeric Inputs */}
          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Age (Years)"
                placeholder="26"
                value={age}
                onChangeText={setAge}
                keyboardType="number-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Input
                label="Height (cm)"
                placeholder="175"
                value={heightCm}
                onChangeText={setHeightCm}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <View style={styles.inputRow}>
            <View style={{ flex: 1 }}>
              <Input
                label="Current Weight (kg)"
                placeholder="74"
                value={currentWeightKg}
                onChangeText={setCurrentWeightKg}
                keyboardType="decimal-pad"
              />
            </View>
            <View style={{ flex: 1, marginLeft: Spacing.sm }}>
              <Input
                label="Goal Weight (kg)"
                placeholder="70"
                value={targetWeightKg}
                onChangeText={setTargetWeightKg}
                keyboardType="decimal-pad"
              />
            </View>
          </View>

          <Button
            title="Continue to Fitness Goals"
            onPress={handleNext}
            loading={loading}
            size="lg"
            style={{ marginTop: Spacing.lg }}
          />
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: Spacing.xl,
  },
  fieldLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.sm,
  },
  genderRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.lg,
  },
  genderCard: {
    flex: 1,
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    paddingVertical: Spacing.md,
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  genderCardActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  genderText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  genderTextActive: {
    color: Colors.primary,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: Spacing.xs,
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
