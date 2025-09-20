import Constants from 'expo-constants';
import { API_KEYS } from '../api-keys';

const UNSPLASH_ACCESS_KEY = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ||
  Constants.manifest?.extra?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ||
  process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY ||
  API_KEYS.UNSPLASH_ACCESS_KEY;
const UNSPLASH_API_URL = 'https://api.unsplash.com/search/photos';

// Debug: Log environment variable status
console.log('Image Service - Environment check:');
console.log('Constants.expoConfig?.extra?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY exists:', !!Constants.expoConfig?.extra?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY);
console.log('Constants.manifest?.extra?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY exists:', !!Constants.manifest?.extra?.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY);
console.log('process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY exists:', !!process.env.EXPO_PUBLIC_UNSPLASH_ACCESS_KEY);
console.log('UNSPLASH_KEY in TestFlight:', UNSPLASH_ACCESS_KEY ? UNSPLASH_ACCESS_KEY.substring(0, 8) : 'NOT FOUND');

export interface UnsplashImage {
  id: string;
  urls: {
    regular: string;
    small: string;
  };
  alt_description: string;
}

export interface UnsplashResponse {
  results: UnsplashImage[];
}

class ImageService {
  private static instance: ImageService;
  
  private constructor() {}
  
  static getInstance(): ImageService {
    if (!ImageService.instance) {
      ImageService.instance = new ImageService();
    }
    return ImageService.instance;
  }

  async getRecipeImage(imageTag: string): Promise<string> {
    try {
      // Debug: Log the API key (first few characters for security)
      console.log('Unsplash API Key available:', UNSPLASH_ACCESS_KEY ? `${UNSPLASH_ACCESS_KEY.substring(0, 8)}...` : 'NOT FOUND');
      
      // If no Unsplash API key, return a fallback image
      if (!UNSPLASH_ACCESS_KEY) {
        console.warn('No Unsplash API key found, using fallback image');
        return this.getFallbackImage(imageTag);
      }

      const response = await fetch(
        `${UNSPLASH_API_URL}?query=${encodeURIComponent(imageTag)}&per_page=1&orientation=landscape`,
        {
          headers: {
            'Authorization': `Client-ID ${UNSPLASH_ACCESS_KEY}`,
          },
        }
      );

      if (!response.ok) {
        console.warn('Unsplash API error, using fallback image');
        return this.getFallbackImage(imageTag);
      }

      const data: UnsplashResponse = await response.json();
      
      if (data.results && data.results.length > 0) {
        return data.results[0].urls.regular;
      }

      return this.getFallbackImage(imageTag);
    } catch (error) {
      console.error('Error fetching image from Unsplash:', error);
      return this.getFallbackImage(imageTag);
    }
  }

  private getFallbackImage(imageTag: string): string {
    // Return a curated fallback image based on the image tag
    const tag = imageTag.toLowerCase();
    
    if (tag.includes('pasta')) {
      return 'https://images.unsplash.com/photo-1621996346565-e3dbc353d2e5?w=800&h=600&fit=crop';
    }
    
    if (tag.includes('stir fry') || tag.includes('asian')) {
      return 'https://images.unsplash.com/photo-1603133872878-684f208fb84b?w=800&h=600&fit=crop';
    }
    
    if (tag.includes('salad')) {
      return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?w=800&h=600&fit=crop';
    }
    
    if (tag.includes('soup')) {
      return 'https://images.unsplash.com/photo-1547592166-23ac45744acd?w=800&h=600&fit=crop';
    }
    
    if (tag.includes('grill') || tag.includes('bbq')) {
      return 'https://images.unsplash.com/photo-1544025162-d76694265947?w=800&h=600&fit=crop';
    }
    
    // Default food image
    return 'https://images.unsplash.com/photo-1565299624946-b28f40a0ca4b?w=800&h=600&fit=crop';
  }
}

export default ImageService.getInstance();
