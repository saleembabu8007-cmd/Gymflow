import { useState, useEffect, useCallback } from 'react';
import { useServices } from '../services/provider';
import { supabase } from '../services/supabaseClient';
import { User, Gym } from '../types';
import { SignUpDTO, CreateGymDTO } from '../services/interfaces';

export function useAuth() {
  const { auth, gym } = useServices();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const checkAuth = useCallback(async () => {
    try {
      setLoading(true);
      const currentUser = await auth.getCurrentUser();
      setUser(currentUser);
      setError(null);
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
      setUser(null);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  useEffect(() => {
    checkAuth();

    if (supabase) {
      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange(async (event) => {
        if (event === 'SIGNED_OUT') {
          setUser(null);
          setLoading(false);
        } else if (
          event === 'SIGNED_IN' ||
          event === 'TOKEN_REFRESHED' ||
          event === 'USER_UPDATED'
        ) {
          checkAuth();
        }
      });

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [checkAuth]);

  const login = useCallback(
    async (email: string, password?: string) => {
      try {
        setLoading(true);
        setError(null);
        const loggedIn = await auth.login(email, password);
        setUser(loggedIn);
        return loggedIn;
      } catch (err: any) {
        const message = err.message || 'Email or password is incorrect.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const signUp = useCallback(
    async (dto: SignUpDTO) => {
      try {
        setLoading(true);
        setError(null);
        const signedUpUser = await auth.signUp(dto);
        setUser(signedUpUser);
        return signedUpUser;
      } catch (err: any) {
        const message = err.message || 'Sign up failed.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const createGym = useCallback(
    async (dto: CreateGymDTO): Promise<Gym> => {
      if (!user) throw new Error('Must be authenticated to create a gym');
      try {
        setLoading(true);
        setError(null);
        const newGym = await gym.createGym(user.id, dto);
        const updatedUser: User = { ...user, gymId: newGym.id };
        setUser(updatedUser);
        return newGym;
      } catch (err: any) {
        const message = err.message || 'Failed to create gym.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [user, gym]
  );

  const registerOwner = useCallback(
    async (dto: any) => {
      try {
        setLoading(true);
        setError(null);
        const res = await auth.registerOwner(dto);
        setUser(res.user);
        return res;
      } catch (err: any) {
        const message = err.message || 'Registration failed.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const logout = useCallback(async () => {
    try {
      setLoading(true);
      await auth.logout();
      setUser(null);
      setError(null);
    } finally {
      setLoading(false);
    }
  }, [auth]);

  const resetPassword = useCallback(
    async (email: string) => {
      try {
        setLoading(true);
        setError(null);
        await auth.resetPassword(email);
      } catch (err: any) {
        const message = err.message || 'Failed to send reset link.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const updatePassword = useCallback(
    async (newPassword: string, token?: string) => {
      try {
        setLoading(true);
        setError(null);
        await auth.updatePassword(newPassword, token);
      } catch (err: any) {
        const message = err.message || 'Failed to update password.';
        setError(message);
        throw new Error(message);
      } finally {
        setLoading(false);
      }
    },
    [auth]
  );

  const updateProfile = useCallback(
    async (updates: Partial<User>) => {
      const updated = await auth.updateProfile(updates);
      setUser(updated);
      return updated;
    },
    [auth]
  );

  return {
    user,
    isAuthenticated: !!user,
    loading,
    error,
    login,
    signUp,
    createGym,
    registerOwner,
    logout,
    resetPassword,
    updatePassword,
    updateProfile,
    refresh: checkAuth,
  };
}
