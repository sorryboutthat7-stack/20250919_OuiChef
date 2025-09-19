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
  folderIds?: string[]; // Multiple folder assignments
}

interface RecipeFolder {
  id: string;
  name: string;
  color: string;
  createdAt: string;
  isSmartFolder?: boolean;
  filterCriteria?: {
    cuisine?: string;
    maxCookTime?: number;
    dietary?: string;
    mealType?: string;
    ingredients?: string[];
  };
}

interface RecipeStore {
  savedRecipes: AppRecipe[];
  currentRecipeBatch: AppRecipe[];
  currentBatchIndex: number;
  pantryItems: PantryItem[];
  filters: RecipeFilters;
  folders: RecipeFolder[];
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
  // Folder methods
  addFolder: (folder: RecipeFolder) => void;
  removeFolder: (folderId: string) => void;
  updateFolder: (folderId: string, updates: Partial<RecipeFolder>) => void;
  assignRecipeToFolder: (recipeId: string, folderId: string | null) => void;
  getRecipesInFolder: (folderId: string) => AppRecipe[];
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
  folders: [
    // Default folders
    { id: '1', name: 'Quick Meals', color: '#FF6B6B', createdAt: new Date().toISOString() },
    { id: '2', name: 'Healthy Options', color: '#4CAF50', createdAt: new Date().toISOString() },
    { id: '3', name: 'Comfort Food', color: '#FF9800', createdAt: new Date().toISOString() },
    { id: '4', name: 'Desserts', color: '#9C27B0', createdAt: new Date().toISOString() },
  ],
  
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
  
  // Folder methods
  addFolder: (folder: RecipeFolder) => {
    set((state) => ({
      folders: [...state.folders, folder],
    }));
  },
  
  removeFolder: (folderId: string) => {
    set((state) => ({
      folders: state.folders.filter(folder => folder.id !== folderId),
      // Remove folder assignment from recipes
      savedRecipes: state.savedRecipes.map(recipe => ({
        ...recipe,
        folderIds: recipe.folderIds?.filter(id => id !== folderId) || []
      })),
    }));
  },
  
  updateFolder: (folderId: string, updates: Partial<RecipeFolder>) => {
    set((state) => ({
      folders: state.folders.map(folder =>
        folder.id === folderId ? { ...folder, ...updates } : folder
      ),
    }));
  },
  
  assignRecipeToFolder: (recipeId: string, folderId: string, assign: boolean) => {
    set((state) => ({
      savedRecipes: state.savedRecipes.map(recipe => {
        if (recipe.id !== recipeId) return recipe;
        
        const currentFolderIds = recipe.folderIds || [];
        let newFolderIds;
        
        if (assign) {
          // Add folder if not already assigned
          newFolderIds = currentFolderIds.includes(folderId) 
            ? currentFolderIds 
            : [...currentFolderIds, folderId];
        } else {
          // Remove folder
          newFolderIds = currentFolderIds.filter(id => id !== folderId);
        }
        
        return { ...recipe, folderIds: newFolderIds };
      }),
    }));
  },
  
  getRecipesInFolder: (folderId: string) => {
    const state = get();
    const folder = state.folders.find(f => f.id === folderId);
    
    if (!folder) return [];
    
    // For smart folders, filter recipes based on criteria
    if (folder.isSmartFolder && folder.filterCriteria) {
      return state.savedRecipes.filter(recipe => {
        const criteria = folder.filterCriteria!;
        
        // Check cuisine match
        if (criteria.cuisine && recipe.cuisine.toLowerCase() !== criteria.cuisine.toLowerCase()) {
          return false;
        }
        
        // Check cook time (parse cook time string like "25 min" to number)
        if (criteria.maxCookTime) {
          const cookTimeMatch = recipe.cook_time?.match(/(\d+)/);
          if (cookTimeMatch) {
            const cookTime = parseInt(cookTimeMatch[1]);
            if (cookTime > criteria.maxCookTime) {
              return false;
            }
          }
        }
        
        // Check if recipe contains required ingredients
        if (criteria.ingredients && criteria.ingredients.length > 0) {
          const recipeIngredients = recipe.ingredients?.join(' ').toLowerCase() || '';
          const hasRequiredIngredient = criteria.ingredients.some(ingredient =>
            recipeIngredients.includes(ingredient.toLowerCase())
          );
          if (!hasRequiredIngredient) {
            return false;
          }
        }
        
        return true;
      });
    }
    
    // For regular folders, return manually assigned recipes
    return state.savedRecipes.filter(recipe => 
      recipe.folderIds?.includes(folderId) || false
    );
  },
}));
