import type { Agency } from '../types/creatorops';
import { saveAgencyData } from './store';

const NETLIFY_SYNC_API = '/.netlify/functions/sync';

export function hashAccountEmail(email: string): string {
  return 'acct_' + email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
}

export function generateSyncCode(): string {
  const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';
  let num = '';
  for (let i = 0; i < 4; i++) {
    num += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return 'UH-' + num;
}

export class CloudSyncEngine {
  private static activeVaultUuid: string | null = localStorage.getItem('creatorops_cloud_vault_uuid');
  private static activeSyncCode: string | null = localStorage.getItem('creatorops_cloud_sync_code');

  public static getVaultUuid(): string | null {
    return this.activeVaultUuid || localStorage.getItem('creatorops_cloud_vault_uuid');
  }

  public static setVaultUuid(uuid: string | null) {
    this.activeVaultUuid = uuid;
    if (uuid) {
      localStorage.setItem('creatorops_cloud_vault_uuid', uuid);
    } else {
      localStorage.removeItem('creatorops_cloud_vault_uuid');
    }
  }

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

  // 1. Fetch Cloud Vault mapping for an account email
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

  // 2. Pair Device using 6-Digit Sync Code (e.g. UH-8492)
  public static async pairDeviceWithSyncCode(code: string): Promise<{ agency: Agency; user?: any } | null> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await fetch(`${NETLIFY_SYNC_API}?code=${encodeURIComponent(cleanCode)}`);
      if (!res.ok) return null;
      const data = await res.json();

      if (data && data.vault && data.vault.agency) {
        this.setSyncCode(cleanCode);
        saveAgencyData(data.vault.agency);
        return data.vault;
      }
    } catch (err) {
      console.warn('Pairing lookup error:', err);
    }
    return null;
  }

  // 3. Fetch full Agency Workspace JSON from Cloud Vault
  public static async pullWorkspace(vaultUuid: string): Promise<{ agency: Agency; user?: any } | null> {
    try {
      const res = await fetch(`${NETLIFY_SYNC_API}?code=${encodeURIComponent(vaultUuid)}`);
      if (!res.ok) return null;
      const data = await res.json();
      if (data && data.vault && data.vault.agency) {
        saveAgencyData(data.vault.agency);
        return data.vault;
      }
    } catch (err) {
      console.warn('Cloud Vault pull offline:', err);
    }
    return null;
  }

  // 4. Create or Push Agency Workspace JSON to Cloud Vault
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

      return syncCode;
    } catch (err) {
      console.warn('Cloud Vault push failed:', err);
      return syncCode;
    }
  }
}
