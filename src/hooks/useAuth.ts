import { useState, useEffect } from 'react';
import { User, Session } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import toast from 'react-hot-toast';

export interface UserProfile {
  id: string;
  username: string;
  credits: number;
  avatar_url: string | null;
  bio: string | null;
  level: 'NEWBIE' | 'TRADER' | 'ELITE' | 'LEGEND';
  total_trades: number;
  created_at: string;
  updated_at: string;
}

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [authLoading, setAuthLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    console.log('🔄 Auth system initializing...');

    // Force loading to complete after maximum 3 seconds
    const forceLoadingComplete = setTimeout(() => {
      if (mounted && loading) {
        console.log('⏰ Force completing loading state after timeout');
        setLoading(false);
      }
    }, 3000);

    const initializeAuth = async () => {
      try {
        console.log('📡 Getting initial session...');
        const { data: { session }, error } = await supabase.auth.getSession();
        
        if (error) {
          console.error('❌ Error getting session:', error);
          if (mounted) {
            setLoading(false);
          }
          return;
        }

        console.log('✅ Initial session:', session ? 'Found' : 'None');
        
        if (mounted) {
          setSession(session);
          setUser(session?.user ?? null);
          
          if (session?.user) {
            console.log('👤 User found, fetching profile...');
            await fetchProfile(session.user.id);
          } else {
            console.log('👤 No user, completing loading');
            setLoading(false);
          }
        }
      } catch (error) {
        console.error('💥 Error in initializeAuth:', error);
        if (mounted) {
          setLoading(false);
        }
      }
    };

    initializeAuth();

    // Listen for auth changes with improved error handling
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('🔔 Auth state changed:', event, session?.user?.email);
      
      if (!mounted) return;

      try {
        setSession(session);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          console.log('👤 User authenticated, fetching profile...');
          await fetchProfile(session.user.id);
        } else {
          console.log('👤 User signed out, clearing profile...');
          setProfile(null);
          setLoading(false);
        }
      } catch (error) {
        console.error('💥 Error in auth state change:', error);
        setLoading(false);
      }
    });

    return () => {
      console.log('🧹 Cleaning up auth hook...');
      mounted = false;
      clearTimeout(forceLoadingComplete);
      subscription.unsubscribe();
    };
  }, []);

  const fetchProfile = async (userId: string, retryCount = 0) => {
    const maxRetries = 3;
    const retryDelay = 1000; // 1 second

    try {
      console.log(`📋 Fetching profile for user: ${userId} (attempt ${retryCount + 1})`);
      
      // Try to get profile with timeout
      const profilePromise = supabase
        .from('user_profiles')
        .select('*')
        .eq('id', userId)
        .single();

      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Profile fetch timeout')), 5000)
      );

      const { data, error } = await Promise.race([profilePromise, timeoutPromise]) as any;

      if (error) {
        if (error.code === 'PGRST116') {
          // Profile not found - this might be a new user
          console.log('⚠️ Profile not found, might be new user. Waiting for trigger...');
          
          if (retryCount < maxRetries) {
            // Wait and retry for new users (trigger might be creating profile)
            setTimeout(() => {
              fetchProfile(userId, retryCount + 1);
            }, retryDelay * (retryCount + 1)); // Exponential backoff
            return;
          } else {
            console.log('🆘 Profile still not found after retries, creating fallback');
            await createFallbackProfile(userId);
          }
        } else if (error.message === 'Profile fetch timeout') {
          console.log('⏰ Profile fetch timeout');
          if (retryCount < maxRetries) {
            setTimeout(() => {
              fetchProfile(userId, retryCount + 1);
            }, retryDelay);
            return;
          } else {
            await createFallbackProfile(userId);
          }
        } else {
          console.error('❌ Error fetching profile:', error);
          await createFallbackProfile(userId);
        }
      } else if (data) {
        console.log('✅ Profile found:', data.username);
        setProfile(data);
        setLoading(false);
      }
    } catch (error) {
      console.error('💥 Error in fetchProfile:', error);
      if (retryCount < maxRetries) {
        setTimeout(() => {
          fetchProfile(userId, retryCount + 1);
        }, retryDelay);
      } else {
        await createFallbackProfile(userId);
      }
    }
  };

  const createFallbackProfile = async (userId: string) => {
    console.log('🆘 Creating fallback profile for:', userId);
    
    const fallbackProfile: UserProfile = {
      id: userId,
      username: user?.email?.split('@')[0] || `user_${userId.slice(0, 6)}`,
      credits: 1000,
      avatar_url: null,
      bio: null,
      level: 'NEWBIE',
      total_trades: 0,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    
    // Try to upsert the profile with timeout
    try {
      console.log('💾 Attempting to upsert profile in database...');
      
      const upsertPromise = supabase
        .from('user_profiles')
        .upsert(fallbackProfile, { 
          onConflict: 'id',
          ignoreDuplicates: false 
        })
        .select()
        .single();
      
      const timeoutPromise = new Promise((_, reject) => 
        setTimeout(() => reject(new Error('Upsert timeout')), 3000)
      );
      
      const { data, error } = await Promise.race([upsertPromise, timeoutPromise]) as any;
      
      if (!error && data) {
        console.log('✅ Fallback profile upserted in database');
        setProfile(data);
      } else {
        console.log('⚠️ Could not upsert in database, using local profile:', error?.message);
        setProfile(fallbackProfile);
      }
    } catch (error) {
      console.log('⚠️ Database upsert failed or timeout, using local profile');
      setProfile(fallbackProfile);
    }
    
    // Always complete loading
    setLoading(false);
    console.log('✅ Fallback profile set, loading complete');
  };

  const signUp = async (email: string, password: string, username: string) => {
    try {
      setAuthLoading(true);
      console.log('📝 Starting signup process for:', email);

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            username,
          },
        },
      });

      if (error) {
        console.error('❌ Signup error:', error);
        toast.error(error.message);
        return { success: false, error };
      }

      if (data.user) {
        console.log('✅ User created successfully:', data.user.email);
        
        if (data.session) {
          console.log('🎉 Immediate session available');
          toast.success('Account created successfully! Welcome to the Matrix! 🚀');
        } else {
          console.log('📧 Email confirmation required');
          toast.success('Account created! Please check your email for confirmation.');
        }
        
        return { success: true, data };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('💥 Sign up exception:', error);
      toast.error('An error occurred during sign up');
      return { success: false, error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signIn = async (email: string, password: string) => {
    try {
      setAuthLoading(true);
      console.log('🔑 Starting signin process for:', email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error('❌ Signin error:', error);
        
        if (error.message.includes('Invalid login credentials')) {
          toast.error('Invalid email or password. Please check your credentials.');
        } else if (error.message.includes('Email not confirmed')) {
          toast.error('Please check your email and confirm your account first.');
        } else if (error.message.includes('Too many requests')) {
          toast.error('Too many login attempts. Please wait a moment and try again.');
        } else {
          toast.error(error.message);
        }
        
        return { success: false, error };
      }

      if (data.user && data.session) {
        console.log('✅ User signed in successfully:', data.user.email);
        toast.success('Welcome back to the Matrix! 🎮');
        return { success: true, data };
      }

      return { success: false, error: 'Unknown error occurred' };
    } catch (error) {
      console.error('💥 Sign in exception:', error);
      toast.error('An error occurred during sign in');
      return { success: false, error };
    } finally {
      setAuthLoading(false);
    }
  };

  const signOut = async () => {
    try {
      setAuthLoading(true);
      console.log('👋 Starting signout process...');
      
      const { error } = await supabase.auth.signOut();
      
      if (error) {
        console.error('❌ Signout error:', error);
        toast.error(error.message);
        return { success: false, error };
      }

      // Clear local state immediately
      setUser(null);
      setProfile(null);
      setSession(null);
      
      console.log('✅ Signout successful');
      toast.success('Disconnected from the Matrix 👋');
      return { success: true };
    } catch (error) {
      console.error('💥 Sign out exception:', error);
      toast.error('An error occurred during sign out');
      return { success: false, error };
    } finally {
      setAuthLoading(false);
    }
  };

  const updateProfile = async (updates: Partial<UserProfile>) => {
    if (!user) return { success: false, error: 'No user logged in' };

    try {
      setAuthLoading(true);
      console.log('📝 Updating profile for:', user.email);
      
      const { data, error } = await supabase
        .from('user_profiles')
        .update(updates)
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        console.error('❌ Profile update error:', error);
        toast.error(error.message);
        return { success: false, error };
      }

      setProfile(data);
      console.log('✅ Profile updated successfully');
      toast.success('Profile updated successfully! ✨');
      return { success: true, data };
    } catch (error) {
      console.error('💥 Profile update exception:', error);
      toast.error('An error occurred updating profile');
      return { success: false, error };
    } finally {
      setAuthLoading(false);
    }
  };

  return {
    user,
    profile,
    session,
    loading,
    authLoading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    isAuthenticated: !!user && !!profile,
  };
}