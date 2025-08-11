import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY

// Validate environment variables
if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Missing Supabase environment variables:')
  console.error('VITE_SUPABASE_URL:', supabaseUrl ? 'Set' : 'Missing')
  console.error('VITE_SUPABASE_ANON_KEY:', supabaseAnonKey ? 'Set' : 'Missing')
  throw new Error('Supabase environment variables are not configured. Please check your .env file or Netlify environment variables.')
}

// Create Supabase client with better error handling
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
    flowType: 'pkce'
  }
})

// Add global error handler for auth errors
supabase.auth.onAuthStateChange((event, session) => {
  console.log('Global auth state change:', event, session?.user?.id);
  
  if (event === 'TOKEN_REFRESHED' && !session) {
    console.warn('Token refresh failed - user session expired');
  }
  
  if (event === 'SIGNED_OUT') {
    console.log('User signed out globally');
  }
});

// Log client configuration for debugging
console.log('Supabase client initialized with URL:', supabaseUrl);
console.log('Supabase client initialized with key:', supabaseAnonKey ? 'Set' : 'Missing'); 