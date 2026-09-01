import React, { useEffect, useState } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { progressApi } from '../api';

interface WaterTrackerCardProps {
  consumedMl: number;
  targetMl: number;
  onWaterUpdated?: (newTotalMl: number) => void;
}

export const WaterTrackerCard: React.FC<WaterTrackerCardProps> = ({
  consumedMl: initialConsumed,
  targetMl,
  onWaterUpdated,
}) => {
  const [consumedMl, setConsumedMl] = useState(initialConsumed);
  const [isAdding, setIsAdding] = useState(false);

  useEffect(() => {
    setConsumedMl(initialConsumed);
  }, [initialConsumed]);

  const percentage = Math.min(Math.round((consumedMl / (targetMl || 2500)) * 100), 100);
  const glasses = (consumedMl / 250).toFixed(1);
  const targetGlasses = Math.ceil(targetMl / 250);

  const handleQuickAdd = async (amount: number = 250) => {
    if (isAdding) return;
    setIsAdding(true);
    try {
      await progressApi.quickAddWater(amount);
      const newTotal = consumedMl + amount;
      setConsumedMl(newTotal);
      if (onWaterUpdated) onWaterUpdated(newTotal);
    } catch {
      // Optimistic increment rollback if needed
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.titleRow}>
          <View style={styles.iconCircle}>
            <Ionicons name="water" size={20} color={Colors.accent} />
          </View>
          <View>
            <Text style={styles.title}>Water Tracker</Text>
            <Text style={styles.subtitle}>
              {consumedMl} / {targetMl} ml ({glasses} / {targetGlasses} glasses)
            </Text>
          </View>
        </View>

        <TouchableOpacity
          activeOpacity={0.7}
          onPress={() => handleQuickAdd(250)}
          disabled={isAdding}
          style={styles.addButton}
        >
          <Ionicons name="add" size={16} color="#FFFFFF" />
          <Text style={styles.addButtonText}>+250ml</Text>
        </TouchableOpacity>
      </View>

      {/* Progress Bar */}
      <View style={styles.progressTrack}>
        <View style={[styles.progressFill, { width: `${percentage}%` }]} />
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.percentText}>{percentage}% of daily goal</Text>
        <Text style={styles.remainingText}>
          {Math.max(0, targetMl - consumedMl)} ml remaining
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.sm,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.accentMuted,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  subtitle: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.accent,
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    gap: 4,
  },
  addButtonText: {
    ...Typography.captionBold,
    color: '#0B0F19',
  },
  progressTrack: {
    height: 8,
    backgroundColor: Colors.surfaceHighlight,
    borderRadius: 4,
    overflow: 'hidden',
    marginTop: Spacing.xs,
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.accent,
    borderRadius: 4,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: Spacing.xs + 2,
  },
  percentText: {
    ...Typography.tiny,
    color: Colors.accent,
    fontWeight: '600',
  },
  remainingText: {
    ...Typography.tiny,
    color: Colors.textMuted,
  },
});
