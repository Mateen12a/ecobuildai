import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import api, { UserPreferences, UserAppearance, UserPrivacy } from './api';

interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  bio?: string;
  avatar?: string;
  company?: string;
  jobTitle?: string;
  totalScans: number;
  carbonSaved: number;
  preferences: UserPreferences;
  appearance: UserAppearance;
  privacy: UserPrivacy;
  subscriptionPlan: 'free' | 'pro' | 'enterprise';
  subscriptionStatus: 'active' | 'cancelled' | 'expired';
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: { email: string; password: string; firstName: string; lastName: string }) => Promise<void>;
  googleLogin: (data: { googleId: string; email: string; firstName: string; lastName: string; avatar?: string }) => Promise<void>;
  logout: () => void;
  updateUser: (data: Partial<User>) => Promise<void>;
  uploadAvatar: (file: File) => Promise<void>;
  updatePreferences: (data: Partial<UserPreferences>) => Promise<void>;
  updateAppearance: (data: Partial<UserAppearance>) => Promise<void>;
  updatePrivacy: (data: Partial<UserPrivacy>) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  refreshUser: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const userData = await api.getMe();
      setUser(userData);
    } catch (error) {
      console.error('Failed to refresh user:', error);
    }
  };

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      api.getMe()
        .then(userData => setUser(userData))
        .catch(() => {
          localStorage.removeItem('token');
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    if (user?.appearance?.darkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [user?.appearance?.darkMode]);

  const login = async (email: string, password: string) => {
    const result = await api.login(email, password);
    setUser(result.user);
  };

  const register = async (data: { email: string; password: string; firstName: string; lastName: string }) => {
    const result = await api.register(data);
    setUser(result.user);
  };

  const googleLogin = async (data: { googleId: string; email: string; firstName: string; lastName: string; avatar?: string }) => {
    const result = await api.googleAuth(data);
    setUser(result.user);
  };

  const logout = () => {
    api.logout();
    setUser(null);
  };

  const updateUser = async (data: Partial<User>) => {
    const updatedUser = await api.updateProfile(data);
    setUser(updatedUser);
  };

  const uploadAvatar = async (file: File) => {
    const result = await api.uploadAvatar(file);
    setUser(result.user);
  };

  const updatePreferences = async (data: Partial<UserPreferences>) => {
    const updatedUser = await api.updatePreferences(data);
    setUser(updatedUser);
  };

  const updateAppearance = async (data: Partial<UserAppearance>) => {
    const updatedUser = await api.updateAppearance(data);
    setUser(updatedUser);
  };

  const updatePrivacy = async (data: Partial<UserPrivacy>) => {
    const updatedUser = await api.updatePrivacy(data);
    setUser(updatedUser);
  };

  const updatePassword = async (currentPassword: string, newPassword: string) => {
    await api.updatePassword(currentPassword, newPassword);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      googleLogin,
      logout,
      updateUser,
      uploadAvatar,
      updatePreferences,
      updateAppearance,
      updatePrivacy,
      updatePassword,
      refreshUser,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
