import type { Agency, Creator, Deal, Deliverable, DealNote, Report } from '../types/creatorops';
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

    const response = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers
    });

    if (!response.ok) {
      const errorBody = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(errorBody.error || `HTTP ${response.status}: ${response.statusText}`);
    }

    return response.json();
  }

  // --- Auth Endpoints ---

  public async login(email: string, password: string) {
    const data = await this.request<{ token: string; user: any; agency: any }>('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password })
    });
    this.setToken(data.token);
    return data;
  }

  public async register(agencyName: string, name: string, email: string, password: string) {
    const data = await this.request<{ token: string; user: any; agency: any }>('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ agencyName, name, email, password })
    });
    this.setToken(data.token);
    return data;
  }

  public async getMe() {
    return this.request<{ user: any; agency: any; teamMembers: any[] }>('/auth/me');
  }

  public async updateProfile(profileData: { name: string; email: string }) {
    const data = await this.request<{ message: string; token: string; user: any }>('/auth/profile', {
      method: 'PUT',
      body: JSON.stringify(profileData)
    });
    if (data.token) this.setToken(data.token);
    return data;
  }

  public async changePassword(passwords: { currentPassword: string; newPassword: string }) {
    return this.request<{ message: string }>('/auth/password', {
      method: 'PUT',
      body: JSON.stringify(passwords)
    });
  }

  public async inviteUser(userData: { name: string; email: string; password: string; role: string }) {
    return this.request<{ user: any }>('/auth/users', {
      method: 'POST',
      body: JSON.stringify(userData)
    });
  }

  // --- Agency & Manager Management ---

  public async updateAgency(data: { name: string }) {
    return this.request<{ message: string; agency: any }>('/agency', {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async updateManager(managerId: string, data: { name: string; email: string; role?: string }) {
    return this.request<{ message: string; user: any }>(`/agency/managers/${managerId}`, {
      method: 'PUT',
      body: JSON.stringify(data)
    });
  }

  public async addManager(data: { name: string; email: string; password: string; role: string }) {
    return this.request<{ message: string; user: any }>('/agency/managers', {
      method: 'POST',
      body: JSON.stringify(data)
    });
  }

  public async deleteManager(managerId: string) {
    return this.request<{ message: string }>(`/agency/managers/${managerId}`, {
      method: 'DELETE'
    });
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
      console.warn('Backend unavailable, falling back to local cached store:', err);
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
