import { create } from 'zustand';
import { AppRecipe, PantryItem, RecipeFilters } from '../types';

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
    { id: '6', name: 'eggs', category: 'dairy', addedAt: new Date().toISOString() },
    { id: '7', name: 'cheese', category: 'dairy', addedAt: new Date().toISOString() },
    { id: '8', name: 'rice', category: 'grains', addedAt: new Date().toISOString() },
  ],
  filters: {
    mealType: 'dinner',
    maxTime: 30,
    cuisine: undefined,
    dietary: undefined,
  },
  
  addRecipe: (recipe: AppRecipe) => {
    const { savedRecipes } = get();
    // Only add if not already saved
    if (!savedRecipes.find(r => r.id === recipe.id)) {
      set({ savedRecipes: [...savedRecipes, recipe] });
    }
  },
  
  removeRecipe: (recipeId: string) => {
    const { savedRecipes } = get();
    set({ savedRecipes: savedRecipes.filter(r => r.id !== recipeId) });
  },
  
  isRecipeSaved: (recipeId: string) => {
    const { savedRecipes } = get();
    return savedRecipes.some(r => r.id === recipeId);
  },
  
  clearAllRecipes: () => {
    set({ savedRecipes: [] });
  },

  setCurrentRecipeBatch: (recipes: AppRecipe[]) => {
    console.log('🏪 RecipeStore: Setting new recipe batch:', {
      recipesCount: recipes.length,
      recipeIds: recipes.map(r => r.id),
      oldBatchCount: get().currentRecipeBatch.length
    });
    set({ currentRecipeBatch: recipes, currentBatchIndex: 0 });
    console.log('🏪 RecipeStore: New batch set successfully');
  },

  nextRecipe: () => {
    const { currentBatchIndex, currentRecipeBatch } = get();
    if (currentBatchIndex < currentRecipeBatch.length - 1) {
      set({ currentBatchIndex: currentBatchIndex + 1 });
    }
  },

  addPantryItem: (item: PantryItem) => {
    const { pantryItems } = get();
    const newItem = {
      ...item,
      addedAt: item.addedAt || new Date().toISOString(),
    };
    set({ pantryItems: [...pantryItems, newItem] });
  },

  removePantryItem: (itemId: string) => {
    const { pantryItems } = get();
    set({ pantryItems: pantryItems.filter(item => item.id !== itemId) });
  },

  updatePantryItem: (itemId: string, updates: Partial<PantryItem>) => {
    const { pantryItems } = get();
    set({
      pantryItems: pantryItems.map(item =>
        item.id === itemId ? { ...item, ...updates } : item
      )
    });
  },

  updateFilters: (newFilters: Partial<RecipeFilters>) => {
    const { filters } = get();
    set({ filters: { ...filters, ...newFilters } });
  },
}));

export { useRecipeStore };
