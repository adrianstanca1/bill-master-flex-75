import CryptoJS from 'crypto-js';
import { supabase } from '@/integrations/supabase/client';

class SimpleSecureStorage {
  private getEncryptionKey(): string {
    return CryptoJS.SHA256('secure_storage_key').toString();
  }

  async getItem(key: string) {
    try {
      // For now, use encrypted localStorage until secure storage functions are available
      const item = localStorage.getItem(`secure_${key}`);
      if (!item) return null;

      const encryptionKey = this.getEncryptionKey();
      const decrypted = CryptoJS.AES.decrypt(item, encryptionKey).toString(CryptoJS.enc.Utf8);
      return decrypted ? JSON.parse(decrypted) : null;
    } catch {
      return null;
    }
  }

  async setItem(key: string, value: any) {
    try {
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