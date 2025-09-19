import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  Dimensions,
  Animated,
  PanResponder,
  SafeAreaView,
  Modal,
  ScrollView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useRecipeStore } from '../state/recipeStore.fixed';
import GPTService from '../services/gptService';
import ImageService from '../services/imageService';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Mock recipe data for now
const mockRecipes = [
  {
    id: '1',
    title: 'Spicy Chicken Stir-fry',
    imageUrl: 'https://via.placeholder.com/300/FF6B6B/FFFFFF?text=Recipe1',
    cookTime: '25 min',
    cuisine: 'Asian',
    difficulty: 'Easy',
    calories: '420 cal',
    description: 'A quick and flavorful chicken stir-fry with vegetables and spicy sauce.',
    ingredients: ['2 chicken breasts, sliced', '1 bell pepper, julienned', '1/2 onion, sliced', '2 tbsp soy sauce', '3 cloves garlic, minced'],
    instructions: ['1. Slice chicken into thin strips and season with salt', '2. Heat oil in large pan over medium-high heat', '3. Cook chicken until golden brown, about 4-5 minutes', '4. Add vegetables and stir-fry for 3-4 minutes until crisp-tender', '5. Pour in soy sauce and toss everything together'],
  },
  {
    id: '2',
    title: 'Creamy Tomato Pasta',
    imageUrl: 'https://via.placeholder.com/300/4CAF50/FFFFFF?text=Recipe2',
    cookTime: '20 min',
    cuisine: 'Italian',
    difficulty: 'Easy',
    calories: '380 cal',
    description: 'Rich and creamy tomato pasta with fresh herbs and parmesan cheese.',
    ingredients: ['8 oz pasta', '2 large tomatoes, diced', '1/2 cup heavy cream', '4 cloves garlic, minced', '1/4 cup fresh basil, chopped', '1/2 cup parmesan, grated'],
    instructions: ['1. Cook pasta according to package directions until al dente', '2. Sauté garlic in olive oil until fragrant, about 1 minute', '3. Add tomatoes and cook until softened, about 5 minutes', '4. Stir in cream and simmer until sauce thickens slightly', '5. Toss pasta with sauce and garnish with basil and parmesan'],
  },
  {
    id: '3',
    title: 'Vegan Lentil Soup',
    imageUrl: 'https://via.placeholder.com/300/FFD700/FFFFFF?text=Recipe3',
    cookTime: '35 min',
    cuisine: 'Mediterranean',
    difficulty: 'Easy',
    calories: '320 cal',
    description: 'Hearty and nutritious lentil soup with vegetables and aromatic spices.',
    ingredients: ['1 cup red lentils', '1 onion, diced', '2 carrots, chopped', '2 celery stalks, chopped', '4 cups vegetable broth', '2 cloves garlic, minced', '1 tsp cumin', '1/2 tsp turmeric'],
    instructions: ['1. Rinse lentils and set aside', '2. Sauté onion, carrots, and celery until softened', '3. Add garlic and spices, cook for 1 minute', '4. Add lentils and broth, bring to boil', '5. Simmer for 25-30 minutes until lentils are tender'],
  },
];

