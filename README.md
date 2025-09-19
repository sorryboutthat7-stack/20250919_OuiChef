# Oui, Chef 🍽️

A cross-platform mobile app built with React Native and Expo that helps users discover recipes based on ingredients they have in their pantry.

## Features

- **Authentication**: Email + password signup/login with Supabase
- **Pantry Management**: Add and manage ingredients in your virtual pantry
- **Recipe Discovery**: Swipeable recipe feed with smart ingredient matching
- **Smart Matching**: Recipes are ranked by ingredient availability
- **Saved Recipes**: Organize recipes into "Cook Now" and "Buy Items" categories
- **Beautiful UI**: Modern, intuitive interface with smooth animations

## Tech Stack

- **Frontend**: React Native with Expo
- **Backend**: Supabase (PostgreSQL + Auth + Real-time)
- **State Management**: Zustand
- **Navigation**: React Navigation
- **Animations**: React Native Reanimated
- **Language**: TypeScript

## Project Structure

```
OuiChef/
├── components/          # Reusable UI components
├── screens/            # App screens
│   ├── LoginScreen.tsx
│   ├── PantryScreen.tsx
│   ├── RecipeFeedScreen.tsx
│   ├── RecipeDetailScreen.tsx
│   └── SavedRecipesScreen.tsx
├── services/           # API and external service integrations
│   ├── supabase.ts
│   └── recipeService.ts
├── state/              # State management with Zustand
│   ├── authStore.ts
│   └── recipeStore.ts
├── types/              # TypeScript type definitions
│   └── index.ts
├── data/               # Sample data and assets
│   └── recipes.json
└── setup-database.sql  # Database setup script
```

## Setup Instructions

### 1. Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Expo CLI (`npm install -g @expo/cli`)
- Supabase account

### 2. Install Dependencies

```bash
npm install
```

### 3. Supabase Setup

1. Create a new project at [supabase.com](https://supabase.com)
2. Get your project URL and anon key
3. Update `services/supabase.ts`:

```typescript
const supabaseUrl = 'YOUR_SUPABASE_URL';
const supabaseAnonKey = 'YOUR_SUPABASE_ANON_KEY';
```

### 4. Database Setup

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Run the contents of `setup-database.sql`
4. This will create:
   - Users table with pantry management
   - Recipes table for recipe storage
   - SavedRecipes table for user favorites
   - Row Level Security policies
   - Sample recipe data

### 5. Run the App

```bash
npm start
```

Scan the QR code with Expo Go app on your mobile device.

## App Flow

1. **Authentication**: Users sign up/login with email and password
2. **Pantry Setup**: Users add ingredients they have available
3. **Recipe Discovery**: Swipe through recipes ranked by ingredient match
4. **Recipe Details**: View full recipe with ingredient highlighting
5. **Save Recipes**: Add favorites to personal collection
6. **Organize**: View saved recipes organized by cooking readiness

## Key Components

### Recipe Matching Algorithm

The app uses intelligent ingredient matching to rank recipes:

- **Cook Now**: All ingredients available in pantry
- **Buy 1-2 Items**: Missing 1-2 ingredients
- **Missing Many**: More than 2 ingredients missing (filtered out)

### State Management

- **AuthStore**: Manages user authentication and session
- **RecipeStore**: Handles recipe data, pantry updates, and saved recipes

### Navigation

- **Stack Navigator**: Handles authentication flow and recipe details
- **Tab Navigator**: Main app navigation between pantry, recipes, and saved

## Customization

### Adding New Recipes

1. Add recipe data to `data/recipes.json`
2. Run the database setup script to insert new recipes
3. Recipes automatically appear in the discovery feed

### Styling

- Colors are defined in individual component styles
- Primary theme: `#FF6B6B` (coral red)
- Secondary theme: `#4ECDC4` (teal)
- Accent: `#FFA726` (orange)

### Adding Features

- New screens can be added to the `screens/` directory
- Additional services can be created in `services/`
- State management can be extended in `state/`

## Troubleshooting

### Common Issues

1. **Metro bundler errors**: Clear cache with `npx expo start --clear`
2. **Supabase connection**: Verify URL and key in `services/supabase.ts`
3. **TypeScript errors**: Ensure all dependencies are properly installed

### Development Tips

- Use Expo DevTools for debugging
- Enable hot reloading for faster development
- Test on both iOS and Android devices

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions:
- Check the troubleshooting section
- Review Supabase documentation
- Open an issue on GitHub

---

**Happy Cooking! 🍳✨**
