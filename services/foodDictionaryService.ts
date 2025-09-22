// Comprehensive food dictionary for ingredient validation
const FOOD_DICTIONARY = new Set([
  // Vegetables
  'onion', 'onions', 'garlic', 'tomato', 'tomatoes', 'potato', 'potatoes', 'carrot', 'carrots',
  'celery', 'bell pepper', 'bell peppers', 'pepper', 'peppers', 'cucumber', 'cucumbers',
  'lettuce', 'spinach', 'kale', 'arugula', 'cabbage', 'broccoli', 'cauliflower', 'asparagus',
  'zucchini', 'eggplant', 'mushroom', 'mushrooms', 'corn', 'peas', 'green beans', 'beans',
  'chickpeas', 'lentils', 'black beans', 'kidney beans', 'pinto beans', 'lima beans',
  'sweet potato', 'sweet potatoes', 'beet', 'beets', 'radish', 'radishes', 'turnip', 'turnips',
  'parsnip', 'parsnips', 'leek', 'leeks', 'shallot', 'shallots', 'scallion', 'scallions',
  'ginger', 'jalapeno', 'jalapenos', 'habanero', 'habaneros', 'serrano', 'serranos',
  'artichoke', 'artichokes', 'avocado', 'avocados', 'olive', 'olives', 'pickle', 'pickles',
  
  // Fruits
  'apple', 'apples', 'banana', 'bananas', 'orange', 'oranges', 'lemon', 'lemons', 'lime', 'limes',
  'grape', 'grapes', 'strawberry', 'strawberries', 'blueberry', 'blueberries', 'raspberry', 'raspberries',
  'blackberry', 'blackberries', 'cranberry', 'cranberries', 'cherry', 'cherries', 'peach', 'peaches',
  'pear', 'pears', 'plum', 'plums', 'apricot', 'apricots', 'mango', 'mangos', 'pineapple', 'pineapples',
  'watermelon', 'watermelons', 'cantaloupe', 'cantaloupes', 'honeydew', 'kiwi', 'kiwis',
  'pomegranate', 'pomegranates', 'fig', 'figs', 'date', 'dates', 'coconut', 'coconuts',
  
  // Grains & Starches
  'rice', 'brown rice', 'white rice', 'wild rice', 'quinoa', 'oats', 'oatmeal', 'barley',
  'wheat', 'flour', 'bread', 'breadcrumbs', 'pasta', 'noodles', 'spaghetti', 'macaroni',
  'penne', 'fettuccine', 'linguine', 'ravioli', 'tortellini', 'gnocchi', 'couscous',
  'bulgur', 'farro', 'millet', 'polenta', 'cornmeal', 'tortilla', 'tortillas', 'pita',
  'naan', 'bagel', 'bagels', 'croissant', 'croissants', 'cracker', 'crackers',
  
  // Proteins
  'chicken', 'beef', 'pork', 'lamb', 'turkey', 'duck', 'fish', 'salmon', 'tuna', 'cod',
  'halibut', 'shrimp', 'crab', 'lobster', 'scallop', 'scallops', 'mussel', 'mussels',
  'clam', 'clams', 'oyster', 'oysters', 'egg', 'eggs', 'tofu', 'tempeh', 'seitan',
  'bacon', 'ham', 'sausage', 'sausages', 'pepperoni', 'salami', 'prosciutto',
  'ground beef', 'ground turkey', 'ground chicken', 'ground pork', 'chicken breast',
  'chicken thigh', 'chicken wing', 'chicken wings', 'ribeye', 'sirloin', 'tenderloin',
  
  // Dairy & Alternatives
  'milk', 'cream', 'heavy cream', 'half and half', 'butter', 'cheese', 'cheddar',
  'mozzarella', 'parmesan', 'swiss', 'gouda', 'brie', 'camembert', 'feta', 'goat cheese',
  'cream cheese', 'cottage cheese', 'ricotta', 'yogurt', 'greek yogurt', 'sour cream',
  'buttermilk', 'almond milk', 'soy milk', 'oat milk', 'coconut milk', 'cashew milk',
  
  // Nuts & Seeds
  'almond', 'almonds', 'walnut', 'walnuts', 'pecan', 'pecans', 'cashew', 'cashews',
  'pistachio', 'pistachios', 'hazelnut', 'hazelnuts', 'macadamia', 'macadamias',
  'peanut', 'peanuts', 'peanut butter', 'almond butter', 'cashew butter', 'sunflower seeds',
  'pumpkin seeds', 'sesame seeds', 'chia seeds', 'flax seeds', 'hemp seeds',
  
  // Herbs & Spices
  'basil', 'oregano', 'thyme', 'rosemary', 'sage', 'parsley', 'cilantro', 'dill',
  'mint', 'chives', 'tarragon', 'bay leaf', 'bay leaves', 'salt', 'pepper', 'black pepper',
  'white pepper', 'red pepper', 'cayenne', 'paprika', 'cumin', 'coriander', 'turmeric',
  'ginger', 'garlic powder', 'onion powder', 'chili powder', 'curry powder', 'cinnamon',
  'nutmeg', 'allspice', 'cloves', 'cardamom', 'star anise', 'fennel seeds', 'mustard seeds',
  'caraway seeds', 'poppy seeds', 'vanilla', 'vanilla extract', 'vanilla bean', 'vanilla beans',
  
  // Oils & Vinegars
  'olive oil', 'vegetable oil', 'canola oil', 'coconut oil', 'sesame oil', 'avocado oil',
  'grapeseed oil', 'sunflower oil', 'safflower oil', 'peanut oil', 'balsamic vinegar',
  'red wine vinegar', 'white wine vinegar', 'apple cider vinegar', 'rice vinegar',
  'sherry vinegar', 'champagne vinegar', 'distilled vinegar', 'white vinegar',
  
  // Condiments & Sauces
  'ketchup', 'mustard', 'mayonnaise', 'mayo', 'hot sauce', 'sriracha', 'soy sauce',
  'worcestershire sauce', 'fish sauce', 'oyster sauce', 'hoisin sauce', 'teriyaki sauce',
  'barbecue sauce', 'bbq sauce', 'ranch dressing', 'italian dressing', 'caesar dressing',
  'vinaigrette', 'tahini', 'hummus', 'pesto', 'marinara sauce', 'alfredo sauce',
  
  // Baking & Sweeteners
  'sugar', 'brown sugar', 'powdered sugar', 'confectioners sugar', 'honey', 'maple syrup',
  'agave', 'molasses', 'corn syrup', 'baking powder', 'baking soda', 'yeast', 'active dry yeast',
  'instant yeast', 'cocoa powder', 'chocolate', 'dark chocolate', 'milk chocolate', 'white chocolate',
  'chocolate chips', 'vanilla extract', 'almond extract', 'lemon extract', 'orange extract',
  
  // Canned & Preserved
  'tomato paste', 'tomato sauce', 'crushed tomatoes', 'diced tomatoes', 'tomato puree',
  'coconut milk', 'coconut cream', 'broth', 'chicken broth', 'beef broth', 'vegetable broth',
  'stock', 'chicken stock', 'beef stock', 'vegetable stock', 'anchovies', 'capers',
  'olives', 'sun dried tomatoes', 'artichoke hearts', 'roasted red peppers',
  
  // Frozen & Prepared
  'frozen vegetables', 'frozen fruit', 'frozen berries', 'ice cream', 'frozen yogurt',
  'puff pastry', 'phyllo dough', 'pie crust', 'pizza dough', 'wonton wrappers',
  
  // Beverages
  'wine', 'red wine', 'white wine', 'beer', 'stock', 'broth', 'juice', 'orange juice',
  'apple juice', 'cranberry juice', 'lemon juice', 'lime juice', 'coffee', 'tea',
  'green tea', 'black tea', 'herbal tea', 'soda', 'sparkling water', 'tonic water',
  
  // Miscellaneous
  'salt', 'kosher salt', 'sea salt', 'table salt', 'pepper', 'black pepper', 'white pepper',
  'red pepper flakes', 'crushed red pepper', 'sugar', 'brown sugar', 'honey', 'maple syrup',
  'cornstarch', 'arrowroot', 'gelatin', 'agar', 'nutritional yeast', 'breadcrumbs',
  'panko', 'crackers', 'graham crackers', 'cookies', 'cereal', 'granola', 'oats',
]);

