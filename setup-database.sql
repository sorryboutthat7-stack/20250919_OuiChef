-- Recipe Finder Database Setup
-- Run this script in your Supabase SQL Editor

-- Create Users table
CREATE TABLE IF NOT EXISTS users (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  pantry JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Recipes table
CREATE TABLE IF NOT EXISTS recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT,
  prep_time INTEGER NOT NULL CHECK (prep_time > 0),
  difficulty TEXT CHECK (difficulty IN ('easy', 'medium', 'hard')),
  ingredients JSONB NOT NULL,
  instructions JSONB NOT NULL,
  cook_time INTEGER,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create SavedRecipes table
CREATE TABLE IF NOT EXISTS saved_recipes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES users(id) ON DELETE CASCADE,
  recipe_id UUID REFERENCES recipes(id) ON DELETE CASCADE,
  match_status TEXT CHECK (match_status IN ('cook_now', 'missing_1_2')),
  missing_ingredients JSONB DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE recipes ENABLE ROW LEVEL SECURITY;
ALTER TABLE saved_recipes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Users table
CREATE POLICY "Users can view own data" ON users FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own data" ON users FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own data" ON users FOR INSERT WITH CHECK (auth.uid() = id);

-- RLS Policies for Recipes table
CREATE POLICY "Recipes are viewable by everyone" ON recipes FOR SELECT USING (true);

-- RLS Policies for SavedRecipes table
CREATE POLICY "Users can view own saved recipes" ON saved_recipes FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own saved recipes" ON saved_recipes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own saved recipes" ON saved_recipes FOR DELETE USING (auth.uid() = user_id);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_recipes_difficulty ON recipes(difficulty);
CREATE INDEX IF NOT EXISTS idx_recipes_prep_time ON recipes(prep_time);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_user_id ON saved_recipes(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_recipes_match_status ON saved_recipes(match_status);

-- Function to automatically create user record on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, email)
  VALUES (NEW.id, NEW.email);
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to call the function when a new user signs up
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Insert sample recipes (optional - you can also use the recipes.json file)
INSERT INTO recipes (title, image_url, prep_time, difficulty, ingredients, instructions) VALUES
('Quick Chicken Stir Fry', 'https://placeholder.com/400x300', 15, 'easy', 
 '["chicken breast", "soy sauce", "garlic", "onion", "bell pepper", "vegetable oil", "cornstarch"]',
 '["Cut chicken into bite-sized pieces", "Heat oil in wok over high heat", "Stir-fry chicken until golden", "Add vegetables and stir-fry", "Add soy sauce and serve"]'),

('Simple Pasta Carbonara', 'https://placeholder.com/400x300', 20, 'easy',
 '["spaghetti", "eggs", "bacon", "parmesan cheese", "black pepper", "salt"]',
 '["Cook pasta according to package", "Cook bacon until crispy", "Beat eggs with cheese", "Combine hot pasta with egg mixture", "Add bacon and serve"]'),

('Easy Vegetable Soup', 'https://placeholder.com/400x300', 25, 'easy',
 '["carrots", "celery", "onion", "vegetable broth", "tomatoes", "herbs", "salt", "pepper"]',
 '["Chop all vegetables", "Sauté onions and celery", "Add broth and vegetables", "Simmer until tender", "Season and serve"]');

-- Grant necessary permissions
GRANT USAGE ON SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated;
GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated;
