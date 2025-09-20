import { GPTRecipe, GPTRecipeResponse, PantryItem } from '../types';
import Constants from 'expo-constants';
import { API_KEYS } from '../api-keys';

const OPENAI_API_KEY = 
  Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY ||
  Constants.manifest?.extra?.EXPO_PUBLIC_OPENAI_API_KEY ||
  process.env.EXPO_PUBLIC_OPENAI_API_KEY ||
  API_KEYS.OPENAI_API_KEY;
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug: Log environment variable status
console.log('🔍 GPT Service - Environment check:');
console.log('Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY exists:', !!Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY);
console.log('Constants.manifest?.extra?.EXPO_PUBLIC_OPENAI_API_KEY exists:', !!Constants.manifest?.extra?.EXPO_PUBLIC_OPENAI_API_KEY);
console.log('process.env.EXPO_PUBLIC_OPENAI_API_KEY exists:', !!process.env.EXPO_PUBLIC_OPENAI_API_KEY);
console.log('🔑 OPENAI_KEY in TestFlight:', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 8) + '...' : 'NOT FOUND');
console.log('📱 Constants.expoConfig extra:', Constants.expoConfig?.extra);
console.log('📱 Constants.manifest extra:', Constants.manifest?.extra);
console.log('🚀 GPT Service initialized with API key:', OPENAI_API_KEY ? 'YES' : 'NO');

export interface RecipeGenerationOptions {
  mealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
  maxTime?: number; // in minutes
  cuisine?: string;
  dietary?: 'vegetarian' | 'vegan' | 'gluten-free' | 'dairy-free';
}

export class GPTService {
  private static instance: GPTService;
  
  private constructor() {}
  
  static getInstance(): GPTService {
    if (!GPTService.instance) {
      GPTService.instance = new GPTService();
    }
    return GPTService.instance;
  }

