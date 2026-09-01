import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  Modal,
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
import { BorderRadius, Colors, Spacing, Typography } from '../../src/constants/theme';
import { nutritionApi } from '../../src/api';
import { NutritionTarget } from '../../src/types';
import { useAuth } from '../../src/context/AuthContext';
import { Button } from '../../src/components/Button';

export default function ProfileScreen() {
  const router = useRouter();
  const { user, profile, signOut, upgradeTier, refreshProfile } = useAuth();

  const [targets, setTargets] = useState<NutritionTarget | null>(null);
  const [loading, setLoading] = useState(true);

  // Target Override Modal
  const [overrideModalVisible, setOverrideModalVisible] = useState(false);
  const [overrideCalories, setOverrideCalories] = useState('');
  const [overrideProtein, setOverrideProtein] = useState('');
  const [overrideCarbs, setOverrideCarbs] = useState('');
  const [overrideFat, setOverrideFat] = useState('');
  const [savingOverride, setSavingOverride] = useState(false);

  // Upgrade Modal
  const [upgradeModalVisible, setUpgradeModalVisible] = useState(false);
  const [upgrading, setUpgrading] = useState(false);

  const fetchTargets = async () => {
    try {
      const res = (await nutritionApi.getMyTargets()) as unknown as NutritionTarget;
      setTargets(res);
      setOverrideCalories(String(res.dailyCalorieTarget));
      setOverrideProtein(String(res.proteinTargetG));
      setOverrideCarbs(String(res.carbsTargetG));
      setOverrideFat(String(res.fatTargetG));
    } catch {
      // Fallback
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchTargets();
      refreshProfile();
    }, []),
  );

  const handleSaveOverride = async () => {
    const c = parseInt(overrideCalories);
    const p = parseInt(overrideProtein);
    const cb = parseInt(overrideCarbs);
    const f = parseInt(overrideFat);

    if (!c || !p || !cb || !f) {
      Alert.alert('Error', 'Please provide valid values for all target fields');
      return;
    }

    setSavingOverride(true);
    try {
      const updated = (await nutritionApi.overrideTargets({
        dailyCalorieTarget: c,
        proteinTargetG: p,
        carbsTargetG: cb,
        fatTargetG: f,
      })) as unknown as NutritionTarget;
      setTargets(updated);
      setOverrideModalVisible(false);
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Failed to save target override');
    } finally {
      setSavingOverride(false);
    }
  };

  const handleUpgrade = async () => {
    setUpgrading(true);
    try {
      await upgradeTier('PREMIUM');
      setUpgradeModalVisible(false);
      Alert.alert('Success 🎉', 'Welcome to FitPulse PRO!');
    } catch (err: any) {
      Alert.alert('Error', err.message || 'Upgrade failed');
    } finally {
      setUpgrading(false);
    }
  };

  const handleSignOut = async () => {
    await signOut();
    router.replace('/(auth)/login');
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        {/* User Card */}
        <View style={styles.userCard}>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarInitials}>
              {(user?.fullName || 'User').charAt(0).toUpperCase()}
            </Text>
          </View>

          <View style={{ flex: 1 }}>
            <View style={styles.nameRow}>
              <Text style={styles.userName}>{user?.fullName || 'Athlete'}</Text>
              <View
                style={[
                  styles.tierTag,
                  user?.tier === 'PREMIUM' ? styles.tierTagPro : styles.tierTagFree,
                ]}
              >
                <Text
                  style={[
                    styles.tierTagText,
                    user?.tier === 'PREMIUM' ? styles.tierTagTextPro : null,
                  ]}
                >
                  {user?.tier || 'FREE'}
                </Text>
              </View>
            </View>
            <Text style={styles.userEmail}>{user?.email}</Text>
          </View>
        </View>

        {/* Upgrade Banner (if Free) */}
        {user?.tier !== 'PREMIUM' && (
          <TouchableOpacity
            onPress={() => setUpgradeModalVisible(true)}
            style={styles.proBanner}
          >
            <View style={styles.proIconBox}>
              <Ionicons name="sparkles" size={24} color="#0B0F19" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.proTitle}>Upgrade to FitPulse PRO</Text>
              <Text style={styles.proSubtitle}>
                Unlock custom workout splits, advanced analytics & priority coaching
              </Text>
            </View>
            <Ionicons name="chevron-forward" size={20} color="#0B0F19" />
          </TouchableOpacity>
        )}

        {/* Nutrition Targets Summary */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Nutrition Targets</Text>
          <TouchableOpacity onPress={() => setOverrideModalVisible(true)}>
            <Text style={styles.actionLink}>Customize / Override</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.targetsCard}>
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Daily Calories</Text>
            <Text style={styles.targetVal}>{targets?.dailyCalorieTarget || 2000} kcal</Text>
          </View>
          <View style={styles.targetDivider} />
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Protein Goal</Text>
            <Text style={[styles.targetVal, { color: Colors.protein }]}>
              {targets?.proteinTargetG || 140} g
            </Text>
          </View>
          <View style={styles.targetDivider} />
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Carbs Goal</Text>
            <Text style={[styles.targetVal, { color: Colors.carbs }]}>
              {targets?.carbsTargetG || 210} g
            </Text>
          </View>
          <View style={styles.targetDivider} />
          <View style={styles.targetRow}>
            <Text style={styles.targetLabel}>Fat Goal</Text>
            <Text style={[styles.targetVal, { color: Colors.fat }]}>
              {targets?.fatTargetG || 65} g
            </Text>
          </View>
          {targets?.isCustomOverride && (
            <View style={styles.overrideNotice}>
              <Ionicons name="create-outline" size={14} color={Colors.accent} />
              <Text style={styles.overrideNoticeText}>Custom User Override Active</Text>
            </View>
          )}
        </View>

        {/* Profile Info Details */}
        <Text style={styles.sectionTitle}>Fitness Profile</Text>
        <View style={styles.infoCard}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Primary Goal</Text>
            <Text style={styles.infoVal}>
              {(profile?.fitnessGoal || 'GENERAL_FITNESS').replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Activity Level</Text>
            <Text style={styles.infoVal}>
              {(profile?.activityLevel || 'MODERATELY_ACTIVE').replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Diet Type</Text>
            <Text style={styles.infoVal}>
              {(profile?.dietaryPreference || 'VEGETARIAN').replace('_', ' ')}
            </Text>
          </View>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Training Experience</Text>
            <Text style={styles.infoVal}>
              {profile?.workoutExperience || 'INTERMEDIATE'}
            </Text>
          </View>
        </View>

        {/* Sign Out Button */}
        <Button
          title="Sign Out"
          variant="outline"
          onPress={handleSignOut}
          style={{ marginTop: Spacing.xl, borderColor: Colors.danger }}
          textStyle={{ color: Colors.danger }}
        />
      </ScrollView>

      {/* Target Override Modal */}
      <Modal visible={overrideModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>Customize Nutrition Targets</Text>
            <Text style={styles.modalSubheading}>
              Manually fine-tune your target calories and macro split.
            </Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Daily Calories (kcal)</Text>
              <TextInput
                value={overrideCalories}
                onChangeText={setOverrideCalories}
                keyboardType="number-pad"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.macroInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Protein (g)</Text>
                <TextInput
                  value={overrideProtein}
                  onChangeText={setOverrideProtein}
                  keyboardType="number-pad"
                  style={styles.modalInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Carbs (g)</Text>
                <TextInput
                  value={overrideCarbs}
                  onChangeText={setOverrideCarbs}
                  keyboardType="number-pad"
                  style={styles.modalInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Fat (g)</Text>
                <TextInput
                  value={overrideFat}
                  onChangeText={setOverrideFat}
                  keyboardType="number-pad"
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setOverrideModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Apply Override"
                onPress={handleSaveOverride}
                loading={savingOverride}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* PRO Upgrade Modal */}
      <Modal visible={upgradeModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { borderTopColor: Colors.gold, borderTopWidth: 2 }]}>
            <View style={styles.proModalHeader}>
              <Ionicons name="sparkles" size={32} color={Colors.gold} />
              <Text style={styles.proModalTitle}>FitPulse PRO</Text>
              <Text style={styles.proModalSub}>Elevate your fitness and nutrition</Text>
            </View>

            <View style={styles.featureList}>
              {[
                'Unlimited Custom Workout Plans',
                'Advanced Nutrition Analytics & Micronutrients',
                'Full Indian & International Food Library',
                'Progress Photo Comparison Gallery',
                'Direct Export of Workout & Diet Logs',
              ].map((f) => (
                <View key={f} style={styles.featureRow}>
                  <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
                  <Text style={styles.featureText}>{f}</Text>
                </View>
              ))}
            </View>

            <Button
              title="Upgrade to PREMIUM Now"
              onPress={handleUpgrade}
              loading={upgrading}
              size="lg"
              style={{ backgroundColor: Colors.gold, marginTop: Spacing.md }}
              textStyle={{ color: '#0B0F19' }}
            />

            <Button
              title="Maybe Later"
              variant="ghost"
              onPress={() => setUpgradeModalVisible(false)}
              style={{ marginTop: Spacing.xs }}
            />
          </View>
        </View>
      </Modal>
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
  userCard: {
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
  avatarCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primaryMuted,
    borderWidth: 2,
    borderColor: Colors.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarInitials: {
    ...Typography.title2,
    color: Colors.primary,
    fontWeight: '800',
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  userName: {
    ...Typography.title2,
    color: Colors.text,
  },
  userEmail: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  tierTag: {
    paddingVertical: 2,
    paddingHorizontal: 8,
    borderRadius: BorderRadius.full,
  },
  tierTagFree: {
    backgroundColor: Colors.surfaceHighlight,
  },
  tierTagPro: {
    backgroundColor: Colors.gold,
  },
  tierTagText: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    fontWeight: '700',
  },
  tierTagTextPro: {
    color: '#0B0F19',
    fontWeight: '800',
  },
  proBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.gold,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  proIconBox: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(0,0,0,0.12)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  proTitle: {
    ...Typography.bodyBold,
    color: '#0B0F19',
  },
  proSubtitle: {
    ...Typography.tiny,
    color: '#332700',
    marginTop: 2,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  sectionTitle: {
    ...Typography.title3,
    color: Colors.text,
  },
  actionLink: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  targetsCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  targetRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.xs + 2,
  },
  targetLabel: {
    ...Typography.body,
    color: Colors.textSecondary,
  },
  targetVal: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  targetDivider: {
    height: 1,
    backgroundColor: Colors.border,
  },
  overrideNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.sm,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
    gap: 4,
  },
  overrideNoticeText: {
    ...Typography.tiny,
    color: Colors.accent,
    fontWeight: '600',
  },
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  infoLabel: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  infoVal: {
    ...Typography.captionBold,
    color: Colors.text,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  modalHeading: {
    ...Typography.title2,
    color: Colors.text,
  },
  modalSubheading: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
    marginBottom: Spacing.md,
  },
  inputWrap: {
    marginBottom: Spacing.md,
  },
  inputLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  modalInput: {
    height: 48,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
  macroInputRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
  proModalHeader: {
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  proModalTitle: {
    ...Typography.hero,
    color: Colors.text,
    marginTop: Spacing.xs,
  },
  proModalSub: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  featureList: {
    gap: Spacing.sm,
    marginVertical: Spacing.md,
  },
  featureRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  featureText: {
    ...Typography.body,
    color: Colors.text,
  },
});
