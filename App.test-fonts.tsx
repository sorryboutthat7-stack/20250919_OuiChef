import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';

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
        <Text style={styles.loadingText}>Loading fonts...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar style="auto" />
      <Text style={styles.title}>Font Test App</Text>
      <Text style={styles.subtitle}>Testing with fonts loaded</Text>
      <Text style={styles.fontTest}>Recoleta Bold Font Test</Text>
    </View>
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
    marginBottom: 20,
  },
  fontTest: {
    fontSize: 18,
    fontFamily: 'Recoleta-Bold',
    color: '#333',
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
