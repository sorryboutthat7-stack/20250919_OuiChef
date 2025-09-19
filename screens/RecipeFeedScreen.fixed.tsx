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
import { useRecipeStore } from '../state/recipeStore.fixed';
import GPTService from '../services/gptService';
import ImageService from '../services/imageService';
import FastImage from 'react-native-fast-image';

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
  const { pantryItems, filters } = useRecipeStore();
  const [recipes, setRecipes] = useState<any[]>([]);
  const [savedRecipes, setSavedRecipes] = useState<string[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);

  useEffect(() => {
    loadRecipes();
  }, [pantryItems, filters]);

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
        gptRecipes.map(async (recipe, index) => {
          // Get image from Unsplash
          const imageUrl = await ImageService.getRecipeImage(recipe.title);
          
          return {
            ...recipe,
            imageUrl,
            missingIngredients: index === 0 ? ['Olive oil', 'Fresh basil', 'Parmesan cheese'] : 
                               index === 1 ? ['Garlic', 'Red wine'] : []
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
        gptRecipes.map(async (recipe, index) => {
          // Get image from Unsplash
          const imageUrl = await ImageService.getRecipeImage(recipe.title);
          
          return {
            ...recipe,
            imageUrl,
            missingIngredients: index === 0 ? ['Olive oil', 'Fresh basil', 'Parmesan cheese'] : 
                               index === 1 ? ['Garlic', 'Red wine'] : []
          };
        })
      );
      
      setRecipes(recipesWithEnhancements);
      setCurrentIndex(0);
    } catch (error) {
      console.error('Error generating recipes:', error);
      Alert.alert('Error', 'Failed to generate new recipes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleLike = (recipe: any) => {
    setSavedRecipes(prev => [...prev, recipe.id]);
    setCurrentIndex(prev => prev + 1);
  };

  const handleSkip = (recipe: any) => {
    setCurrentIndex(prev => prev + 1);
  };

  const handleRefresh = () => {
    generateNewRecipes();
  };

  const handleRecipeTap = (recipe: any) => {
    setSelectedRecipe(recipe);
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

  if (loading && recipes.length === 0) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <FastImage
            source={require('../assets/animations/coral_outline.gif')}
            style={styles.loadingGif}
            resizeMode={FastImage.resizeMode.contain}
          />
          <Text style={styles.loadingText}>Finding delicious recipes...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (currentIndex >= recipes.length) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.emptyContainer}>
          <Ionicons name="restaurant-outline" size={80} color="#FF6B6B" />
          <Text style={styles.emptyTitle}>No more recipes!</Text>
          <Text style={styles.emptySubtitle}>
            You've seen all available recipes. Tap the button below to generate new ones!
          </Text>
          <TouchableOpacity style={styles.refreshButton} onPress={handleRefresh}>
            <Ionicons name="refresh" size={20} color="#fff" />
            <Text style={styles.refreshButtonText}>Generate New Recipes</Text>
          </TouchableOpacity>
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
                    <Text style={styles.modalDetailText}>{selectedRecipe.cookTime}</Text>
                  </View>
                  <View style={styles.modalDetailItemCenter}>
                    <Ionicons name="trending-up-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>{selectedRecipe.difficulty}</Text>
                  </View>
                  <View style={styles.modalDetailItemRight}>
                    <Ionicons name="flame-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>{selectedRecipe.calories}</Text>
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
                <View style={[styles.section, styles.missingIngredientsBanner]}>
                  <View style={styles.missingIngredientsContent}>
                    <View style={styles.missingIngredientsLeft}>
                      <Ionicons name="warning-outline" size={20} color="#F57C00" style={styles.missingIngredientsIcon} />
                      <View style={styles.missingIngredientsTextContainer}>
                        <Text style={styles.missingIngredientsMainText}>Missing Ingredients</Text>
                        <Text style={styles.missingIngredientsSubText}>
                          {selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0 
                            ? selectedRecipe.missingIngredients.join(', ')
                            : 'Olive oil, Fresh basil, Parmesan cheese'
                          }
                        </Text>
                      </View>
                    </View>
                  </View>
                </View>

                <View style={[styles.section, styles.sectionWithBackground]}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {selectedRecipe.ingredients.map((ingredient: string, index: number) => (
                    <Text key={index} style={styles.ingredientText}>• {ingredient}</Text>
                  ))}
                </View>

                <View style={[styles.section, styles.sectionWithBackground]}>
                  <Text style={styles.sectionTitle}>Instructions</Text>
                  {selectedRecipe.instructions.map((instruction: string, index: number) => (
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
    height: '80%',
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
    fontWeight: '700',
    fontFamily: 'NunitoSans',
    color: '#F57C00',
    marginBottom: 4,
  },
  missingIngredientsSubText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
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
