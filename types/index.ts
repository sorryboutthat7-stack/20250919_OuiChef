export interface SpoonacularRecipe {
  id: number;
  image: string;
  imageType: string;
  title: string;
  readyInMinutes: number;
  servings: number;
  sourceUrl: string;
  vegetarian: boolean;
  vegan: boolean;
  glutenFree: boolean;
  dairyFree: boolean;
  veryHealthy: boolean;
  cheap: boolean;
  veryPopular: boolean;
  sustainable: boolean;
  lowFodmap: boolean;
  weightWatcherSmartPoints: number;
  gaps: string;
  preparationMinutes: number | null;
  cookingMinutes: number | null;
  aggregateLikes: number;
  healthScore: number;
  creditsText: string;
  license: string | null;
  sourceName: string;
  pricePerServing: number;
  summary: string;
  cuisines: string[];
  dishTypes: string[];
  diets: string[];
  occasions: string[];
  spoonacularScore: number;
  spoonacularSourceUrl: string;
}

export interface RecipesResponse {
  results: SpoonacularRecipe[];
}

// New GPT Recipe Schema
export interface GPTRecipe {
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cook_time: string;
  cuisine: string;
  image_tag: string;
}

export interface GPTRecipeResponse {
  recipes: GPTRecipe[];
}

// Pantry Management
export interface PantryItem {
  id: string;
  name: string;
  category: string;
  addedAt: string; // ISO string instead of Date object
  expiresAt?: string; // ISO string instead of Date object
}

// Recipe Filters
export interface RecipeFilters {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  maxTime?: number; // in minutes
  cuisine?: string;
  dietary?: 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
}

// Enhanced Recipe interface for the app
export interface AppRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cookTime: string;
  cuisine: string;
  imageUrl: string;
  imageTag: string;
  isGPTGenerated: boolean;
  createdAt: string; // ISO string instead of Date object
  // Additional fields for compatibility
  readyInMinutes?: number;
  servings?: number;
  difficulty?: 'Easy' | 'Medium' | 'Hard';
  tags?: string[];
}
