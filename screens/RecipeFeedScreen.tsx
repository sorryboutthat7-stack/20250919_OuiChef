import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  Image,
  ActivityIndicator,
  Dimensions,
  Animated,
  PanResponder,
  SafeAreaView,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../state/recipeStore';
import GPTService from '../services/gptService';

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
    difficulty: 'Medium',
    calories: '280 cal',
    description: 'Hearty and nutritious lentil soup with vegetables and aromatic spices.',
    ingredients: ['1 cup red lentils, rinsed', '2 carrots, diced', '2 celery stalks, chopped', '1 onion, diced', '4 cups vegetable broth', '2 tsp cumin, 1 tsp turmeric'],
    instructions: ['1. Sauté onion, carrots, and celery until softened, about 5 minutes', '2. Add lentils and spices, stirring for 1 minute to toast', '3. Pour in broth and bring to a boil, then reduce heat', '4. Simmer uncovered for 20-25 minutes until lentils are tender', '5. Season with salt and pepper, serve hot'],
  },
];

// SwipeCard Component
function SwipeCard({ 
  recipe, 
  onSwipeRight, 
  onSwipeLeft, 
  onTap, 
  isTopCard = false 
}: {
  recipe: any;
  onSwipeRight: () => void;
  onSwipeLeft: () => void;
  onTap: () => void;
  isTopCard?: boolean;
}) {
  const translateX = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(0)).current;
  const scale = useRef(new Animated.Value(isTopCard ? 1 : 0.95)).current;
  const opacity = useRef(new Animated.Value(isTopCard ? 1 : 0.8)).current;

  // Update scale and opacity when isTopCard changes
  useEffect(() => {
    // Reset transform values when becoming top card
    if (isTopCard) {
      translateX.setValue(0);
      translateY.setValue(0);
    }
    
    Animated.parallel([
      Animated.spring(scale, {
        toValue: isTopCard ? 1 : 0.9,
        useNativeDriver: true,
        tension: 100,
        friction: 8,
      }),
      Animated.timing(opacity, {
        toValue: isTopCard ? 1 : 0.7,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  }, [isTopCard, scale, opacity, translateX, translateY]);

  const panResponder = isTopCard ? PanResponder.create({
    onStartShouldSetPanResponder: () => true,
    onMoveShouldSetPanResponder: () => true,
    onPanResponderGrant: () => {
      // Pan responder granted
    },
    onPanResponderMove: (_, gestureState) => {
      translateX.setValue(gestureState.dx);
      translateY.setValue(gestureState.dy * 0.1); // Reduce vertical movement
    },
    onPanResponderRelease: (_, gestureState) => {
      const { dx, vx, dy } = gestureState;
      const swipeThreshold = screenWidth * 0.25; // 25% of screen width
      const velocityThreshold = 0.5;
      const tapThreshold = 10; // Small movement threshold for tap

      // Check if it's a tap (small movement)
      if (Math.abs(dx) < tapThreshold && Math.abs(dy) < tapThreshold) {
        onTap();
        return;
      }

      if (Math.abs(dx) > swipeThreshold || Math.abs(vx) > velocityThreshold) {
        const direction = dx > 0 ? 'right' : 'left';
        const targetX = direction === 'right' ? screenWidth + 100 : -screenWidth - 100;
        
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
        ]).start(() => {
          if (direction === 'right') {
            onSwipeRight();
          } else {
            onSwipeLeft();
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
  }) : null;

  const cardStyle = {
    transform: [
      { translateX },
      { translateY },
      { scale },
    ],
    opacity,
  };

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
        cardStyle
      ]}
      pointerEvents={isTopCard ? 'auto' : 'none'}
      {...(panResponder ? panResponder.panHandlers : {})}
    >
      <View style={styles.cardContent}>
        <Image source={{ uri: recipe.imageUrl }} style={styles.cardImage} />
        
        {/* Swipe Overlays */}
        <Animated.View style={[styles.swipeOverlay, styles.likeOverlay, { opacity: likeOpacity }]}>
            <View style={styles.overlayContent}>
            <Ionicons name="heart" size={60} color="#4CAF50" />
            <Text style={styles.overlayText}>SAVED</Text>
            </View>
          </Animated.View>

        <Animated.View style={[styles.swipeOverlay, styles.nopeOverlay, { opacity: nopeOpacity }]}>
            <View style={styles.overlayContent}>
            <Ionicons name="close" size={60} color="#F44336" />
            <Text style={styles.overlayText}>SKIPPED</Text>
            </View>
          </Animated.View>

              {/* Recipe Info Overlay */}
              <View style={styles.recipeOverlay}>
                <Text style={styles.recipeTitle}>{recipe.title}</Text>
                <View style={styles.recipeMeta}>
                  <View style={[styles.metaItem, styles.metaItemLeft]}>
                    <Ionicons name="time-outline" size={16} color="#fff" />
                    <Text style={styles.metaText}>{recipe.cookTime}</Text>
              </View>
                  <View style={[styles.metaItem, styles.metaItemCenter]}>
                    <Ionicons name="trending-up-outline" size={16} color="#fff" />
                    <Text style={styles.metaText}>{recipe.difficulty}</Text>
              </View>
                  <View style={[styles.metaItem, styles.metaItemRight]}>
                    <Ionicons name="flame-outline" size={16} color="#fff" />
                    <Text style={styles.metaText}>{recipe.calories}</Text>
                </View>
            </View>
              </View>

        {/* Save Button */}
        <TouchableOpacity style={styles.saveButton} onPress={onSwipeRight}>
          <Ionicons name="bookmark-outline" size={24} color="#fff" />
        </TouchableOpacity>
    </View>
         </Animated.View>
  );
}

export default function RecipeFeedScreen() {
  const { pantryItems, filters } = useRecipeStore();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);

  // Generate recipes when component mounts or pantry changes
  useEffect(() => {
    generateRecipes();
  }, [pantryItems, filters]);

  // Helper functions for pantry matching
  const calculatePantryMatch = (recipeIngredients: string[]): number => {
    if (pantryItems.length === 0) return 0;
    
    const pantryNames = pantryItems.map(item => item.name.toLowerCase());
    const matchingCount = recipeIngredients.filter(ingredient => {
      const ingredientLower = ingredient.toLowerCase();
      return pantryNames.some(pantryItem => 
        ingredientLower.includes(pantryItem) || pantryItem.includes(ingredientLower.split(',')[0].trim())
      );
    }).length;
    
    return Math.round((matchingCount / recipeIngredients.length) * 100);
  };

  const getMatchingIngredients = (recipeIngredients: string[]): string[] => {
    if (pantryItems.length === 0) return [];
    
    const pantryNames = pantryItems.map(item => item.name.toLowerCase());
    return recipeIngredients.filter(ingredient => {
      const ingredientLower = ingredient.toLowerCase();
      return pantryNames.some(pantryItem => 
        ingredientLower.includes(pantryItem) || pantryItem.includes(ingredientLower.split(',')[0].trim())
      );
    });
  };

  const canMakeWithPantry = (recipeIngredients: string[]): boolean => {
    const missingIngredients = recipeIngredients.length - getMatchingIngredients(recipeIngredients).length;
    return missingIngredients <= 2; // Can make if 2 or fewer missing ingredients
  };

  const generateRecipes = async () => {
    setLoading(true);
    try {
      const gptRecipes = await GPTService.generateRecipes(pantryItems, {
        mealType: filters.mealType,
        maxTime: filters.maxTime,
        cuisine: filters.cuisine,
        dietary: filters.dietary,
      });

      // Transform GPT recipes to our format
      const transformedRecipes = gptRecipes.map((recipe, index) => ({
        id: `gpt-${Date.now()}-${index}`,
        title: recipe.title,
        imageUrl: `https://via.placeholder.com/300/FF6B6B/FFFFFF?text=${encodeURIComponent(recipe.title)}`,
        cookTime: recipe.cook_time,
        cuisine: recipe.cuisine,
        difficulty: 'Easy', // GPT doesn't provide difficulty, defaulting to Easy
        calories: `${Math.floor(Math.random() * 200) + 300} cal`, // Random calories for now
        description: recipe.description,
        ingredients: recipe.ingredients,
        instructions: recipe.steps,
        pantryMatch: calculatePantryMatch(recipe.ingredients),
        matchingIngredients: getMatchingIngredients(recipe.ingredients),
        canMake: canMakeWithPantry(recipe.ingredients),
      }));

      setRecipes(transformedRecipes);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error generating recipes:', error);
      // Fallback to mock recipes if GPT fails
      const fallbackRecipes = mockRecipes.map(recipe => ({
        ...recipe,
        pantryMatch: calculatePantryMatch(recipe.ingredients),
        matchingIngredients: getMatchingIngredients(recipe.ingredients),
        canMake: canMakeWithPantry(recipe.ingredients),
      }));
      setRecipes(fallbackRecipes);
      setCurrentIndex(0);
      } finally {
      setLoading(false);
    }
  };
  
  const handleSwipeRight = () => {
    const currentRecipe = recipes[currentIndex];
    if (currentRecipe && !savedRecipes.includes(currentRecipe.id)) {
      setSavedRecipes(prev => [...prev, currentRecipe.id]);
      Alert.alert('Recipe Saved!', `${currentRecipe.title} has been saved!`);
    }
    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  const handleSwipeLeft = () => {
    // Move to next card
    setCurrentIndex(prev => prev + 1);
  };

  const handleCardTap = () => {
    const currentRecipe = recipes[currentIndex];
    if (currentRecipe) {
      Alert.alert(
        currentRecipe.title,
        `${currentRecipe.description}\n\nCook Time: ${currentRecipe.cookTime}\nDifficulty: ${currentRecipe.difficulty}\nCalories: ${currentRecipe.calories}`,
        [{ text: 'OK' }]
      );
    }
  };

  const handleRefresh = () => {
    generateRecipes();
    Alert.alert('New Recipes', 'Fresh recipes loaded!');
  };

  const currentRecipe = recipes[currentIndex];
  const nextRecipe = recipes[currentIndex + 1];
  const thirdRecipe = recipes[currentIndex + 2];
  
  
  // Ensure we have at least the current card
  const hasCurrentCard = currentRecipe;


  // Show loading state if recipes are being generated
  if (loading) {
    return (
      <View style={styles.container}>
      <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#FF6B6B" />
          <Text style={styles.loadingText}>Loading fresh recipes...</Text>
        </View>
      </View>
    );
  }

  // Show empty state if no more recipes
  if (!hasCurrentCard) {
    return (
      <View style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={80} color="#999" />
          <Text style={styles.emptyText}>No more recipes!</Text>
          <Text style={styles.emptySubtext}>Pull down to refresh and get new recipes</Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Text style={styles.refreshButtonText}>Get New Recipes</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.cardContainer}>
        {/* Third Card - Back Background (only if available) */}
        {thirdRecipe && (
          <SwipeCard
            recipe={thirdRecipe}
            onSwipeRight={() => {}} // Empty handler for background card
            onSwipeLeft={() => {}} // Empty handler for background card
            onTap={() => {}} // Empty handler for background card
            isTopCard={false}
          />
        )}

        {/* Background Card */}
        {nextRecipe && (
          <SwipeCard
            recipe={nextRecipe}
            onSwipeRight={() => {}} // Empty handler for background card
            onSwipeLeft={() => {}} // Empty handler for background card
            onTap={() => {}} // Empty handler for background card
            isTopCard={false}
          />
        )}

        {/* Current Card - Interactive */}
        {currentRecipe && (
          <SwipeCard
            recipe={currentRecipe}
            onSwipeRight={handleSwipeRight}
            onSwipeLeft={handleSwipeLeft}
            onTap={handleCardTap}
            isTopCard={true}
          />
        )}
    </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  cardContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 20,
  },
  swipeCard: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  topCard: {
    zIndex: 2,
  },
  backgroundCard: {
    zIndex: 1,
    transform: [{ scale: 0.9 }, { translateY: 20 }],
    opacity: 0.7,
  },
  cardContent: {
    flex: 1,
    borderRadius: 20,
    overflow: 'hidden',
  },
  cardImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  swipeOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
  likeOverlay: {
    backgroundColor: 'rgba(76, 175, 80, 0.2)',
  },
  nopeOverlay: {
    backgroundColor: 'rgba(244, 67, 54, 0.2)',
  },
  overlayContent: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  overlayText: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginTop: 10,
    textShadowColor: 'rgba(0, 0, 0, 0.8)',
    textShadowOffset: { width: 2, height: 2 },
    textShadowRadius: 4,
  },
  recipeOverlay: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 30,
    paddingBottom: 40,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
  },
  recipeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#fff',
    marginBottom: 15,
  },
  recipeMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaItemLeft: {
    flex: 1,
    justifyContent: 'flex-start',
  },
  metaItemCenter: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  metaItemRight: {
    flex: 1,
    justifyContent: 'flex-end',
    alignItems: 'flex-end',
  },
  metaText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '500',
    fontFamily: 'NunitoSans-Medium',
    color: '#fff',
    marginLeft: 8,
  },
  saveButton: {
    position: 'absolute',
    top: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 5,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  loadingText: {
    marginTop: 16,
    fontSize: 18,
    lineHeight: 24,
    fontWeight: '500',
    fontFamily: 'NunitoSans-Medium',
    color: '#666666',
    textAlign: 'center',
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 40,
  },
  emptyText: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#666666',
    textAlign: 'center',
    marginTop: 20,
    marginBottom: 10,
  },
  emptySubtext: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#999999',
    textAlign: 'center',
    marginBottom: 30,
  },
  refreshButton: {
    backgroundColor: '#FF6B6B',
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  refreshButtonText: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#FFFFFF',
  },
});

