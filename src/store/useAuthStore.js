import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,

  // Sign in
  signIn: async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) throw error;
    set({ user: data.user });
    return data;
  },

  // Sign up
  signUp: async (email, password) => {
    const { data, error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
    // Note: Supabase sends a confirmation email. User is not signed in until confirmed.
    // You might want to handle this in your UI.
    return data;
  },

  // Sign out
  signOut: async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
    set({ user: null });
  },

  // Listen to auth state changes
  onAuthStateChange: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      set({ user: session?.user ?? null, loading: false });
    });
    return () => subscription.unsubscribe();
  }
}));

export default useAuthStore; 