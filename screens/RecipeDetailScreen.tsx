import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { width: screenWidth } = Dimensions.get('window');

interface Recipe {
  id: string;
  title: string;
  imageUrl: string;
  cookTime: string;
  cuisine: string;
  difficulty: string;
  calories: string;
  description: string;
  ingredients: string[];
  instructions: string[];
}

interface RecipeDetailScreenProps {
  route: {
    params: {
      recipe: Recipe;
    };
  };
  navigation: any;
}

export default function RecipeDetailScreen({ route, navigation }: RecipeDetailScreenProps) {
  const { recipe } = route.params;

  return (
    <ScrollView style={styles.container}>
      {/* Header with back button */}
      <View style={styles.header}>
        <TouchableOpacity 
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#FF6B6B" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Recipe Details</Text>
        <View style={styles.placeholder} />
      </View>

      {/* Recipe Image */}
      <Image source={{ uri: recipe.imageUrl }} style={styles.recipeImage} />

      {/* Recipe Info */}
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle}>{recipe.title}</Text>
        <Text style={styles.recipeDescription}>{recipe.description}</Text>
        
        {/* Meta Info */}
        <View style={styles.metaContainer}>
          <View style={[styles.metaItem, styles.metaItemLeft]}>
            <Ionicons name="time-outline" size={20} color="#FF6B6B" />
            <Text style={styles.metaText}>{recipe.cookTime}</Text>
          </View>
          <View style={[styles.metaItem, styles.metaItemCenter]}>
            <Ionicons name="trending-up-outline" size={20} color="#FF6B6B" />
            <Text style={styles.metaText}>{recipe.difficulty}</Text>
          </View>
          <View style={[styles.metaItem, styles.metaItemRight]}>
            <Ionicons name="flame-outline" size={20} color="#FF6B6B" />
            <Text style={styles.metaText}>{recipe.calories}</Text>
          </View>
        </View>
      </View>

      {/* Ingredients Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Ingredients</Text>
        <View style={styles.ingredientsList}>
          {recipe.ingredients.map((ingredient, index) => (
            <View key={index} style={styles.ingredientItem}>
              <View style={styles.ingredientBullet} />
              <Text style={styles.ingredientText}>{ingredient}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Instructions Section */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Instructions</Text>
        <View style={styles.instructionsList}>
          {recipe.instructions.map((instruction, index) => (
            <View key={index} style={styles.instructionItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>{index + 1}</Text>
              </View>
              <Text style={styles.instructionText}>{instruction}</Text>
            </View>
          ))}
        </View>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#f8f9fa',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#333',
  },
  placeholder: {
    width: 40,
  },
  recipeImage: {
    width: '100%',
    height: 250,
    resizeMode: 'cover',
  },
  recipeInfo: {
    backgroundColor: '#fff',
    padding: 20,
    marginBottom: 10,
  },
  recipeTitle: {
    fontSize: 28,
    lineHeight: 34,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginBottom: 10,
  },
  recipeDescription: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666',
    marginBottom: 20,
  },
  metaContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 15,
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
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
    fontSize: 14,
    fontWeight: '500',
    fontFamily: 'NunitoSans-Medium',
    color: '#333',
    marginLeft: 8,
  },
  section: {
    backgroundColor: '#fff',
    marginBottom: 10,
    padding: 20,
  },
  sectionTitle: {
    fontSize: 22,
    lineHeight: 28,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginBottom: 15,
  },
  ingredientsList: {
    gap: 12,
  },
  ingredientItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  ingredientBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#FF6B6B',
    marginTop: 8,
    marginRight: 12,
  },
  ingredientText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#333',
    flex: 1,
  },
  instructionsList: {
    gap: 20,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepNumber: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: '#FF6B6B',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  stepNumberText: {
    fontSize: 14,
    fontWeight: 'bold',
    fontFamily: 'NunitoSans-Bold',
    color: '#fff',
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#333',
    flex: 1,
  },
  bottomSpacing: {
    height: 20,
  },
});