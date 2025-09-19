import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Image,
  ActivityIndicator,
  Dimensions,
  SafeAreaView,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';

const { width: screenWidth, height: screenHeight } = Dimensions.get('window');

// Simple mock recipe data
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
  },
];

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);
  const [recipes, setRecipes] = useState(mockRecipes);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Add Animated API
  const scale = useRef(new Animated.Value(1)).current;
  const opacity = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Recoleta-Bold': require('./assets/fonts/Recoleta-Bold.otf'),
        'Recoleta-Regular': require('./assets/fonts/Recoleta-Regular.otf'),
        'Recoleta-Medium': require('./assets/fonts/Recoleta-Medium.otf'),
        'NunitoSans-Regular': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-SemiBold': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-Bold': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-Italic': require('./assets/fonts/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.log('Error loading fonts:', error);
      setFontsLoaded(true);
    }
  };

  const handleLike = () => {
    console.log('Recipe liked!');
    
    // Animate the like action
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 1.2,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentIndex(prev => Math.min(prev + 1, recipes.length - 1));
    });
  };

  const handleSkip = () => {
    console.log('Recipe skipped!');
    
    // Animate the skip action
    Animated.parallel([
      Animated.timing(scale, {
        toValue: 0.8,
        duration: 200,
        useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 0.5,
        duration: 200,
        useNativeDriver: true,
      }),
    ]).start(() => {
      // Reset animation
      Animated.parallel([
        Animated.spring(scale, {
          toValue: 1,
          useNativeDriver: true,
          tension: 100,
        }),
        Animated.timing(opacity, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start();
      
      setCurrentIndex(prev => Math.min(prev + 1, recipes.length - 1));
    });
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#FF6B6B" />
        <Text style={styles.loadingText}>Generating recipes...</Text>
      </View>
    );
  }

  if (currentIndex >= recipes.length) {
    return (
      <View style={styles.container}>
        <StatusBar style="light" />
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyTitle}>No more recipes!</Text>
          <Text style={styles.emptySubtitle}>Check back later for more delicious recipes.</Text>
        </View>
      </View>
    );
  }

  const currentRecipe = recipes[currentIndex];

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      
      {/* Recipe Card with Animation */}
      <Animated.View 
        style={[
          styles.card,
          {
            transform: [{ scale }],
            opacity,
          }
        ]}
      >
        <Image source={{ uri: currentRecipe.imageUrl }} style={styles.recipeImage} />
        
        <View style={styles.recipeInfo}>
          <Text style={styles.recipeTitle}>{currentRecipe.title}</Text>
          <Text style={styles.recipeDescription}>{currentRecipe.description}</Text>
          
          <View style={styles.recipeDetails}>
            <View style={styles.detailItem}>
              <Ionicons name="time-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{currentRecipe.cookTime}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="restaurant-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{currentRecipe.cuisine}</Text>
            </View>
            <View style={styles.detailItem}>
              <Ionicons name="flame-outline" size={16} color="#666" />
              <Text style={styles.detailText}>{currentRecipe.calories}</Text>
            </View>
          </View>
        </View>
      </Animated.View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity style={styles.skipButton} onPress={handleSkip}>
          <Ionicons name="close" size={30} color="#F44336" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.likeButton} onPress={handleLike}>
          <Ionicons name="heart" size={30} color="#4CAF50" />
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  loadingContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontFamily: 'Recoleta-Regular',
    marginTop: 10,
  },
  card: {
    flex: 1,
    margin: 20,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 8,
  },
  recipeImage: {
    width: '100%',
    height: '60%',
    resizeMode: 'cover',
  },
  recipeInfo: {
    flex: 1,
    padding: 20,
  },
  recipeTitle: {
    fontSize: 24,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeDescription: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#666',
    lineHeight: 24,
    marginBottom: 20,
  },
  recipeDetails: {
    flexDirection: 'row',
    justifyContent: 'space-around',
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  detailText: {
    fontSize: 14,
    fontFamily: 'NunitoSans-Regular',
    color: '#666',
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 60,
    paddingBottom: 40,
  },
  skipButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  likeButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
  },
  emptyContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  emptyTitle: {
    fontSize: 24,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginBottom: 10,
  },
  emptySubtitle: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 20,
  },
});
