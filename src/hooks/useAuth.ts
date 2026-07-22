import { useState, useEffect, useCallback } from 'react';
import { User, AuthState } from '../types';
import { supabase } from '../lib/supabase';

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    loading: true,
    pendingVerification: false
  });
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState<string>('');

  useEffect(() => {
    // Check active session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        loadUserProfile(session.user.id);
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      (async () => {
        if (session?.user) {
          // Clear pending verification state when a real session is established
          if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
            setPendingVerificationEmail('');
          }
          await loadUserProfile(session.user.id);
        } else {
          setAuthState({
            isAuthenticated: false,
            user: null,
            loading: false,
            pendingVerification: false
          });
        }
      })();
    });

    return () => subscription.unsubscribe();
  }, []);

  const loadUserProfile = async (userId: string) => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const emailConfirmed = !!session?.user?.email_confirmed_at;

      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;

      if (profile) {
        const user: User = {
          id: profile.id,
          email: profile.email,
          firstName: profile.first_name,
          lastName: profile.last_name,
          username: profile.username || '',
          location: profile.location,
          phoneNumber: profile.phone_number,
          pickleballLevel: profile.pickleball_level as User['pickleballLevel'],
          duprRating: profile.dupr_rating,
          joinedDate: profile.created_at,
          isEmailVerified: emailConfirmed,
          isAdmin: profile.is_admin || false,
          stats: {
            matchesPlayed: profile.matches_played,
            matchesWon: profile.matches_won,
            matchesLost: profile.matches_lost,
            tournamentsWon: profile.tournaments_won,
            currentRanking: profile.current_ranking,
            points: profile.points,
            winRate: profile.matches_played > 0
              ? Math.round((profile.matches_won / profile.matches_played) * 100)
              : 0
          }
        };

        setAuthState({
          isAuthenticated: true,
          user,
          loading: false,
          pendingVerification: false
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      setAuthState(prev => ({ ...prev, loading: false }));
    }
  };

  const signIn = useCallback(async (email: string, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Sign in failed' };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }, []);

  const signUp = useCallback(async (userData: Partial<User>, password: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.signUp({
        email: userData.email!,
        password,
        options: {
          emailRedirectTo: `${window.location.origin}/`,
          data: {
            first_name: userData.firstName,
            last_name: userData.lastName
          }
        }
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));

        if (error.message.includes('already') || error.message.includes('registered')) {
          return { success: false, error: 'This email is already registered. Please sign in instead.' };
        }

        return { success: false, error: error.message };
      }

      if (data.user) {
        // Create the user profile immediately so it exists when they verify
        const { error: profileError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email: userData.email!,
            first_name: userData.firstName!,
            last_name: userData.lastName!,
            username: userData.username || `${userData.firstName?.toLowerCase()}_${Date.now()}`,
            location: userData.location!,
            phone_number: userData.phoneNumber,
            pickleball_level: userData.pickleballLevel!,
            dupr_rating: userData.duprRating
          });

        if (profileError) {
          console.error('Error creating profile:', profileError);
          setAuthState(prev => ({ ...prev, loading: false }));
          return { success: false, error: 'Failed to create user profile' };
        }

        // Show the email verification screen — do not log the user in yet
        setPendingVerificationEmail(userData.email!);
        setAuthState({
          isAuthenticated: false,
          user: null,
          loading: false,
          pendingVerification: true
        });

        return { success: true };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Sign up failed' };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }, []);

  const verifyEmail = useCallback(async (token: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { data, error } = await supabase.auth.verifyOtp({
        token_hash: token,
        type: 'email'
      });

      if (error) {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, error: error.message };
      }

      if (data.user) {
        await loadUserProfile(data.user.id);
        return { success: true };
      }

      setAuthState(prev => ({ ...prev, loading: false }));
      return { success: false, error: 'Verification failed' };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email
      });

      setAuthState(prev => ({ ...prev, loading: false }));

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }, []);

  const sendPasswordResetLink = useCallback(async (email: string) => {
    setAuthState(prev => ({ ...prev, loading: true }));

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/`
      });

      setAuthState(prev => ({ ...prev, loading: false }));

      if (error) {
        return { success: false, error: error.message };
      }

      return { success: true };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false }));
      return {
        success: false,
        error: error instanceof Error ? error.message : 'An error occurred'
      };
    }
  }, []);

  const signOut = useCallback(async () => {
    await supabase.auth.signOut();
    setAuthState({
      isAuthenticated: false,
      user: null,
      loading: false,
      pendingVerification: false
    });
  }, []);

  return {
    ...authState,
    pendingVerificationEmail,
    signIn,
    signUp,
    signOut,
    verifyEmail,
    resendVerification,
    sendPasswordResetLink
  };
};
