import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';

// Import your actual screens but with simplified versions
import PantryScreen from './screens/PantryScreen';
import RecipeFeedScreen from './screens/RecipeFeedScreen';
import SavedRecipesScreen from './screens/SavedRecipesScreen';

// Simple tab icon component
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const iconName = name === 'basket' ? 'basket-outline' : 
                   name === 'restaurant' ? 'search-outline' : 
                   name === 'heart' ? 'heart-outline' : 'help-outline';
  
  return (
    <Ionicons name={iconName as any} size={size} color={color} />
  );
}

// Bottom Tab Navigator
const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#666',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#eee',
        },
        headerStyle: {
          backgroundColor: '#f8f9fa',
          borderBottomWidth: 0,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: '#FF6B6B',
        headerTitleStyle: {
          fontWeight: 'bold',
          fontFamily: 'Recoleta-Bold',
        },
      }}
    >
      <Tab.Screen 
        name="Pantry" 
        component={PantryScreen}
        options={{
          title: 'My Pantry',
          tabBarLabel: 'My Pantry',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="basket" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Recipes" 
        component={RecipeFeedScreen}
        options={{
          title: 'Find Recipes',
          tabBarLabel: 'Find Recipes',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="restaurant" color={color} size={size} />
          ),
        }}
      />
      <Tab.Screen 
        name="Saved" 
        component={SavedRecipesScreen}
        options={{
          title: 'My Meals',
          tabBarLabel: 'My Meals',
          tabBarIcon: ({ color, size }) => (
            <TabIcon name="heart" color={color} size={size} />
          ),
        }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        // Recoleta fonts
        'Recoleta-Bold': require('./assets/fonts/Recoleta-Bold.otf'),
        'Recoleta-Regular': require('./assets/fonts/Recoleta-Regular.otf'),
        'Recoleta-Medium': require('./assets/fonts/Recoleta-Medium.otf'),
        
        // Nunito Sans variable fonts
        'NunitoSans-Regular': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-SemiBold': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-Bold': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-Italic': require('./assets/fonts/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.log('Error loading fonts:', error);
      setFontsLoaded(true); // Continue even if fonts fail to load
    }
  };

  if (!fontsLoaded) {
    return (
      <View style={styles.loadingContainer}>
        <Text style={styles.loadingText}>Loading...</Text>
      </View>
    );
  }

  return (
    <NavigationContainer>
      <StatusBar style="light" />
      <MainTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  loadingContainer: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  loadingText: {
    fontSize: 18,
    color: '#FF6B6B',
    fontFamily: 'Recoleta-Regular',
  },
});
