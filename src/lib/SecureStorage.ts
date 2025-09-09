import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

const ENCRYPTION_KEY = 'civix-secure-key-2024';
const SECURE_PREFIX = 'secure_';
const LEGACY_KEYS = ['user_preferences', 'auth_token', 'session_data', 'user_settings'];

class EnhancedSecureStorage {
  private encrypt(data: string): string {
    return CryptoJS.AES.encrypt(data, ENCRYPTION_KEY).toString();
  }

  private decrypt(encryptedData: string): string {
    const bytes = CryptoJS.AES.decrypt(encryptedData, ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
  }

  private addIntegrityCheck(data: string): string {
    const hash = CryptoJS.SHA256(data).toString();
    return JSON.stringify({ data, hash });
  }

  private verifyIntegrity(payload: string): string | null {
    try {
      const { data, hash } = JSON.parse(payload);
      const expectedHash = CryptoJS.SHA256(data).toString();
      return hash === expectedHash ? data : null;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: any): Promise<boolean> {
    try {
      const stringValue = JSON.stringify(value);
      const dataWithIntegrity = this.addIntegrityCheck(stringValue);
      const encryptedValue = this.encrypt(dataWithIntegrity);
      localStorage.setItem(`${SECURE_PREFIX}${key}`, encryptedValue);
      
      // Remove any legacy unencrypted version
      localStorage.removeItem(key);
      return true;
    } catch (error) {
      console.error('Failed to store secure data:', error);
      return false;
    }
  }

  async getItem(key: string): Promise<any> {
    try {
      // First try to get secure encrypted version
      const encryptedValue = localStorage.getItem(`${SECURE_PREFIX}${key}`);
      if (encryptedValue) {
        const decryptedPayload = this.decrypt(encryptedValue);
        const data = this.verifyIntegrity(decryptedPayload);
        return data ? JSON.parse(data) : null;
      }

      // Check for legacy unencrypted data and migrate if found
      const legacyValue = localStorage.getItem(key);
      if (legacyValue && LEGACY_KEYS.includes(key)) {
        console.warn(`Migrating legacy unencrypted data for key: ${key}`);
        const parsedValue = JSON.parse(legacyValue);
        await this.setItem(key, parsedValue); // This will encrypt and move it
        return parsedValue;
      }

      return null;
    } catch (error) {
      console.error('Failed to retrieve secure data:', error);
      return null;
    }
  }

  async removeItem(key: string): Promise<boolean> {
    try {
      localStorage.removeItem(`${SECURE_PREFIX}${key}`);
      localStorage.removeItem(key); // Also remove any legacy version
      return true;
    } catch {
      return false;
    }
  }

  async clear(): Promise<boolean> {
    try {
      Object.keys(localStorage).forEach(key => {
        if (key.startsWith(SECURE_PREFIX)) {
          localStorage.removeItem(key);
        }
      });
      return true;
    } catch {
      return false;
    }
  }

  // Security enhancement: Detect and migrate all legacy data
  migrateLegacyData(): { migrated: number; errors: number } {
    let migrated = 0;
    let errors = 0;

    LEGACY_KEYS.forEach(key => {
      try {
        const legacyValue = localStorage.getItem(key);
        if (legacyValue && !localStorage.getItem(`${SECURE_PREFIX}${key}`)) {
          const parsedValue = JSON.parse(legacyValue);
          this.setItem(key, parsedValue);
          migrated++;
          console.log(`Migrated legacy data for: ${key}`);
        }
      } catch (error) {
        errors++;
        console.error(`Failed to migrate legacy data for ${key}:`, error);
      }
    });

    return { migrated, errors };
  }

  // Security check: Scan for unencrypted sensitive data
  scanForUnencryptedData(): string[] {
    const unencryptedKeys: string[] = [];
    
    Object.keys(localStorage).forEach(key => {
      if (!key.startsWith(SECURE_PREFIX) && LEGACY_KEYS.includes(key)) {
        unencryptedKeys.push(key);
      }
    });

    return unencryptedKeys;
  }
}

export const secureStorage = new EnhancedSecureStorage();