import type { Agency } from '../types/creatorops';
import { saveAgencyData } from './store';

const CLOUD_API_BASE = 'https://api.restful-api.dev/objects';
const MASTER_REGISTRY_ID = 'ff808181a04ccf2d01a05175cce2146b';

export function hashAccountEmail(email: string): string {
  let hash = 0;
  const clean = email.trim().toLowerCase();
  for (let i = 0; i < clean.length; i++) {
    hash = ((hash << 5) - hash) + clean.charCodeAt(i);
    hash |= 0;
  }
  return 'cops_acct_' + Math.abs(hash).toString(36);
}

export class CloudSyncEngine {
  private static activeVaultId: string | null = localStorage.getItem('creatorops_cloud_vault_id');

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

  // 2. Fetch full Agency Workspace JSON from Cloud Vault
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

  // 3. Create or Push Agency Workspace JSON to Cloud Vault
  public static async pushWorkspace(email: string, user: any, agency: Agency): Promise<string | null> {
    const key = hashAccountEmail(email);
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
            data: { email, user, agency, updatedAt: new Date().toISOString() }
          })
        });
      } else {
        // CREATE NEW VAULT
        const createRes = await fetch(CLOUD_API_BASE, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: key,
            data: { email, user, agency, createdAt: new Date().toISOString() }
          })
        }).then(r => r.json());

        if (createRes && createRes.id) {
          currentVaultId = createRes.id;
          this.setVaultId(currentVaultId);

          // Register in Master Registry
          const regRes = await fetch(`${CLOUD_API_BASE}/${MASTER_REGISTRY_ID}`).then(r => r.json());
          const accounts = {
            ...(regRes.data?.accounts || {}),
            [key]: {
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
              data: { accounts }
            })
          });
        }
      }
      return currentVaultId;
    } catch (err) {
      console.warn('Cloud Vault push failed:', err);
      return currentVaultId;
    }
  }
}
