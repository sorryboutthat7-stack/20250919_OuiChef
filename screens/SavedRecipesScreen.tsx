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
  const [showSearch, setShowSearch] = useState(false);
  
  // Get saved recipes from global store
  const { savedRecipes, removeRecipe } = useRecipeStore();

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

  const renderFolderCard = ({ item }: { item: any }) => (
    <TouchableOpacity style={styles.folderCard} activeOpacity={0.8}>
      <Image source={{ uri: item.thumbnail }} style={styles.folderThumbnail} />
      <View style={styles.folderInfo}>
        <Text style={styles.folderName}>{item.name}</Text>
        <Text style={styles.folderCount}>{item.recipeCount} recipes</Text>
      </View>
      <Ionicons name="chevron-forward" size={20} color="#666" />
    </TouchableOpacity>
  );

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
        return savedRecipes.length > 0 ? (
          <FlatList
            key="saved-recipes-grid"
            data={savedRecipes}
            renderItem={renderRecipeCard}
            keyExtractor={(item) => item.id}
            numColumns={2}
            columnWrapperStyle={styles.row}
            contentContainerStyle={styles.gridContainer}
            showsVerticalScrollIndicator={false}
          />
        ) : (
          <View style={styles.emptyState}>
            <Ionicons name="heart-outline" size={80} color="#FF6B6B" />
            <Text style={styles.emptyStateTitle}>No Saved Recipes Yet</Text>
            <Text style={styles.emptyStateSubtitle}>
              Swipe right on recipe cards in the Find Recipes tab to save your favorites!
            </Text>
          </View>
        );
      case 'folders':
        return (
          <FlatList
            key="folders-list"
            data={mockFolders}
            renderItem={renderFolderCard}
            keyExtractor={(item) => item.id}
            contentContainerStyle={styles.foldersContainer}
            showsVerticalScrollIndicator={false}
          />
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
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>My Meals</Text>
        <TouchableOpacity
          style={styles.searchButton}
          onPress={() => setShowSearch(!showSearch)}
          activeOpacity={0.7}
        >
          <Ionicons name="search-outline" size={24} color="#FF6B6B" />
        </TouchableOpacity>
      </View>

      {/* Search Bar */}
      {showSearch && (
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search your saved recipes..."
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          <TouchableOpacity
            style={styles.searchCloseButton}
            onPress={() => setShowSearch(false)}
          >
            <Ionicons name="close" size={20} color="#666" />
          </TouchableOpacity>
        </View>
      )}

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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#f8f9fa',
  },
  headerTitle: {
    fontSize: 32,
    lineHeight: 38,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#333333',
  },
  searchButton: {
    padding: 8,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingBottom: 16,
    backgroundColor: '#f8f9fa',
  },
  searchInput: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#333333',
    borderWidth: 1,
    borderColor: '#e9ecef',
  },
  searchCloseButton: {
    marginLeft: 12,
    padding: 8,
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
    padding: 20,
  },
  folderCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  folderThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 8,
  },
  folderInfo: {
    flex: 1,
    marginLeft: 16,
  },
  folderCount: {
    fontSize: 12,
    lineHeight: 18,
    fontWeight: '400',
    fontFamily: 'NunitoSans-Regular',
    color: '#666666',
    marginTop: 4,
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
});