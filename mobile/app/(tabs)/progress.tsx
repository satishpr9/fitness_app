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
import { progressApi } from '../../src/api';
import { BodyMeasurement, WeightLog } from '../../src/types';
import { Button } from '../../src/components/Button';

export default function ProgressScreen() {
  const [weightLogs, setWeightLogs] = useState<WeightLog[]>([]);
  const [measurements, setMeasurements] = useState<BodyMeasurement[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Weight Logging Modal
  const [weightModalVisible, setWeightModalVisible] = useState(false);
  const [newWeight, setNewWeight] = useState('73.5');
  const [weightNotes, setWeightNotes] = useState('');
  const [savingWeight, setSavingWeight] = useState(false);

  // Measurement Modal
  const [measureModalVisible, setMeasureModalVisible] = useState(false);
  const [chestCm, setChestCm] = useState('');
  const [waistCm, setWaistCm] = useState('');
  const [hipsCm, setHipsCm] = useState('');
  const [bicepsCm, setBicepsCm] = useState('');
  const [savingMeasure, setSavingMeasure] = useState(false);

  const fetchProgressData = async () => {
    try {
      const [wRes, mRes] = await Promise.all([
        progressApi.getWeightLogs() as unknown as any,
        progressApi.getMeasurements() as unknown as any,
      ]);
      const wItems: WeightLog[] = Array.isArray(wRes) ? wRes : wRes?.items || [];
      const mItems: BodyMeasurement[] = Array.isArray(mRes) ? mRes : mRes?.items || [];
      setWeightLogs(wItems);
      setMeasurements(mItems);
    } catch {
      // Fallback demo data
      setWeightLogs([
        { id: '1', userId: 'u1', weightKg: 73.5, date: '2026-09-01', notes: 'Morning weigh-in' },
        { id: '2', userId: 'u1', weightKg: 74.0, date: '2026-08-25', notes: 'Weekly check' },
        { id: '3', userId: 'u1', weightKg: 74.8, date: '2026-08-18', notes: 'Initial weigh-in' },
      ]);
      setMeasurements([
        { id: '1', userId: 'u1', date: '2026-09-01', chestCm: 102, waistCm: 82, hipsCm: 96, bicepsCm: 37 },
      ]);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchProgressData();
    }, []),
  );

  const handleSaveWeight = async () => {
    const val = parseFloat(newWeight);
    if (!val) return;

    setSavingWeight(true);
    try {
      await progressApi.logWeight(val, new Date().toISOString().split('T')[0], weightNotes);
      setWeightModalVisible(false);
      fetchProgressData();
    } catch {
      // Ignore
    } finally {
      setSavingWeight(false);
    }
  };

  const handleSaveMeasurement = async () => {
    setSavingMeasure(true);
    try {
      await progressApi.logMeasurement({
        date: new Date().toISOString().split('T')[0],
        chestCm: chestCm ? parseFloat(chestCm) : undefined,
        waistCm: waistCm ? parseFloat(waistCm) : undefined,
        hipsCm: hipsCm ? parseFloat(hipsCm) : undefined,
        bicepsCm: bicepsCm ? parseFloat(bicepsCm) : undefined,
      });
      setMeasureModalVisible(false);
      fetchProgressData();
    } catch {
      // Ignore
    } finally {
      setSavingMeasure(false);
    }
  };

  if (loading && weightLogs.length === 0) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const latestWeight = weightLogs[0]?.weightKg || 74;
  const startWeight = weightLogs[weightLogs.length - 1]?.weightKg || 74;
  const totalChange = Number((latestWeight - startWeight).toFixed(1));

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Progress & Body Stats</Text>
        <TouchableOpacity
          onPress={() => setWeightModalVisible(true)}
          style={styles.headerAddBtn}
        >
          <Ionicons name="add" size={18} color="#0B0F19" />
          <Text style={styles.headerAddText}>Log Weight</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchProgressData(); }} tintColor={Colors.primary} />
        }
      >
        {/* Weight Stat Highlights */}
        <View style={styles.statsCard}>
          <View style={styles.statCol}>
            <Text style={styles.statLbl}>Start Weight</Text>
            <Text style={styles.statVal}>{startWeight} kg</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLbl}>Current Weight</Text>
            <Text style={[styles.statVal, { color: Colors.primary }]}>{latestWeight} kg</Text>
          </View>
          <View style={styles.statDivider} />
          <View style={styles.statCol}>
            <Text style={styles.statLbl}>Total Delta</Text>
            <Text
              style={[
                styles.statVal,
                { color: totalChange <= 0 ? Colors.primary : Colors.carbs },
              ]}
            >
              {totalChange > 0 ? `+${totalChange}` : totalChange} kg
            </Text>
          </View>
        </View>

        {/* Weight History Timeline */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Weight Timeline</Text>
          <TouchableOpacity onPress={() => setWeightModalVisible(true)}>
            <Text style={styles.actionLink}>+ Record Weigh-in</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.historyCard}>
          {weightLogs.map((log, idx) => (
            <View key={log.id || idx} style={styles.historyRow}>
              <View style={styles.historyDot} />
              <View style={{ flex: 1 }}>
                <Text style={styles.historyDate}>
                  {new Date(log.date).toLocaleDateString(undefined, {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })}
                </Text>
                {log.notes && <Text style={styles.historyNotes}>{log.notes}</Text>}
              </View>
              <Text style={styles.historyWeight}>{log.weightKg} kg</Text>
            </View>
          ))}
        </View>

        {/* Body Measurements */}
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Body Tape Measurements</Text>
          <TouchableOpacity onPress={() => setMeasureModalVisible(true)}>
            <Text style={styles.actionLink}>+ Update Stats</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.measureGrid}>
          {[
            { label: 'Chest', val: measurements[0]?.chestCm || 102, icon: 'shield-outline' },
            { label: 'Waist', val: measurements[0]?.waistCm || 82, icon: 'body-outline' },
            { label: 'Hips', val: measurements[0]?.hipsCm || 96, icon: 'fitness-outline' },
            { label: 'Arms / Biceps', val: measurements[0]?.bicepsCm || 37, icon: 'barbell-outline' },
          ].map((m) => (
            <View key={m.label} style={styles.measureCard}>
              <Ionicons name={m.icon as any} size={20} color={Colors.accent} />
              <Text style={styles.measureVal}>{m.val} cm</Text>
              <Text style={styles.measureLbl}>{m.label}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Log Weight Modal */}
      <Modal visible={weightModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>Record New Weigh-In</Text>
            <Text style={styles.modalSubheading}>
              Weigh yourself under consistent morning conditions for accuracy.
            </Text>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Weight (kg)</Text>
              <TextInput
                value={newWeight}
                onChangeText={setNewWeight}
                keyboardType="decimal-pad"
                style={styles.modalInput}
              />
            </View>

            <View style={styles.inputWrap}>
              <Text style={styles.inputLabel}>Notes (optional)</Text>
              <TextInput
                placeholder="e.g. Post morning workout, fasted"
                placeholderTextColor={Colors.textMuted}
                value={weightNotes}
                onChangeText={setWeightNotes}
                style={[styles.modalInput, { height: 44, fontSize: 14 }]}
              />
            </View>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setWeightModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save"
                onPress={handleSaveWeight}
                loading={savingWeight}
                style={{ flex: 1 }}
              />
            </View>
          </View>
        </View>
      </Modal>

      {/* Log Measurements Modal */}
      <Modal visible={measureModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalHeading}>Update Body Measurements</Text>
            <Text style={styles.modalSubheading}>Tape measurements in centimeters (cm)</Text>

            <View style={styles.measureInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Chest (cm)</Text>
                <TextInput
                  placeholder="102"
                  placeholderTextColor={Colors.textMuted}
                  value={chestCm}
                  onChangeText={setChestCm}
                  keyboardType="decimal-pad"
                  style={styles.modalInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Waist (cm)</Text>
                <TextInput
                  placeholder="82"
                  placeholderTextColor={Colors.textMuted}
                  value={waistCm}
                  onChangeText={setWaistCm}
                  keyboardType="decimal-pad"
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={styles.measureInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Hips (cm)</Text>
                <TextInput
                  placeholder="96"
                  placeholderTextColor={Colors.textMuted}
                  value={hipsCm}
                  onChangeText={setHipsCm}
                  keyboardType="decimal-pad"
                  style={styles.modalInput}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.inputLabel}>Arms (cm)</Text>
                <TextInput
                  placeholder="37"
                  placeholderTextColor={Colors.textMuted}
                  value={bicepsCm}
                  onChangeText={setBicepsCm}
                  keyboardType="decimal-pad"
                  style={styles.modalInput}
                />
              </View>
            </View>

            <View style={styles.modalBtnRow}>
              <Button
                title="Cancel"
                variant="secondary"
                onPress={() => setMeasureModalVisible(false)}
                style={{ flex: 1 }}
              />
              <Button
                title="Save Measurements"
                onPress={handleSaveMeasurement}
                loading={savingMeasure}
                style={{ flex: 1 }}
              />
            </View>
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
  headerTitle: {
    ...Typography.title1,
    color: Colors.text,
  },
  headerAddBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  headerAddText: {
    ...Typography.captionBold,
    color: '#0B0F19',
  },
  scrollContent: {
    padding: Spacing.md,
  },
  statsCard: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
  },
  statCol: {
    flex: 1,
    alignItems: 'center',
  },
  statLbl: {
    ...Typography.tiny,
    color: Colors.textSecondary,
  },
  statVal: {
    ...Typography.title2,
    color: Colors.text,
    fontWeight: '800',
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
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
  historyCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.lg,
    gap: Spacing.md,
  },
  historyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  historyDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  historyDate: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  historyNotes: {
    ...Typography.tiny,
    color: Colors.textMuted,
    marginTop: 2,
  },
  historyWeight: {
    ...Typography.bodyBold,
    color: Colors.primary,
  },
  measureGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  measureCard: {
    width: '48%',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  measureVal: {
    ...Typography.title2,
    color: Colors.text,
    fontWeight: '800',
  },
  measureLbl: {
    ...Typography.tiny,
    color: Colors.textSecondary,
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
    height: 50,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    color: Colors.text,
    paddingHorizontal: Spacing.md,
    fontSize: 16,
    fontWeight: '600',
  },
  measureInputRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginBottom: Spacing.md,
  },
  modalBtnRow: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.sm,
  },
});
