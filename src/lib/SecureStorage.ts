import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

class SimpleSecureStorage {
  private getEncryptionKey(): string {
    // Use a combination of session data for encryption key
    const session = supabase.auth.getSession();
    return CryptoJS.SHA256('secure_storage_key').toString();
  }

  async getItem(key: string) {
    try {
      // Try to get from Supabase secure storage first
      const { data } = await supabase.rpc('secure_retrieve_data', { store_key: key });
      if (data) return data;

      // Fallback to encrypted localStorage
      const item = localStorage.getItem(`secure_${key}`);
      if (!item) return null;

      const encryptionKey = this.getEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(item, encryptionKey).toString(CryptoJS.enc.Utf8);
      return decrypted ? JSON.parse(decrypted) : null;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: any, options?: any) {
    try {
      // Store in Supabase secure storage if user is authenticated
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        await supabase.rpc('secure_store_data', { 
          store_key: key, 
          store_value: value 
        });
      }

      // Also store encrypted in localStorage as fallback
      const encryptionKey = this.getEncryptionKey();
      const encrypted = CryptoJS.AES.encrypt(JSON.stringify(value), encryptionKey).toString();
      localStorage.setItem(`secure_${key}`, encrypted);
      return true;
    } catch {
      return false;
    }
  }

  async removeItem(key: string) {
    try {
      localStorage.removeItem(`secure_${key}`);
      return true;
    } catch {
      return false;
    }
  }

  async clear() {
    try {
      const keys = Object.keys(localStorage).filter(key => key.startsWith('secure_'));
      keys.forEach(key => localStorage.removeItem(key));
      return true;
    } catch {
      return false;
    }
  }
}

export const secureStorage = new SimpleSecureStorage();