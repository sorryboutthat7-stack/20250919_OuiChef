import React from 'react';
import { View, Text, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface LoadingScreenProps {
  message?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ 
  message = "Loading your recipes..." 
}) => {
  return (
    <View style={styles.container}>
      <View style={styles.content}>
        <Ionicons name="restaurant" size={60} color="#FF6B6B" />
        <Text style={styles.title}>Oui, Chef</Text>
        <ActivityIndicator size="large" color="#FF6B6B" style={styles.spinner} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  title: {
    fontSize: 32,
    fontWeight: 'bold',
    fontFamily: 'Recoleta-Bold',
    color: '#FF6B6B',
    marginTop: 20,
    marginBottom: 40,
  },
  spinner: {
    marginBottom: 20,
  },
  message: {
    fontSize: 16,
    color: '#666',
    textAlign: 'center',
    fontFamily: 'NunitoSans-Regular',
  },
});

export default LoadingScreen;
