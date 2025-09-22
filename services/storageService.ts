import AsyncStorage from '@react-native-async-storage/async-storage';

// Storage keys for different data types
const STORAGE_KEYS = {
  PANTRY_ITEMS: 'pantry_items',
  SAVED_RECIPES: 'saved_recipes',
  FOLDERS: 'folders',
  RECENTLY_VIEWED: 'recently_viewed',
  FILTERS: 'filters',
} as const;

export interface StoredData {
  pantryItems: any[];
  savedRecipes: any[];
  folders: any[];
  recentlyViewed: any[];
  filters: any;
}

class StorageService {
  /**
   * Save pantry items to storage
   */
  async savePantryItems(pantryItems: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.PANTRY_ITEMS, JSON.stringify(pantryItems));
      console.log('✅ Pantry items saved to storage:', pantryItems.length);
    } catch (error) {
      console.error('❌ Error saving pantry items:', error);
    }
  }

  /**
   * Load pantry items from storage
   */
  async loadPantryItems(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.PANTRY_ITEMS);
      if (data) {
        const pantryItems = JSON.parse(data);
        console.log('✅ Pantry items loaded from storage:', pantryItems.length);
        return pantryItems;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading pantry items:', error);
      return [];
    }
  }

  /**
   * Save saved recipes to storage
   */
  async saveSavedRecipes(savedRecipes: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.SAVED_RECIPES, JSON.stringify(savedRecipes));
      console.log('✅ Saved recipes saved to storage:', savedRecipes.length);
    } catch (error) {
      console.error('❌ Error saving saved recipes:', error);
    }
  }

  /**
   * Load saved recipes from storage
   */
  async loadSavedRecipes(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.SAVED_RECIPES);
      if (data) {
        const savedRecipes = JSON.parse(data);
        console.log('✅ Saved recipes loaded from storage:', savedRecipes.length);
        return savedRecipes;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading saved recipes:', error);
      return [];
    }
  }

  /**
   * Save folders to storage
   */
  async saveFolders(folders: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FOLDERS, JSON.stringify(folders));
      console.log('✅ Folders saved to storage:', folders.length);
    } catch (error) {
      console.error('❌ Error saving folders:', error);
    }
  }

  /**
   * Load folders from storage
   */
  async loadFolders(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FOLDERS);
      if (data) {
        const folders = JSON.parse(data);
        console.log('✅ Folders loaded from storage:', folders.length);
        return folders;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading folders:', error);
      return [];
    }
  }

  /**
   * Save recently viewed recipes to storage
   */
  async saveRecentlyViewed(recentlyViewed: any[]): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.RECENTLY_VIEWED, JSON.stringify(recentlyViewed));
      console.log('✅ Recently viewed saved to storage:', recentlyViewed.length);
    } catch (error) {
      console.error('❌ Error saving recently viewed:', error);
    }
  }

  /**
   * Load recently viewed recipes from storage
   */
  async loadRecentlyViewed(): Promise<any[]> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.RECENTLY_VIEWED);
      if (data) {
        const recentlyViewed = JSON.parse(data);
        console.log('✅ Recently viewed loaded from storage:', recentlyViewed.length);
        return recentlyViewed;
      }
      return [];
    } catch (error) {
      console.error('❌ Error loading recently viewed:', error);
      return [];
    }
  }

  /**
   * Save filters to storage
   */
  async saveFilters(filters: any): Promise<void> {
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.FILTERS, JSON.stringify(filters));
      console.log('✅ Filters saved to storage');
    } catch (error) {
      console.error('❌ Error saving filters:', error);
    }
  }

  /**
   * Load filters from storage
   */
  async loadFilters(): Promise<any> {
    try {
      const data = await AsyncStorage.getItem(STORAGE_KEYS.FILTERS);
      if (data) {
        const filters = JSON.parse(data);
        console.log('✅ Filters loaded from storage');
        return filters;
      }
      return {};
    } catch (error) {
      console.error('❌ Error loading filters:', error);
      return {};
    }
  }

  /**
   * Save all app data at once
   */
  async saveAllData(data: StoredData): Promise<void> {
    try {
      await Promise.all([
        this.savePantryItems(data.pantryItems),
        this.saveSavedRecipes(data.savedRecipes),
        this.saveFolders(data.folders),
        this.saveRecentlyViewed(data.recentlyViewed),
        this.saveFilters(data.filters),
      ]);
      console.log('✅ All app data saved to storage');
    } catch (error) {
      console.error('❌ Error saving all app data:', error);
    }
  }

  /**
   * Load all app data at once
   */
  async loadAllData(): Promise<StoredData> {
    try {
      const [pantryItems, savedRecipes, folders, recentlyViewed, filters] = await Promise.all([
        this.loadPantryItems(),
        this.loadSavedRecipes(),
        this.loadFolders(),
        this.loadRecentlyViewed(),
        this.loadFilters(),
      ]);

      console.log('✅ All app data loaded from storage');
      return {
        pantryItems,
        savedRecipes,
        folders,
        recentlyViewed,
        filters,
      };
    } catch (error) {
      console.error('❌ Error loading all app data:', error);
      return {
        pantryItems: [],
        savedRecipes: [],
        folders: [],
        recentlyViewed: [],
        filters: {},
      };
    }
  }

  /**
   * Clear all stored data (useful for testing or reset functionality)
   */
  async clearAllData(): Promise<void> {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      console.log('✅ All app data cleared from storage');
    } catch (error) {
      console.error('❌ Error clearing all app data:', error);
    }
  }

  /**
   * Check if any data exists in storage
   */
  async hasStoredData(): Promise<boolean> {
    try {
      const keys = await AsyncStorage.getAllKeys();
      return keys.some(key => Object.values(STORAGE_KEYS).includes(key as any));
    } catch (error) {
      console.error('❌ Error checking stored data:', error);
      return false;
    }
  }
}

// Export singleton instance
export default new StorageService();
