import React, { useState, useEffect, useRef } from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert, SafeAreaView, Animated, Image } from "react-native";
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../state/recipeStore.fixed';
import HapticService from '../services/hapticService';
import GPTStylePantryInput from '../components/GPTStylePantryInput';

export default function PantryScreen() {
  const [showFilters, setShowFilters] = useState(false);
  const [activeFilters, setActiveFilters] = useState<string[]>([]);
  
  // Use global store for pantry items and filters
  const { pantryItems, addPantryItem, removePantryItem, updateFilters, filters } = useRecipeStore();
  
  // Animation refs
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const arrowAnim = useRef(new Animated.Value(0)).current;

  // Filter categories
  const filterCategories = {
    cuisines: ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'Indian', 'French'],
    difficulties: ['Easy', 'Medium', 'Hard'],
    cookTime: ['>15 min', '15-30 min', '30-45 min', '45+ min'],
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo'],
    diningTimes: ['Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Dessert'],
    foodConscious: ['High-Protein', 'High-Carb', 'Low-Calorie', 'Low-Fat', 'High-Fiber', 'Low-Sodium', 'Sugar-Free']
  };

  // Animation effects
  useEffect(() => {
    if (activeFilters.length > 0) {
      // Bounce animation when filters are active
      Animated.sequence([
        Animated.timing(bounceAnim, {
          toValue: 1.05,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(bounceAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();

      // Arrow animation
      Animated.loop(
        Animated.sequence([
          Animated.timing(arrowAnim, {
            toValue: 1,
            duration: 1000,
            useNativeDriver: true,
          }),
          Animated.timing(arrowAnim, {
            toValue: 0,
            duration: 1000,
            useNativeDriver: true,
          }),
        ])
      ).start();
    } else {
      // Reset animations when no filters
      bounceAnim.setValue(1);
      arrowAnim.setValue(0);
    }
  }, [activeFilters.length]);


  // Helper function to get filter preview
  const getFilterPreview = () => {
    if (activeFilters.length === 0) {
      return {
        mainText: "New! Use filters to customize your recipe suggestions.",
        subText: "Tap here to use filters!"
      };
    }
    return {
      mainText: `${activeFilters.length} filter${activeFilters.length > 1 ? 's' : ''} active`,
      subText: activeFilters.length <= 2 
        ? activeFilters.join(', ')
        : `${activeFilters.slice(0, 2).join(', ')} +${activeFilters.length - 2} more`
    };
  };


  const removeIngredient = (index: number) => {
    const itemToRemove = pantryItems[index];
    if (itemToRemove) {
      HapticService.buttonPress();
      removePantryItem(itemToRemove.id);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView style={styles.scrollView}>
               <View style={styles.header}>
               </View>

        {/* Filter Banner */}
        <Animated.View 
          style={[
            styles.filterBanner,
            activeFilters.length > 0 && styles.filterBannerActive,
            { transform: [{ scale: bounceAnim }] }
          ]}
        >
          <TouchableOpacity
            style={styles.filterBannerContent}
            onPress={() => {
              HapticService.buttonPress();
              setShowFilters(!showFilters);
            }}
            activeOpacity={0.8}
          >
                   <View style={styles.filterBannerLeft}>
                     <Ionicons name="sparkles" size={16} color="#FFD700" style={styles.filterBannerIcon} />
              <View style={styles.filterBannerTextContainer}>
                <Text style={[
                  styles.filterBannerMainText,
                  activeFilters.length > 0 && styles.filterBannerMainTextActive
                ]}>
                  {getFilterPreview().mainText}
                </Text>
                <Text style={[
                  styles.filterBannerSubText,
                  activeFilters.length > 0 && styles.filterBannerSubTextActive
                ]}>
                  {getFilterPreview().subText}
                </Text>
              </View>
            </View>
            <View style={styles.filterBannerRight}>
              {activeFilters.length > 0 && (
                <View style={styles.filterBadge}>
                  <Text style={styles.filterBadgeText}>{activeFilters.length}</Text>
                </View>
              )}
            </View>
          </TouchableOpacity>
        </Animated.View>

        {/* Filter Panel */}
        {showFilters && (
          <View style={styles.filterPanel}>
            <View style={styles.filterHeader}>
              <Text style={styles.filterTitle}>Filter Preferences</Text>
                   <TouchableOpacity onPress={() => setShowFilters(false)}>
                     <Ionicons name="close" size={20} color="#888888" />
                   </TouchableOpacity>
            </View>
            
            <ScrollView style={styles.filterScrollView} showsVerticalScrollIndicator={false}>
              {Object.entries(filterCategories).map(([category, filters]) => (
                <View key={category} style={styles.filterCategory}>
                  <Text style={styles.categoryTitle}>
                    {category === 'cuisines' ? 'Cuisines' :
                     category === 'difficulties' ? 'Difficulty' :
                     category === 'cookTime' ? 'Cook Time' :
                     category === 'dietary' ? 'Dietary' :
                     category === 'diningTimes' ? 'Dining Times' :
                     category === 'foodConscious' ? 'Food Conscious' :
                     category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <View style={styles.filterTags}>
                    {filters.map((filter) => (
                      <TouchableOpacity
                        key={filter}
                        style={[
                          styles.filterTag,
                          activeFilters.includes(filter) && styles.activeFilterTag
                        ]}
                        onPress={() => {
                          HapticService.filterChanged();
                          const newActiveFilters = activeFilters.includes(filter)
                            ? activeFilters.filter(f => f !== filter)
                            : [...activeFilters, filter];
                          
                          setActiveFilters(newActiveFilters);
                          
                          // Update global store filters based on active filters
                          // Map local filter categories to store filter properties
                          const storeFilters: any = {};
                          
                          // Check for meal type filters
                          const mealTypeFilter = newActiveFilters.find(f => 
                            ['Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Dessert'].includes(f)
                          );
                          if (mealTypeFilter) {
                            storeFilters.mealType = mealTypeFilter.toLowerCase();
                          }
                          
                          // Check for dietary filters
                          const dietaryFilter = newActiveFilters.find(f => 
                            ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo'].includes(f)
                          );
                          if (dietaryFilter) {
                            storeFilters.dietary = dietaryFilter.toLowerCase();
                          }
                          
                          // Check for cuisine filters
                          const cuisineFilter = newActiveFilters.find(f => 
                            ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'Indian', 'French'].includes(f)
                          );
                          if (cuisineFilter) {
                            storeFilters.cuisine = cuisineFilter;
                          }
                          
                          // Check for cook time filters
                          const cookTimeFilter = newActiveFilters.find(f => 
                            ['>15 min', '15-30 min', '30-45 min', '45+ min'].includes(f)
                          );
                          if (cookTimeFilter) {
                            if (cookTimeFilter === '>15 min') storeFilters.maxTime = 15;
                            else if (cookTimeFilter === '15-30 min') storeFilters.maxTime = 30;
                            else if (cookTimeFilter === '30-45 min') storeFilters.maxTime = 45;
                            else if (cookTimeFilter === '45+ min') storeFilters.maxTime = 60;
                          }
                          
                          updateFilters(storeFilters);
                        }}
                      >
                        <Text style={[
                          styles.filterTagText,
                          activeFilters.includes(filter) && styles.activeFilterTagText
                        ]}>
                          {filter}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        <View style={styles.inputSection}>
          <GPTStylePantryInput
            onIngredientsAdded={(ingredients) => {
              console.log('✅ Ingredients added via GPT input:', ingredients);
              // Trigger haptic feedback for successful addition
              HapticService.buttonPress();
            }}
            placeholder="Add ingredients to your pantry..."
          />
        </View>

        {pantryItems.length > 0 ? (
          <View style={styles.pantrySection}>
            <View style={styles.pantrySectionHeader}>
              <Text style={styles.sectionTitle}>Your Pantry Items</Text>
              <TouchableOpacity
                style={styles.clearAllButton}
                onPress={() => {
                  HapticService.buttonPress();
                  Alert.alert(
                    "Clear All Items",
                    "Are you sure you want to remove all ingredients from your pantry?",
                    [
                      { text: "Cancel", style: "cancel" },
                      { 
                        text: "Clear All", 
                        style: "destructive",
                        onPress: () => {
                          HapticService.successState();
                          // Clear all pantry items from the store
                          pantryItems.forEach(item => removePantryItem(item.id));
                        }
                      }
                    ]
                  );
                }}
                activeOpacity={0.8}
              >
                <Text style={styles.clearAllButtonText}>Clear All</Text>
              </TouchableOpacity>
            </View>
            <View style={styles.ingredientContainer}>
              {pantryItems.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.ingredientTag}
                  onPress={() => removeIngredient(index)}
                  activeOpacity={0.7}
                >
                         <Text style={styles.ingredientText}>{item.name}</Text>
                         <Ionicons name="close" size={16} color="#FFFFFF" style={styles.removeIcon} />
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ) : (
          <View style={styles.emptyStateSection}>
             <View style={styles.emptyStateContent}>
                     <Ionicons name="basket-outline" size={48} color="#999999" style={styles.emptyStateIcon} />
              <Text style={styles.emptyStateTitle}>Your pantry is empty</Text>
              <Text style={styles.emptyStateMessage}>Add some ingredients above to get started!</Text>
            </View>
          </View>
        )}
      </ScrollView>
      
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f8f9fa",
  },
  scrollView: {
    flex: 1,
  },
  header: {
    alignItems: "flex-start",
    padding: 20,
    paddingTop: 20,
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: '900',
    fontFamily: 'Recoleta-Bold',
    color: '#FF6B6B',
    marginBottom: 8,
  },
         subtitle: {
           fontSize: 24,
           lineHeight: 30,
           fontWeight: 'bold',
           fontFamily: 'Recoleta-Bold',
           color: '#333333',
           textAlign: "left",
         },
  inputSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
         inputLabel: {
           fontSize: 15,
           lineHeight: 22,
           fontWeight: '700',
           fontFamily: 'NunitoSans',
           color: '#333333',
           marginBottom: 12,
         },
  input: {
    borderWidth: 2,
    borderColor: "#e9ecef",
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'NunitoSans-Medium',
    backgroundColor: "#f8f9fa",
    color: '#333333',
    textAlignVertical: "top",
  },
  addButton: {
    backgroundColor: "#FF6B6B",
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  addButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'NunitoSans-Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  pantrySection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    margin: 20,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  pantrySectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: '500',
    fontFamily: 'NunitoSans-Medium',
    color: '#333333',
  },
  clearAllButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  clearAllButtonText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'NunitoSans-Medium',
    letterSpacing: 0.5,
    textTransform: 'uppercase',
    color: '#FFFFFF',
  },
  emptyStateSection: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 15,
    margin: 20,
    marginTop: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    minHeight: 150,
  },
  emptyStateContent: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 30,
  },
  emptyStateIcon: {
    marginBottom: 12,
  },
         emptyStateTitle: {
           fontSize: 22,
           lineHeight: 28,
           fontWeight: '900',
           fontFamily: 'Recoleta-Bold',
           color: '#999999',
           marginBottom: 6,
           textAlign: 'center',
         },
  emptyStateMessage: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#999999',
    textAlign: 'center',
  },
  ingredientContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  ingredientTag: {
    backgroundColor: "#FF6B6B",
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    flexDirection: "row",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  ingredientText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    fontFamily: 'NunitoSans',
    color: '#FFFFFF',
  },
  removeIcon: {
    marginLeft: 8,
    opacity: 0.9,
  },
  filterBanner: {
    backgroundColor: '#E3F2FD',
    margin: 20,
    marginTop: 10,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  filterBannerActive: {
    backgroundColor: '#BBDEFB',
    shadowOpacity: 0.15,
    elevation: 4,
  },
  filterBannerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  filterBannerLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  filterBannerIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  filterBannerTextContainer: {
    flex: 1,
  },
  filterBannerMainText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'NunitoSans',
    color: '#1976D2',
    marginBottom: 4,
  },
  filterBannerMainTextActive: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'NunitoSans',
    color: '#0D47A1',
  },
  filterBannerSubText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#1976D2',
    opacity: 0.8,
  },
  filterBannerSubTextActive: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'NunitoSans',
    color: '#0D47A1',
    opacity: 0.9,
  },
  filterBannerRight: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  filterBadge: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 8,
  },
  filterBadgeText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
  },
  filterBannerArrow: {
    marginLeft: 4,
  },
  filterBannerArrowText: {
    fontSize: 16,
    color: '#1976D2',
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
  },
  filterPanel: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    maxHeight: 400,
  },
  filterHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  filterTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: '900',
    fontFamily: 'Recoleta-Bold',
    color: '#333333',
  },
  closeIcon: {
    // Icon styling handled by Ionicons component
  },
  filterScrollView: {
    maxHeight: 300,
  },
  filterCategory: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  categoryTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'NunitoSans',
    color: '#333333',
    marginBottom: 15,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterTag: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  filterTagText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'NunitoSans',
    color: '#333333',
  },
  activeFilterTagText: {
    color: '#FFFFFF',
  },
});