// Swipeable Recipe Card Component
function SwipeableRecipeCard({ 
  recipe, 
  isTopCard, 
  onLike, 
  onSkip,
  onTap
}: { 
  recipe: any; 
  isTopCard: boolean; 
  onLike: () => void; 
  onSkip: () => void;
  onTap: () => void;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(isTopCard ? 0 : 15)).current;
  const scale = useRef(new Animated.Value(isTopCard ? 1 : 0.85)).current;
  const opacity = useRef(new Animated.Value(isTopCard ? 1 : 0.6)).current;

  // Update scale and opacity when isTopCard changes
  useEffect(() => {
    if (isTopCard) {
      // When card becomes top card, animate to full size and opacity with a smooth "pop" effect
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
        Animated.spring(opacity, {
          toValue: 1,
          useNativeDriver: true,
          tension: 200,
          friction: 8,
        }),
      ]).start();
    } else {
      // When card becomes background, animate to smaller size and lower opacity
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 0.85,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }),
        Animated.spring(translateY, {
          toValue: 15,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }),
        Animated.spring(opacity, {
          toValue: 0.6,
          useNativeDriver: true,
          tension: 120,
          friction: 10,
        }),
      ]).start();
    }
  }, [isTopCard, scale, opacity, translateY]);

  const panResponder = PanResponder.create({
    onStartShouldSetPanResponder: () => isTopCard,
    onMoveShouldSetPanResponder: () => isTopCard,
    onPanResponderGrant: () => {
      // Pan responder granted
    },
    onPanResponderMove: (_, gestureState) => {
      if (isTopCard) {
        translateX.setValue(gestureState.dx);
        translateY.setValue(gestureState.dy * 0.1); // Reduce vertical movement
      }
    },
    onPanResponderRelease: (_, gestureState) => {
      if (!isTopCard) return;
      
      const { dx, vx, dy } = gestureState;
      const swipeThreshold = screenWidth * 0.25; // 25% of screen width
      const velocityThreshold = 0.5;

      if (Math.abs(dx) > swipeThreshold || Math.abs(vx) > velocityThreshold) {
        // Swipe detected
        const targetX = dx > 0 ? screenWidth : -screenWidth;
        
        Animated.parallel([
          Animated.timing(translateX, {
            toValue: targetX,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(translateY, {
            toValue: -50,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(scale, {
            toValue: 0.8,
            duration: 300,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          // Call appropriate callback based on swipe direction
          if (dx > 0) {
            onLike();
          } else {
            onSkip();
          }
        });
      } else {
        // Return to center
        Animated.parallel([
          Animated.spring(translateX, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
          Animated.spring(translateY, {
            toValue: 0,
            useNativeDriver: true,
            tension: 100,
            friction: 8,
          }),
        ]).start();
      }
    },
  });

  // Calculate overlay opacities based on swipe position
  const likeOpacity = translateX.interpolate({
    inputRange: [0, screenWidth * 0.3],
    outputRange: [0, 1],
    extrapolate: 'clamp',
  });

  const nopeOpacity = translateX.interpolate({
    inputRange: [-screenWidth * 0.3, 0],
    outputRange: [1, 0],
    extrapolate: 'clamp',
  });

  return (
    <Animated.View
      style={[
        styles.swipeCard, 
        isTopCard ? styles.topCard : styles.backgroundCard,
        {
          transform: [
            { translateX },
            { translateY },
            { scale }
          ],
          opacity,
        }
      ]}
      {...panResponder.panHandlers}
    >
      <TouchableOpacity 
        style={styles.cardTouchable}
        onPress={onTap}
        activeOpacity={0.9}
      >
        <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />
        
               {/* Swipe Overlays */}
               <Animated.View style={[styles.swipeOverlay, styles.likeOverlay, { opacity: likeOpacity }]}>
                 <View style={styles.overlayContent}>
                   <Ionicons name="heart" size={60} color="#4CAF50" />
                   <Text style={[styles.overlayText, { color: '#4CAF50' }]}>OUI</Text>
                 </View>
               </Animated.View>
     
               <Animated.View style={[styles.swipeOverlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
                 <View style={styles.overlayContent}>
                   <Ionicons name="close" size={60} color="#F44336" />
                   <Text style={[styles.overlayText, { color: '#F44336' }]}>NON</Text>
                 </View>
               </Animated.View>

        {/* Recipe Info Overlay */}
        <View style={styles.recipeOverlay}>
          <Text style={styles.recipeTitle}>{recipe.title}</Text>
          <Text style={styles.recipeDescription}>{recipe.description}</Text>
          
          <View style={styles.recipeDetails}>
            <View style={styles.detailItemLeft}>
              <Ionicons name="time-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>{recipe.cookTime}</Text>
            </View>
            <View style={styles.detailItemCenter}>
              <Ionicons name="trending-up-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>{recipe.difficulty}</Text>
            </View>
            <View style={styles.detailItemRight}>
              <Ionicons name="flame-outline" size={16} color="#fff" />
              <Text style={styles.detailText}>{recipe.calories}</Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    </Animated.View>
  );
}

export default function RecipeFeedScreen() {
  const { pantryItems, filters, addRecipe } = useRecipeStore();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  
  // Track previous state to detect changes
  const [previousPantryItems, setPreviousPantryItems] = useState<any[]>([]);
  const [previousFilters, setPreviousFilters] = useState<any>({});
  const [isGenerating, setIsGenerating] = useState(false);

  // Function to check if pantry items have changed
  const pantryItemsChanged = (current: any[], previous: any[]): boolean => {
    if (current.length !== previous.length) return true;
    
    // Compare each item by id and name
    return current.some((item, index) => {
      const prevItem = previous[index];
      return !prevItem || item.id !== prevItem.id || item.name !== prevItem.name;
    });
  };

  // Function to check if filters have changed
  const filtersChanged = (current: any, previous: any): boolean => {
    const currentKeys = Object.keys(current);
    const previousKeys = Object.keys(previous);
    
    if (currentKeys.length !== previousKeys.length) return true;
    
    return currentKeys.some(key => current[key] !== previous[key]);
  };

  // Initial load only - no automatic regeneration on changes
  useEffect(() => {
    // Only load recipes on initial mount, not on every change
    if (recipes.length === 0) {
      loadRecipes();
    }
  }, []); // Empty dependency array - only run on mount

  // Initialize previous state on first load
  useEffect(() => {
    if (previousPantryItems.length === 0 && previousFilters && Object.keys(previousFilters).length === 0) {
      setPreviousPantryItems([...pantryItems]);
      setPreviousFilters({...filters});
    }
  }, [pantryItems, filters, previousPantryItems, previousFilters]);

  // Regenerate recipes when user navigates back to this tab (only if changes detected)
  useFocusEffect(
    React.useCallback(() => {
      // Prevent multiple simultaneous generations
      if (isGenerating) {
        console.log('⏳ Already generating recipes, skipping...');
        return;
      }

      // Check if pantry items or filters have actually changed
      const pantryChanged = pantryItemsChanged(pantryItems, previousPantryItems);
      const filterChanged = filtersChanged(filters, previousFilters);
      
      if (pantryChanged || filterChanged) {
        console.log('🔄 Tab focused - changes detected, regenerating recipes', {
          pantryChanged,
          filterChanged,
          pantryItems: pantryItems.length,
          filters: Object.keys(filters).filter(k => filters[k])
        });
        
        // Set generating flag to prevent multiple calls
        setIsGenerating(true);
        
        // Clear old recipes and show loading state
        setRecipes([]);
        setCurrentIndex(0);
        setLoading(true);
        
        // Update previous state to current state
        setPreviousPantryItems([...pantryItems]);
        setPreviousFilters({...filters});
        
        // Generate new recipes
        loadRecipes().finally(() => {
          setIsGenerating(false);
        });
      } else {
        console.log('📱 Tab focused - no changes detected, keeping current recipes');
      }
    }, [pantryItems, filters, previousPantryItems, previousFilters, isGenerating])
  );

  const loadRecipes = async () => {
    setLoading(true);
    try {
      // Generate recipes using GPT service
      const gptRecipes = await GPTService.generateRecipes(pantryItems, {
        mealType: filters.mealType,
        maxTime: filters.maxTime,
        cuisine: filters.cuisine,
        dietary: filters.dietary,
      });
      
      // Ensure we have an array to work with
      if (!gptRecipes || !Array.isArray(gptRecipes) || gptRecipes.length === 0) {
        console.warn('No recipes received from GPT, using fallback');
        setRecipes(mockRecipes);
        return;
      }
      
      // Add sample missing ingredients and enhance with images
      const recipesWithEnhancements = await Promise.all(
        (gptRecipes || []).map(async (recipe, index) => {
          // Get image from Unsplash
          const imageUrl = await ImageService.getRecipeImage(recipe.title);
          
          return {
            ...recipe,
            id: recipe.id || `gpt-${index}`,
            imageUrl,
            cookTime: recipe.cook_time || '30 min',
            instructions: recipe.steps || [],
            difficulty: recipe.difficulty || 'Medium',
            calories: recipe.calories || '400 cal',
            missingIngredients: [] // Will be calculated dynamically when modal opens
          };
        })
      );
      
      setRecipes(recipesWithEnhancements);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error loading recipes:', error);
      // Fallback to mock recipes if GPT fails
      setRecipes(mockRecipes);
    } finally {
      setLoading(false);
    }
  };

  const generateNewRecipes = async () => {
    // Prevent multiple simultaneous generations
    if (loading) {
      console.log('Already generating recipes, skipping...');
      return;
    }
    
    setLoading(true);
    try {
      const gptRecipes = await GPTService.generateRecipes(pantryItems, {
        mealType: filters.mealType,
        maxTime: filters.maxTime,
        cuisine: filters.cuisine,
        dietary: filters.dietary,
      });
      
      // Ensure we have an array to work with
      if (!gptRecipes || !Array.isArray(gptRecipes) || gptRecipes.length === 0) {
        console.warn('No recipes received from GPT, using fallback');
        setRecipes(mockRecipes);
        return;
      }
      
      // Add sample missing ingredients and enhance with images
      const recipesWithEnhancements = await Promise.all(
        (gptRecipes || []).map(async (recipe, index) => {
          // Get image from Unsplash
          const imageUrl = await ImageService.getRecipeImage(recipe.title);
          
          return {
            ...recipe,
            id: recipe.id || `gpt-${index}`,
            imageUrl,
            cookTime: recipe.cook_time || '30 min',
            instructions: recipe.steps || [],
            difficulty: recipe.difficulty || 'Medium',
            calories: recipe.calories || '400 cal',
            missingIngredients: [] // Will be calculated dynamically when modal opens
          };
        })
      );
      
      // Append new recipes to existing ones instead of replacing
      setRecipes(prevRecipes => [...prevRecipes, ...recipesWithEnhancements]);
      // Don't reset currentIndex - keep the user's current position
    } catch (error) {
      console.error('Error generating recipes:', error);
      Alert.alert('Error', 'Failed to generate new recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (recipe: any) => {
    // Save recipe to global store
    addRecipe(recipe);
    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      // If we're running low on recipes (less than 2 remaining), generate more
      if (newIndex >= recipes.length - 1) {
        generateNewRecipes();
      }
      return newIndex;
    });
  };

  const handleSkip = (recipe: any) => {
    setCurrentIndex(prev => {
      const newIndex = prev + 1;
      // If we're running low on recipes (less than 2 remaining), generate more
      if (newIndex >= recipes.length - 1) {
        generateNewRecipes();
      }
      return newIndex;
    });
  };

  const handleRefresh = () => {
    generateNewRecipes();
  };

  const handleRecipeTap = (recipe: any) => {
    // Calculate missing ingredients dynamically when modal opens
    const missingIngredients = getMissingIngredients(recipe.ingredients || [], pantryItems);
    const recipeWithMissingIngredients = {
      ...recipe,
      missingIngredients
    };
    
    console.log('🔍 Recipe tapped, calculated missing ingredients:', {
      recipe: recipe.title,
      ingredients: recipe.ingredients,
      pantryItems: pantryItems.map(item => item.name),
      missingIngredients
    });
    
    setSelectedRecipe(recipeWithMissingIngredients);
    setModalVisible(true);
  };

  const closeModal = () => {
    setModalVisible(false);
    setSelectedRecipe(null);
    setServingMultiplier(1); // Reset serving multiplier when modal closes
  };

  const handleServingChange = (multiplier: number) => {
    setServingMultiplier(multiplier);
  };

  // Function to determine missing ingredients by comparing recipe with pantry
  const getMissingIngredients = (recipeIngredients: string[], pantryItems: any[]): string[] => {
    console.log('🔍 getMissingIngredients called with:', {
      recipeIngredients,
      pantryItems: pantryItems.map(item => item.name)
    });

    if (!recipeIngredients || recipeIngredients.length === 0) return [];
    if (!pantryItems || pantryItems.length === 0) return recipeIngredients;

    const pantryNames = pantryItems.map(item => item.name.toLowerCase().trim());
    const missingIngredients: string[] = [];

    recipeIngredients.forEach(ingredient => {
      // Extract the main ingredient name (remove quantities and measurements)
      const ingredientText = ingredient.toLowerCase().trim();
      
      // Remove common quantity patterns to get the core ingredient name
      const cleanIngredient = ingredientText
        .replace(/^\d+\/\d+\s+/, '') // Remove fractions like "1/2 "
        .replace(/^\d+\.\d+\s+/, '') // Remove decimals like "1.5 "
        .replace(/^\d+\s+/, '') // Remove whole numbers like "2 "
        .replace(/^(cup|cups|tbsp|tsp|oz|lb|pound|pounds|clove|cloves|slice|slices|can|cans|bag|bags|bunch|bunches|head|heads|piece|pieces|dash|pinch|handful)\s+/, '') // Remove measurements
        .replace(/\s+(cup|cups|tbsp|tsp|oz|lb|pound|pounds|clove|cloves|slice|slices|can|cans|bag|bags|bunch|bunches|head|heads|piece|pieces|dash|pinch|handful)$/, '') // Remove measurements at end
        .replace(/,\s*(diced|chopped|sliced|minced|grated|shredded|crushed|whole|fresh|dried|frozen|canned|raw|cooked|optional).*$/, '') // Remove preparation methods
        .replace(/\s+(diced|chopped|sliced|minced|grated|shredded|crushed|whole|fresh|dried|frozen|canned|raw|cooked|optional).*$/, '') // Remove preparation methods
        .trim();

      // Check if any pantry item matches this ingredient
      const hasIngredient = pantryNames.some(pantryName => {
        // Direct match
        if (pantryName === cleanIngredient) return true;
        
        // Check if pantry item contains the ingredient or vice versa
        if (pantryName.includes(cleanIngredient) || cleanIngredient.includes(pantryName)) return true;
        
        // Check for common variations (plural/singular, different forms)
        const pantrySingular = pantryName.replace(/s$/, '');
        const ingredientSingular = cleanIngredient.replace(/s$/, '');
        if (pantrySingular === ingredientSingular) return true;
        
        return false;
      });

      console.log(`🔍 Ingredient: "${ingredient}" -> Clean: "${cleanIngredient}" -> Has: ${hasIngredient}`);
      
      if (!hasIngredient) {
        missingIngredients.push(ingredient);
      }
    });

    console.log('🔍 Missing ingredients result:', missingIngredients);
    return missingIngredients;
  };

  // Function to scale calories based on serving size
  const scaleCalories = (caloriesText: string, multiplier: number): string => {
    if (multiplier === 1) return caloriesText;
    
    // Extract number from calories text (e.g., "450 cal" -> 450)
    const match = caloriesText.match(/(\d+)/);
    if (!match) return caloriesText;
    
    const originalCalories = parseInt(match[1]);
    const scaledCalories = Math.round(originalCalories * multiplier);
    
    return caloriesText.replace(/\d+/, scaledCalories.toString());
  };

  // Function to adjust cook time based on serving size
  const adjustCookTime = (cookTimeText: string, multiplier: number): string => {
    if (multiplier === 1) return cookTimeText;
    
    // Extract number from cook time text (e.g., "25 min" -> 25)
    const match = cookTimeText.match(/(\d+)/);
    if (!match) return cookTimeText;
    
    const originalTime = parseInt(match[1]);
    
    // Cook time doesn't scale linearly - larger batches might take slightly longer
    // but not proportionally. Use a more conservative scaling.
    let adjustedTime: number;
    if (multiplier <= 0.5) {
      // Smaller batches cook faster
      adjustedTime = Math.round(originalTime * 0.8);
    } else if (multiplier >= 2) {
      // Larger batches take a bit longer
      adjustedTime = Math.round(originalTime * 1.2);
    } else {
      // Close to original serving size, minimal adjustment
      adjustedTime = originalTime;
    }
    
    return cookTimeText.replace(/\d+/, adjustedTime.toString());
  };

  // Function to format quantities as fractions when possible
  const formatQuantityAsFraction = (value: number): string => {
    // If it's a whole number, return as is
    if (value % 1 === 0) {
      return value.toString();
    }

    // Common fractions to check for
    const commonFractions = [
      { decimal: 0.125, fraction: '1/8' },
      { decimal: 0.25, fraction: '1/4' },
      { decimal: 0.33, fraction: '1/3' },
      { decimal: 0.375, fraction: '3/8' },
      { decimal: 0.5, fraction: '1/2' },
      { decimal: 0.625, fraction: '5/8' },
      { decimal: 0.67, fraction: '2/3' },
      { decimal: 0.75, fraction: '3/4' },
      { decimal: 0.875, fraction: '7/8' },
    ];

    // Check for exact matches with common fractions
    for (const { decimal, fraction } of commonFractions) {
      if (Math.abs(value - decimal) < 0.01) {
        return fraction;
      }
    }

    // For values greater than 1, try to separate whole and fractional parts
    if (value > 1) {
      const wholePart = Math.floor(value);
      const fractionalPart = value - wholePart;
      
      // Check if the fractional part matches a common fraction
      for (const { decimal, fraction } of commonFractions) {
        if (Math.abs(fractionalPart - decimal) < 0.01) {
          return `${wholePart} ${fraction}`;
        }
      }
      
      // If no common fraction matches, use decimal for fractional part
      if (fractionalPart > 0.01) {
        return `${wholePart} ${fractionalPart.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '')}`;
      }
      
      return wholePart.toString();
    }

    // For values less than 1, try to find the closest common fraction
    let closestFraction = '';
    let smallestDiff = Infinity;
    
    for (const { decimal, fraction } of commonFractions) {
      const diff = Math.abs(value - decimal);
      if (diff < smallestDiff && diff < 0.1) { // Only if reasonably close
        smallestDiff = diff;
        closestFraction = fraction;
      }
    }
    
    if (closestFraction) {
      return closestFraction;
    }

    // Fallback to decimal with 2 decimal places, removing trailing zeros
    return value.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
  };

  // Function to scale ingredient quantities based on serving size
  const scaleIngredientQuantity = (ingredient: string, multiplier: number): string => {
    if (multiplier === 1) return ingredient; // No scaling needed for 1x serving
    
    // Regular expressions to match common quantity patterns
    // Order matters - more specific patterns first to avoid overlapping matches
    const patterns = [
      // Fractions: 1/2, 1/4, 3/4, etc. (must be at start of word or after space)
      { regex: /(?:^|\s)(\d+\/\d+)(?=\s|$)/g, type: 'fraction' },
      // Decimals: 0.5, 1.5, 2.5, etc. (must be at start of word or after space)
      { regex: /(?:^|\s)(\d+\.\d+)(?=\s|$)/g, type: 'decimal' },
      // Whole numbers: 1, 2, 3, etc. (must be at start of word or after space, not part of fraction)
      { regex: /(?:^|\s)(\d+)(?=\s|$)/g, type: 'whole' },
    ];

    let scaledIngredient = ingredient;

    patterns.forEach(({ regex, type }) => {
      scaledIngredient = scaledIngredient.replace(regex, (match, capturedGroup) => {
        // Use the captured group (the actual number/fraction) instead of the full match
        const numberPart = capturedGroup;
        let value: number;
        
        if (type === 'fraction') {
          // Parse fraction (e.g., "1/2" -> 0.5)
          const [numerator, denominator] = numberPart.split('/').map(Number);
          value = numerator / denominator;
        } else if (type === 'decimal') {
          // Parse decimal (e.g., "1.5" -> 1.5)
          value = parseFloat(numberPart);
        } else {
          // Parse whole number (e.g., "2" -> 2)
          value = parseInt(numberPart);
        }

        // Scale the value
        const scaledValue = value * multiplier;

        // Format the result - prefer fractions over decimals
        return match.replace(numberPart, formatQuantityAsFraction(scaledValue));
      });
    });

    return scaledIngredient;
  };

  if (loading && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Image
            source={require('../assets/animations/coral_outline.gif')}
            style={styles.loadingGif}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>
            {pantryItems.length > 0 || Object.values(filters).some(value => value && value !== '') 
              ? 'Generating new recipes...' 
              : 'Finding delicious recipes...'
            }
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  // Show loading state while generating new recipes
  if (currentIndex >= recipes.length && loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <Image 
            source={require('../assets/animations/coral_outline.gif')} 
            style={styles.loadingGif}
          />
          <Text style={styles.loadingText}>Generating new recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  const currentRecipe = recipes[currentIndex];
  const nextRecipe = recipes[currentIndex + 1];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Background Card */}
        {nextRecipe && (
          <SwipeableRecipeCard
            key={`background-${nextRecipe.id}`}
            recipe={nextRecipe}
            isTopCard={false}
            onLike={() => handleLike(nextRecipe)}
            onSkip={() => handleSkip(nextRecipe)}
            onTap={() => handleRecipeTap(nextRecipe)}
          />
        )}

        {/* Top Card */}
        <SwipeableRecipeCard
          key={`top-${currentRecipe.id}`}
          recipe={currentRecipe}
          isTopCard={true}
          onLike={() => handleLike(currentRecipe)}
          onSkip={() => handleSkip(currentRecipe)}
          onTap={() => handleRecipeTap(currentRecipe)}
        />
      </View>

      {/* Recipe Detail Modal */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeModal}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity onPress={closeModal} style={styles.closeButton}>
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Recipe Details</Text>
            <View style={styles.placeholder} />
          </View>
          
          {selectedRecipe && (
            <ScrollView style={styles.modalContent}>
              <Image source={{ uri: selectedRecipe.imageUrl }} style={styles.modalImage} />
              
              <View style={styles.modalInfo}>
                <View style={styles.titleDescriptionSection}>
                  <Text style={styles.modalRecipeTitle}>{selectedRecipe.title}</Text>
                  <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>
                </View>
                
                <View style={[styles.modalDetails, styles.detailsWithBackground]}>
                  <View style={styles.modalDetailItemLeft}>
                    <Ionicons name="time-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>{adjustCookTime(selectedRecipe.cookTime, servingMultiplier)}</Text>
                  </View>
                  <View style={styles.modalDetailItemCenter}>
                    <Ionicons name="trending-up-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>{selectedRecipe.difficulty}</Text>
                  </View>
                  <View style={styles.modalDetailItemRight}>
                    <Ionicons name="flame-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>{scaleCalories(selectedRecipe.calories, servingMultiplier)}</Text>
                  </View>
                </View>

                {/* Serving Size Section */}
                <View style={[styles.section, styles.servingSizeSection]}>
                  <View style={styles.servingSizeRow}>
                    <Text style={styles.servingSizeTitle}>Serving Size</Text>
                    <View style={styles.servingSizeButtons}>
                      <TouchableOpacity 
                        style={[styles.servingSizeButton, servingMultiplier === 0.5 && styles.servingSizeButtonActive]}
                        onPress={() => handleServingChange(0.5)}
                      >
                        <Text style={[styles.servingSizeButtonText, servingMultiplier === 0.5 && styles.servingSizeButtonTextActive]}>1/2</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.servingSizeButton, servingMultiplier === 1 && styles.servingSizeButtonActive]}
                        onPress={() => handleServingChange(1)}
                      >
                        <Text style={[styles.servingSizeButtonText, servingMultiplier === 1 && styles.servingSizeButtonTextActive]}>1</Text>
                      </TouchableOpacity>
                      <TouchableOpacity 
                        style={[styles.servingSizeButton, servingMultiplier === 2 && styles.servingSizeButtonActive]}
                        onPress={() => handleServingChange(2)}
                      >
                        <Text style={[styles.servingSizeButtonText, servingMultiplier === 2 && styles.servingSizeButtonTextActive]}>2</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                  <Text style={styles.servingSizeSubtext}>Makes {Math.round(4 * servingMultiplier)} servings.</Text>
                </View>

                {/* Missing Ingredients Section */}
                {(() => {
                  console.log('🔍 Modal missing ingredients check:', {
                    hasMissingIngredients: selectedRecipe.missingIngredients,
                    length: selectedRecipe.missingIngredients?.length,
                    ingredients: selectedRecipe.missingIngredients
                  });
                  return selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0;
                })() && (
                  <View style={[styles.section, styles.missingIngredientsBanner]}>
                    <View style={styles.missingIngredientsContent}>
                      <View style={styles.missingIngredientsLeft}>
                        <Ionicons name="warning-outline" size={20} color="#F57C00" style={styles.missingIngredientsIcon} />
                        <View style={styles.missingIngredientsTextContainer}>
                          <Text style={styles.missingIngredientsMainText}>Missing Ingredients</Text>
                          <Text style={styles.missingIngredientsSubText}>
                            {selectedRecipe.missingIngredients.join(', ')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* All Ingredients Available Section */}
                {(!selectedRecipe.missingIngredients || selectedRecipe.missingIngredients.length === 0) && (
                  <View style={[styles.section, styles.allIngredientsBanner]}>
                    <View style={styles.missingIngredientsContent}>
                      <View style={styles.missingIngredientsLeft}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" style={styles.missingIngredientsIcon} />
                        <View style={styles.missingIngredientsTextContainer}>
                          <Text style={[styles.missingIngredientsMainText, { color: '#4CAF50' }]}>All Ingredients Available</Text>
                          <Text style={[styles.missingIngredientsSubText, { color: '#4CAF50' }]}>
                            You have everything needed for this recipe!
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                <View style={[styles.section, styles.sectionWithBackground]}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {(selectedRecipe.ingredients || []).map((ingredient: string, index: number) => (
                    <Text key={index} style={styles.ingredientText}>
                      • {scaleIngredientQuantity(ingredient, servingMultiplier)}
                    </Text>
                  ))}
                </View>

                <View style={[styles.section, styles.sectionWithBackground]}>
                  <Text style={styles.sectionTitle}>Instructions</Text>
                  {(selectedRecipe.instructions || []).map((instruction: string, index: number) => (
                    <Text key={index} style={styles.instructionText}>{instruction}</Text>
                  ))}
                </View>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingGif: {
    width: 120,
    height: 120,
  },
  loadingText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontFamily: 'Recoleta-Regular',
    marginTop: 10,
  },
  cardContainer: {
    flex: 1,
    position: 'relative',
    margin: 20,
  },
  swipeCard: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  topCard: {
    zIndex: 2,
  },
  backgroundCard: {
    zIndex: 1,
  },
  recipeImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  recipeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: 'rgba(0,0,0,0.7)',
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontFamily: 'Recoleta-Bold',
    color: '#fff',
    marginBottom: 8,
  },
  recipeDescription: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#fff',
    lineHeight: 22,
    marginBottom: 15,
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  detailItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    justifyContent: 'flex-start',
  },
  detailItemCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    justifyContent: 'center',
  },
  detailItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
    justifyContent: 'flex-end',
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'Recoleta-Bold',
    color: '#fff',
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 3,
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.8)',
  },
  nopeOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.8)',
  },
  overlayContent: {
    alignItems: 'center',
  },
  overlayText: {
    fontSize: 36,
    fontFamily: 'Recoleta-Bold',
    color: '#fff',
    marginTop: 10,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
    gap: 8,
  },
  refreshButtonText: {
    color: '#fff',
    fontFamily: 'NunitoSans-SemiBold',
    fontSize: 16,
  },
  cardTouchable: {
    flex: 1,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  closeButton: {
    padding: 5,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
  },
  placeholder: {
    width: 34,
  },
  modalContent: {
    flex: 1,
  },
  modalImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  modalInfo: {
    padding: 20,
  },
  titleDescriptionSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 20,
  },
  modalRecipeTitle: {
    fontSize: 24,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginBottom: 10,
  },
  modalDescription: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  modalDetails: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 30,
  },
  detailsWithBackground: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  servingSizeSection: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  servingSizeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  servingSizeTitle: {
    fontSize: 16,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
  },
  servingSizeButtons: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  servingSizeButton: {
    backgroundColor: '#f8f9fa',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    minWidth: 50,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  servingSizeButtonActive: {
    backgroundColor: '#FF6B6B',
    borderColor: '#FF6B6B',
  },
  servingSizeButtonText: {
    fontSize: 16,
    fontFamily: 'NunitoSans-SemiBold',
    color: '#666',
  },
  servingSizeButtonTextActive: {
    color: '#fff',
  },
  servingSizeSubtext: {
    fontSize: 14,
    fontFamily: 'NunitoSans-Regular',
    color: '#666',
    textAlign: 'left',
    marginTop: 8,
  },
  modalDetailItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-start',
  },
  modalDetailItemCenter: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'center',
  },
  modalDetailItemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalDetailText: {
    fontSize: 14,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
  },
  section: {
    marginBottom: 25,
  },
  sectionWithBackground: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
  },
  missingIngredientsBanner: {
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  allIngredientsBanner: {
    backgroundColor: '#E8F5E8', // Light green
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  missingIngredientsContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
  },
  missingIngredientsLeft: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  missingIngredientsIcon: {
    marginRight: 8,
    marginTop: 2,
  },
  missingIngredientsTextContainer: {
    flex: 1,
  },
  missingIngredientsMainText: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '900',
    fontFamily: 'Recoleta-Bold',
    color: '#F57C00',
    marginBottom: 4,
  },
  missingIngredientsSubText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
    fontFamily: 'NunitoSans-Bold',
    color: '#F57C00',
    opacity: 0.8,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginBottom: 15,
  },
  ingredientText: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#333',
    lineHeight: 24,
    marginBottom: 12,
  },
});
