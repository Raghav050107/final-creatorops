import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../lib/api';
import { CloudSyncEngine } from '../lib/cloudSync';
import { loadAgencyData } from '../lib/store';

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
      CloudSyncEngine.setVaultUuid(null);
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
      console.warn('Backend server unavailable, checking local & cloud sync user session:', err);
      const savedUserStr = localStorage.getItem(OFFLINE_USER_KEY);
      const savedAgencyStr = localStorage.getItem(OFFLINE_AGENCY_KEY);

      if (savedUserStr && savedAgencyStr) {
        try {
          const parsedUser = JSON.parse(savedUserStr);
          const parsedAgency = JSON.parse(savedAgencyStr);
          setUser(parsedUser);
          setAgency(parsedAgency);

          // Try pulling latest cloud workspace snapshot on mount
          const vaultUuid = await CloudSyncEngine.findVaultForAccount(parsedUser.email);
          if (vaultUuid) {
            const cloudData = await CloudSyncEngine.pullWorkspace(vaultUuid);
            if (cloudData?.user && cloudData?.agency) {
              setUser(cloudData.user);
              setAgency({
                id: cloudData.agency.id,
                name: cloudData.agency.name,
                slug: cloudData.agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
                currency: 'INR'
              });
              saveOfflineSession(cloudData.user, cloudData.agency as any);
            }
          }
        } catch {
          setUser(null);
          setAgency(null);
        }
      } else {
        // REQUIRE LOGIN ON FRESH DEVICES!
        setUser(null);
        setAgency(null);
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
    const cleanEmail = email.trim().toLowerCase();

    try {
      // 1. Try Backend API login
      const res = await api.login(cleanEmail, password);
      let activeUser = res.user;
      let activeAgency = res.agency;

      // CROSS-DEVICE CLOUD VAULT SYNC LOOKUP
      const vaultUuid = await CloudSyncEngine.findVaultForAccount(cleanEmail);
      if (vaultUuid) {
        const cloudData = await CloudSyncEngine.pullWorkspace(vaultUuid);
        if (cloudData?.user) activeUser = cloudData.user;
        if (cloudData?.agency) {
          activeAgency = {
            id: cloudData.agency.id,
            name: cloudData.agency.name,
            slug: cloudData.agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            currency: 'INR'
          };
        }
      } else {
        const currentStore = loadAgencyData();
        await CloudSyncEngine.pushWorkspace(cleanEmail, activeUser, currentStore);
      }

      setUser(activeUser);
      setAgency(activeAgency);
      setToken(res.token);
      saveOfflineSession(activeUser, activeAgency);
      setIsBackendConnected(true);
    } catch (err: any) {
      console.warn('Backend login offline, falling back to Cloud Sync Vault:', err);

      // 2. Fallback to Cloud Sync Vault Lookup for static deploys (Netlify)
      const vaultUuid = await CloudSyncEngine.findVaultForAccount(cleanEmail);
      if (vaultUuid) {
        const cloudData = await CloudSyncEngine.pullWorkspace(vaultUuid);
        if (cloudData && cloudData.user && cloudData.agency) {
          const authUser: AuthUser = cloudData.user;
          const authAgency: AuthAgency = {
            id: cloudData.agency.id,
            name: cloudData.agency.name,
            slug: cloudData.agency.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
            currency: 'INR'
          };
          setUser(authUser);
          setAgency(authAgency);
          saveOfflineSession(authUser, authAgency);
          setIsLoading(false);
          return;
        }
      }

      // 3. Fallback for default admin credentials when no vault exists yet
      if (cleanEmail === 'admin@unseenhours.com' || cleanEmail === 'sam@unseenhours.com') {
        const demoUser: AuthUser = {
          id: cleanEmail === 'admin@unseenhours.com' ? 'usr_admin' : 'usr_sam',
          name: cleanEmail === 'admin@unseenhours.com' ? 'Jordan Miller (Owner)' : 'Sam Wilson (Manager)',
          email: cleanEmail,
          role: cleanEmail === 'admin@unseenhours.com' ? 'owner' : 'manager',
          avatarUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=250&q=80',
          agencyId: 'agency_unseen_hours_1'
        };
        const demoAgency: AuthAgency = {
          id: 'agency_unseen_hours_1',
          name: 'Unseen Hours',
          slug: 'unseen-hours',
          currency: 'INR'
        };

        const currentStore = loadAgencyData();
        await CloudSyncEngine.pushWorkspace(cleanEmail, demoUser, currentStore);

        setUser(demoUser);
        setAgency(demoAgency);
        saveOfflineSession(demoUser, demoAgency);
        setIsLoading(false);
        return;
      }

      throw new Error('No account found for this email on any device. Please click "Register" to create a new account.');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (agencyName: string, name: string, email: string, password: string) => {
    setIsLoading(true);
    const cleanEmail = email.trim().toLowerCase();
    const cleanName = name.trim();
    const cleanAgencyName = agencyName.trim();

    const newUser: AuthUser = {
      id: `usr_${Date.now()}`,
      name: cleanName,
      email: cleanEmail,
      role: 'owner',
      avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(cleanName)}`,
      agencyId: `agency_${Date.now()}`
    };

    const newAgency: AuthAgency = {
      id: newUser.agencyId,
      name: cleanAgencyName,
      slug: cleanAgencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
      currency: 'INR'
    };

    try {
      const res = await api.register(cleanAgencyName, cleanName, cleanEmail, password);
      if (res && res.user && res.agency) {
        setUser(res.user);
        setAgency(res.agency);
        setToken(res.token);
        saveOfflineSession(res.user, res.agency);
        setIsBackendConnected(true);
      }
    } catch (err) {
      console.warn('Backend register offline, creating local + cloud sync account:', err);
      setUser(newUser);
      setAgency(newAgency);
      saveOfflineSession(newUser, newAgency);
    }

    // Push new workspace to Cloud Vault so other devices (phone) can log into it immediately
    const currentStore = loadAgencyData();
    currentStore.id = newAgency.id;
    currentStore.name = cleanAgencyName;
    await CloudSyncEngine.pushWorkspace(cleanEmail, newUser, currentStore);

    setIsLoading(false);
  };

  const updateProfile = async (profileData: { name: string; email: string }) => {
    const res = await api.updateProfile(profileData);
    setUser(res.user);
    if (agency) {
      saveOfflineSession(res.user, agency);
      const currentStore = loadAgencyData();
      await CloudSyncEngine.pushWorkspace(res.user.email, res.user, currentStore);
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
