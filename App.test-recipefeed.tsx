import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import * as Font from 'expo-font';
import RecipeFeedScreen from './screens/RecipeFeedScreen';

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
        'Recoleta-Medium': require('./assets/fonts/Recoleta-Medium.otf'),
        'NunitoSans-Regular': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-SemiBold': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-Bold': require('./assets/fonts/NunitoSans-VariableFont_YTLC,opsz,wdth,wght.ttf'),
        'NunitoSans-Italic': require('./assets/fonts/NunitoSans-Italic-VariableFont_YTLC,opsz,wdth,wght.ttf'),
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
    <View style={styles.container}>
      <StatusBar style="auto" />
      <RecipeFeedScreen />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
