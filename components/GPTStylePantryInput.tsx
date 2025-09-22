import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Animated,
  Alert,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as Haptics from 'expo-haptics';
import FoodDictionaryService from '../services/foodDictionaryService';
import { useRecipeStore } from '../state/recipeStore.fixed';

interface GPTStylePantryInputProps {
  onIngredientsAdded?: (ingredients: string[]) => void;
  placeholder?: string;
}

const GPTStylePantryInput: React.FC<GPTStylePantryInputProps> = ({
  onIngredientsAdded,
  placeholder = "Add ingredients...",
}) => {
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  const [transcription, setTranscription] = useState('');
  
  const { addPantryItem } = useRecipeStore();
  const inputRef = useRef<TextInput>(null);
  const waveformAnimation = useRef(new Animated.Value(0)).current;

  // Animation for waveform icon
  useEffect(() => {
    if (isListening) {
      const animateWaveform = () => {
        Animated.sequence([
          Animated.timing(waveformAnimation, {
            toValue: 1,
            duration: 500,
            useNativeDriver: true,
          }),
          Animated.timing(waveformAnimation, {
            toValue: 0,
            duration: 500,
            useNativeDriver: true,
          }),
        ]).start(() => {
          if (isListening) {
            animateWaveform();
          }
        });
      };
      animateWaveform();
    } else {
      waveformAnimation.setValue(0);
    }
  }, [isListening]);

  // Handle text input changes
  const handleTextChange = (text: string) => {
    setInputText(text);
    setIsTyping(text.length > 0);
    
    // If we have transcription from voice, clear it when user starts typing
    if (transcription && text !== transcription) {
      setTranscription('');
    }
  };

  // Start voice recording
  const startListening = async () => {
    try {
      // Request permissions
      const { status } = await Audio.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please allow microphone access to use voice input.');
        return;
      }

      // Configure audio mode
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });

      // Start recording
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      
      setRecording(newRecording);
      setIsListening(true);
      setTranscription('');
      
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      
      console.log('🎤 Started recording...');
    } catch (error) {
      console.error('❌ Error starting recording:', error);
      Alert.alert('Error', 'Failed to start voice recording. Please try again.');
    }
  };

  // Stop voice recording and process transcription
  const stopListening = async () => {
    try {
      if (!recording) return;

      setIsListening(false);
      await recording.stopAndUnloadAsync();
      
      // For now, we'll simulate transcription since expo-speech doesn't provide STT
      // In a real app, you'd integrate with a speech-to-text service
      const simulatedTranscription = "eggs, bread, spinach"; // This would be actual transcription
      setTranscription(simulatedTranscription);
      setInputText(simulatedTranscription);
      setIsTyping(true);
      
      // Haptic feedback
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
      
      console.log('🎤 Stopped recording, transcription:', simulatedTranscription);
    } catch (error) {
      console.error('❌ Error stopping recording:', error);
      setIsListening(false);
    }
  };

  // Submit ingredients
  const submitIngredients = async () => {
    const textToProcess = inputText.trim();
    if (!textToProcess) return;

    try {
      // Parse and validate ingredients
      const { validIngredients, invalidItems } = FoodDictionaryService.parseIngredients(textToProcess);

      if (validIngredients.length === 0) {
        // No valid ingredients found
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        Alert.alert(
          "No Valid Ingredients",
          "Didn't catch any ingredients. Try again?",
          [{ text: "OK" }]
        );
        return;
      }

      // Add valid ingredients to pantry
      for (const ingredient of validIngredients) {
        const pantryItem = {
          id: `pantry-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
          name: ingredient,
          category: 'other', // Could be enhanced with category detection
          addedAt: new Date().toISOString(),
        };
        addPantryItem(pantryItem);
      }

      // Show feedback for invalid items
      if (invalidItems.length > 0) {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        Alert.alert(
          "Some Items Couldn't Be Added",
          `Non-food items: ${invalidItems.join(', ')}`,
          [{ text: "OK" }]
        );
      } else {
        // Success feedback
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      }

      // Clear input and reset state
      setInputText('');
      setTranscription('');
      setIsTyping(false);
      inputRef.current?.blur();

      // Notify parent component
      onIngredientsAdded?.(validIngredients);

      console.log('✅ Added ingredients to pantry:', validIngredients);
    } catch (error) {
      console.error('❌ Error submitting ingredients:', error);
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      Alert.alert('Error', 'Failed to add ingredients. Please try again.');
    }
  };

  // Handle icon press
  const handleIconPress = () => {
    if (isListening) {
      stopListening();
    } else if (isTyping) {
      submitIngredients();
    } else {
      startListening();
    }
  };

  // Get current icon and color
  const getIconConfig = () => {
    if (isListening) {
      return {
        name: 'stop' as const,
        color: '#FF6B6B',
        animated: true,
      };
    } else if (isTyping) {
      return {
        name: 'arrow-up' as const,
        color: '#FF6B6B',
        animated: false,
      };
    } else {
      return {
        name: 'pulse' as const,
        color: '#FF6B6B',
        animated: false,
      };
    }
  };

  const iconConfig = getIconConfig();

  return (
    <View style={styles.container}>
      <View style={styles.inputContainer}>
        <TextInput
          ref={inputRef}
          style={styles.textInput}
          value={inputText}
          onChangeText={handleTextChange}
          placeholder={placeholder}
          placeholderTextColor="#999"
          maxLength={200}
          onFocus={() => {
            if (transcription) {
              setInputText(transcription);
              setIsTyping(true);
            }
          }}
        />
        
        <TouchableOpacity
          style={[
            styles.iconButton,
            isListening && styles.iconButtonActive,
            isTyping && styles.iconButtonSubmit,
          ]}
          onPress={handleIconPress}
          activeOpacity={0.7}
        >
          {iconConfig.animated && isListening ? (
            <Animated.View
              style={[
                styles.waveformContainer,
                {
                  transform: [
                    {
                      scale: waveformAnimation.interpolate({
                        inputRange: [0, 1],
                        outputRange: [1, 1.2],
                      }),
                    },
                  ],
                },
              ]}
            >
              <Ionicons name="pulse" size={20} color={iconConfig.color} />
            </Animated.View>
          ) : (
            <Ionicons name={iconConfig.name} size={20} color={iconConfig.color} />
          )}
        </TouchableOpacity>
      </View>
      
      {/* Voice status indicator */}
      {isListening && (
        <View style={styles.voiceIndicator}>
          <Animated.View
            style={[
              styles.voiceDot,
              {
                opacity: waveformAnimation.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.3, 1],
                }),
              },
            ]}
          />
          <Text style={styles.voiceText}>Listening...</Text>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 16,
    marginVertical: 8,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f5f5f5',
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 12,
    minHeight: 48,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  textInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'NunitoSans-Regular',
    color: '#333',
    paddingRight: 8,
  },
  iconButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#fff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  iconButtonActive: {
    backgroundColor: '#FF6B6B',
  },
  iconButtonSubmit: {
    backgroundColor: '#FF6B6B',
  },
  waveformContainer: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  voiceIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 16,
  },
  voiceDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#FF6B6B',
    marginRight: 8,
  },
  voiceText: {
    fontSize: 14,
    color: '#FF6B6B',
    fontFamily: 'NunitoSans-Regular',
  },
});

export default GPTStylePantryInput;
