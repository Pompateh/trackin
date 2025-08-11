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
    try {
      // First, clear local state immediately
      set({ user: null });
      
      // Clear any stored session data
      localStorage.removeItem('supabase.auth.token');
      sessionStorage.removeItem('supabase.auth.token');
      
      // Then try to sign out from Supabase (but don't fail if it errors)
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.warn('Supabase sign out error (non-critical):', error);
        // Don't throw error - we've already cleared local state
      }
    } catch (error) {
      console.warn('Sign out process error (non-critical):', error);
      // Don't throw error - we've already cleared local state
    }
  },

  // Check if current session is valid
  checkSession: async () => {
    try {
      const { data: { session }, error } = await supabase.auth.getSession();
      if (error) {
        console.warn('Session check error:', error);
        set({ user: null, loading: false });
        return null;
      }
      
      if (session?.user) {
        set({ user: session.user, loading: false });
        return session.user;
      } else {
        set({ user: null, loading: false });
        return null;
      }
    } catch (error) {
      console.warn('Session check failed:', error);
      set({ user: null, loading: false });
      return null;
    }
  },

  // Refresh session token
  refreshSession: async () => {
    try {
      const { data, error } = await supabase.auth.refreshSession();
      if (error) {
        console.warn('Session refresh error:', error);
        // If refresh fails, clear user state
        set({ user: null, loading: false });
        return null;
      }
      
      if (data.session?.user) {
        set({ user: data.session.user, loading: false });
        return data.session.user;
      } else {
        set({ user: null, loading: false });
        return null;
      }
    } catch (error) {
      console.warn('Session refresh failed:', error);
      set({ user: null, loading: false });
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChange: () => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      console.log('Auth state change:', event, session?.user?.id);
      
      if (event === 'SIGNED_OUT' || event === 'TOKEN_REFRESHED' && !session) {
        // Clear user state when signed out or token refresh fails
        set({ user: null, loading: false });
      } else if (session?.user) {
        // Set user when signed in
        set({ user: session.user, loading: false });
      } else {
        // No session
        set({ user: null, loading: false });
      }
    });
    return () => subscription.unsubscribe();
  }
}));

export default useAuthStore; 