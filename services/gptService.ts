import { GPTRecipe, GPTRecipeResponse, PantryItem } from '../types';
import Constants from 'expo-constants';

const OPENAI_API_KEY = Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY || 'your-api-key-here';
const OPENAI_API_URL = 'https://api.openai.com/v1/chat/completions';

// Debug: Log environment variable status
console.log('GPT Service - Environment check:');
console.log('EXPO_PUBLIC_OPENAI_API_KEY exists:', !!Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY);
console.log('API Key first 8 chars:', Constants.expoConfig?.extra?.EXPO_PUBLIC_OPENAI_API_KEY ? Constants.expoConfig.extra.EXPO_PUBLIC_OPENAI_API_KEY.substring(0, 8) : 'NOT FOUND');
console.log('Constants extra:', Constants.expoConfig?.extra);

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
              content: `You are a professional sous chef writing training cards for new cooks. Generate exactly 3 recipes in valid JSON format. Each recipe must be practical, delicious, and use mostly the provided pantry ingredients. Only suggest 2-3 additional ingredients if absolutely essential. For ingredients and instructions, be concise but clear - write as if training a new cook. IMPORTANT: Return ONLY valid JSON, no markdown formatting, no backticks, no extra text.`
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
        throw new Error(`OpenAI API error: ${response.status}`);
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
      return recipeResponse.recipes;
    } catch (error) {
      console.error('Error generating recipes with GPT:', error);
      // Return fallback recipes if GPT fails
      return this.getFallbackRecipes(pantryItems, options);
    }
  }

  private buildPrompt(pantryItems: PantryItem[], options: RecipeGenerationOptions): string {
    const pantryNames = pantryItems.map(item => item.name).join(', ');
    
    let prompt = '';
    
    if (pantryItems.length === 0) {
      prompt = `Generate 3 dinner recipes under 30 minutes. Use common, accessible ingredients that most people would have in their kitchen.`;
    } else {
      prompt = `Generate 3 dinner recipes under 30 minutes using these pantry ingredients: ${pantryNames}. 
      
IMPORTANT INGREDIENT RULES:
- Use as many pantry ingredients as possible (aim for 80%+ pantry ingredients)
- Maximum 2 missing ingredients per recipe (prefer 0-1 missing ingredients)
- If you can't create a good recipe with pantry ingredients, suggest the best possible recipe with minimal missing ingredients
- Missing ingredients should be common, basic items (salt, pepper, oil, etc.)`;
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
    
         prompt += `\n\nIMPORTANT REQUIREMENTS:
     - Each recipe must have a detailed, appetizing description (2-3 sentences)
     - For ingredients and instructions, use this specific format:
     
     You are a sous chef writing a training card for a new cook. 
     From the recipe JSON below, generate exactly two new fields:
     
     "ingredients": [list of concise but clear ingredients],
     "method": [numbered step-by-step instructions, concise but not overly concise].
     
     Return strictly valid JSON with only those two keys.
     
     Respond with valid JSON in this exact format:\n{\n  "recipes": [\n    {\n      "title": "Recipe Title",\n      "description": "Detailed description explaining what the dish is, its flavors, and why it's delicious. Make it appetizing and informative.",\n      "ingredients": ["2 cups pasta", "1/2 onion, diced", "3 cloves garlic, minced"],\n      "steps": ["Step 1: Detailed cooking instruction", "Step 2: Next cooking step", "Step 3: Final preparation step"],\n      "cook_time": "X minutes",\n      "cuisine": "cuisine type",\n      "image_tag": "descriptive food photo tag"\n    }\n  ]\n}`;
    
    return prompt;
  }

  private getFallbackRecipes(pantryItems: PantryItem[], options: RecipeGenerationOptions): GPTRecipe[] {
    // Fallback recipes when GPT is unavailable
    const pantryNames = pantryItems.slice(0, 3).map(item => item.name).join(', ');
    
    return [
      {
        title: "Quick Pantry Pasta",
        description: `A delicious and simple pasta dish that makes the most of your pantry ingredients. This comforting meal combines ${pantryNames} with perfectly cooked pasta for a satisfying dinner that's ready in just 20 minutes. The combination of fresh vegetables and al dente pasta creates a wholesome, flavorful dish that's perfect for busy weeknights.`,
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
        description: `A vibrant and quick stir fry that showcases your pantry vegetables in a delicious Asian-inspired dish. This colorful meal features ${pantryNames} tossed in a savory sauce, creating a healthy and satisfying dinner that's packed with flavor and ready in just 15 minutes. Perfect for when you want something nutritious and delicious without spending hours in the kitchen.`,
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
        description: `A bright and refreshing salad that celebrates the fresh ingredients in your pantry. This simple yet satisfying dish combines ${pantryNames} with a light, zesty dressing for a healthy meal that's perfect for lunch or as a side dish. The combination of crisp vegetables and tangy dressing creates a delightful contrast of textures and flavors that will leave you feeling energized and satisfied.`,
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

