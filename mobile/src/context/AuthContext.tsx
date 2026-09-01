import React, { createContext, useContext, useEffect, useState } from 'react';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { authApi, onboardingApi } from '../api';
import { ACCESS_TOKEN_KEY, REFRESH_TOKEN_KEY } from '../api/client';
import { Profile, SubscriptionTier, User } from '../types';

interface SignInResult {
  user: User;
  profile: Profile | null;
  isOnboardingCompleted: boolean;
}

interface AuthContextType {
  user: User | null;
  profile: Profile | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboardingCompleted: boolean;
  signIn: (email: string, password: string) => Promise<SignInResult>;
  signUp: (email: string, password: string, fullName?: string, tier?: SubscriptionTier) => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  upgradeTier: (tier: SubscriptionTier) => Promise<void>;
  setProfileState: (profile: Profile) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const saveTokens = async (accessToken: string, refreshToken: string) => {
    if (Platform.OS === 'web') {
      localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
      localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    } else {
      await SecureStore.setItemAsync(ACCESS_TOKEN_KEY, accessToken);
      await SecureStore.setItemAsync(REFRESH_TOKEN_KEY, refreshToken);
    }
  };

  const clearTokens = async () => {
    if (Platform.OS === 'web') {
      localStorage.removeItem(ACCESS_TOKEN_KEY);
      localStorage.removeItem(REFRESH_TOKEN_KEY);
    } else {
      await SecureStore.deleteItemAsync(ACCESS_TOKEN_KEY);
      await SecureStore.deleteItemAsync(REFRESH_TOKEN_KEY);
    }
  };

  const loadUserSession = async () => {
    try {
      let token: string | null = null;
      if (Platform.OS === 'web') {
        token = localStorage.getItem(ACCESS_TOKEN_KEY);
      } else {
        token = await SecureStore.getItemAsync(ACCESS_TOKEN_KEY);
      }

      if (token) {
        const rawUserData = (await authApi.getMe()) as unknown as any;
        const normalizedUser: User = {
          ...rawUserData,
          id: rawUserData.id || rawUserData.userId,
        };
        setUser(normalizedUser);

        try {
          const status = (await onboardingApi.getStatus()) as unknown as {
            isOnboardingCompleted: boolean;
            onboardingStep: number;
            profile: Profile;
          };
          if (status?.profile) {
            setProfile(status.profile);
          }
        } catch {
          // Onboarding status load fallback
        }
      }
    } catch {
      await clearTokens();
      setUser(null);
      setProfile(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadUserSession();
  }, []);

  const signIn = async (email: string, password: string): Promise<SignInResult> => {
    setIsLoading(true);
    try {
      const res = (await authApi.signIn({ email, password })) as unknown as {
        user: any;
        accessToken: string;
        refreshToken: string;
      };
      await saveTokens(res.accessToken, res.refreshToken);

      const normalizedUser: User = {
        ...res.user,
        id: res.user.id || res.user.userId,
      };
      setUser(normalizedUser);

      let latestProfile: Profile | null = null;
      let completed = false;

      try {
        const status = (await onboardingApi.getStatus()) as unknown as {
          isOnboardingCompleted: boolean;
          onboardingStep: number;
          profile: Profile;
        };
        if (status?.profile) {
          latestProfile = status.profile;
          completed = !!status.isOnboardingCompleted;
          setProfile(status.profile);
        }
      } catch {
        // Fallback
      }

      return {
        user: normalizedUser,
        profile: latestProfile,
        isOnboardingCompleted: completed,
      };
    } finally {
      setIsLoading(false);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    fullName?: string,
    tier?: SubscriptionTier,
  ) => {
    setIsLoading(true);
    try {
      const res = (await authApi.signUp({ email, password, fullName, tier })) as unknown as {
        user: any;
        accessToken: string;
        refreshToken: string;
      };
      await saveTokens(res.accessToken, res.refreshToken);

      const normalizedUser: User = {
        ...res.user,
        id: res.user.id || res.user.userId,
      };
      setUser(normalizedUser);

      try {
        const status = (await onboardingApi.getStatus()) as unknown as {
          isOnboardingCompleted: boolean;
          onboardingStep: number;
          profile: Profile;
        };
        if (status?.profile) {
          setProfile(status.profile);
        }
      } catch {
        // Fallback
      }
    } finally {
      setIsLoading(false);
    }
  };

  const signOut = async () => {
    await clearTokens();
    setUser(null);
    setProfile(null);
  };

  const refreshProfile = async () => {
    try {
      const status = (await onboardingApi.getStatus()) as unknown as {
        isOnboardingCompleted: boolean;
        onboardingStep: number;
        profile: Profile;
      };
      if (status?.profile) {
        setProfile(status.profile);
      }
      const me = (await authApi.getMe()) as unknown as any;
      if (me) {
        setUser({
          ...me,
          id: me.id || me.userId,
        });
      }
    } catch {
      // Ignore
    }
  };

  const upgradeTier = async (tier: SubscriptionTier) => {
    const res = (await authApi.upgradeTier(tier)) as unknown as any;
    if (res?.accessToken) {
      await saveTokens(res.accessToken, res.refreshToken);
      const newTier = res.user?.tier || res.tier || tier;
      if (user) {
        setUser({ ...user, tier: newTier });
      }
    }
  };

  const setProfileState = (updatedProfile: Profile) => {
    setProfile(updatedProfile);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        profile,
        isLoading,
        isAuthenticated: !!user,
        isOnboardingCompleted: !!profile?.isOnboardingCompleted,
        signIn,
        signUp,
        signOut,
        refreshProfile,
        upgradeTier,
        setProfileState,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
