import { create } from 'zustand';
import { AuthState, User } from '../types';
import { authService } from '../services/supabase';

interface AuthStore extends AuthState {
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (email: string, password: string) => Promise<void>;
  signOut: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  checkAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthStore>((set, get) => ({
  user: null,
  token: null,
  isLoading: false,
  isAuthenticated: false,

  signIn: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await authService.signIn(email, password);
      if (error) throw error;
      
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            pantry: []
          },
          token: data.session?.access_token || null,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signUp: async (email: string, password: string) => {
    set({ isLoading: true });
    try {
      const { data, error } = await authService.signUp(email, password);
      if (error) throw error;
      
      if (data.user) {
        set({
          user: {
            id: data.user.id,
            email: data.user.email || '',
            pantry: []
          },
          token: data.session?.access_token || null,
          isAuthenticated: true,
          isLoading: false
        });
      }
    } catch (error: any) {
      set({ isLoading: false });
      throw error;
    }
  },

  signOut: async () => {
    try {
      await authService.signOut();
      set({
        user: null,
        token: null,
        isAuthenticated: false
      });
    } catch (error) {
      console.error('Sign out error:', error);
    }
  },

  setUser: (user: User | null) => {
    set({ user, isAuthenticated: !!user });
  },

  setToken: (token: string | null) => {
    set({ token });
  },

  checkAuth: async () => {
    try {
      const session = await authService.getSession();
      if (session) {
        const user = await authService.getCurrentUser();
        if (user) {
          set({
            user: {
              id: user.id,
              email: user.email || '',
              pantry: []
            },
            token: session.access_token,
            isAuthenticated: true
          });
        }
      }
    } catch (error) {
      console.error('Auth check error:', error);
    }
  }
}));
