import { create } from 'zustand';

// Simplified types to avoid import issues
interface PantryItem {
  id: string;
  name: string;
  category: string;
  addedAt: string;
}

interface RecipeFilters {
  mealType?: string;
  maxTime?: number;
  cuisine?: string;
  dietary?: string;
}

interface AppRecipe {
  id: string;
  title: string;
  description: string;
  ingredients: string[];
  steps: string[];
  cook_time: string;
  cuisine: string;
  image_tag: string;
}

interface RecipeStore {
  savedRecipes: AppRecipe[];
  currentRecipeBatch: AppRecipe[];
  currentBatchIndex: number;
  pantryItems: PantryItem[];
  filters: RecipeFilters;
  addRecipe: (recipe: AppRecipe) => void;
  removeRecipe: (recipeId: string) => void;
  isRecipeSaved: (recipeId: string) => boolean;
  clearAllRecipes: () => void;
  setCurrentRecipeBatch: (recipes: AppRecipe[]) => void;
  nextRecipe: () => void;
  addPantryItem: (item: PantryItem) => void;
  removePantryItem: (itemId: string) => void;
  updatePantryItem: (itemId: string, updates: Partial<PantryItem>) => void;
  updateFilters: (filters: Partial<RecipeFilters>) => void;
}

export const useRecipeStore = create<RecipeStore>((set, get) => ({
  savedRecipes: [],
  currentRecipeBatch: [],
  currentBatchIndex: 0,
  pantryItems: [
    // Default pantry items for testing
    { id: '1', name: 'pasta', category: 'grains', addedAt: new Date().toISOString() },
    { id: '2', name: 'tomatoes', category: 'vegetables', addedAt: new Date().toISOString() },
    { id: '3', name: 'onions', category: 'vegetables', addedAt: new Date().toISOString() },
    { id: '4', name: 'garlic', category: 'vegetables', addedAt: new Date().toISOString() },
    { id: '5', name: 'olive oil', category: 'oils', addedAt: new Date().toISOString() },
  ],
  filters: {
    mealType: 'dinner',
    maxTime: 30,
    cuisine: '',
    dietary: '',
  },
  
  addRecipe: (recipe: AppRecipe) => {
    set((state) => ({
      savedRecipes: [...state.savedRecipes, recipe],
    }));
  },
  
  removeRecipe: (recipeId: string) => {
    set((state) => ({
      savedRecipes: state.savedRecipes.filter(recipe => recipe.id !== recipeId),
    }));
  },
  
  isRecipeSaved: (recipeId: string) => {
    const state = get();
    return state.savedRecipes.some(recipe => recipe.id === recipeId);
  },
  
  clearAllRecipes: () => {
    set({ savedRecipes: [] });
  },
  
  setCurrentRecipeBatch: (recipes: AppRecipe[]) => {
    console.log('🏪 RecipeStore: Setting new recipe batch:', {
      count: recipes.length,
      firstRecipe: recipes[0]?.title || 'none'
    });
    
    set({
      currentRecipeBatch: recipes,
      currentBatchIndex: 0,
    });
    
    console.log('🏪 RecipeStore: New batch set successfully');
  },
  
  nextRecipe: () => {
    set((state) => ({
      currentBatchIndex: Math.min(state.currentBatchIndex + 1, state.currentRecipeBatch.length - 1),
    }));
  },
  
  addPantryItem: (item: PantryItem) => {
    set((state) => ({
      pantryItems: [...state.pantryItems, item],
    }));
  },
  
  removePantryItem: (itemId: string) => {
    set((state) => ({
      pantryItems: state.pantryItems.filter(item => item.id !== itemId),
    }));
  },
  
  updatePantryItem: (itemId: string, updates: Partial<PantryItem>) => {
    set((state) => ({
      pantryItems: state.pantryItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      ),
    }));
  },
  
  updateFilters: (newFilters: Partial<RecipeFilters>) => {
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
    }));
  },
}));
