# 🚀 Oui Chef - GPT-Powered Recipe App Setup

## Overview
This app has been refactored to use GPT-generated recipes instead of static data. It now generates personalized recipes based on your pantry ingredients using OpenAI's GPT-4 API.

## 🔑 Required API Keys

### 1. OpenAI API Key
- Sign up at [OpenAI Platform](https://platform.openai.com/)
- Create an API key
- Add to your environment: `EXPO_PUBLIC_OPENAI_API_KEY=your_key_here`

### 2. Unsplash API Key (Optional)
- Sign up at [Unsplash Developers](https://unsplash.com/developers)
- Create an application to get access key
- Add to your environment: `EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_key_here`

## 📱 Features

### GPT Recipe Generation
- **3 recipes per batch** generated based on your pantry
- **Pantry-aware**: Uses ingredients you already have
- **Smart suggestions**: Only suggests 2-3 additional ingredients if essential
- **Customizable**: Filter by meal type, cook time, cuisine, dietary preferences

### Swipe Interface
- **Swipe right**: Save recipe to cookbook
- **Swipe left**: Skip recipe
- **Auto-refresh**: Generates new batch when running low
- **Manual refresh**: "New Recipes" button for fresh ideas

### Image Integration
- **Unsplash integration**: High-quality food photos based on recipe descriptions
- **Fallback system**: Placeholder images if API unavailable
- **Future-ready**: DALL-E integration planned

## 🏗️ Architecture

### Services
- `gptService.ts`: Handles OpenAI API calls
- `imageService.ts`: Manages Unsplash image fetching
- `recipeTransformService.ts`: Converts GPT recipes to app format
- `recipeStore.ts`: Zustand state management

### Data Flow
1. **Pantry Input** → User's available ingredients
2. **GPT Request** → OpenAI generates 3 recipes
3. **Image Fetch** → Unsplash provides relevant photos
4. **Recipe Display** → Swipeable cards with full details
5. **User Interaction** → Save/skip recipes, request variations

## 🚀 Getting Started

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Set environment variables**:
   Create a `.env` file in your project root:
   ```
   EXPO_PUBLIC_OPENAI_API_KEY=your_openai_api_key_here
   EXPO_PUBLIC_UNSPLASH_ACCESS_KEY=your_unsplash_access_key_here
   ```

3. **Start the app**:
   ```bash
   npm start
   ```

## 🔧 Configuration

### Recipe Generation Options
```typescript
interface RecipeGenerationOptions {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  maxTime?: number; // in minutes
  cuisine?: string;
  dietary?: 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
}
```

### Default Pantry Items
The app comes with sample pantry items for testing:
- Grains: pasta, rice
- Vegetables: tomatoes, onions, garlic
- Oils: olive oil
- Dairy: eggs, cheese

## 🎯 Future Enhancements

### Planned Features
- **Swipe Up**: Request recipe variations (faster, spicier, vegetarian)
- **DALL-E Integration**: Generate custom food images
- **Recipe Sharing**: Share saved recipes with friends
- **Meal Planning**: Weekly meal planning with generated recipes
- **Pantry Management**: Add/remove ingredients, expiration tracking

### Advanced AI Features
- **Learning Preferences**: GPT learns from user's save/skip patterns
- **Seasonal Suggestions**: Recipes based on seasonal ingredients
- **Dietary Evolution**: Adapts to changing dietary preferences
- **Cooking Skill Level**: Adjusts recipe complexity based on user feedback

## 🐛 Troubleshooting

### Common Issues
1. **GPT API Errors**: Check API key and rate limits
2. **Image Loading**: Verify Unsplash API key or check fallback images
3. **Recipe Generation**: Ensure pantry has sufficient ingredients

### Fallback System
- If GPT fails, app shows pre-built fallback recipes
- If Unsplash fails, app uses curated placeholder images
- App gracefully degrades without breaking functionality

## 📊 Performance

### Optimization Features
- **Batch Processing**: 3 recipes per API call (cost-effective)
- **Image Caching**: Unsplash images cached for performance
- **Lazy Loading**: Recipes generated on-demand
- **Smart Filtering**: Client-side filtering for instant results

### API Cost Management
- **Efficient Prompts**: Optimized GPT prompts for cost control
- **Batch Generation**: Reduces API calls per user session
- **Fallback Recipes**: Reduces dependency on external APIs

## 🤝 Contributing

This refactor demonstrates modern React Native patterns:
- **TypeScript**: Full type safety
- **Zustand**: Lightweight state management
- **Service Layer**: Clean separation of concerns
- **Error Handling**: Graceful degradation
- **Performance**: Optimized for mobile experience

---

**Happy Cooking! 🍳✨**

