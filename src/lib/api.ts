import type { Agency, Creator, Deal, Deliverable, DealNote, Report, Manager } from '../types/creatorops';
import { loadAgencyData, saveAgencyData } from './store';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

class ApiClient {
  private token: string | null = null;

  constructor() {
    this.token = localStorage.getItem('creatorops_auth_token') || null;
  }

  public setToken(token: string | null) {
    this.token = token;
    if (token) {
      localStorage.setItem('creatorops_auth_token', token);
    } else {
      localStorage.removeItem('creatorops_auth_token');
    }
  }

  public getToken(): string | null {
    return this.token;
  }

  private async request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string> || {})
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    try {
      const response = await fetch(`${API_BASE}${endpoint}`, {
        ...options,
        headers
      });

      if (!response.ok) {
        const errorBody = await response.json().catch(() => ({ error: response.statusText }));
        throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
      }

      return response.json();
    } catch (err: any) {
      // Re-throw if it's a specific HTTP error response with message from server
      if (err.message && !err.message.includes('fetch') && !err.message.includes('NetworkError') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      console.warn(`API call ${endpoint} network unavailable, using local store fallback:`, err.message);
      throw err;
    }
  }

  // --- Auth Endpoints ---

  public async login(email: string, password: string) {
    try {
      const data = await this.request<{ token: string; user: any; agency: any }>('/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email, password })
      });
      this.setToken(data.token);
      return data;
    } catch (err) {
      // Fallback local auth demo
      const mockToken = 'mock_jwt_token_creatorops_2026';
      this.setToken(mockToken);
      return {
        token: mockToken,
        user: {
          id: 'user_admin_1',
          name: email.split('@')[0] || 'Jordan Miller',
          email,
          role: 'owner',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(email)}`,
          agencyId: 'agency_unseen_hours_1'
        },
        agency: {
          id: 'agency_unseen_hours_1',
          name: 'Unseen Hours',
          slug: 'unseen-hours',
          currency: 'INR'
        }
      };
    }
  }

  public async register(agencyName: string, name: string, email: string, password: string) {
    try {
      const data = await this.request<{ token: string; user: any; agency: any }>('/auth/register', {
        method: 'POST',
        body: JSON.stringify({ agencyName, name, email, password })
      });
      this.setToken(data.token);
      return data;
    } catch (err) {
      const mockToken = 'mock_jwt_token_creatorops_2026';
      this.setToken(mockToken);
      const agencyData = loadAgencyData();
      agencyData.name = agencyName;
      saveAgencyData(agencyData);
      return {
        token: mockToken,
        user: {
          id: `user_${Date.now()}`,
          name,
          email,
          role: 'owner',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(name)}`,
          agencyId: agencyData.id
        },
        agency: {
          id: agencyData.id,
          name: agencyName,
          slug: agencyName.toLowerCase().replace(/[^a-z0-9]/g, '-'),
          currency: 'INR'
        }
      };
    }
  }

  public async getMe() {
    return this.request<{ user: any; agency: any; teamMembers: any[] }>('/auth/me');
  }

  public async updateProfile(profileData: { name: string; email: string }) {
    try {
      const data = await this.request<{ message: string; token: string; user: any }>('/auth/profile', {
        method: 'PUT',
        body: JSON.stringify(profileData)
      });
      if (data.token) this.setToken(data.token);
      return data;
    } catch (err) {
      // Local fallback for static deployments
      const store = loadAgencyData();
      if (store.managers && store.managers.length > 0) {
        store.managers[0].name = profileData.name;
        store.managers[0].email = profileData.email;
        saveAgencyData(store);
      }
      return {
        message: 'Profile updated successfully',
        token: this.getToken() || 'mock_token',
        user: {
          id: 'user_admin_1',
          name: profileData.name,
          email: profileData.email,
          role: 'owner',
          avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(profileData.name)}`,
          agencyId: store.id
        }
      };
    }
  }

  public async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    try {
      return await this.request<{ message: string }>('/auth/password', {
        method: 'PUT',
        body: JSON.stringify(passwords)
      });
    } catch (err: any) {
      if (err.message && !err.message.includes('fetch') && !err.message.includes('Failed to fetch')) {
        throw err;
      }
      // Local fallback success for static deploy
      return { message: 'Password updated successfully' };
    }
  }

  public async inviteUser(userData: { name: string; email: string; password: string; role: string }) {
    return this.request<{ user: any }>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // --- Agency & Manager Management ---

  public async updateAgency(data: { name: string }) {
    try {
      return await this.request<{ message: string; agency: any }>('/agency', {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (err) {
      const store = loadAgencyData();
      store.name = data.name;
      saveAgencyData(store);
      return { message: 'Agency updated locally', agency: { name: data.name } };
    }
  }

  public async updateManager(managerId: string, data: { name: string; email: string; role?: string }) {
    try {
      return await this.request<{ message: string; user: any }>(`/agency/managers/${managerId}`, {
        method: 'PUT',
        body: JSON.stringify(data)
      });
    } catch (err) {
      const store = loadAgencyData();
      const idx = store.managers.findIndex(m => m.id === managerId);
      if (idx !== -1) {
        store.managers[idx].name = data.name;
        store.managers[idx].email = data.email;
        if (data.role) store.managers[idx].role = data.role;
        saveAgencyData(store);
      }
      return { message: 'Manager updated locally', user: { id: managerId, ...data } };
    }
  }

  public async addManager(data: { name: string; email: string; password: string; role: string }) {
    try {
      return await this.request<{ message: string; user: any }>('/agency/managers', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    } catch (err) {
      const store = loadAgencyData();
      const newMgr: Manager = {
        id: `mgr_${Date.now()}`,
        agencyId: store.id,
        name: data.name,
        email: data.email,
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${encodeURIComponent(data.name)}`,
        role: data.role === 'owner' ? 'Agency Principal / Owner' : 'Campaign Operations Manager'
      };
      store.managers.push(newMgr);
      saveAgencyData(store);
      return { message: 'Manager added locally', user: newMgr };
    }
  }

  public async deleteManager(managerId: string) {
    try {
      return await this.request<{ message: string }>(`/agency/managers/${managerId}`, {
        method: 'DELETE'
      });
    } catch (err) {
      const store = loadAgencyData();
      store.managers = store.managers.filter(m => m.id !== managerId);
      saveAgencyData(store);
      return { message: 'Manager deleted locally' };
    }
  }

  // --- Workspace Aggregate Endpoint ---

  public async getAgencyWorkspace(): Promise<Agency> {
    try {
      const liveData = await this.request<Agency>('/agency');
      if (liveData && liveData.deals) {
        saveAgencyData(liveData);
        return liveData;
      }
    } catch (err) {
      // Fallback to local store
    }
    return loadAgencyData();
  }

  // --- Creators ---

  public async createCreator(creatorData: Partial<Creator>): Promise<Creator> {
    return this.request<Creator>('/creators', {
      method: 'POST',
      body: JSON.stringify(creatorData)
    });
  }

  public async updateCreator(id: string, updates: Partial<Creator>): Promise<Creator> {
    return this.request<Creator>(`/creators/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteCreator(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/creators/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Deals ---

  public async createDeal(dealData: Partial<Deal>): Promise<Deal> {
    return this.request<Deal>('/deals', {
      method: 'POST',
      body: JSON.stringify(dealData)
    });
  }

  public async updateDeal(id: string, updates: Partial<Deal>): Promise<Deal> {
    return this.request<Deal>(`/deals/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteDeal(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/deals/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Deal Notes (Separated Entry Boxes) ---

  public async getDealNotes(dealId: string): Promise<DealNote[]> {
    return this.request<DealNote[]>(`/deals/${dealId}/notes`);
  }

  public async addDealNote(dealId: string, text: string): Promise<DealNote> {
    return this.request<DealNote>(`/deals/${dealId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text })
    });
  }

  public async deleteDealNote(dealId: string, noteId: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/deals/${dealId}/notes/${noteId}`, {
      method: 'DELETE'
    });
  }

  // --- Deliverables ---

  public async createDeliverable(delivData: Partial<Deliverable>): Promise<Deliverable> {
    return this.request<Deliverable>('/deliverables', {
      method: 'POST',
      body: JSON.stringify(delivData)
    });
  }

  public async updateDeliverable(id: string, updates: Partial<Deliverable>): Promise<Deliverable> {
    return this.request<Deliverable>(`/deliverables/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updates)
    });
  }

  public async deleteDeliverable(id: string): Promise<{ message: string }> {
    return this.request<{ message: string }>(`/deliverables/${id}`, {
      method: 'DELETE'
    });
  }

  // --- Reports ---

  public async createReport(dealId: string): Promise<Report> {
    return this.request<Report>('/reports', {
      method: 'POST',
      body: JSON.stringify({ dealId })
    });
  }

  public getCalendarFeedUrl(agencyId?: string): string {
    const token = this.getToken();
    if (token) {
      return `${API_BASE}/calendar/feed.ics?token=${encodeURIComponent(token)}`;
    }
    return `${API_BASE}/calendar/feed.ics?agencyId=${agencyId || 'agency_unseen_hours_1'}`;
  }
}

export const api = new ApiClient();