// Common non-food words to filter out
const NON_FOOD_WORDS = new Set([
  'phone', 'computer', 'laptop', 'tablet', 'book', 'pen', 'pencil', 'paper', 'notebook',
  'wallet', 'keys', 'car', 'house', 'apartment', 'room', 'bed', 'chair', 'table',
  'desk', 'lamp', 'tv', 'television', 'radio', 'music', 'movie', 'game', 'toy',
  'clothes', 'shirt', 'pants', 'shoes', 'hat', 'jacket', 'coat', 'dress', 'skirt',
  'money', 'cash', 'credit card', 'debit card', 'id', 'passport', 'license',
  'medicine', 'pill', 'vitamin', 'supplement', 'bandage', 'tissue', 'soap', 'shampoo',
  'toothbrush', 'toothpaste', 'deodorant', 'perfume', 'makeup', 'lipstick', 'mascara',
  'tool', 'hammer', 'screwdriver', 'wrench', 'pliers', 'drill', 'saw', 'knife',
  'fork', 'spoon', 'plate', 'bowl', 'cup', 'glass', 'mug', 'bottle', 'can',
  'bag', 'box', 'container', 'jar', 'bottle', 'can', 'package', 'wrapper',
]);

class FoodDictionaryService {
  /**
   * Normalize ingredient text (lowercase, trim, remove extra spaces)
   */
  private normalizeIngredient(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '') // Remove punctuation
      .trim();
  }

  /**
   * Check if a word is a valid food item
   */
  private isValidFood(word: string): boolean {
    const normalized = this.normalizeIngredient(word);
    
    // Check if it's explicitly a non-food word
    if (NON_FOOD_WORDS.has(normalized)) {
      return false;
    }
    
    // Check if it's in our food dictionary
    return FOOD_DICTIONARY.has(normalized);
  }

  /**
   * Parse and filter ingredients from input text
   */
  parseIngredients(input: string): {
    validIngredients: string[];
    invalidItems: string[];
  } {
    if (!input || !input.trim()) {
      return { validIngredients: [], invalidItems: [] };
    }

    // Split by common separators
    const items = input
      .split(/[,;]|and|&/)
      .map(item => item.trim())
      .filter(item => item.length > 0);

    const validIngredients: string[] = [];
    const invalidItems: string[] = [];

    for (const item of items) {
      const normalized = this.normalizeIngredient(item);
      
      if (this.isValidFood(normalized)) {
        // Use the normalized version for consistency
        validIngredients.push(normalized);
      } else {
        invalidItems.push(item);
      }
    }

    return { validIngredients, invalidItems };
  }

  /**
   * Get suggestions for similar food items
   */
  getSuggestions(input: string): string[] {
    const normalized = this.normalizeIngredient(input);
    const suggestions: string[] = [];

    // Find exact matches first
    for (const food of FOOD_DICTIONARY) {
      if (food.includes(normalized) || normalized.includes(food)) {
        suggestions.push(food);
      }
    }

    // Sort by relevance (exact matches first, then by length)
    return suggestions
      .sort((a, b) => {
        if (a === normalized) return -1;
        if (b === normalized) return 1;
        return a.length - b.length;
      })
      .slice(0, 5); // Return top 5 suggestions
  }

  /**
   * Check if a single ingredient is valid
   */
  isValidIngredient(ingredient: string): boolean {
    return this.isValidFood(ingredient);
  }
}

export default new FoodDictionaryService();
