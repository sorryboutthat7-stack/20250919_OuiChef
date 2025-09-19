import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Image } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
// import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import { Ionicons } from '@expo/vector-icons';

// Import actual screens
import PantryScreen from './screens/PantryScreen';
import RecipeFeedScreen from './screens/RecipeFeedScreen.fixed';
import SavedRecipesScreen from './screens/SavedRecipesScreen';
// import RecipeDetailScreen from './screens/RecipeDetailScreen';

// SavedRecipesScreen is now imported from separate file

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
          title: '',
                 headerTitle: () => (
                   <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', flex: 1, position: 'relative', height: 44 }}>
                     <View style={{ position: 'absolute', left: '50%', transform: [{ translateX: -50 }], top: '50%', marginTop: -15 }}>
                       <Text style={{ 
                         fontSize: 24, 
                         lineHeight: 30, 
                         fontWeight: 'bold', 
                         fontFamily: 'Recoleta-Bold', 
                         color: '#FF6B6B'
                       }}>
                         Oui, Chef
                       </Text>
                     </View>
                     <Image 
                       source={require('./logo/ouichef_logo_trans-01.png')} 
                       style={{ width: 65, height: 32, position: 'absolute', left: '50%', transform: [{ translateX: -105 }], top: '50%', marginTop: -16 }}
                       resizeMode="contain"
                     />
                   </View>
                 ),
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
          title: 'Oui, Chef',
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

// Stack Navigator - removed to avoid gesture-handler dependency
// const Stack = createStackNavigator();

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
        
        // Nunito Sans variable fonts - load with specific weight names
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
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#FF6B6B',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
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