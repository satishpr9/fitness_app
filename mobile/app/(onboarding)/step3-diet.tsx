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
import { DietaryPreference } from '../../src/types';
import { Button } from '../../src/components/Button';

const DIET_TYPES: { key: DietaryPreference; label: string; desc: string; icon: string }[] = [
  { key: 'VEGETARIAN', label: 'Vegetarian', desc: 'Plant foods, dairy & lentils', icon: 'leaf-outline' },
  { key: 'EGGETARIAN', label: 'Eggetarian', desc: 'Vegetarian + Eggs', icon: 'egg-outline' },
  { key: 'NON_VEGETARIAN', label: 'Non-Vegetarian', desc: 'Chicken, meat, fish & eggs', icon: 'restaurant-outline' },
  { key: 'VEGAN', label: 'Vegan', desc: '100% plant-based, zero dairy', icon: 'nutrition-outline' },
  { key: 'KETO', label: 'Keto', desc: 'High fat, ultra-low carbohydrate', icon: 'flash-outline' },
];

const CUISINES = ['Indian', 'North Indian', 'South Indian', 'Continental', 'Asian', 'Mediterranean'];

export default function Step3DietScreen() {
  const router = useRouter();

  const [dietaryPreference, setDietaryPreference] = useState<DietaryPreference>('VEGETARIAN');
  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(['Indian']);
  const [mealsPerDay, setMealsPerDay] = useState<number>(4);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const toggleCuisine = (cuisine: string) => {
    if (selectedCuisines.includes(cuisine)) {
      if (selectedCuisines.length > 1) {
        setSelectedCuisines(selectedCuisines.filter((c) => c !== cuisine));
      }
    } else {
      setSelectedCuisines([...selectedCuisines, cuisine]);
    }
  };

  const handleNext = async () => {
    setLoading(true);
    setError(null);
    try {
      await onboardingApi.updateDietaryPreferences({
        dietaryPreference,
        preferredCuisines: selectedCuisines,
        mealsPerDay,
        allergies: [],
        foodDislikes: [],
      });
      router.push('/(onboarding)/step4-lifestyle');
    } catch (err: any) {
      setError(err.message || 'Failed to save dietary preferences');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* Step Indicator */}
        <View style={styles.stepHeader}>
          <Text style={styles.stepBadge}>Step 3 of 4</Text>
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: '75%' }]} />
          </View>
        </View>

        <Text style={styles.title}>Dietary Preferences</Text>
        <Text style={styles.subtitle}>
          Help us customize your meal suggestions and food database recommendations.
        </Text>

        {error && (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={18} color={Colors.danger} />
            <Text style={styles.errorText}>{error}</Text>
          </View>
        )}

        {/* Diet Type */}
        <Text style={styles.sectionTitle}>Diet Type</Text>
        <View style={styles.cardList}>
          {DIET_TYPES.map((d) => (
            <TouchableOpacity
              key={d.key}
              onPress={() => setDietaryPreference(d.key)}
              style={[styles.optionCard, dietaryPreference === d.key ? styles.optionCardActive : null]}
            >
              <View style={styles.cardIcon}>
                <Ionicons
                  name={d.icon as any}
                  size={24}
                  color={dietaryPreference === d.key ? Colors.primary : Colors.textSecondary}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={[styles.cardTitle, dietaryPreference === d.key ? styles.cardTitleActive : null]}>
                  {d.label}
                </Text>
                <Text style={styles.cardDesc}>{d.desc}</Text>
              </View>
              {dietaryPreference === d.key && (
                <Ionicons name="checkmark-circle" size={22} color={Colors.primary} />
              )}
            </TouchableOpacity>
          ))}
        </View>

        {/* Preferred Cuisines */}
        <Text style={styles.sectionTitle}>Preferred Cuisines</Text>
        <View style={styles.chipWrap}>
          {CUISINES.map((c) => {
            const isSelected = selectedCuisines.includes(c);
            return (
              <TouchableOpacity
                key={c}
                onPress={() => toggleCuisine(c)}
                style={[styles.chip, isSelected ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, isSelected ? styles.chipTextActive : null]}>
                  {c}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Meals Per Day */}
        <Text style={styles.sectionTitle}>Target Meals Per Day</Text>
        <View style={styles.mealsRow}>
          {[2, 3, 4, 5, 6].map((m) => (
            <TouchableOpacity
              key={m}
              onPress={() => setMealsPerDay(m)}
              style={[styles.mealChip, mealsPerDay === m ? styles.mealChipActive : null]}
            >
              <Text style={[styles.mealChipText, mealsPerDay === m ? styles.mealChipTextActive : null]}>
                {m} Meals
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Button
          title="Continue to Lifestyle & Water"
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
  chipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs + 2,
  },
  chip: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  chipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  chipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
  },
  mealsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs,
  },
  mealChip: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surface,
    borderWidth: 1.5,
    borderColor: Colors.border,
  },
  mealChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primary,
  },
  mealChipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  mealChipTextActive: {
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
