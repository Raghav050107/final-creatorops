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

const OFFLINE_USER_KEY = 'creatorops_offline_user_data';
const OFFLINE_AGENCY_KEY = 'creatorops_offline_agency_data';

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<AuthUser | null>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [agency, setAgency] = useState<AuthAgency | null>(() => {
    try {
      const saved = localStorage.getItem(OFFLINE_AGENCY_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => api.getToken());
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isBackendConnected, setIsBackendConnected] = useState<boolean>(false);

  const saveOfflineSession = (u: AuthUser, a: AuthAgency) => {
    try {
      localStorage.setItem(OFFLINE_USER_KEY, JSON.stringify(u));
      localStorage.setItem(OFFLINE_AGENCY_KEY, JSON.stringify(a));
    } catch (e) {
      console.warn('Could not save offline session:', e);
    }
  };

  const clearOfflineSession = () => {
    try {
      localStorage.removeItem(OFFLINE_USER_KEY);
      localStorage.removeItem(OFFLINE_AGENCY_KEY);
    } catch (e) {
      console.warn('Could not clear offline session:', e);
    }
  };

  const checkAuth = async () => {
    setIsLoading(true);
    try {
      const meData = await api.getMe();
      if (meData && meData.user && meData.agency) {
        setUser(meData.user);
        setAgency(meData.agency);
        saveOfflineSession(meData.user, meData.agency);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('Backend server unavailable, preserving active local user session:', err);
      // PRESERVE REGISTERED OR LOGGED IN OFFLINE USER ON REFRESH!
      const savedUserStr = localStorage.getItem(OFFLINE_USER_KEY);
      const savedAgencyStr = localStorage.getItem(OFFLINE_AGENCY_KEY);

      if (savedUserStr && savedAgencyStr) {
        try {
          setUser(JSON.parse(savedUserStr));
          setAgency(JSON.parse(savedAgencyStr));
        } catch {
          // fallback only if parse fails
        }
      } else {
        // Fallback default admin session only on very first launch
        const defaultUser: AuthUser = {
          id: 'user_admin_1',
          name: 'Jordan Miller',
          email: 'admin@unseenhours.com',
          role: 'owner',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          agencyId: 'agency_unseen_hours_1'
        };
        const defaultAgency: AuthAgency = {
          id: 'agency_unseen_hours_1',
          name: 'Unseen Hours',
          slug: 'unseen-hours',
          currency: 'INR'
        };
        setUser(defaultUser);
        setAgency(defaultAgency);
        saveOfflineSession(defaultUser, defaultAgency);
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
      saveOfflineSession(res.user, res.agency);
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
      saveOfflineSession(res.user, res.agency);
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
    if (agency) {
      saveOfflineSession(res.user, agency);
    }
    if (res.token) setToken(res.token);
  };

  const changePassword = async (passwords: { currentPassword: string; newPassword: string }) => {
    await api.changePassword(passwords);
  };

  const logout = () => {
    api.setToken(null);
    clearOfflineSession();
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
