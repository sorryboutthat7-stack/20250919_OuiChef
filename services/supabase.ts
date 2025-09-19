import { createClient } from '@supabase/supabase-js';

// Supabase configuration
const supabaseUrl = 'https://mzplkfltkepagezauebv.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im16cGxrZmx0a2VwYWdlemF1ZWJ2Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTYzMDIwMDcsImV4cCI6MjA3MTg3ODAwN30.kIbwIQCc-N22lxuly-MbScyMdyrkIKPw4iNB_Hdj0AQ';

export const supabase = createClient(supabaseUrl, supabaseAnonKey);

export const authService = {
  signIn: async (email: string, password: string) => {
    return await supabase.auth.signInWithPassword({ email, password });
  },

  signUp: async (email: string, password: string) => {
    return await supabase.auth.signUp({ email, password });
  },

  signOut: async () => {
    return await supabase.auth.signOut();
  },

  getSession: async () => {
    const { data: { session } } = await supabase.auth.getSession();
    return session;
  },

  getCurrentUser: async () => {
    const { data: { user } } = await supabase.auth.getUser();
    return user;
  }
};

export const recipeService = {
  getRecipes: async () => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*');
    return { data, error };
  },

  getRecipeById: async (id: string) => {
    const { data, error } = await supabase
      .from('recipes')
      .select('*')
      .eq('id', id)
      .single();
    return { data, error };
  },

  saveRecipe: async (userId: string, recipeId: string, status: 'cook_now' | 'buy_items') => {
    const { data, error } = await supabase
      .from('saved_recipes')
      .insert({
        user_id: userId,
        recipe_id: recipeId,
        status,
        saved_at: new Date().toISOString()
      });
    return { data, error };
  }
};
