import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import * as Font from 'expo-font';
import { create } from 'zustand';

// Simple Zustand store for testing
interface TestStore {
  count: number;
  increment: () => void;
  decrement: () => void;
}

const useTestStore = create<TestStore>((set) => ({
  count: 0,
  increment: () => set((state) => ({ count: state.count + 1 })),
  decrement: () => set((state) => ({ count: state.count - 1 })),
}));

// Test screen with Zustand
function CounterScreen() {
  const { count, increment, decrement } = useTestStore();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Zustand Test</Text>
      <Text style={styles.count}>Count: {count}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.button} onPress={decrement}>
          <Text style={styles.buttonText}>-</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={increment}>
          <Text style={styles.buttonText}>+</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

function InfoScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Info Screen</Text>
      <Text style={styles.subtitle}>Zustand + Navigation Test</Text>
    </View>
  );
}

const Tab = createBottomTabNavigator();

export default function App() {
  const [fontsLoaded, setFontsLoaded] = useState(false);

  useEffect(() => {
    loadFonts();
  }, []);

  const loadFonts = async () => {
    try {
      await Font.loadAsync({
        'Recoleta-Bold': require('./assets/fonts/Recoleta-Bold.otf'),
        'Recoleta-Regular': require('./assets/fonts/Recoleta-Regular.otf'),
      });
      setFontsLoaded(true);
    } catch (error) {
      console.log('Error loading fonts:', error);
      setFontsLoaded(true);
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
      <StatusBar style="auto" />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#FF6B6B',
          tabBarInactiveTintColor: '#666',
        }}
      >
        <Tab.Screen 
          name="Counter" 
          component={CounterScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="calculator" size={size} color={color} />
            ),
          }}
        />
        <Tab.Screen 
          name="Info" 
          component={InfoScreen}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="information-circle" size={size} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
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
    fontFamily: 'Recoleta-Bold',
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
    fontFamily: 'Recoleta-Regular',
  },
  count: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 30,
    fontFamily: 'Recoleta-Bold',
  },
  buttonContainer: {
    flexDirection: 'row',
    gap: 20,
  },
  button: {
    backgroundColor: '#FF6B6B',
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: 'white',
    fontSize: 24,
    fontWeight: 'bold',
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
