import React, { useCallback, useState } from 'react';
import {
  ActivityIndicator,
  FlatList,
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
import { dietsApi, foodsApi } from '../../src/api';
import { DailyFoodDiary, FoodItem, FoodLog, MealType } from '../../src/types';
import { PortionSelectorModal } from '../../src/components/PortionSelectorModal';
import { Button } from '../../src/components/Button';

const MEAL_SECTIONS: { type: MealType; title: string; icon: string }[] = [
  { type: 'BREAKFAST', title: 'Breakfast', icon: 'sunny-outline' },
  { type: 'MORNING_SNACK', title: 'Morning Snack', icon: 'cafe-outline' },
  { type: 'LUNCH', title: 'Lunch', icon: 'restaurant-outline' },
  { type: 'EVENING_SNACK', title: 'Evening Snack', icon: 'nutrition-outline' },
  { type: 'DINNER', title: 'Dinner', icon: 'moon-outline' },
  { type: 'PRE_WORKOUT', title: 'Pre-Workout', icon: 'flash-outline' },
  { type: 'POST_WORKOUT', title: 'Post-Workout', icon: 'barbell-outline' },
];

export default function DietScreen() {
  const [diary, setDiary] = useState<DailyFoodDiary | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Search Food Modal State
  const [searchModalVisible, setSearchModalVisible] = useState(false);
  const [activeMealType, setActiveMealType] = useState<MealType>('LUNCH');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<FoodItem[]>([]);
  const [searching, setSearching] = useState(false);
  const [isVegFilter, setIsVegFilter] = useState(false);

  // Portion Modal State
  const [selectedFood, setSelectedFood] = useState<FoodItem | null>(null);
  const [portionModalVisible, setPortionModalVisible] = useState(false);

  const fetchDiary = async () => {
    try {
      const res = (await dietsApi.getDailyDiary()) as unknown as DailyFoodDiary;
      setDiary(res);
    } catch {
      // Fallback
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDiary();
    }, []),
  );

  const handleSearchFoods = async (query: string, vegOnly: boolean = isVegFilter) => {
    setSearching(true);
    try {
      const results = (await foodsApi.search({
        query: query.trim() || undefined,
        isVegetarian: vegOnly ? true : undefined,
      })) as unknown as FoodItem[];
      setSearchResults(results || []);
    } catch {
      // Fallback local items if offline
      setSearchResults([
        { id: '1', name: 'Roti (Whole Wheat)', category: 'Grains', servingSize: 30, servingUnit: 'piece', calories: 80, protein: 3, carbs: 16, fat: 0.5, isVegetarian: true, isVegan: true, isGlobal: true },
        { id: '2', name: 'Yellow Dal Tadka', category: 'Pulses', servingSize: 150, servingUnit: 'bowl', calories: 160, protein: 9, carbs: 22, fat: 4, isVegetarian: true, isVegan: true, isGlobal: true },
        { id: '3', name: 'Grilled Chicken Breast', category: 'Poultry', servingSize: 100, servingUnit: 'g', calories: 165, protein: 31, carbs: 0, fat: 3.6, isVegetarian: false, isVegan: false, isGlobal: true },
        { id: '4', name: 'Paneer (Raw)', category: 'Dairy', servingSize: 100, servingUnit: 'g', calories: 265, protein: 18, carbs: 3.5, fat: 20, isVegetarian: true, isVegan: false, isGlobal: true },
        { id: '5', name: 'White Rice (Cooked)', category: 'Grains', servingSize: 100, servingUnit: 'g', calories: 130, protein: 2.7, carbs: 28, fat: 0.3, isVegetarian: true, isVegan: true, isGlobal: true },
      ]);
    } finally {
      setSearching(false);
    }
  };

  const openSearchForMeal = (mealType: MealType) => {
    setActiveMealType(mealType);
    setSearchModalVisible(true);
    handleSearchFoods('');
  };

  const handleSelectFood = (food: FoodItem) => {
    setSelectedFood(food);
    setPortionModalVisible(true);
  };

  const handleConfirmLog = async (logData: any) => {
    try {
      console.log('[DIET] Logging food:', JSON.stringify({ foodName: logData.foodName, mealType: logData.mealType }));
      await dietsApi.logFood(logData);
      setSearchModalVisible(false);
      setPortionModalVisible(false);
      fetchDiary();
    } catch (err: any) {
      console.error(err);
    }
  };

  const handleDeleteLog = async (id: string) => {
    try {
      await dietsApi.deleteFoodLog(id);
      fetchDiary();
    } catch {
      // Ignore
    }
  };

  if (loading && !diary) {
    return (
      <SafeAreaView style={[styles.safeArea, styles.center]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </SafeAreaView>
    );
  }

  const consumed = diary?.summary?.calories?.consumed || 0;
  const target = diary?.summary?.calories?.target || 2000;
  const remaining = diary?.summary?.calories?.remaining ?? Math.max(0, target - consumed);

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Food Diary</Text>
        <TouchableOpacity
          onPress={() => openSearchForMeal('LUNCH')}
          style={styles.headerAddBtn}
        >
          <Ionicons name="add" size={20} color="#0B0F19" />
          <Text style={styles.headerAddText}>Log Food</Text>
        </TouchableOpacity>
      </View>

      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); fetchDiary(); }} tintColor={Colors.primary} />
        }
      >
        {/* Daily Calorie Summary Banner */}
        <View style={styles.summaryBanner}>
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>{consumed}</Text>
            <Text style={styles.summaryLbl}>Consumed</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={[styles.summaryVal, { color: Colors.primary }]}>{remaining}</Text>
            <Text style={styles.summaryLbl}>Remaining</Text>
          </View>
          <View style={styles.summaryDivider} />
          <View style={styles.summaryCol}>
            <Text style={styles.summaryVal}>{target}</Text>
            <Text style={styles.summaryLbl}>Target kcal</Text>
          </View>
        </View>

        {/* Meal Sections */}
        {MEAL_SECTIONS.map((section) => {
          const mealData = diary?.meals?.[section.type];
          const items: FoodLog[] = mealData?.items || [];
          const mealCalories = mealData?.totalCalories || 0;

          return (
            <View key={section.type} style={styles.mealCard}>
              {/* Meal Card Header */}
              <View style={styles.mealHeader}>
                <View style={styles.mealTitleRow}>
                  <Ionicons name={section.icon as any} size={20} color={Colors.primary} />
                  <Text style={styles.mealTitle}>{section.title}</Text>
                </View>

                <View style={styles.mealHeaderRight}>
                  {mealCalories > 0 && (
                    <Text style={styles.mealCalText}>{mealCalories} kcal</Text>
                  )}
                  <TouchableOpacity
                    onPress={() => openSearchForMeal(section.type)}
                    style={styles.addIconBtn}
                  >
                    <Ionicons name="add-circle" size={26} color={Colors.primary} />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Logged Items List */}
              {items.length === 0 ? (
                <TouchableOpacity
                  onPress={() => openSearchForMeal(section.type)}
                  style={styles.emptyMealBox}
                >
                  <Text style={styles.emptyMealText}>Tap + to log {section.title.toLowerCase()}</Text>
                </TouchableOpacity>
              ) : (
                <View style={styles.itemsList}>
                  {items.map((item) => (
                    <View key={item.id} style={styles.foodItemRow}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.foodItemName}>
                          {item.foodItem?.name || item.customFoodName}
                        </Text>
                        <Text style={styles.foodItemMeta}>
                          {item.quantity}x • {item.servingSize} {item.servingUnit} (P: {item.proteinG}g | C: {item.carbsG}g | F: {item.fatG}g)
                        </Text>
                      </View>

                      <Text style={styles.foodItemCal}>{item.calories} kcal</Text>

                      <TouchableOpacity
                        onPress={() => handleDeleteLog(item.id)}
                        style={styles.deleteBtn}
                      >
                        <Ionicons name="trash-outline" size={16} color={Colors.textMuted} />
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>
          );
        })}
      </ScrollView>

      {/* Food Search Modal */}
      <Modal visible={searchModalVisible} animationType="slide">
        <SafeAreaView style={styles.searchModalContainer}>
          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              onPress={() => setSearchModalVisible(false)}
              style={styles.modalCloseBtn}
            >
              <Ionicons name="arrow-back" size={24} color={Colors.text} />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Add Food to {activeMealType}</Text>
            <View style={{ width: 24 }} />
          </View>

          {/* Search Input Bar */}
          <View style={styles.searchBar}>
            <Ionicons name="search" size={20} color={Colors.textMuted} />
            <TextInput
              placeholder="Search Indian & global foods (e.g. Roti, Paneer)..."
              placeholderTextColor={Colors.textMuted}
              value={searchQuery}
              onChangeText={(text) => {
                setSearchQuery(text);
                handleSearchFoods(text);
              }}
              style={styles.searchInput}
            />
            {searchQuery.length > 0 && (
              <TouchableOpacity onPress={() => { setSearchQuery(''); handleSearchFoods(''); }}>
                <Ionicons name="close-circle" size={18} color={Colors.textMuted} />
              </TouchableOpacity>
            )}
          </View>

          {/* Filter Chips */}
          <View style={styles.filterRow}>
            <TouchableOpacity
              onPress={() => {
                const next = !isVegFilter;
                setIsVegFilter(next);
                handleSearchFoods(searchQuery, next);
              }}
              style={[styles.filterChip, isVegFilter ? styles.filterChipActive : null]}
            >
              <Ionicons
                name="leaf"
                size={14}
                color={isVegFilter ? Colors.primary : Colors.textMuted}
              />
              <Text style={[styles.filterChipText, isVegFilter ? styles.filterChipTextActive : null]}>
                Vegetarian Only
              </Text>
            </TouchableOpacity>
          </View>

          {/* Results List */}
          {searching ? (
            <View style={styles.center}>
              <ActivityIndicator size="small" color={Colors.primary} />
            </View>
          ) : (
            <FlatList
              data={searchResults}
              keyExtractor={(item) => item.id}
              contentContainerStyle={{ padding: Spacing.md }}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => handleSelectFood(item)}
                  style={styles.searchItemCard}
                >
                  <View style={{ flex: 1 }}>
                    <View style={styles.itemNameRow}>
                      <Text style={styles.searchItemName}>{item.name}</Text>
                      {item.isVegetarian && (
                        <View style={styles.vegDot} />
                      )}
                    </View>
                    <Text style={styles.searchItemMeta}>
                      {item.servingSize} {item.servingUnit} • P: {item.protein}g | C: {item.carbs}g | F: {item.fat}g
                    </Text>
                  </View>

                  <Text style={styles.searchItemCal}>{item.calories} kcal</Text>
                  <Ionicons name="add" size={20} color={Colors.primary} />
                </TouchableOpacity>
              )}
            />
          )}
        </SafeAreaView>
      </Modal>

      {/* Portion Selector Modal */}
      <PortionSelectorModal
        key={`${selectedFood?.id || 'none'}-${activeMealType}`}
        visible={portionModalVisible}
        food={selectedFood}
        selectedMealType={activeMealType}
        onClose={() => setPortionModalVisible(false)}
        onConfirm={handleConfirmLog}
      />
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
    paddingHorizontal: 14,
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
  summaryBanner: {
    flexDirection: 'row',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.xl,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  summaryCol: {
    flex: 1,
    alignItems: 'center',
  },
  summaryVal: {
    ...Typography.title2,
    color: Colors.text,
    fontWeight: '800',
  },
  summaryLbl: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  summaryDivider: {
    width: 1,
    height: 32,
    backgroundColor: Colors.border,
  },
  mealCard: {
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.lg,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.border,
    marginBottom: Spacing.md,
  },
  mealHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  mealTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs + 2,
  },
  mealTitle: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  mealHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  mealCalText: {
    ...Typography.captionBold,
    color: Colors.textSecondary,
  },
  addIconBtn: {
    padding: 2,
  },
  emptyMealBox: {
    paddingVertical: Spacing.sm,
    marginTop: Spacing.xs,
  },
  emptyMealText: {
    ...Typography.caption,
    color: Colors.textMuted,
    fontStyle: 'italic',
  },
  itemsList: {
    marginTop: Spacing.sm,
    gap: Spacing.xs,
  },
  foodItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm,
    gap: Spacing.sm,
  },
  foodItemName: {
    ...Typography.captionBold,
    color: Colors.text,
  },
  foodItemMeta: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  foodItemCal: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
  deleteBtn: {
    padding: 4,
  },
  searchModalContainer: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalCloseBtn: {
    padding: Spacing.xs,
  },
  modalTitle: {
    ...Typography.title3,
    color: Colors.text,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surfaceLight,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.md,
    margin: Spacing.md,
    height: 48,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.xs,
  },
  searchInput: {
    flex: 1,
    color: Colors.text,
    fontSize: 15,
  },
  filterRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.md,
    marginBottom: Spacing.xs,
  },
  filterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: BorderRadius.full,
    backgroundColor: Colors.surface,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: 4,
  },
  filterChipActive: {
    borderColor: Colors.primary,
    backgroundColor: Colors.primaryMuted,
  },
  filterChipText: {
    ...Typography.tiny,
    color: Colors.textSecondary,
  },
  filterChipTextActive: {
    color: Colors.primary,
    fontWeight: '700',
  },
  searchItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.surface,
    borderRadius: BorderRadius.md,
    padding: Spacing.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: Colors.border,
    gap: Spacing.sm,
  },
  itemNameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
  },
  searchItemName: {
    ...Typography.bodyBold,
    color: Colors.text,
  },
  vegDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.primary,
  },
  searchItemMeta: {
    ...Typography.tiny,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  searchItemCal: {
    ...Typography.captionBold,
    color: Colors.primary,
  },
});
