import { create } from 'zustand';
import { supabase } from '../lib/supabaseClient';

const useAuthStore = create((set, get) => ({
  user: null,
  loading: true,
  
  // Fetch user session and full user data
  fetchSession: async () => {
    set({ loading: true });
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        // When session is restored, user metadata might be stale.
        // Refreshing the user object gets the latest metadata.
        const { data: { user } } = await supabase.auth.refreshSession();
        set({ user: user ?? null });
      } else {
        set({ user: null });
      }
    } catch (error) {
      console.error('Error fetching session:', error);
      set({ user: null });
    } finally {
      set({ loading: false });
    }
  },

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
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      if (session?.user) {
        // This handles SIGNED_IN and INITIAL_SESSION events
        set({ user: session.user });
      } else if (_event === 'SIGNED_OUT') {
        set({ user: null });
      }
    });
    return () => subscription.unsubscribe();
  }
}));

// Initialize auth state
useAuthStore.getState().fetchSession();

export default useAuthStore; 