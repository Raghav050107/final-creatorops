import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'manager' | 'viewer';
  avatarUrl?: string;
  agencyId: string;
}

export interface AuthAgency {
  id: string;
  name: string;
  slug: string;
  currency: string;
}

interface AuthContextType {
  user: AuthUser | null;
  agency: AuthAgency | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  isBackendConnected: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (agencyName: string, name: string, email: string, password: string) => Promise<void>;
  updateProfile: (profileData: { name: string; email: string }) => Promise<void>;
  changePassword: (passwords: { currentPassword: string; newPassword: string }) => Promise<void>;
  logout: () => void;
  inviteMember: (userData: { name: string; email: string; password: string; role: string }) => Promise<void>;
  switchDemoUser: (userType: 'jordan' | 'sam') => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [agency, setAgency] = useState<AuthAgency | null>(null);
  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const meData = await api.getMe();
      if (meData && meData.user && meData.agency) {
        setUser(meData.user);
        setAgency(meData.agency);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('Could not verify session with backend, checking offline mode:', err);
      if (!user) {
        setUser({
          id: 'user_admin_1',
          name: 'Jordan Miller',
          email: 'admin@unseenhours.com',
          role: 'owner',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          agencyId: 'agency_unseen_hours_1'
        });
        setAgency({
          id: 'agency_unseen_hours_1',
          name: 'Unseen Hours',
          slug: 'unseen-hours',
          currency: 'INR'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    checkAuth();
  }, []);

  const login = async (email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.login(email, password);
      setUser(res.user);
      setAgency(res.agency);
      setToken(res.token);
      setIsBackendConnected(true);
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (agencyName: string, name: string, email: string, password: string) => {
    setIsLoading(true);
    try {
      const res = await api.register(agencyName, name, email, password);
      setUser(res.user);
      setAgency(res.agency);
      setToken(res.token);
      setIsBackendConnected(true);
    } catch (err: any) {
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData: { name: string; email: string }) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
    if (res.token) setToken(res.token);
  };

  const changePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    await api.changePassword(passwords);
  };

  const logout = () => {
    api.setToken(null);
    setUser(null);
    setAgency(null);
    setToken(null);
  };

  const inviteMember = async (userData: { name: string; email: string; password: string; role: string }) => {
    await api.inviteUser(userData);
  };

  const switchDemoUser = async (userType: 'jordan' | 'sam') => {
    const email = userType === 'jordan' ? 'admin@unseenhours.com' : 'sam@unseenhours.com';
    await login(email, 'admin123');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        agency,
        token,
        isAuthenticated: !!user,
        isLoading,
        isBackendConnected,
        login,
        register,
        updateProfile,
        changePassword,
        logout,
        inviteMember,
        switchDemoUser
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
