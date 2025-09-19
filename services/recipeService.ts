import { SpoonacularRecipe, RecipesResponse } from '../types';
import { Recipe } from '../state/recipeStore';

// Load recipes from local JSON file
export const loadLocalRecipes = async (): Promise<Recipe[]> => {
  try {
    // Import the JSON file directly
    const recipesData: RecipesResponse = require('../recipes/recipes.json');
    
    // Transform Spoonacular recipes to app Recipe format
    return recipesData.results.map((spoonacularRecipe: SpoonacularRecipe): Recipe => {
      // Extract dish types for filtering
      const dishTypes = spoonacularRecipe.dishTypes || [];
      
      // Create tags array for filtering
      const tags = [
        ...dishTypes,
        ...(spoonacularRecipe.vegetarian ? ['vegetarian'] : []),
        ...(spoonacularRecipe.vegan ? ['vegan'] : []),
        ...(spoonacularRecipe.glutenFree ? ['gluten-free'] : []),
        ...(spoonacularRecipe.dairyFree ? ['dairy-free'] : []),
        ...(spoonacularRecipe.veryHealthy ? ['healthy'] : []),
        ...(spoonacularRecipe.cheap ? ['budget-friendly'] : []),
        ...(spoonacularRecipe.cuisines || []),
        ...(spoonacularRecipe.diets || [])
      ];

      // Determine difficulty based on cook time
      let difficulty: 'Easy' | 'Medium' | 'Hard' = 'Easy';
      if (spoonacularRecipe.readyInMinutes > 45) {
        difficulty = 'Hard';
      } else if (spoonacularRecipe.readyInMinutes > 25) {
        difficulty = 'Medium';
      }

      // Format rating as X.X/10
      const rating = Math.round((spoonacularRecipe.spoonacularScore / 10) * 10) / 10;

      return {
        id: spoonacularRecipe.id.toString(),
        title: spoonacularRecipe.title,
        description: extractDescription(spoonacularRecipe.summary),
        image: spoonacularRecipe.image.replace('-312x231', '-556x370'), // Higher resolution
        cookTime: `${spoonacularRecipe.readyInMinutes} min`,
        prepTime: '5 min', // Default prep time
        totalTime: `${spoonacularRecipe.readyInMinutes} min`,
        difficulty,
        servings: spoonacularRecipe.servings,
        rating,
        calories: 0, // Not available in Spoonacular data
        authorName: spoonacularRecipe.sourceName || 'Chef',
        tags,
        ingredients: [], // Not available in this dataset
        instructions: [], // Not available in this dataset
        ingredientsCount: 0, // Not available in this dataset
        // Additional fields for enhanced functionality
        readyInMinutes: spoonacularRecipe.readyInMinutes,
        dishTypes: spoonacularRecipe.dishTypes,
        spoonacularScore: spoonacularRecipe.spoonacularScore,
        vegetarian: spoonacularRecipe.vegetarian,
        vegan: spoonacularRecipe.vegan,
        glutenFree: spoonacularRecipe.glutenFree,
        dairyFree: spoonacularRecipe.dairyFree,
        veryHealthy: spoonacularRecipe.veryHealthy,
        cheap: spoonacularRecipe.cheap,
        cuisines: spoonacularRecipe.cuisines,
        diets: spoonacularRecipe.diets,
        healthScore: spoonacularRecipe.healthScore,
        aggregateLikes: spoonacularRecipe.aggregateLikes,
        pricePerServing: spoonacularRecipe.pricePerServing
      };
    });
  } catch (error) {
    console.error('Error loading local recipes:', error);
    return [];
  }
};

// Extract a clean description from the HTML summary
const extractDescription = (summary: string): string => {
  // Remove HTML tags and extract meaningful text
  const cleanText = summary
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/&[^;]+;/g, '') // Remove HTML entities
    .replace(/\s+/g, ' ') // Normalize whitespace
    .trim();
  
  // Take first 100 characters and add ellipsis if longer
  if (cleanText.length > 100) {
    return cleanText.substring(0, 100) + '...';
  }
  return cleanText;
};

// Get unique dish types for filtering
export const getUniqueDishTypes = (recipes: Recipe[]): string[] => {
  const allDishTypes = recipes.flatMap(recipe => recipe.dishTypes || []);
  return [...new Set(allDishTypes)].sort();
};

// Get unique cuisines for filtering
export const getUniqueCuisines = (recipes: Recipe[]): string[] => {
  const allCuisines = recipes.flatMap(recipe => recipe.cuisines || []);
  return [...new Set(allCuisines)].sort();
};

// Filter recipes by dish type
export const filterRecipesByDishType = (recipes: Recipe[], dishType: string): Recipe[] => {
  return recipes.filter(recipe => 
    recipe.dishTypes?.includes(dishType)
  );
};

// Filter recipes by cuisine
export const filterRecipesByCuisine = (recipes: Recipe[], cuisine: string): Recipe[] => {
  return recipes.filter(recipe => 
    recipe.cuisines?.includes(cuisine)
  );
};
