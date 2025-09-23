import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

// Simple placeholder screens
function PantryScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Pantry Screen</Text>
    </View>
  );
}

function RecipeFeedScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Recipe Feed Screen</Text>
    </View>
  );
}

function SavedRecipesScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Saved Recipes Screen</Text>
    </View>
  );
}

// Simple tab icon component
function TabIcon({ name, color, size }: { name: string; color: string; size: number }) {
  const iconName = name === 'basket' ? 'basket-outline' : 
                   name === 'book' ? 'book-outline' : 'heart-outline';
  return <Ionicons name={iconName as any} size={size} color={color} />;
}

const Tab = createBottomTabNavigator();

function MainTabs() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => (
          <TabIcon name={route.name} color={color} size={size} />
        ),
        tabBarActiveTintColor: '#FF6B6B',
        tabBarInactiveTintColor: '#999',
        tabBarStyle: {
          backgroundColor: '#fff',
          borderTopWidth: 1,
          borderTopColor: '#f0f0f0',
          paddingBottom: 5,
          paddingTop: 5,
          height: 60,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="basket" 
        component={PantryScreen}
        options={{ tabBarLabel: 'Pantry' }}
      />
      <Tab.Screen 
        name="book" 
        component={RecipeFeedScreen}
        options={{ tabBarLabel: 'Recipes' }}
      />
      <Tab.Screen 
        name="heart" 
        component={SavedRecipesScreen}
        options={{ tabBarLabel: 'Saved' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <MainTabs />
    </NavigationContainer>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  text: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
  },
});
