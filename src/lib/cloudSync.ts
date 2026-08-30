import type { Agency } from '../types/creatorops';
import { saveAgencyData } from './store';

const CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
const MASTER_REGISTRY_ID = 'ff808181a04ccf2d01a05175cce2146b';

export function hashAccountEmail(email: string): string {
  return 'cops_acct_' + email.trim().toLowerCase().replace(/[^a-z0-9]/g, '_');
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
  private static activeVaultId: string | null = localStorage.getItem('creatorops_cloud_vault_id');
  private static activeSyncCode: string | null = localStorage.getItem('creatorops_cloud_sync_code');

  public static getVaultId(): string | null {
    return this.activeVaultId || localStorage.getItem('creatorops_cloud_vault_id');
  }

  public static setVaultId(id: string | null) {
    this.activeVaultId = id;
    if (id) {
      localStorage.setItem('creatorops_cloud_vault_id', id);
    } else {
      localStorage.removeItem('creatorops_cloud_vault_id');
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

  // 1. Fetch Cloud Vault ID mapping for an account email
  public static async findVaultForAccount(email: string): Promise<string | null> {
    const key = hashAccountEmail(email);
    try {
      const res = await fetch(`${CLOUD_API_BASE}/${MASTER_REGISTRY_ID}`);
      if (!res.ok) return null;
      const registry = await res.json();
      const mapping = registry.data?.accounts?.[key];
      return mapping?.vaultId || null;
    } catch (err) {
      console.warn('Cloud Registry lookup offline:', err);
      return null;
    }
  }

  // 2. Pair Device using 6-Digit Sync Code (e.g. UH-8492)
  public static async pairDeviceWithSyncCode(code: string): Promise<{ agency: Agency; user?: any } | null> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await fetch(`${CLOUD_API_BASE}/${MASTER_REGISTRY_ID}`);
      if (!res.ok) return null;
      const registry = await res.json();
      const mappedVault = registry.data?.codes?.[cleanCode];

      if (mappedVault && mappedVault.vaultId) {
        const workspaceData = await this.pullWorkspace(mappedVault.vaultId);
        if (workspaceData) {
          this.setSyncCode(cleanCode);
          return workspaceData;
        }
      }
    } catch (err) {
      console.warn('Pairing lookup error:', err);
    }
    return null;
  }

  // 3. Fetch full Agency Workspace JSON from Cloud Vault
  public static async pullWorkspace(vaultId: string): Promise<{ agency: Agency; user?: any } | null> {
    try {
      const res = await fetch(`${CLOUD_API_BASE}/${vaultId}`);
      if (!res.ok) return null;
      const vault = await res.json();
      if (vault && vault.data && vault.data.agency) {
        this.setVaultId(vaultId);
        saveAgencyData(vault.data.agency);
        return vault.data;
      }
    } catch (err) {
      console.warn('Cloud Vault pull offline:', err);
    }
    return null;
  }

  // 4. Create or Push Agency Workspace JSON to Cloud Vault
  public static async pushWorkspace(email: string, user: any, agency: Agency): Promise<string | null> {
    const key = hashAccountEmail(email);
    const syncCode = this.getSyncCode();
    let currentVaultId = this.getVaultId();

    try {
      if (!currentVaultId) {
        currentVaultId = await this.findVaultForAccount(email);
      }

      if (currentVaultId) {
        // UPDATE EXISTING VAULT
        await fetch(`${CLOUD_API_BASE}/${currentVaultId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: key,
            data: { email, user, agency, syncCode, updatedAt: new Date().toISOString() }
          })
        });
      } else {
        // CREATE NEW VAULT
        const createRes = await fetch(CLOUD_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: key,
            data: { email, user, agency, syncCode, createdAt: new Date().toISOString() }
          })
        }).then(r => r.json());

        if (createRes && createRes.id) {
          currentVaultId = createRes.id;
          this.setVaultId(currentVaultId);
        }
      }

      // ALWAYS REGISTER EMAIL AND SYNC CODE IN MASTER REGISTRY!
      if (currentVaultId) {
        try {
          const regRes = await fetch(`${CLOUD_API_BASE}/${MASTER_REGISTRY_ID}`).then(r => r.json());
          const accounts = {
            ...(regRes.data?.accounts || {}),
            [key]: {
              vaultId: currentVaultId,
              email,
              syncCode,
              updatedAt: new Date().toISOString()
            }
          };
          const codes = {
            ...(regRes.data?.codes || {}),
            [syncCode]: {
              vaultId: currentVaultId,
              email,
              updatedAt: new Date().toISOString()
            }
          };

          await fetch(`${CLOUD_API_BASE}/${MASTER_REGISTRY_ID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              name: 'creatorops_master_registry_v1',
              data: { accounts, codes }
            })
          });
        } catch (regErr) {
          console.warn('Master registry update note:', regErr);
        }
      }

      return currentVaultId;
    } catch (err) {
      console.warn('Cloud Vault push failed:', err);
      return currentVaultId;
    }
  }
}
