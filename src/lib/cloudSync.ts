import type { Agency } from '../types/creatorops';
import { saveAgencyData } from './store';

const NETLIFY_SYNC_API = '/.netlify/functions/sync';

export function generateSyncCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let num = '';
  for (let i = 0; i < 4; i++) {
    num += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'UH-' + num;
}

export function encodeWorkspaceToToken(user: any, agency: Agency): string {
  try {
    const payload = {
      user: user ? { name: user.name, email: user.email, role: user.role, agencyId: user.agencyId } : null,
      agency: {
        id: agency.id,
        name: agency.name,
        creators: agency.creators || [],
        deals: agency.deals || [],
        deliverables: agency.deliverables || [],
        managers: agency.managers || []
      },
      createdAt: new Date().toISOString()
    };
    const jsonStr = JSON.stringify(payload);
    return btoa(unescape(encodeURIComponent(jsonStr)))
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  } catch (err) {
    console.warn('Encoding sync token failed:', err);
    return '';
  }
}

export function decodeTokenToWorkspace(token: string): { agency: Agency; user?: any } | null {
  try {
    let cleanToken = token.trim().replace(/-/g, '+').replace(/_/g, '/');
    while (cleanToken.length % 4 !== 0) {
      cleanToken += '=';
    }
    const jsonStr = decodeURIComponent(escape(atob(cleanToken)));
    const parsed = JSON.parse(jsonStr);
    if (parsed && parsed.agency) {
      return parsed;
    }
  } catch (err) {
    console.warn('Decoding sync token failed:', err);
  }
  return null;
}

export class CloudSyncEngine {
  private static activeSyncCode: string | null = localStorage.getItem('creatorops_cloud_sync_code');

  public static getSyncCode(): string {
    if (!this.activeSyncCode) {
      const saved = localStorage.getItem('creatorops_cloud_sync_code');
      if (saved) {
        this.activeSyncCode = saved;
      } else {
        const newCode = generateSyncCode();
        this.activeSyncCode = newCode;
        localStorage.setItem('creatorops_cloud_sync_code', newCode);
      }
    }
    return this.activeSyncCode;
  }

  public static setSyncCode(code: string) {
    const clean = code.trim().toUpperCase();
    this.activeSyncCode = clean;
    localStorage.setItem('creatorops_cloud_sync_code', clean);
  }

  public static setVaultUuid(uuid: string | null) {
    if (uuid) {
      localStorage.setItem('creatorops_cloud_vault_uuid', uuid);
    } else {
      localStorage.removeItem('creatorops_cloud_vault_uuid');
    }
  }

  public static getOneClickSyncUrl(user: any, agency: Agency): string {
    const token = encodeWorkspaceToToken(user, agency);
    const baseUrl = window.location.origin + window.location.pathname;
    return `${baseUrl}?syncToken=${token}`;
  }

  public static async findVaultForAccount(email: string): Promise<any | null> {
    const cleanEmail = email.trim().toLowerCase();
    try {
      const res = await fetch(`${NETLIFY_SYNC_API}?email=${encodeURIComponent(cleanEmail)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.vault) {
        return data.vault;
      }
    } catch (err) {
      console.warn('Cloud Sync API lookup offline:', err);
    }
    return null;
  }

  public static async pullWorkspace(vaultUuid: string): Promise<{ agency: Agency; user?: any } | null> {
    return this.pairDeviceWithSyncCode(vaultUuid);
  }

  public static async pairDeviceWithSyncCode(input: string): Promise<{ agency: Agency; user?: any } | null> {
    const cleanInput = input.trim();

    // 1. Try decoding directly as Sync Token
    const decoded = decodeTokenToWorkspace(cleanInput);
    if (decoded && decoded.agency) {
      saveAgencyData(decoded.agency);
      return decoded;
    }

    // 2. Try Netlify Functions Serverless Endpoint
    try {
      const res = await fetch(`${NETLIFY_SYNC_API}?code=${encodeURIComponent(cleanInput.toUpperCase())}`);
      if (res.ok) {
        const data = await res.json();
        if (data && data.vault && data.vault.agency) {
          saveAgencyData(data.vault.agency);
          return data.vault;
        }
      }
    } catch (err) {
      console.warn('Netlify sync API pairing error:', err);
    }

    return null;
  }

  public static async pushWorkspace(email: string, user: any, agency: Agency): Promise<string | null> {
    const cleanEmail = email.trim().toLowerCase();
    const syncCode = this.getSyncCode();

    try {
      const payload = {
        email: cleanEmail,
        user,
        agency,
        syncCode,
        updatedAt: new Date().toISOString()
      };

      await fetch(NETLIFY_SYNC_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
    } catch (err) {
      console.warn('Netlify sync push note:', err);
    }

    return syncCode;
  }
}
