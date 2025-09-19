import { GPTRecipe, AppRecipe } from '../types';
import imageService from './imageService';

export class RecipeTransformService {
  private static instance: RecipeTransformService;
  
  private constructor() {}
  
  static getInstance(): RecipeTransformService {
    if (!RecipeTransformService.instance) {
      RecipeTransformService.instance = new RecipeTransformService();
    }
    return RecipeTransformService.instance;
  }

  async transformGPTRecipes(gptRecipes: GPTRecipe[]): Promise<AppRecipe[]> {
    const transformedRecipes: AppRecipe[] = [];
    
    for (const gptRecipe of gptRecipes) {
      const transformedRecipe = await this.transformSingleRecipe(gptRecipe);
      transformedRecipes.push(transformedRecipe);
    }
    
    return transformedRecipes;
  }

  private async transformSingleRecipe(gptRecipe: GPTRecipe): Promise<AppRecipe> {
    // Generate a unique ID based on recipe content
    const recipeId = this.generateRecipeId(gptRecipe);
    
    // Fetch image from Unsplash based on image_tag
    const imageUrl = await imageService.getRecipeImage(gptRecipe.image_tag);
    
    // Parse cook time to get minutes
    const cookTimeMinutes = this.parseCookTime(gptRecipe.cook_time);
    
    // Determine difficulty based on cook time
    const difficulty = this.calculateDifficulty(cookTimeMinutes);
    
    // Create tags for filtering
    const tags = [
      gptRecipe.cuisine.toLowerCase(),
      difficulty.toLowerCase(),
      ...this.extractTagsFromIngredients(gptRecipe.ingredients)
    ];

    return {
      id: recipeId,
      title: gptRecipe.title,
      description: gptRecipe.description,
      ingredients: gptRecipe.ingredients,
      steps: gptRecipe.steps,
      cookTime: gptRecipe.cook_time,
      cuisine: gptRecipe.cuisine,
      imageUrl,
      imageTag: gptRecipe.image_tag,
      isGPTGenerated: true,
      createdAt: new Date(),
      // Additional fields for compatibility
      readyInMinutes: cookTimeMinutes,
      servings: 2, // Default to 2 servings
      difficulty,
      tags
    };
  }

  private generateRecipeId(recipe: GPTRecipe): string {
    // Create a hash from recipe title and ingredients for consistent IDs
    const content = `${recipe.title}-${recipe.ingredients.join(',')}`;
    let hash = 0;
    
    for (let i = 0; i < content.length; i++) {
      const char = content.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    
    return `gpt-${Math.abs(hash)}`;
  }

  private parseCookTime(cookTime: string): number {
    // Extract minutes from cook time string (e.g., "20 minutes" -> 20)
    const match = cookTime.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 30; // Default to 30 minutes
  }

  private calculateDifficulty(minutes: number): 'Easy' | 'Medium' | 'Hard' {
    if (minutes <= 20) return 'Easy';
    if (minutes <= 45) return 'Medium';
    return 'Hard';
  }

  private extractTagsFromIngredients(ingredients: string[]): string[] {
    const tags: string[] = [];
    
    // Extract common ingredient categories
    const ingredientText = ingredients.join(' ').toLowerCase();
    
    if (ingredientText.includes('pasta') || ingredientText.includes('noodles')) {
      tags.push('pasta');
    }
    
    if (ingredientText.includes('chicken') || ingredientText.includes('beef') || ingredientText.includes('pork')) {
      tags.push('meat');
    }
    
    if (ingredientText.includes('fish') || ingredientText.includes('salmon') || ingredientText.includes('shrimp')) {
      tags.push('seafood');
    }
    
    if (ingredientText.includes('vegetable') || ingredientText.includes('tomato') || ingredientText.includes('onion')) {
      tags.push('vegetables');
    }
    
    if (ingredientText.includes('cheese') || ingredientText.includes('milk') || ingredientText.includes('cream')) {
      tags.push('dairy');
    }
    
    return tags;
  }
}

export default RecipeTransformService.getInstance();

