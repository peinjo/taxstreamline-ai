
/**
 * Utility for secure client-side storage with encryption
 */

// Simple encryption using AES from the Web Crypto API
export const secureStorage = {
  // Generate a random encryption key
  generateKey: async (): Promise<CryptoKey> => {
    return await window.crypto.subtle.generateKey(
      {
        name: "AES-GCM",
        length: 256,
      },
      true,
      ["encrypt", "decrypt"]
    );
  },

  // Convert CryptoKey to string for storage
  exportKey: async (key: CryptoKey): Promise<string> => {
    const exported = await window.crypto.subtle.exportKey("raw", key);
    return Buffer.from(exported).toString('base64');
  },

  // Convert string back to CryptoKey
  importKey: async (keyStr: string): Promise<CryptoKey> => {
    const keyData = Buffer.from(keyStr, 'base64');
    return await window.crypto.subtle.importKey(
      "raw",
      keyData,
      {
        name: "AES-GCM",
        length: 256,
      },
      false,
      ["encrypt", "decrypt"]
    );
  },

  // Encrypt data
  encrypt: async (data: any, key: CryptoKey): Promise<string> => {
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encodedData = new TextEncoder().encode(JSON.stringify(data));
    
    const encryptedData = await window.crypto.subtle.encrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      encodedData
    );

    // Combine IV and encrypted data for storage
    const combined = new Uint8Array(iv.length + encryptedData.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encryptedData), iv.length);
    
    return Buffer.from(combined).toString('base64');
  },

  // Decrypt data
  decrypt: async (encryptedStr: string, key: CryptoKey): Promise<any> => {
    const encryptedData = Buffer.from(encryptedStr, 'base64');
    const iv = encryptedData.slice(0, 12);
    const data = encryptedData.slice(12);

    const decrypted = await window.crypto.subtle.decrypt(
      {
        name: "AES-GCM",
        iv,
      },
      key,
      data
    );

    return JSON.parse(new TextDecoder().decode(decrypted));
  },

  // Store encrypted data in localStorage
  setItem: async (key: string, data: any): Promise<void> => {
    try {
      // For simplicity, we'll use a fixed key derivation here
      // In production, you'd want a proper key management system
      const masterKeyStr = localStorage.getItem('__secure_master_key');
      let masterKey: CryptoKey;
      
      if (!masterKeyStr) {
        masterKey = await secureStorage.generateKey();
        localStorage.setItem('__secure_master_key', await secureStorage.exportKey(masterKey));
      } else {
        masterKey = await secureStorage.importKey(masterKeyStr);
      }
      
      const encryptedData = await secureStorage.encrypt(data, masterKey);
      localStorage.setItem(key, encryptedData);
    } catch (error) {
      console.error('Encryption failed:', error);
      // Fallback to unencrypted storage if encryption fails
      localStorage.setItem(key, JSON.stringify(data));
    }
  },

  // Retrieve and decrypt data from localStorage
  getItem: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const encryptedData = localStorage.getItem(key);
      if (!encryptedData) return defaultValue;
      
      const masterKeyStr = localStorage.getItem('__secure_master_key');
      if (!masterKeyStr) return defaultValue;
      
      const masterKey = await secureStorage.importKey(masterKeyStr);
      return await secureStorage.decrypt(encryptedData, masterKey);
    } catch (error) {
      console.error('Decryption failed:', error);
      // Try to retrieve unencrypted data as fallback
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : defaultValue;
    }
  },

  // Remove item from localStorage
  removeItem: (key: string): void => {
    localStorage.removeItem(key);
  },

  // Clear all items from localStorage
  clear: (): void => {
    localStorage.clear();
  }
};
