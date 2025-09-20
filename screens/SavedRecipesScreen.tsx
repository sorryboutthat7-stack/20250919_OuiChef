import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Image,
  FlatList,
  TextInput,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../state/recipeStore.fixed';
import HapticService from '../services/hapticService';

// Mock data for demonstration
const mockSavedRecipes = [
  {
    id: '1',
    title: 'Classic Spaghetti Carbonara',
    author: 'Chef Marco',
    cookTime: '25 min',
    image: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
    folder: 'Italian Classics',
  },
  {
    id: '2',
    title: 'Chocolate Chip Cookies',
    author: 'Baker Sarah',
    cookTime: '15 min',
    image: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop',
    folder: 'Desserts',
  },
  {
    id: '3',
    title: 'Grilled Salmon with Herbs',
    author: 'Chef Alex',
    cookTime: '20 min',
    image: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
    folder: 'Healthy Meals',
  },
  {
    id: '4',
    title: 'Beef Stir Fry',
    author: 'Chef Li',
    cookTime: '18 min',
    image: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop',
    folder: 'Asian Cuisine',
  },
];

const mockFolders = [
  {
    id: '1',
    name: 'Italian Classics',
    recipeCount: 8,
    thumbnail: 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=300&h=200&fit=crop',
  },
  {
    id: '2',
    name: 'Desserts',
    recipeCount: 12,
    thumbnail: 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=300&h=200&fit=crop',
  },
  {
    id: '3',
    name: 'Healthy Meals',
    recipeCount: 15,
    thumbnail: 'https://images.unsplash.com/photo-1467003909585-2f8a72700288?w=300&h=200&fit=crop',
  },
  {
    id: '4',
    name: 'Asian Cuisine',
    recipeCount: 6,
    thumbnail: 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=300&h=200&fit=crop',
  },
];


type TabType = 'saved' | 'folders' | 'recent';

