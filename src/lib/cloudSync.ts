import type { Agency } from '../types/creatorops';
import { saveAgencyData } from './store';

const MASTER_VAULT_UUID = '5e449d0c-cd84-4797-89ec-8bfaa07cc12a';

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

  // 1. Fetch Cloud Vault UUID mapping for an account email
  public static async findVaultForAccount(email: string): Promise<string | null> {
    const key = hashAccountEmail(email);
    try {
      const res = await fetch(`https://webhook.site/${MASTER_VAULT_UUID}`);
      if (!res.ok) return null;
      const master = await res.json();
      return master.accounts?.[key]?.uuid || null;
    } catch (err) {
      console.warn('Cloud Registry lookup offline:', err);
      return null;
    }
  }

  // 2. Pair Device using 6-Digit Sync Code (e.g. UH-8492)
  public static async pairDeviceWithSyncCode(code: string): Promise<{ agency: Agency; user?: any } | null> {
    const cleanCode = code.trim().toUpperCase();
    try {
      const res = await fetch(`https://webhook.site/${MASTER_VAULT_UUID}`);
      if (!res.ok) return null;
      const master = await res.json();
      const mappedVault = master.codes?.[cleanCode];

      if (mappedVault && mappedVault.uuid) {
        const workspaceData = await this.pullWorkspace(mappedVault.uuid);
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
  public static async pullWorkspace(vaultUuid: string): Promise<{ agency: Agency; user?: any } | null> {
    try {
      const res = await fetch(`https://webhook.site/${vaultUuid}`);
      if (!res.ok) return null;
      const vaultData = await res.json();
      if (vaultData && vaultData.agency) {
        this.setVaultUuid(vaultUuid);
        saveAgencyData(vaultData.agency);
        return vaultData;
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
    let currentVaultUuid = this.getVaultUuid();

    try {
      if (!currentVaultUuid) {
        currentVaultUuid = await this.findVaultForAccount(email);
      }

      if (!currentVaultUuid) {
        const tokenRes = await fetch('https://webhook.site/token', { method: 'POST' }).then(r => r.json());
        if (tokenRes && tokenRes.uuid) {
          currentVaultUuid = tokenRes.uuid;
          this.setVaultUuid(currentVaultUuid);
        }
      }

      if (currentVaultUuid) {
        const payload = { email, user, agency, syncCode, updatedAt: new Date().toISOString() };
        await fetch(`https://webhook.site/token/${currentVaultUuid}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            default_content: JSON.stringify(payload),
            default_content_type: 'application/json'
          })
        });

        // ALWAYS REGISTER EMAIL AND SYNC CODE IN MASTER REGISTRY!
        try {
          let masterData: any = {};
          try {
            masterData = await fetch(`https://webhook.site/${MASTER_VAULT_UUID}`).then(r => r.json());
          } catch {}

          const accounts = {
            ...(masterData.accounts || {}),
            [key]: { uuid: currentVaultUuid, email, syncCode, updatedAt: new Date().toISOString() }
          };
          const codes = {
            ...(masterData.codes || {}),
            [syncCode]: { uuid: currentVaultUuid, email, updatedAt: new Date().toISOString() }
          };

          await fetch(`https://webhook.site/token/${MASTER_VAULT_UUID}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              default_content: JSON.stringify({ ...masterData, accounts, codes }),
              default_content_type: 'application/json'
            })
          });
        } catch (regErr) {
          console.warn('Master vault registration note:', regErr);
        }
      }

      return currentVaultUuid;
    } catch (err) {
      console.warn('Cloud Vault push failed:', err);
      return currentVaultUuid;
    }
  }
}
