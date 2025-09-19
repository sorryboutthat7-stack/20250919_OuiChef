import json
import time
from openai import OpenAI, OpenAIError

# Initialize GPT client (relies on OPENAI_API_KEY in environment)
client = OpenAI()

# Load recipes from JSON file
with open("recipes.json", "r", encoding="utf-8") as f:
    data = json.load(f)
    recipes = data.get("results", [])  # Extract the list of recipe dicts

# Prompt builder
def make_prompt(recipe):
    return f"""
You are a sous chef writing a training card for a new cook. 
From the recipe JSON below, generate exactly two new fields:

"ingredients": [list of concise but clear ingredients],
"method": [numbered step-by-step instructions, concise but not overly concise].

Return strictly valid JSON with only those two keys.

Recipe JSON:
{json.dumps(recipe, indent=2)}
"""

# Function to enrich a single recipe
def enrich_recipe(recipe):
    prompt = make_prompt(recipe)
    
    try:
        response = client.chat.completions.create(
            model="gpt-4o-mini",
            messages=[
                {"role": "system", "content": "You are a professional sous chef. Output strictly valid JSON."},
                {"role": "user", "content": prompt}
            ],
            temperature=0.3
        )

        additions = json.loads(response.choices[0].message["content"])
        recipe["ingredients"] = additions.get("ingredients", [])
        recipe["method"] = additions.get("method", [])

    except OpenAIError as e:
        title = recipe.get("title") if isinstance(recipe, dict) else str(recipe)
        print(f"⚠️ OpenAI API error for recipe '{title}': {str(e)}")
    
    except (json.JSONDecodeError, KeyError, TypeError):
        title = recipe.get("title") if isinstance(recipe, dict) else str(recipe)
        print(f"⚠️ Invalid JSON from GPT for recipe '{title}'.")

    return recipe

# Loop over all recipes with incremental saving
enriched_recipes = []
for idx, r in enumerate(recipes, 1):
    enriched = enrich_recipe(r)
    enriched_recipes.append(enriched)
    
    # Print progress safely
    title = r.get("title", "UNKNOWN") if isinstance(r, dict) else str(r)
    print(f"✅ Processed {idx}/{len(recipes)}: {title}")
    
    # Save after each recipe
    with open("enriched_recipes.json", "w", encoding="utf-8") as f:
        json.dump(enriched_recipes, f, indent=2, ensure_ascii=False)
    
    # Optional delay to reduce rapid API usage
    time.sleep(1)

print("🎉 All done! Enriched recipes saved to enriched_recipes.json")
