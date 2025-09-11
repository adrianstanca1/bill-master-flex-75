import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

const SECURE_PREFIX = 'secure_';
const LEGACY_KEYS = ['user_preferences', 'auth_token', 'session_data', 'user_settings'];

class EnhancedSecureStorage {
  private async getEncryptionKey(): Promise<string> {
    try {
      // Try to get user-specific key from Supabase function
      const { data, error } = await supabase.rpc('get_user_encryption_key');
      if (!error && data) {
        return data;
      }
    } catch (error) {
      console.warn('Failed to get user encryption key, using fallback:', error);
    }
    
    // Fallback: Generate session-based key
    const sessionKey = this.generateSessionKey();
    return sessionKey;
  }

  private generateSessionKey(): string {
    // Generate a key based on session data and browser fingerprint
    const sessionData = localStorage.getItem('supabase.auth.token') || 'no-session';
    const browserFingerprint = `${navigator.userAgent}-${screen.width}-${screen.height}-${new Date().getTimezoneOffset()}`;
    const combinedData = `${sessionData}-${browserFingerprint}-civix-secure-2024`;
    
    return CryptoJS.SHA256(combinedData).toString();
  }

  private async encrypt(data: string): Promise<string> {
    const key = await this.getEncryptionKey();
    return CryptoJS.AES.encrypt(data, key).toString();
  }

  private async decrypt(encryptedData: string): Promise<string> {
    const key = await this.getEncryptionKey();
    const bytes = CryptoJS.AES.decrypt(encryptedData, key);
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
      const encryptedValue = await this.encrypt(dataWithIntegrity);
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
        const decryptedPayload = await this.decrypt(encryptedValue);
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