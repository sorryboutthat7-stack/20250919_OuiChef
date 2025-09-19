import React, { useState } from 'react';
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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRecipeStore } from '../state/recipeStore.fixed';

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

const mockRecentlyViewed = [
  {
    id: '1',
    title: 'Mediterranean Quinoa Bowl',
    author: 'Chef Maria',
    cookTime: '22 min',
    image: 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=300&h=200&fit=crop',
    viewedAt: '2 hours ago',
  },
  {
    id: '2',
    title: 'Chicken Tikka Masala',
    author: 'Chef Raj',
    cookTime: '35 min',
    image: 'https://images.unsplash.com/photo-1563379091339-03246963d96a?w=300&h=200&fit=crop',
    viewedAt: '1 day ago',
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
  
  // Smart folder filter state
  const [smartFolderName, setSmartFolderName] = useState('');
  const [selectedCuisine, setSelectedCuisine] = useState('');
  const [maxCookTime, setMaxCookTime] = useState<number | null>(null);
  const [selectedDietary, setSelectedDietary] = useState('');
  const [requiredIngredients, setRequiredIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState('');
  
  // Get saved recipes and folders from global store
  const { savedRecipes, removeRecipe, folders, getRecipesInFolder, addFolder } = useRecipeStore();

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
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  // Handle folder selection
  const handleFolderPress = (folder: any) => {
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
    
    const colors = ['#FF6B6B', '#4CAF50', '#FF9800', '#9C27B0', '#2196F3', '#E91E63', '#795548', '#607D8B'];
    const randomColor = colors[Math.floor(Math.random() * colors.length)];
    
    const filterCriteria: any = {};
    if (selectedCuisine) filterCriteria.cuisine = selectedCuisine;
    if (maxCookTime) filterCriteria.maxCookTime = maxCookTime;
    if (selectedDietary) filterCriteria.dietary = selectedDietary;
    if (requiredIngredients.length > 0) filterCriteria.ingredients = requiredIngredients;
    
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
    setSelectedCuisine('');
    setMaxCookTime(null);
    setSelectedDietary('');
    setRequiredIngredients([]);
    setNewIngredient('');
    setShowNewSmartFolderModal(false);
  };

  // Add ingredient to required ingredients list
  const addRequiredIngredient = () => {
    if (newIngredient.trim() && !requiredIngredients.includes(newIngredient.trim())) {
      setRequiredIngredients([...requiredIngredients, newIngredient.trim()]);
      setNewIngredient('');
    }
  };

  // Remove ingredient from required ingredients list
  const removeRequiredIngredient = (ingredient: string) => {
    setRequiredIngredients(requiredIngredients.filter(ing => ing !== ingredient));
  };

  const renderRecipeCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.recipeCard} activeOpacity={0.8}>
      <Image source={{ uri: item.imageUrl || item.image }} style={styles.recipeImage} />
      
      {/* Heart icon in top right */}
      <TouchableOpacity 
        style={styles.heartButton}
        onPress={() => removeRecipe(item.id)}
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
    const recipeCount = getRecipesInFolder(item.id).length;
    
    return (
      <TouchableOpacity 
        style={styles.folderCard} 
        activeOpacity={0.8}
        onPress={() => handleFolderPress(item)}
      >
        <View style={[styles.folderThumbnail, { backgroundColor: item.color }]}>
          <Ionicons name={item.isSmartFolder ? "flash" : "folder"} size={40} color="#fff" />
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
    <TouchableOpacity style={styles.recentCard} activeOpacity={0.8}>
      <Image source={{ uri: item.image }} style={styles.recentImage} />
      <View style={styles.recentInfo}>
        <Text style={styles.recentTitle} numberOfLines={2}>
          {item.title}
        </Text>
        <Text style={styles.recentAuthor}>{item.author}</Text>
        <View style={styles.recentMetadata}>
          <Ionicons name="time-outline" size={14} color="#666" />
          <Text style={styles.recentCookTime}>{item.cookTime}</Text>
          <Text style={styles.recentViewedAt}>{item.viewedAt}</Text>
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
        return (
          <View style={styles.foldersContainer}>
            {/* New Folder Buttons */}
            <View style={styles.newFolderButtonsContainer}>
              <TouchableOpacity 
                style={[styles.newFolderButton, styles.regularFolderButton]}
                onPress={() => setShowNewFolderModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="add" size={24} color="#FF6B6B" />
                <Text style={styles.newFolderButtonText}>New Folder</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.newFolderButton, styles.smartFolderButton]}
                onPress={() => setShowNewSmartFolderModal(true)}
                activeOpacity={0.8}
              >
                <Ionicons name="flash" size={24} color="#4CAF50" />
                <Text style={[styles.newFolderButtonText, { color: '#4CAF50' }]}>New Smart Folder</Text>
              </TouchableOpacity>
            </View>
            
            {folders.length > 0 ? (
              <FlatList
                key="folders-grid"
                data={folders}
                renderItem={renderFolderCard}
                keyExtractor={(item) => item.id}
                numColumns={2}
                columnWrapperStyle={styles.row}
                contentContainerStyle={styles.gridContainer}
                showsVerticalScrollIndicator={false}
              />
            ) : (
              <View style={styles.emptyState}>
                <Ionicons name="folder-outline" size={80} color="#FF6B6B" />
                <Text style={styles.emptyStateTitle}>No Folders Yet</Text>
                <Text style={styles.emptyStateSubtitle}>
                  Create folders to organize your saved recipes by category or cuisine!
                </Text>
              </View>
            )}
          </View>
        );
      case 'recent':
        return (
          <FlatList
            key="recent-list"
            data={mockRecentlyViewed}
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
          onPress={() => setActiveTab('saved')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'saved' && styles.activeTabText]}>
            Saved Recipes
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'folders' && styles.activeTab]}
          onPress={() => setActiveTab('folders')}
          activeOpacity={0.7}
        >
          <Text style={[styles.tabText, activeTab === 'folders' && styles.activeTabText]}>
            Folders
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'recent' && styles.activeTab]}
          onPress={() => setActiveTab('recent')}
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
            
            <Text style={styles.modalLabel}>Cuisine (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Italian, Asian, Mexican..."
              placeholderTextColor="#999"
              value={selectedCuisine}
              onChangeText={setSelectedCuisine}
            />
            
            <Text style={styles.modalLabel}>Max Cook Time (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., 30 (minutes)"
              placeholderTextColor="#999"
              value={maxCookTime ? maxCookTime.toString() : ''}
              onChangeText={(text) => setMaxCookTime(text ? parseInt(text) : null)}
              keyboardType="numeric"
            />
            
            <Text style={styles.modalLabel}>Dietary (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g., Vegetarian, Vegan, Gluten-Free..."
              placeholderTextColor="#999"
              value={selectedDietary}
              onChangeText={setSelectedDietary}
            />
            
            <Text style={styles.modalLabel}>Required Ingredients (Optional)</Text>
            <View style={styles.ingredientInputContainer}>
              <TextInput
                style={[styles.modalInput, styles.ingredientInput]}
                placeholder="Add ingredient..."
                placeholderTextColor="#999"
                value={newIngredient}
                onChangeText={setNewIngredient}
                onSubmitEditing={addRequiredIngredient}
              />
              <TouchableOpacity 
                style={styles.addIngredientButton}
                onPress={addRequiredIngredient}
              >
                <Ionicons name="add" size={20} color="#4CAF50" />
              </TouchableOpacity>
            </View>
            
            {requiredIngredients.length > 0 && (
              <View style={styles.ingredientsList}>
                {requiredIngredients.map((ingredient, index) => (
                  <View key={index} style={styles.ingredientTag}>
                    <Text style={styles.ingredientTagText}>{ingredient}</Text>
                    <TouchableOpacity 
                      onPress={() => removeRequiredIngredient(ingredient)}
                      style={styles.removeIngredientButton}
                    >
                      <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            
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
  newFolderButtonsContainer: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  newFolderButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderStyle: 'dashed',
  },
  regularFolderButton: {
    borderColor: '#FF6B6B',
  },
  smartFolderButton: {
    borderColor: '#4CAF50',
  },
  newFolderButtonText: {
    fontSize: 14,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#FF6B6B',
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
  },
  folderThumbnail: {
    width: '100%',
    height: 120,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
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
  folderName: {
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
    padding: 20,
  },
  modalLabel: {
    fontSize: 16,
    fontWeight: '600',
    fontFamily: 'NunitoSans-SemiBold',
    color: '#333333',
    marginBottom: 8,
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
});