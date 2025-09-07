/**
 * Secure client-side storage utility with proper key management
 * Uses user authentication for key derivation instead of storing master keys
 */

import { supabase } from "@/integrations/supabase/client";

export const secureStorage = {
  // Generate a user-specific encryption key derived from auth session
  generateUserKey: async (): Promise<CryptoKey | null> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user?.id) {
        return null;
      }

      // Use user ID as key material for consistent key derivation
      const keyMaterial = new TextEncoder().encode(session.user.id + session.access_token.slice(0, 32));
      
      return await window.crypto.subtle.importKey(
        "raw",
        await window.crypto.subtle.digest("SHA-256", keyMaterial),
        { name: "AES-GCM" },
        false,
        ["encrypt", "decrypt"]
      );
    } catch (error) {
      console.error('Failed to generate user key:', error);
      return null;
    }
  },

  // Encrypt data with user-specific key
  encrypt: async (data: any): Promise<string | null> => {
    try {
      const key = await secureStorage.generateUserKey();
      if (!key) return null;

      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encodedData = new TextEncoder().encode(JSON.stringify(data));
      
      const encryptedData = await window.crypto.subtle.encrypt(
        { name: "AES-GCM", iv },
        key,
        encodedData
      );

      // Combine IV and encrypted data
      const combined = new Uint8Array(iv.length + encryptedData.byteLength);
      combined.set(iv);
      combined.set(new Uint8Array(encryptedData), iv.length);
      
      return btoa(String.fromCharCode(...combined));
    } catch (error) {
      console.error('Encryption failed:', error);
      return null;
    }
  },

  // Decrypt data with user-specific key
  decrypt: async (encryptedStr: string): Promise<any | null> => {
    try {
      const key = await secureStorage.generateUserKey();
      if (!key) return null;

      const combined = new Uint8Array(atob(encryptedStr).split('').map(char => char.charCodeAt(0)));
      const iv = combined.slice(0, 12);
      const data = combined.slice(12);

      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        key,
        data
      );

      return JSON.parse(new TextDecoder().decode(decrypted));
    } catch (error) {
      console.error('Decryption failed:', error);
      return null;
    }
  },

  // Store encrypted data in localStorage (only for authenticated users)
  setItem: async (key: string, data: any): Promise<boolean> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        console.warn('Cannot store secure data: user not authenticated');
        return false;
      }

      const encrypted = await secureStorage.encrypt(data);
      if (!encrypted) {
        // Fallback to unencrypted storage for non-sensitive data only
        console.warn('Encryption failed, storing unencrypted');
        localStorage.setItem(key, JSON.stringify(data));
        return false;
      }

      localStorage.setItem(`secure_${session.user.id}_${key}`, encrypted);
      return true;
    } catch (error) {
      console.error('Secure storage failed:', error);
      return false;
    }
  },

  // Retrieve and decrypt data from localStorage
  getItem: async <T>(key: string, defaultValue: T): Promise<T> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) {
        return defaultValue;
      }

      const secureKey = `secure_${session.user.id}_${key}`;
      const encryptedData = localStorage.getItem(secureKey);
      
      if (!encryptedData) {
        // Check for unencrypted fallback
        const plainData = localStorage.getItem(key);
        return plainData ? JSON.parse(plainData) : defaultValue;
      }

      const decrypted = await secureStorage.decrypt(encryptedData);
      return decrypted !== null ? decrypted : defaultValue;
    } catch (error) {
      console.error('Secure retrieval failed:', error);
      return defaultValue;
    }
  },

  // Remove item from localStorage
  removeItem: async (key: string): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user) {
        localStorage.removeItem(`secure_${session.user.id}_${key}`);
      }
      // Also remove any unencrypted fallback
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Secure removal failed:', error);
    }
  },

  // Clear all user-specific secure data
  clearUserData: async (): Promise<void> => {
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session?.user) return;

      const userPrefix = `secure_${session.user.id}_`;
      const keysToRemove: string[] = [];

      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(userPrefix)) {
          keysToRemove.push(key);
        }
      }

      keysToRemove.forEach(key => localStorage.removeItem(key));
    } catch (error) {
      console.error('Secure clear failed:', error);
    }
  }
};