export default function SavedRecipesScreen() {
  const [activeTab, setActiveTab] = useState<TabType>('saved');
  const [searchQuery, setSearchQuery] = useState('');
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [showNewSmartFolderModal, setShowNewSmartFolderModal] = useState(false);
  const [newFolderName, setNewFolderName] = useState('');
  const [selectedFolder, setSelectedFolder] = useState<any>(null);
  const [showFolderRecipes, setShowFolderRecipes] = useState(false);
  
  // Get recently viewed recipes from store
  const { getRecentlyViewed } = useRecipeStore();
  const recentlyViewed = getRecentlyViewed();

  // Function to format time ago
  const formatTimeAgo = (dateString: string): string => {
    const now = new Date();
    const viewedAt = new Date(dateString);
    const diffInSeconds = Math.floor((now.getTime() - viewedAt.getTime()) / 1000);
    
    if (diffInSeconds < 60) {
      return 'Just now';
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    } else if (diffInSeconds < 86400) {
      const hours = Math.floor(diffInSeconds / 3600);
      return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    } else {
      const days = Math.floor(diffInSeconds / 86400);
      return `${days} day${days > 1 ? 's' : ''} ago`;
    }
  };
  
  // Recipe details modal state
  const [selectedRecipe, setSelectedRecipe] = useState<any>(null);
  const [showRecipeDetails, setShowRecipeDetails] = useState(false);
  const [servingMultiplier, setServingMultiplier] = useState(1);
  
  // Save recipe functionality
  const [showSaveSheet, setShowSaveSheet] = useState(false);
  const [showSaveAnimation, setShowSaveAnimation] = useState(false);
  const saveAnimationScale = useRef(new Animated.Value(1)).current;
  const saveAnimationOpacity = useRef(new Animated.Value(0)).current;
  const sparkleOpacity = useRef(new Animated.Value(0)).current;
  const sparkleScale = useRef(new Animated.Value(0.5)).current;
  
  // Animation for bottom sheet
  const bottomSheetTranslateY = useRef(new Animated.Value(300)).current;
  const backdropOpacity = useRef(new Animated.Value(0)).current;

  // Animation effects for bottom sheet
  React.useEffect(() => {
    if (showSaveSheet) {
      // Slide up animation
      Animated.parallel([
        Animated.spring(bottomSheetTranslateY, {
          toValue: 0,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    } else {
      // Slide down animation
      Animated.parallel([
        Animated.spring(bottomSheetTranslateY, {
          toValue: 300,
          useNativeDriver: true,
          tension: 100,
          friction: 8,
        }),
        Animated.timing(backdropOpacity, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start();
    }
  }, [showSaveSheet]);
  
  // Smart folder filter state
  const [smartFolderName, setSmartFolderName] = useState('');
  const [smartFolderFilters, setSmartFolderFilters] = useState<string[]>([]);
  
  // Filter categories for smart folder
  const filterCategories = {
    cuisines: ['Italian', 'Asian', 'Mediterranean', 'Mexican', 'American', 'Indian', 'French'],
    difficulties: ['Easy', 'Medium', 'Hard'],
    cookTime: ['15 min', '30 min', '45 min', '60 min'],
    dietary: ['Vegetarian', 'Vegan', 'Gluten-Free', 'Dairy-Free', 'Low-Carb', 'Keto', 'Paleo'],
    diningTimes: ['Breakfast', 'Lunch', 'Dinner', 'Brunch', 'Dessert'],
    foodConscious: ['High-Protein', 'High-Carb', 'Low-Calorie', 'Low-Fat', 'High-Fiber', 'Low-Sodium', 'Sugar-Free']
  };
  
  // Get saved recipes and folders from global store
  const { savedRecipes, removeRecipe, folders, getRecipesInFolder, addFolder, removeFolder, pantryItems, addToRecentlyViewed, addRecipe, assignRecipeToFolder } = useRecipeStore();

  // Filter recipes based on search query
  const filteredSavedRecipes = savedRecipes.filter(recipe => {
    if (!searchQuery.trim()) return true;
    
    const searchTerm = searchQuery.toLowerCase().trim();
    const title = recipe.title.toLowerCase();
    const description = recipe.description?.toLowerCase() || '';
    const ingredients = recipe.ingredients?.join(' ').toLowerCase() || '';
    
    return title.includes(searchTerm) || 
           description.includes(searchTerm) || 
           ingredients.includes(searchTerm);
  });

  // Create new folder
  const handleCreateFolder = () => {
    if (!newFolderName.trim()) {
      HapticService.errorState();
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    
    const colors = ['#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#E91E63', '#795548', '#607D8B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const newFolder = {
      id: Date.now().toString(),
      name: newFolderName.trim(),
      color: randomColor,
      createdAt: new Date().toISOString(),
    };
    
    addFolder(newFolder);
    HapticService.successState();
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  // Handle folder selection
  const handleFolderPress = (folder: any) => {
    HapticService.buttonPress();
    setSelectedFolder(folder);
    setShowFolderRecipes(true);
  };

  // Close folder recipes view
  const closeFolderRecipes = () => {
    setShowFolderRecipes(false);
    setSelectedFolder(null);
  };

  // Create smart folder
  const handleCreateSmartFolder = () => {
    if (!smartFolderName.trim()) {
      Alert.alert('Error', 'Please enter a folder name');
      return;
    }
    
    if (smartFolderFilters.length === 0) {
      Alert.alert('Error', 'Please select at least one filter criteria');
      return;
    }
    
    const colors = ['#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#E91E63', '#795548', '#607D8B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    // Parse selected filters into criteria
    const filterCriteria: any = {};
    
    // Categorize selected filters
    const cuisines = filterCategories.cuisines.filter(f => smartFolderFilters.includes(f));
    const difficulties = filterCategories.difficulties.filter(f => smartFolderFilters.includes(f));
    const cookTimes = filterCategories.cookTime.filter(f => smartFolderFilters.includes(f));
    const dietary = filterCategories.dietary.filter(f => smartFolderFilters.includes(f));
    const diningTimes = filterCategories.diningTimes.filter(f => smartFolderFilters.includes(f));
    const foodConscious = filterCategories.foodConscious.filter(f => smartFolderFilters.includes(f));
    
    if (cuisines.length > 0) filterCriteria.cuisine = cuisines[0]; // Take first selected cuisine
    if (diningTimes.length > 0) filterCriteria.mealType = diningTimes[0]; // Take first selected dining time
    if (dietary.length > 0) filterCriteria.dietary = dietary[0]; // Take first selected dietary
    if (cookTimes.length > 0) {
      const maxTime = Math.max(...cookTimes.map(time => parseInt(time.replace(' min', ''))));
      filterCriteria.maxCookTime = maxTime;
    }
    
    const newSmartFolder = {
      id: Date.now().toString(),
      name: smartFolderName.trim(),
      color: randomColor,
      createdAt: new Date().toISOString(),
      isSmartFolder: true,
      filterCriteria,
    };
    
    addFolder(newSmartFolder);
    
    // Reset form
    setSmartFolderName('');
    setSmartFolderFilters([]);
    setShowNewSmartFolderModal(false);
  };

  // Toggle filter selection for smart folder
  const toggleSmartFolderFilter = (filter: string) => {
    setSmartFolderFilters(prev => 
      prev.includes(filter) 
        ? prev.filter(f => f !== filter)
        : [...prev, filter]
    );
  };

  // Handle recipe tap to show details
  const handleRecipeTap = (recipe: any) => {
    // Light haptic feedback for recipe tap
    HapticService.buttonPress();
    
    // Add recipe to recently viewed
    addToRecentlyViewed(recipe);
    
    // Calculate missing ingredients dynamically when modal opens
    const missingIngredients = getMissingIngredients(recipe.ingredients || [], pantryItems);
    const recipeWithMissingIngredients = {
      ...recipe,
      missingIngredients
    };
    
    setSelectedRecipe(recipeWithMissingIngredients);
    setShowRecipeDetails(true);
    setServingMultiplier(1); // Reset serving multiplier
  };

  // Close recipe details modal
  const closeRecipeDetails = () => {
    setShowRecipeDetails(false);
    setSelectedRecipe(null);
    setServingMultiplier(1);
  };

  // Save recipe functionality
  const handleSaveRecipe = () => {
    HapticService.buttonPress();
    setShowSaveSheet(true);
  };

  const handleCloseSaveSheet = () => {
    setShowSaveSheet(false);
  };

  const handleSaveToSpecificFolder = (folderId: string | null) => {
    if (!selectedRecipe) return;
    
    // Check if recipe is already saved and in the specific folder
    const isAlreadySaved = useRecipeStore.getState().isRecipeSaved(selectedRecipe.id);
    const isAlreadyInFolder = folderId ? useRecipeStore.getState().isRecipeInFolder(selectedRecipe.id, folderId) : false;
    
    // Trigger save animation immediately over the recipe details
    triggerSaveAnimation();
    
    HapticService.successState();
    
    // Add recipe to saved recipes (will be ignored if already exists)
    addRecipe(selectedRecipe);
    
    // Assign to specific folder if provided
    if (folderId) {
      assignRecipeToFolder(selectedRecipe.id, folderId, true);
    }
    
    // Close save sheet only (keep recipe details modal open)
    setShowSaveSheet(false);
  };

  // Function to trigger save animation
  const triggerSaveAnimation = () => {
    setShowSaveAnimation(true);
    
    // Reset animation values
    saveAnimationScale.setValue(1);
    saveAnimationOpacity.setValue(0);
    sparkleOpacity.setValue(0);
    sparkleScale.setValue(0.5);
    
    // Animate the bookmark icon with even slower, more elegant effect
    Animated.sequence([
      // Scale up more slowly
      Animated.timing(saveAnimationScale, {
        toValue: 1.4,
        duration: 280,
        useNativeDriver: true,
      }),
      // Bounce back with gentler spring
      Animated.spring(saveAnimationScale, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();
    
    // Animate sparkle effect with even slower timing
    Animated.parallel([
      Animated.sequence([
        Animated.timing(sparkleOpacity, {
          toValue: 1,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleOpacity, {
          toValue: 0,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
      Animated.sequence([
        Animated.timing(sparkleScale, {
          toValue: 1.2,
          duration: 320,
          useNativeDriver: true,
        }),
        Animated.timing(sparkleScale, {
          toValue: 0.8,
          duration: 500,
          useNativeDriver: true,
        }),
      ]),
    ]).start();
    
    // Fade in/out the animation overlay with even slower timing
    Animated.sequence([
      Animated.timing(saveAnimationOpacity, {
        toValue: 1,
        duration: 250,
        useNativeDriver: true,
      }),
      Animated.timing(saveAnimationOpacity, {
        toValue: 0,
        duration: 600,
        useNativeDriver: true,
      }),
    ]).start(() => {
      setShowSaveAnimation(false);
    });
  };

  // Function to format quantities as fractions
  const formatQuantityAsFraction = (value: number): string => {
    // If it's a whole number, return as is
    if (value % 1 === 0) {
      return value.toString();
    }

    // Common fractions to check for
    const commonFractions = [
      { decimal: 0.125, fraction: '1/8' },
      { decimal: 0.25, fraction: '1/4' },
      { decimal: 0.33, fraction: '1/3' },
      { decimal: 0.375, fraction: '3/8' },
      { decimal: 0.5, fraction: '1/2' },
      { decimal: 0.625, fraction: '5/8' },
      { decimal: 0.67, fraction: '2/3' },
      { decimal: 0.75, fraction: '3/4' },
      { decimal: 0.875, fraction: '7/8' },
    ];

    // Check for exact matches with common fractions
    for (const { decimal, fraction } of commonFractions) {
      if (Math.abs(value - decimal) < 0.01) {
        return fraction;
      }
    }

    // For values greater than 1, try to separate whole and fractional parts
    if (value > 1) {
      const wholePart = Math.floor(value);
      const fractionalPart = value - wholePart;
      
      // Check if the fractional part matches a common fraction
      for (const { decimal, fraction } of commonFractions) {
        if (Math.abs(fractionalPart - decimal) < 0.01) {
          return `${wholePart} ${fraction}`;
        }
      }
      
      // If no common fraction matches, use decimal for fractional part
      if (fractionalPart > 0.01) {
        return `${wholePart} ${fractionalPart.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '')}`;
      }
      
      return wholePart.toString();
    }

    // For values less than 1, try to find the closest common fraction
    let closestFraction = '';
    let smallestDiff = Infinity;
    
    for (const { decimal, fraction } of commonFractions) {
      const diff = Math.abs(value - decimal);
      if (diff < smallestDiff && diff < 0.1) { // Only if reasonably close
        smallestDiff = diff;
        closestFraction = fraction;
      }
    }
    
    if (closestFraction) {
      return closestFraction;
    }

    // Fallback to decimal with 2 decimal places, removing trailing zeros
    return value.toFixed(2).replace(/\.00$/, '').replace(/\.0$/, '');
  };

  // Function to scale ingredient quantities based on serving size
  const scaleIngredientQuantity = (ingredient: string, multiplier: number): string => {
    if (multiplier === 1) return ingredient; // No scaling needed for 1x serving
    
    // Regular expressions to match common quantity patterns
    // Order matters - more specific patterns first to avoid overlapping matches
    const patterns = [
      // Fractions: 1/2, 1/4, 3/4, etc. (must be at start of word or after space)
      { regex: /(?:^|\s)(\d+\/\d+)(?=\s|$)/g, type: 'fraction' },
      // Decimals: 0.5, 1.5, 2.5, etc. (must be at start of word or after space)
      { regex: /(?:^|\s)(\d+\.\d+)(?=\s|$)/g, type: 'decimal' },
      // Whole numbers: 1, 2, 3, etc. (must be at start of word or after space, not part of fraction)
      { regex: /(?:^|\s)(\d+)(?=\s|$)/g, type: 'whole' },
    ];

    let scaledIngredient = ingredient;

    patterns.forEach(({ regex, type }) => {
      scaledIngredient = scaledIngredient.replace(regex, (match, capturedGroup) => {
        // Use the captured group (the actual number/fraction) instead of the full match
        const numberPart = capturedGroup;
        let value: number;
        
        if (type === 'fraction') {
          // Parse fraction (e.g., "1/2" -> 0.5)
          const [numerator, denominator] = numberPart.split('/').map(Number);
          value = numerator / denominator;
        } else if (type === 'decimal') {
          // Parse decimal (e.g., "1.5" -> 1.5)
          value = parseFloat(numberPart);
        } else {
          // Parse whole number (e.g., "2" -> 2)
          value = parseInt(numberPart);
        }

        // Scale the value
        const scaledValue = value * multiplier;

        // Format the result - prefer fractions over decimals
        return match.replace(numberPart, formatQuantityAsFraction(scaledValue));
      });
    });

    return scaledIngredient;
  };

  // Function to scale calories based on serving size
  const scaleCalories = (caloriesText: string, multiplier: number): string => {
    if (multiplier === 1) return caloriesText;
    
    // Extract number from calories text (e.g., "450 cal" -> 450)
    const match = caloriesText.match(/(\d+)/);
    if (!match) return caloriesText;
    
    const originalCalories = parseInt(match[1]);
    const scaledCalories = Math.round(originalCalories * multiplier);
    
    return caloriesText.replace(/\d+/, scaledCalories.toString());
  };

  // Function to adjust cook time based on serving size
  const adjustCookTime = (cookTimeText: string, multiplier: number): string => {
    if (multiplier === 1) return cookTimeText;
    
    // Extract number from cook time text (e.g., "25 min" -> 25)
    const match = cookTimeText.match(/(\d+)/);
    if (!match) return cookTimeText;
    
    const originalTime = parseInt(match[1]);
    
    // Cook time doesn't scale linearly - larger batches might take slightly longer
    // but not proportionally. Use a more conservative scaling.
    let adjustedTime: number;
    if (multiplier <= 0.5) {
      // Smaller batches cook faster
      adjustedTime = Math.round(originalTime * 0.8);
    } else if (multiplier >= 2) {
      // Larger batches take a bit longer
      adjustedTime = Math.round(originalTime * 1.2);
    } else {
      // Close to original serving size, minimal adjustment
      adjustedTime = originalTime;
    }
    
    return cookTimeText.replace(/\d+/, adjustedTime.toString());
  };

  // Handle serving size change
  const handleServingChange = (multiplier: number) => {
    HapticService.selectionChange();
    setServingMultiplier(multiplier);
  };

  // Function to determine missing ingredients by comparing recipe with pantry
  const getMissingIngredients = (recipeIngredients: string[], pantryItems: any[]): string[] => {
    if (!recipeIngredients || recipeIngredients.length === 0) return [];
    if (!pantryItems || pantryItems.length === 0) return recipeIngredients;

    const pantryNames = pantryItems.map(item => item.name.toLowerCase().trim());
    const missingIngredients: string[] = [];

    recipeIngredients.forEach(ingredient => {
      // Extract the main ingredient name (remove quantities and measurements)
      const ingredientText = ingredient.toLowerCase().trim();
      
      // Remove common quantity patterns to get the core ingredient name
      const cleanIngredient = ingredientText
        .replace(/^\d+\/\d+\s+/, '') // Remove fractions like "1/2 "
        .replace(/^\d+\.\d+\s+/, '') // Remove decimals like "1.5 "
        .replace(/^\d+\s+/, '') // Remove whole numbers like "2 "
        .replace(/^(cup|cups|tbsp|tsp|oz|lb|pound|pounds|clove|cloves|slice|slices|can|cans|bag|bags|bunch|bunches|head|heads|piece|pieces|dash|pinch|handful)\s+/, '') // Remove measurements
        .replace(/\s+(cup|cups|tbsp|tsp|oz|lb|pound|pounds|clove|cloves|slice|slices|can|cans|bag|bags|bunch|bunches|head|heads|piece|pieces|dash|pinch|handful)$/, '') // Remove measurements at end
        .replace(/,\s*(diced|chopped|sliced|minced|grated|shredded|crushed|whole|fresh|dried|frozen|canned|raw|cooked|optional).*$/, '') // Remove preparation methods
        .replace(/\s+(diced|chopped|sliced|minced|grated|shredded|crushed|whole|fresh|dried|frozen|canned|raw|cooked|optional).*$/, '') // Remove preparation methods
        .trim();

      // Check if any pantry item matches this ingredient
      const hasIngredient = pantryNames.some(pantryName => {
        // Direct match
        if (pantryName === cleanIngredient) return true;
        
        // Check if pantry item contains the ingredient or vice versa
        if (pantryName.includes(cleanIngredient) || cleanIngredient.includes(pantryName)) return true;
        
        // Check for common variations (plural/singular, different forms)
        const pantrySingular = pantryName.replace(/s$/, '');
        const ingredientSingular = cleanIngredient.replace(/s$/, '');
        if (pantrySingular === ingredientSingular) return true;
        
        return false;
      });

      if (!hasIngredient) {
        // Clean ingredient name for display (remove preparation methods and "to taste")
        const displayIngredient = ingredient
          .replace(/,\s*(diced|chopped|sliced|minced|grated|shredded|crushed|halved|quartered|julienned|cubed|strips|rings|wedges|chunks|bits|pieces|optional).*$/i, '') // Remove preparation methods at end
          .replace(/\s+(diced|chopped|sliced|minced|grated|shredded|crushed|halved|quartered|julienned|cubed|strips|rings|wedges|chunks|bits|pieces|optional).*$/i, '') // Remove preparation methods
          .replace(/\s+to\s+taste$/i, '') // Remove "to taste" at the end
          .trim();
        missingIngredients.push(displayIngredient);
      }
    });

    return missingIngredients;
  };

  const renderRecipeCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.recipeCard} 
      activeOpacity={0.8}
      onPress={() => handleRecipeTap(item)}
    >
      <Image source={{ uri: item.imageUrl || item.image }} style={styles.recipeImage} />
      
      {/* Heart icon in top right */}
      <TouchableOpacity 
        style={styles.heartButton}
        onPress={() => {
          HapticService.buttonPress();
          removeRecipe(item.id);
        }}
        activeOpacity={0.7}
      >
        <Ionicons name="heart" size={20} color="#FF6B6B" />
      </TouchableOpacity>
      
      <View style={styles.recipeInfo}>
        <Text style={styles.recipeTitle} numberOfLines={2}>
          {item.title}
        </Text>
        
        {/* Bottom row with cook time (left) and calories (right) */}
        <View style={styles.recipeBottomRow}>
          <View style={styles.cookTimeContainer}>
          <Ionicons name="time-outline" size={14} color="#666" />
            <Text style={styles.cookTime}>{item.cookTime || item.cook_time}</Text>
          </View>
          
          <View style={styles.caloriesContainer}>
            <Ionicons name="flame-outline" size={14} color="#666" />
            <Text style={styles.calories}>{item.calories}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderFolderCard = ({ item }: { item: any }) => {
    const recipesInFolder = getRecipesInFolder(item.id);
    const recipeCount = recipesInFolder.length;
    const firstRecipe = recipesInFolder[0];
    
    const handleDeleteFolder = () => {
      HapticService.buttonPress();
      Alert.alert(
        'Delete Folder',
        'Are you sure you want to delete this entire folder?',
        [
          {
            text: 'Cancel',
            style: 'cancel',
          },
          {
            text: 'Delete',
            style: 'destructive',
            onPress: () => {
              HapticService.buttonPress();
              removeFolder(item.id);
            },
          },
        ]
      );
    };
    
    return (
      <TouchableOpacity 
        style={styles.folderCard} 
        activeOpacity={0.8}
        onPress={() => handleFolderPress(item)}
      >
        <TouchableOpacity 
          style={styles.folderDeleteButton}
          onPress={handleDeleteFolder}
          activeOpacity={0.7}
        >
          <Ionicons name="close" size={16} color="#666" />
        </TouchableOpacity>
        <View style={styles.folderThumbnail}>
          {firstRecipe && (firstRecipe.imageUrl || firstRecipe.image) ? (
            <Image source={{ uri: firstRecipe.imageUrl || firstRecipe.image }} style={styles.folderThumbnailImage} />
          ) : (
            <View style={[styles.folderThumbnailFallback, { backgroundColor: '#fff' }]}>
              <Ionicons name="restaurant" size={40} color="#999" />
            </View>
          )}
          {item.isSmartFolder && (
            <View style={styles.smartFolderBadge}>
              <Ionicons name="flash" size={12} color="#fff" />
            </View>
          )}
        </View>
      <View style={styles.folderInfo}>
          <Text style={styles.folderName} numberOfLines={2}>
            {item.name}
          </Text>
          <Text style={styles.folderCount}>{recipeCount} recipes</Text>
      </View>
    </TouchableOpacity>
  );
  };

  const renderRecentlyViewedCard = ({ item }: { item: any }) => (
    <TouchableOpacity 
      style={styles.recentCard} 
      activeOpacity={0.8}
      onPress={() => handleRecipeTap(item)}
    >
      <Image source={{ uri: item.imageUrl || item.image }} style={styles.recentImage} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.recentAuthor}>{item.cuisine}</Text>
        <View style={styles.recentMetadata}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.recentCookTime}>{item.cookTime || item.cook_time}</Text>
          <Text style={styles.recentViewedAt}>{formatTimeAgo(item.viewedAt)}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  const renderContent = () => {
    switch (activeTab) {
      case 'saved':
        if (savedRecipes.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Ionicons name="heart-outline" size={80} color="#FF6B6B" />
              <Text style={styles.emptyStateTitle}>No Saved Recipes Yet</Text>
              <Text style={styles.emptyStateSubtitle}>
                Swipe right on recipe cards in the Find Recipes tab to save your favorites!
              </Text>
            </View>
          );
        }
        
        if (filteredSavedRecipes.length === 0 && searchQuery.trim()) {
          return (
            <View style={styles.emptyState}>
              <Ionicons name="search-outline" size={80} color="#FF6B6B" />
              <Text style={styles.emptyStateTitle}>No Results Found</Text>
              <Text style={styles.emptyStateSubtitle}>
                No recipes match "{searchQuery}". Try a different search term.
              </Text>
            </View>
          );
        }
        
        return (
          <FlatList
            key="saved-recipes-grid"
            data={filteredSavedRecipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'folders':
        // Create combined data with new folder buttons first
        const newFolderButtons = [
          { id: 'new-folder', type: 'new-folder', name: 'New Folder', color: '#FF6B6B' },
          { id: 'new-smart-folder', type: 'new-smart-folder', name: 'New Smart Folder', color: '#4CAF50' }
        ];
        const combinedData = [...newFolderButtons, ...folders];
        
        return (
          <FlatList
            key="folders-grid"
            data={combinedData}
            renderItem={({ item }) => {
              if ('type' in item && item.type === 'new-folder') {
                return (
                  <TouchableOpacity 
                    style={[styles.newFolderButton, styles.regularFolderButton]}
                    onPress={() => {
                      HapticService.buttonPress();
                      setShowNewFolderModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="add" size={24} color="#fff" />
                    <Text style={styles.newFolderButtonText}>New Folder</Text>
                  </TouchableOpacity>
                );
              } else if ('type' in item && item.type === 'new-smart-folder') {
                return (
                  <TouchableOpacity 
                    style={[styles.newFolderButton, styles.smartFolderButton]}
                    onPress={() => {
                      HapticService.buttonPress();
                      setShowNewSmartFolderModal(true);
                    }}
                    activeOpacity={0.8}
                  >
                    <Ionicons name="flash" size={18} color="#fff" />
                    <Text style={[styles.newFolderButtonText, { color: '#fff' }]}>New Smart Folder</Text>
                  </TouchableOpacity>
                );
              } else {
                return renderFolderCard({ item });
              }
            }}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      case 'recent':
        if (recentlyViewed.length === 0) {
          return (
            <View style={styles.emptyState}>
              <Ionicons name="time-outline" size={80} color="#FF6B6B" />
              <Text style={styles.emptyStateTitle}>No Recently Viewed Recipes</Text>
              <Text style={styles.emptyStateSubtitle}>
                Tap on recipe cards in the Find Recipes tab to view recipe details and build your recently viewed list!
              </Text>
            </View>
          );
        }
        
        return (
          <FlatList
            key="recent-list"
            data={recentlyViewed}
            renderItem={renderRecentlyViewedCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.recentContainer}
            showsVerticalScrollIndicator={false}
          />
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Search Bar */}
        <View style={styles.searchContainer}>
        <View style={styles.searchInputContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your saved recipes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
          <TouchableOpacity
            style={styles.searchCloseButton}
              onPress={() => setSearchQuery('')}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
      )}
        </View>
      </View>

      {/* Sub-navigation Tabs */}
      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'saved' && styles.activeTab]}
          onPress={() => {
            HapticService.selectionChange();
            setActiveTab('saved');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Saved Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'folders' && styles.activeTab]}
          onPress={() => {
            HapticService.selectionChange();
            setActiveTab('folders');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'folders' && styles.activeTabText]}>
            Folders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => {
            HapticService.selectionChange();
            setActiveTab('recent');
          }}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'recent' && styles.activeTabText]}>
            Recently Viewed
          </Text>
        </TouchableOpacity>
      </View>

      {/* Content */}
      {renderContent()}

      {/* New Folder Modal */}
      <Modal
        visible={showNewFolderModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewFolderModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowNewFolderModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Folder</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.modalContent}>
            <Text style={styles.modalLabel}>Folder Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter folder name..."
              placeholderTextColor="#999"
              value={newFolderName}
              onChangeText={setNewFolderName}
              autoFocus
            />
            
            <TouchableOpacity 
              style={styles.createButton}
              onPress={handleCreateFolder}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>Create Folder</Text>
            </TouchableOpacity>
          </View>
    </SafeAreaView>
      </Modal>

      {/* New Smart Folder Modal */}
      <Modal
        visible={showNewSmartFolderModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowNewSmartFolderModal(false)}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={() => setShowNewSmartFolderModal(false)} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>New Smart Folder</Text>
            <View style={styles.placeholder} />
          </View>
          
          <ScrollView style={styles.modalContent}>
            <Text style={styles.modalLabel}>Folder Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="Enter folder name..."
              placeholderTextColor="#999"
              value={smartFolderName}
              onChangeText={setSmartFolderName}
              autoFocus
            />
            
            <Text style={styles.modalLabel}>Select Filter Criteria</Text>
            
            {Object.entries(filterCategories).map(([category, filters]) => (
              <View key={category} style={styles.filterCategory}>
                <Text style={styles.categoryTitle}>
                  {category === 'cuisines' ? 'Cuisines' :
                   category === 'difficulties' ? 'Difficulty' :
                   category === 'cookTime' ? 'Cook Time' :
                   category === 'dietary' ? 'Dietary' :
                   category === 'diningTimes' ? 'Dining Times' :
                   category === 'foodConscious' ? 'Food Conscious' :
                   category.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                </Text>
                <View style={styles.filterTags}>
                  {filters.map((filter) => (
                    <TouchableOpacity
                      key={filter}
                      style={[
                        styles.filterTag,
                        smartFolderFilters.includes(filter) && styles.activeFilterTag
                      ]}
                      onPress={() => toggleSmartFolderFilter(filter)}
                      activeOpacity={0.7}
                    >
                      <Text style={[
                        styles.filterTagText,
                        smartFolderFilters.includes(filter) && styles.activeFilterTagText
                      ]}>
                        {filter}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            ))}
            
            <TouchableOpacity 
              style={[styles.createButton, styles.smartCreateButton]}
              onPress={handleCreateSmartFolder}
              activeOpacity={0.8}
            >
              <Text style={styles.createButtonText}>Create Smart Folder</Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* Folder Recipes Modal */}
      <Modal
        visible={showFolderRecipes}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeFolderRecipes}
      >
        <SafeAreaView style={styles.modalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={closeFolderRecipes} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>{selectedFolder?.name}</Text>
            <View style={styles.placeholder} />
          </View>
          
          <View style={styles.modalContent}>
            {selectedFolder && getRecipesInFolder(selectedFolder.id).length > 0 ? (
              <FlatList
                data={getRecipesInFolder(selectedFolder.id)}
                renderItem={renderRecipeCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-open-outline" size={80} color="#FF6B6B" />
                <Text style={styles.emptyStateTitle}>No Recipes Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Add recipes to this folder to organize your collection!
                </Text>
              </View>
            )}
          </View>
        </SafeAreaView>
      </Modal>

      {/* Recipe Details Modal */}
      <Modal
        visible={showRecipeDetails}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRecipeDetails}
      >
        <SafeAreaView style={styles.recipeModalContainer}>
          <View style={styles.modalHeader}>
            <TouchableOpacity 
              onPress={closeRecipeDetails} 
              style={styles.closeButton}
            >
              <Ionicons name="close" size={24} color="#333" />
            </TouchableOpacity>
            <Text style={styles.modalTitle}>Recipe Details</Text>
            <View style={styles.placeholder} />
          </View>
          
          {selectedRecipe && (
            <>
              <ScrollView style={styles.modalContent}>
              <Image 
                source={{ uri: selectedRecipe.imageUrl || selectedRecipe.image }} 
                style={styles.modalImage} 
              />
              
              <View style={styles.modalInfo}>
                <View style={styles.titleDescriptionSection}>
                  <Text style={styles.modalRecipeTitle}>{selectedRecipe.title}</Text>
                  <Text style={styles.modalDescription}>{selectedRecipe.description}</Text>
                </View>
                
                <View style={[styles.modalDetails, styles.detailsWithBackground]}>
                  <View style={styles.modalDetailItemLeft}>
                    <Ionicons name="time-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>
                      {adjustCookTime(selectedRecipe.cookTime || selectedRecipe.cook_time || '30 min', servingMultiplier)}
                    </Text>
                  </View>
                  <View style={styles.modalDetailItemCenter}>
                    <Ionicons name="trending-up-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>
                      {selectedRecipe.difficulty || 'Medium'}
                    </Text>
                  </View>
                  <View style={styles.modalDetailItemRight}>
                    <Ionicons name="flame-outline" size={20} color="#FF6B6B" />
                    <Text style={styles.modalDetailText}>
                      {scaleCalories(selectedRecipe.calories || '400 cal', servingMultiplier)}
                    </Text>
                  </View>
                </View>
                
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
                  <Text style={styles.servingSizeSubtext}>
                    Makes {Math.round(4 * servingMultiplier)} servings.
                  </Text>
                </View>
                
                {/* Missing Ingredients Section */}
                {selectedRecipe.missingIngredients && selectedRecipe.missingIngredients.length > 0 && (
                  <View style={[styles.section, styles.missingIngredientsBanner]}>
                    <View style={styles.missingIngredientsContent}>
                      <View style={styles.missingIngredientsLeft}>
                        <Ionicons name="warning-outline" size={20} color="#F57C00" style={styles.missingIngredientsIcon} />
                        <View style={styles.missingIngredientsTextContainer}>
                          <Text style={styles.missingIngredientsMainText}>Missing Ingredients</Text>
                          <Text style={styles.missingIngredientsSubText}>
                            {selectedRecipe.missingIngredients.join(', ')}
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}

                {/* All Ingredients Available Section */}
                {(!selectedRecipe.missingIngredients || selectedRecipe.missingIngredients.length === 0) && (
                  <View style={[styles.section, styles.allIngredientsBanner]}>
                    <View style={styles.missingIngredientsContent}>
                      <View style={styles.missingIngredientsLeft}>
                        <Ionicons name="checkmark-circle-outline" size={20} color="#4CAF50" style={styles.missingIngredientsIcon} />
                        <View style={styles.missingIngredientsTextContainer}>
                          <Text style={[styles.missingIngredientsMainText, { color: '#4CAF50' }]}>All Ingredients Available</Text>
                          <Text style={[styles.missingIngredientsSubText, { color: '#4CAF50' }]}>
                            You have everything needed for this recipe!
                          </Text>
                        </View>
                      </View>
                    </View>
                  </View>
                )}
                
                {/* Ingredients */}
                <View style={[styles.section, styles.sectionWithBackground]}>
                  <Text style={styles.sectionTitle}>Ingredients</Text>
                  {selectedRecipe.ingredients?.map((ingredient: string, index: number) => (
                    <Text key={index} style={styles.ingredientText}>
                      • {scaleIngredientQuantity(ingredient, servingMultiplier)}
                    </Text>
                  ))}
                </View>
                
                {/* Instructions */}
                <View style={[styles.section, styles.sectionWithBackground]}>
                  <Text style={styles.sectionTitle}>Instructions</Text>
                  {selectedRecipe.instructions?.map((instruction: string, index: number) => {
                    // Check if instruction already has step formatting to avoid duplication
                    const cleanInstruction = instruction.trim();
                    
                    // Check for patterns like "1. Step 1:" or "Step 1:" and clean them up
                    const stepPattern = /^(\d+\.\s*)?Step\s*\d+[.:]?\s*/i;
                    const hasStepPattern = stepPattern.test(cleanInstruction);
                    
                    let displayText;
                    if (hasStepPattern) {
                      // Remove the number prefix if it exists (like "1. ") and keep just "Step X:"
                      displayText = cleanInstruction.replace(/^\d+\.\s*/, '');
                    } else {
                      // Add step formatting if it doesn't exist
                      displayText = `Step ${index + 1}. ${cleanInstruction}`;
                    }
                    
                    return (
                      <Text key={index} style={styles.instructionText}>
                        {displayText}
                      </Text>
                    );
                  })}
                </View>
              </View>
            </ScrollView>
            
            {/* Save Recipe Banner */}
            <View style={styles.saveRecipeBanner}>
              <TouchableOpacity 
                style={styles.saveRecipeBannerButton}
                onPress={handleSaveRecipe}
                activeOpacity={0.8}
              >
                <Ionicons name="heart" size={20} color="#FFFFFF" style={styles.saveRecipeBannerButtonIcon} />
                <Text style={styles.saveRecipeBannerButtonText}>Save Recipe</Text>
              </TouchableOpacity>
            </View>
            
            {/* Save Recipe Modal - Inside Recipe Detail Modal */}
            {showSaveSheet && (
              <View style={styles.bottomSheetOverlay}>
                <Animated.View 
                  style={[
                    styles.bottomSheetBackdrop,
                    { opacity: backdropOpacity }
                  ]}
                >
                  <TouchableOpacity 
                    style={{ flex: 1 }}
                    activeOpacity={1}
                    onPress={handleCloseSaveSheet}
                  />
                </Animated.View>
                <Animated.View 
                  style={[
                    styles.bottomSheetContainer,
                    {
                      transform: [{ translateY: bottomSheetTranslateY }]
                    }
                  ]}
                >
                  <View style={styles.bottomSheetHandle} />
                  <View style={styles.bottomSheetContent}>
                    <Text style={styles.bottomSheetTitle}>Save Recipe</Text>
                    
                    <ScrollView 
                      style={styles.folderScrollView}
                      contentContainerStyle={styles.folderScrollContent}
                      showsVerticalScrollIndicator={false}
                      bounces={true}
                    >
                      {/* General Collection Option */}
                      <TouchableOpacity 
                        style={styles.folderOption}
                        onPress={() => {
                          HapticService.selectionChange();
                          handleSaveToSpecificFolder(null);
                        }}
                        activeOpacity={0.7}
                      >
                        <View style={styles.folderOptionContent}>
                          <View style={styles.folderIconContainer}>
                            <Ionicons name="bookmark-outline" size={24} color="#FF6B6B" />
                          </View>
                          <Text style={styles.folderOptionText}>General Collection</Text>
                        </View>
                      </TouchableOpacity>
                      
                      {/* Custom Folders */}
                      {folders.map((folder) => (
                        <TouchableOpacity 
                          key={folder.id}
                          style={styles.folderOption}
                          onPress={() => {
                            HapticService.selectionChange();
                            handleSaveToSpecificFolder(folder.id);
                          }}
                          activeOpacity={0.7}
                        >
                          <View style={styles.folderOptionContent}>
                            <View style={styles.folderIconContainer}>
                              <Ionicons name="bookmark-outline" size={24} color="#FF6B6B" />
                            </View>
                            <Text style={styles.folderOptionText}>{folder.name}</Text>
                          </View>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                </Animated.View>
              </View>
            )}
            
            {/* Save Animation Overlay - Inside Recipe Detail Modal */}
            {showSaveAnimation && (
              <Animated.View 
                style={[
                  styles.saveAnimationOverlay,
                  { opacity: saveAnimationOpacity }
                ]}
                pointerEvents="none"
              >
                {/* Sparkle effect */}
                <Animated.View 
                  style={[
                    styles.sparkleEffect,
                    { 
                      opacity: sparkleOpacity,
                      transform: [{ scale: sparkleScale }]
                    }
                  ]}
                >
                  <Ionicons name="sparkles" size={40} color="#FFD700" />
                </Animated.View>
                
                {/* Main bookmark icon */}
                <Animated.View 
                  style={[
                    styles.saveAnimationIcon,
                    { transform: [{ scale: saveAnimationScale }] }
                  ]}
                >
                  <Ionicons name="bookmark" size={60} color="#FF6B6B" />
                </Animated.View>
              </Animated.View>
            )}
            </>
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
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  searchInputContainer: {
    position: 'relative',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchInput: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    paddingRight: 50, // Make room for the close button
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#333333',
  },
  searchCloseButton: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -10 }], // Center vertically
    padding: 4,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#fff',
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  tab: {
    flex: 1,
    paddingVertical: 16,
    alignItems: 'center',
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  activeTab: {
    borderBottomColor: '#FF6B6B',
  },
  tabText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
  },
  activeTabText: {
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#FF6B6B',
  },
  // Recipe Cards
  gridContainer: {
    padding: 20,
  },
  row: {
    justifyContent: 'space-between',
  },
  recipeCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  recipeImage: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  recipeInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  recipeTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  recipeAuthor: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  recipeMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  cookTime: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  folderIcon: {
    marginLeft: 12,
  },
  folderName: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  // Folder Cards
  foldersContainer: {
    flex: 1,
    padding: 20,
  },
  newFolderButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    width: '48%',
    height: 42,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 12,
  },
  regularFolderButton: {
    borderColor: '#FF6B6B',
  },
  smartFolderButton: {
    backgroundColor: '#FF6B6B',
  },
  newFolderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#fff',
    marginLeft: 8,
  },
  folderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
    position: 'relative',
  },
  folderDeleteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 2,
  },
  folderThumbnail: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    position: 'relative',
    overflow: 'hidden',
  },
  folderThumbnailImage: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
  },
  folderThumbnailFallback: {
    width: '100%',
    height: '100%',
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
  },
  smartFolderBadge: {
    position: 'absolute',
    top: 8,
    right: 8,
    backgroundColor: 'rgba(0, 0, 0, 0.3)',
    borderRadius: 12,
    padding: 4,
  },
  folderInfo: {
    padding: 12,
    flex: 1,
    justifyContent: 'space-between',
  },
  folderTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  folderCount: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
  },
  // Recently Viewed Cards
  recentContainer: {
    padding: 20,
  },
  recentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  recentImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  recentInfo: {
    flex: 1,
    marginLeft: 16,
    justifyContent: 'center',
  },
  recentTitle: {
    fontSize: 16,
    lineHeight: 22,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#333333',
    marginBottom: 4,
  },
  recentAuthor: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginBottom: 8,
  },
  recentMetadata: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
  },
  recentCookTime: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  recentViewedAt: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#999999',
    marginLeft: 12,
  },
  // Heart button in top right
  heartButton: {
    position: 'absolute',
    top: 4,
    right: 4,
    padding: 6,
  },
  // Bottom row layout
  recipeBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cookTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  caloriesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  calories: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginLeft: 4,
  },
  // Empty state
  emptyState: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  emptyStateTitle: {
    fontSize: 24,
    lineHeight: 30,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#333333',
    marginTop: 20,
    marginBottom: 10,
    textAlign: 'center',
  },
  emptyStateSubtitle: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    textAlign: 'center',
  },
  // Modal styles
  modalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
    borderBottomWidth: 1,
    borderBottomColor: '#e9ecef',
  },
  closeButton: {
    padding: 8,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#333333',
  },
  placeholder: {
    width: 40,
  },
  modalContent: {
    flex: 1,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#333333',
    marginBottom: 8,
  },
  modalSubLabel: {
    fontSize: 14,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginBottom: 20,
  },
  modalInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#333333',
    borderWidth: 1,
    borderColor: '#e9ecef',
    marginBottom: 24,
  },
  createButton: {
    backgroundColor: '#FF6B6B',
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  createButtonText: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#fff',
  },
  smartCreateButton: {
    backgroundColor: '#4CAF50',
  },
  // Filter category styles
  filterCategory: {
    marginBottom: 24,
  },
  categoryTitle: {
    fontSize: 15,
    lineHeight: 22,
    fontWeight: '700',
    fontFamily: 'NunitoSans',
    color: '#333333',
    marginBottom: 15,
  },
  filterTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  filterTag: {
    backgroundColor: '#f8f9fa',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  activeFilterTag: {
    backgroundColor: '#4CAF50',
    borderColor: '#4CAF50',
  },
  filterTagText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600',
    fontFamily: 'NunitoSans',
    color: '#333333',
  },
  activeFilterTagText: {
    color: '#FFFFFF',
  },
  // Recipe details modal styles (matching Recipe Feed screen)
  recipeModalContainer: {
    flex: 1,
    backgroundColor: '#f8f9fa',
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
    marginBottom: 20,
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
  sectionWithBackground: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    marginBottom: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    fontFamily: 'Recoleta-Bold',
    color: '#333333',
    marginBottom: 12,
  },
  ingredientText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#333333',
    marginBottom: 8,
  },
  instructionText: {
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#333333',
    marginBottom: 12,
  },
  // Missing ingredients styles
  section: {
    marginBottom: 15,
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
  allIngredientsBanner: {
    backgroundColor: '#E8F5E8', // Light green
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
    fontWeight: '900',
    fontFamily: 'Recoleta-Bold',
    color: '#F57C00',
    marginBottom: 4,
  },
  missingIngredientsSubText: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '900',
    fontFamily: 'NunitoSans-Bold',
    color: '#F57C00',
    opacity: 0.8,
  },
  // Ingredient input styles
  ingredientInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  ingredientInput: {
    flex: 1,
    marginBottom: 0,
    marginRight: 12,
  },
  addIngredientButton: {
    backgroundColor: '#4CAF50',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  ingredientsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 24,
    gap: 8,
  },
  ingredientTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#E8F5E8',
    borderRadius: 16,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  ingredientTagText: {
    fontSize: 14,
    fontFamily: 'NunitoSans-Regular',
    color: '#2E7D32',
    marginRight: 6,
  },
  removeIngredientButton: {
    padding: 2,
  },
  // Save Recipe Banner Styles
  saveRecipeBanner: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E0E0E0',
    paddingTop: 16,
    paddingBottom: 20,
    paddingHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  saveRecipeBannerButton: {
    backgroundColor: '#FF6B6B',
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  saveRecipeBannerButtonIcon: {
    marginRight: 8,
  },
  saveRecipeBannerButtonText: {
    fontSize: 18,
    fontWeight: '600',
    fontFamily: 'Recoleta-Bold',
    color: '#FFFFFF',
  },
  // Bottom Sheet Styles
  bottomSheetOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 1000,
  },
  bottomSheetBackdrop: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  bottomSheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    minHeight: 300,
    maxHeight: '75%',
    paddingBottom: 50,
  },
  bottomSheetHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#CCCCCC',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: 12,
    marginBottom: 8,
  },
  bottomSheetContent: {
    paddingHorizontal: 20,
    flex: 1,
  },
  bottomSheetTitle: {
    fontSize: 20,
    fontWeight: '600',
    fontFamily: 'Recoleta-Bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  folderScrollView: {
    flex: 1,
    marginTop: 10,
  },
  folderScrollContent: {
    paddingBottom: 40,
  },
  folderOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 16,
    paddingHorizontal: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 12,
  },
  folderOptionContent: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  folderIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  folderOptionText: {
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#333',
    flex: 1,
  },
  // Save Animation Styles
  saveAnimationOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000,
    pointerEvents: 'none',
  },
  saveAnimationIcon: {
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 60,
    padding: 25,
    shadowColor: '#FF6B6B',
    shadowOffset: {
      width: 0,
      height: 8,
    },
    shadowOpacity: 0.4,
    shadowRadius: 12,
    elevation: 12,
    borderWidth: 3,
    borderColor: 'rgba(255, 107, 107, 0.3)',
  },
  sparkleEffect: {
    position: 'absolute',
    top: -20,
    right: -20,
    zIndex: 1001,
  },
});