  async generateRecipes(
    pantryItems: PantryItem[], 
    options: RecipeGenerationOptions = {}
  ): Promise<GPTRecipe[]> {
    try {
      const prompt = this.buildPrompt(pantryItems, options);
      
      // Add delay to prevent rate limiting
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      console.log('🚀 Calling OpenAI API with prompt length:', prompt.length);
      console.log('🔑 Using API key:', OPENAI_API_KEY ? OPENAI_API_KEY.substring(0, 8) + '...' : 'NOT FOUND');
      console.log('🌐 API URL:', OPENAI_API_URL);
      
      const response = await fetch(OPENAI_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
          model: 'gpt-4o-mini',
          messages: [
            {
              role: 'system',
              content: `You are a professional sous chef writing training cards for new cooks. Generate exactly 3 recipes in valid JSON format. Each recipe must be practical, delicious, and use mostly the provided pantry ingredients. Only suggest 2-3 additional ingredients if absolutely essential. 

CRITICAL CHARACTER LIMITS:
- Recipe title: Maximum 120 characters
- Recipe description: Maximum 280 characters (for recipe details modal)
- Keep ingredients and instructions concise but clear

IMPORTANT: Return ONLY valid JSON, no markdown formatting, no backticks, no extra text.`
            },
            {
              role: 'user',
              content: prompt
            }
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('OpenAI API Error Details:', errorText);
        if (response.status === 401) {
          throw new Error('OpenAI API key is invalid or expired. Please check your API key.');
        }
        throw new Error(`OpenAI API error: ${response.status} - ${errorText}`);
      }

      const data = await response.json();
      const content = data.choices[0]?.message?.content;
      
      if (!content) {
        throw new Error('No content received from GPT');
      }

      console.log('🔍 Raw GPT response:', content);

      // Clean the response content - remove markdown formatting and backticks
      let cleanedContent = content.trim();
      
      // Remove markdown code blocks if present
      if (cleanedContent.startsWith('```json')) {
        cleanedContent = cleanedContent.replace(/^```json\s*/, '');
      }
      if (cleanedContent.endsWith('```')) {
        cleanedContent = cleanedContent.replace(/\s*```$/, '');
      }
      
      // Remove any remaining backticks
      cleanedContent = cleanedContent.replace(/`/g, '');
      
      console.log('🧹 Cleaned content:', cleanedContent);

      // Try to parse the JSON response
      let recipeResponse: GPTRecipeResponse;
      try {
        recipeResponse = JSON.parse(cleanedContent);
      } catch (parseError) {
        console.error('❌ JSON parse error:', parseError);
        console.error('❌ Failed content:', cleanedContent);
        
        // Try to extract JSON from the response if it's embedded in text
        const jsonMatch = cleanedContent.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          try {
            recipeResponse = JSON.parse(jsonMatch[0]);
            console.log('✅ Successfully extracted JSON from embedded content');
          } catch (extractError) {
            console.error('❌ Failed to extract JSON:', extractError);
            throw new Error('Invalid recipe format received from GPT - JSON parsing failed');
          }
        } else {
          throw new Error('Invalid recipe format received from GPT - no JSON found');
        }
      }
      
      if (!recipeResponse.recipes || !Array.isArray(recipeResponse.recipes)) {
        throw new Error('Invalid recipe format received from GPT - missing recipes array');
      }

      console.log('✅ Successfully parsed recipes:', recipeResponse.recipes.length);
      
      // Post-process recipes to enforce character limits
      const processedRecipes = recipeResponse.recipes.map(recipe => ({
        ...recipe,
        title: recipe.title.length > 120 ? recipe.title.substring(0, 117) + '...' : recipe.title,
        description: recipe.description.length > 280 ? recipe.description.substring(0, 277) + '...' : recipe.description
      }));
      
      return processedRecipes;
    } catch (error) {
      console.error('Error generating recipes with GPT:', error);
      // Return fallback recipes if GPT fails
      const fallbackRecipes = this.getFallbackRecipes(pantryItems, options);
      console.log('Using fallback recipes:', fallbackRecipes.length);
      return fallbackRecipes;
    }
  }

  private buildPrompt(pantryItems: PantryItem[], options: RecipeGenerationOptions): string {
    const pantryNames = pantryItems.map(item => item.name).join(', ');
    
    let prompt = '';
    
    if (pantryItems.length === 0) {
      prompt = `Generate 3 dinner recipes under 30 minutes. Use common, accessible ingredients that most people would have in their kitchen.`;
    } else {
      prompt = `Generate 3 dinner recipes under 30 minutes using these pantry ingredients: ${pantryNames}. 
      
CRITICAL INGREDIENT RULES:
- PRIORITY: Generate recipes with 0-2 missing ingredients (prefer 0-1 missing ingredients)
- Use 80%+ pantry ingredients whenever possible
- Only suggest 3+ missing ingredients if absolutely necessary due to very limited pantry
- Missing ingredients should be common, basic items (salt, pepper, oil, etc.)
- If pantry is limited, prioritize recipes that use the most pantry ingredients available`;
    }
    
    if (options.mealType && options.mealType !== 'dinner') {
      prompt = prompt.replace('dinner', options.mealType);
    }
    
    if (options.maxTime && options.maxTime !== 30) {
      prompt = prompt.replace('under 30 minutes', `under ${options.maxTime} minutes`);
    }
    
    if (options.cuisine) {
      prompt += ` Focus on ${options.cuisine} cuisine.`;
    }
    
    if (options.dietary) {
      prompt += ` Make all recipes ${options.dietary}.`;
    }
    
         prompt += `\n\nCRITICAL CHARACTER LIMITS:
     - Recipe title: Maximum 120 characters (for recipe card display)
     - Recipe description: Maximum 280 characters (for recipe details modal)
     - Keep ingredients and instructions concise but clear
     
     Respond with valid JSON in this exact format:\n{\n  "recipes": [\n    {\n      "title": "Recipe Title (max 120 chars)",\n      "description": "Brief description explaining the dish, its flavors, and why it's delicious. Keep under 280 characters.",\n      "ingredients": ["2 cups pasta", "1/2 onion, diced", "3 cloves garlic, minced"],\n      "steps": ["Step 1: Detailed cooking instruction", "Step 2: Next cooking step", "Step 3: Final preparation step"],\n      "cook_time": "X minutes",\n      "cuisine": "cuisine type",\n      "image_tag": "descriptive food photo tag"\n    }\n  ]\n}`;
    
    return prompt;
  }

  private getFallbackRecipes(pantryItems: PantryItem[], options: RecipeGenerationOptions): GPTRecipe[] {
    // Fallback recipes when GPT is unavailable
    const pantryNames = pantryItems.slice(0, 3).map(item => item.name).join(', ');
    
    return [
      {
        title: "Quick Pantry Pasta",
        description: `A delicious and simple pasta dish using ${pantryNames}. Ready in 20 minutes with perfectly cooked pasta and fresh vegetables for a wholesome, flavorful meal.`,
        ingredients: [
          "2 cups pasta (any type)",
          "1/2 cup olive oil",
          "2 cloves garlic, minced",
          "1/2 onion, diced",
          "2 tomatoes, chopped",
          "Salt and pepper to taste",
          "1/4 cup grated cheese (optional)"
        ],
        steps: [
          "Bring a large pot of salted water to boil and cook pasta according to package instructions until al dente",
          "While pasta cooks, heat olive oil in a large pan over medium heat and sauté diced onion until translucent",
          "Add minced garlic and chopped tomatoes to the pan, cooking for 2-3 minutes until tomatoes soften",
          "Drain pasta, reserving 1/2 cup of pasta water, then add pasta to the pan with vegetables",
          "Toss everything together, adding pasta water if needed for a silky sauce, and season with salt and pepper",
          "Serve hot with grated cheese on top if desired"
        ],
        cook_time: "20 minutes",
        cuisine: "Italian",
        image_tag: "pasta dish with vegetables and cheese"
      },
      {
        title: "Pantry Stir Fry",
        description: `A vibrant stir fry featuring ${pantryNames} in a savory Asian-inspired sauce. Ready in 15 minutes with healthy vegetables and bold flavors.`,
        ingredients: [
          "2 cups mixed vegetables (from your pantry)",
          "2 tablespoons vegetable oil",
          "3 cloves garlic, minced",
          "1 tablespoon soy sauce",
          "1 teaspoon sesame oil",
          "1/2 teaspoon red pepper flakes (optional)",
          "2 green onions, sliced (optional)"
        ],
        steps: [
          "Heat vegetable oil in a wok or large frying pan over high heat until very hot",
          "Add minced garlic and stir for 10 seconds until fragrant, being careful not to burn it",
          "Add all your pantry vegetables to the pan and stir fry for 3-4 minutes until they start to soften",
          "Pour in soy sauce and sesame oil, tossing everything together for another 2-3 minutes",
          "Add red pepper flakes and green onions if using, then serve immediately while hot and crispy"
        ],
        cook_time: "15 minutes",
        cuisine: "Asian",
        image_tag: "colorful stir fry vegetables in wok"
      },
      {
        title: "Fresh Pantry Salad",
        description: `A bright and refreshing salad featuring ${pantryNames} with a light, zesty dressing. Perfect for lunch or as a healthy side dish with crisp vegetables and tangy flavors.`,
        ingredients: [
          "2 cups mixed fresh vegetables (from your pantry)",
          "2 tablespoons extra virgin olive oil",
          "1 tablespoon fresh lemon juice",
          "1/2 teaspoon salt",
          "1/4 teaspoon black pepper",
          "1 tablespoon fresh herbs (basil, parsley, or cilantro if available)",
          "1/4 cup crumbled cheese (optional)"
        ],
        steps: [
          "Wash and chop all vegetables into bite-sized pieces, placing them in a large salad bowl",
          "In a small bowl, whisk together olive oil, lemon juice, salt, and pepper to create the dressing",
          "Pour the dressing over the vegetables and gently toss everything together until well coated",
          "Add fresh herbs and cheese if using, then serve immediately for the best texture and flavor"
        ],
        cook_time: "10 minutes",
        cuisine: "Mediterranean",
        image_tag: "fresh colorful vegetable salad bowl"
      }
    ];
  }
}

export default GPTService.getInstance();

