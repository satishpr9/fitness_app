import React, { useEffect, useState } from 'react';
import {
  Modal,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { BorderRadius, Colors, Spacing, Typography } from '../constants/theme';
import { FoodItem, MealType } from '../types';
import { Button } from './Button';

interface PortionSelectorModalProps {
  visible: boolean;
  food: FoodItem | null;
  selectedMealType?: MealType;
  onClose: () => void;
  onConfirm: (logData: {
    foodItemId: string;
    foodName: string;
    mealType: MealType;
    quantity: number;
    servingSize: number;
    servingUnit: string;
    calories: number;
    proteinG: number;
    carbsG: number;
    fatG: number;
    fiberG: number;
    date?: string;
  }) => void;
}

const MEAL_TYPES: { key: MealType; label: string }[] = [
  { key: 'BREAKFAST', label: 'Breakfast' },
  { key: 'MORNING_SNACK', label: 'Snack (AM)' },
  { key: 'LUNCH', label: 'Lunch' },
  { key: 'EVENING_SNACK', label: 'Snack (PM)' },
  { key: 'DINNER', label: 'Dinner' },
  { key: 'PRE_WORKOUT', label: 'Pre-Workout' },
  { key: 'POST_WORKOUT', label: 'Post-Workout' },
];

export const PortionSelectorModal: React.FC<PortionSelectorModalProps> = ({
  visible,
  food,
  selectedMealType = 'LUNCH',
  onClose,
  onConfirm,
}) => {
  const [quantity, setQuantity] = useState<number>(1);
  // Always use the parent's selectedMealType directly — no internal mealType state
  // This eliminates stale state bugs where the modal remembers a previous meal type
  const mealType = selectedMealType;

  useEffect(() => {
    if (visible) {
      setQuantity(1);
    }
  }, [visible, selectedMealType]);

  if (!food) return null;

  // Deterministic Portion Math matching backend FoodsService
  const baseServing = food.servingSize || 100;
  const ratio = (baseServing * quantity) / baseServing;

  const calcCalories = Math.round(food.calories * ratio);
  const calcProtein = Number((food.protein * ratio).toFixed(1));
  const calcCarbs = Number((food.carbs * ratio).toFixed(1));
  const calcFat = Number((food.fat * ratio).toFixed(1));
  const calcFiber = Number(((food.fiber || 0) * ratio).toFixed(1));

  const handleConfirm = () => {
    onConfirm({
      foodItemId: food.id,
      foodName: food.name,
      mealType,
      quantity,
      servingSize: food.servingSize,
      servingUnit: food.servingUnit,
      calories: calcCalories,
      proteinG: calcProtein,
      carbsG: calcCarbs,
      fatG: calcFat,
      fiberG: calcFiber,
      date: new Date().toISOString().split('T')[0],
    });
    onClose();
  };

  return (
    <Modal visible={visible} transparent animationType="slide" onRequestClose={onClose}>
      <View style={styles.overlay}>
        <View style={styles.modalContent}>
          {/* Header */}
          <View style={styles.header}>
            <View style={{ flex: 1 }}>
              <Text style={styles.foodName}>{food.name}</Text>
              <Text style={styles.foodMeta}>
                Base: {food.servingSize} {food.servingUnit} • {food.category}
              </Text>
            </View>
            <TouchableOpacity onPress={onClose} style={styles.closeBtn}>
              <Ionicons name="close" size={22} color={Colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Scaled Calories & Macros Card */}
          <View style={styles.nutritionBox}>
            <View style={styles.calorieBox}>
              <Text style={styles.calorieValue}>{calcCalories}</Text>
              <Text style={styles.calorieLabel}>kcal</Text>
            </View>

            <View style={styles.macroRow}>
              <View style={styles.macroCol}>
                <Text style={[styles.macroVal, { color: Colors.protein }]}>{calcProtein}g</Text>
                <Text style={styles.macroLbl}>Protein</Text>
              </View>
              <View style={styles.macroCol}>
                <Text style={[styles.macroVal, { color: Colors.carbs }]}>{calcCarbs}g</Text>
                <Text style={styles.macroLbl}>Carbs</Text>
              </View>
              <View style={styles.macroCol}>
                <Text style={[styles.macroVal, { color: Colors.fat }]}>{calcFat}g</Text>
                <Text style={styles.macroLbl}>Fat</Text>
              </View>
              <View style={styles.macroCol}>
                <Text style={[styles.macroVal, { color: Colors.fiber }]}>{calcFiber}g</Text>
                <Text style={styles.macroLbl}>Fiber</Text>
              </View>
            </View>
          </View>

          {/* Quantity Controls */}
          <Text style={styles.sectionLabel}>Number of Servings ({food.servingSize} {food.servingUnit} each)</Text>
          <View style={styles.stepperRow}>
            <TouchableOpacity
              onPress={() => setQuantity(Math.max(0.25, Number((quantity - 0.5).toFixed(2))))}
              style={styles.stepBtn}
            >
              <Ionicons name="remove" size={20} color={Colors.text} />
            </TouchableOpacity>

            <TextInput
              value={String(quantity)}
              onChangeText={(text) => {
                const val = parseFloat(text);
                if (!isNaN(val) && val >= 0) setQuantity(val);
              }}
              keyboardType="decimal-pad"
              style={styles.qtyInput}
            />

            <TouchableOpacity
              onPress={() => setQuantity(Number((quantity + 0.5).toFixed(2)))}
              style={styles.stepBtn}
            >
              <Ionicons name="add" size={20} color={Colors.text} />
            </TouchableOpacity>
          </View>

          {/* Quick Quantity Chips */}
          <View style={styles.chipRow}>
            {[0.5, 1, 1.5, 2, 3].map((qty) => (
              <TouchableOpacity
                key={qty}
                onPress={() => setQuantity(qty)}
                style={[styles.chip, quantity === qty ? styles.chipActive : null]}
              >
                <Text style={[styles.chipText, quantity === qty ? styles.chipTextActive : null]}>
                  {qty}x
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Meal Type Badge (read-only — driven by the section the user tapped '+' on) */}
          <Text style={styles.sectionLabel}>Adding To</Text>
          <View style={styles.mealChipWrap}>
            <View style={[styles.mealChip, styles.mealChipActive]}>
              <Text style={[styles.mealChipText, styles.mealChipTextActive]}>
                {MEAL_TYPES.find((m) => m.key === mealType)?.label || mealType}
              </Text>
            </View>
          </View>

          {/* Confirm Action */}
          <Button
            title={`Log ${calcCalories} kcal to ${MEAL_TYPES.find((m) => m.key === mealType)?.label}`}
            onPress={handleConfirm}
            size="lg"
            style={{ marginTop: Spacing.md }}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.75)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: Colors.surface,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.lg,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
  },
  foodName: {
    ...Typography.title2,
    color: Colors.text,
  },
  foodMeta: {
    ...Typography.caption,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  closeBtn: {
    padding: Spacing.xs,
  },
  nutritionBox: {
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  calorieBox: {
    alignItems: 'center',
    paddingRight: Spacing.md,
    borderRightWidth: 1,
    borderRightColor: Colors.border,
  },
  calorieValue: {
    ...Typography.title1,
    color: Colors.primary,
    fontWeight: '800',
  },
  calorieLabel: {
    ...Typography.tiny,
    color: Colors.textSecondary,
  },
  macroRow: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingLeft: Spacing.sm,
  },
  macroCol: {
    alignItems: 'center',
  },
  macroVal: {
    ...Typography.bodyBold,
  },
  macroLbl: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  sectionLabel: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  stepperRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: Spacing.md,
    marginVertical: Spacing.xs,
  },
  stepBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: Colors.surfaceHighlight,
    justifyContent: 'center',
    alignItems: 'center',
  },
  qtyInput: {
    width: 80,
    height: 44,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: BorderRadius.md,
    color: Colors.text,
    textAlign: 'center',
    fontSize: 18,
    fontWeight: '700',
  },
  chipRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    gap: Spacing.xs + 2,
    marginTop: Spacing.xs,
    marginBottom: Spacing.md,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  chipActive: {
    backgroundColor: Colors.primaryMuted,
    borderColor: Colors.primary,
  },
  chipText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  chipTextActive: {
    color: Colors.primary,
  },
  mealChipWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.xs,
    marginTop: Spacing.xs,
  },
  mealChip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.surfaceLight,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  mealChipActive: {
    backgroundColor: Colors.accentMuted,
    borderColor: Colors.accent,
  },
  mealChipText: {
    ...Typography.caption,
    color: Colors.textSecondary,
  },
  mealChipTextActive: {
    color: Colors.accent,
    fontWeight: '600',
  },
});
