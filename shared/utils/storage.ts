import { StorageInterface } from '../types';

// Web storage implementation
export class WebStorage implements StorageInterface {
  async getItem(key: string): Promise<string | null> {
    if (typeof window === 'undefined') {
      return null;
    }
    return localStorage.getItem(key);
  }

  async setItem(key: string, value: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.setItem(key, value);
  }

  async removeItem(key: string): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    localStorage.removeItem(key);
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    if (typeof window === 'undefined') {
      return keys.map(key => [key, null]);
    }
    return keys.map(key => [key, localStorage.getItem(key)]);
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    keyValuePairs.forEach(([key, value]) => {
      localStorage.setItem(key, value);
    });
  }

  async multiRemove(keys: string[]): Promise<void> {
    if (typeof window === 'undefined') {
      return;
    }
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  }
}

// React Native AsyncStorage adapter
export class AsyncStorageAdapter implements StorageInterface {
  private AsyncStorage: any;

  constructor(AsyncStorage: any) {
    this.AsyncStorage = AsyncStorage;
  }

  async getItem(key: string): Promise<string | null> {
    try {
      return await this.AsyncStorage.getItem(key);
    } catch (error) {
      console.error('AsyncStorage getItem error:', error);
      return null;
    }
  }

  async setItem(key: string, value: string): Promise<void> {
    try {
      await this.AsyncStorage.setItem(key, value);
    } catch (error) {
      console.error('AsyncStorage setItem error:', error);
    }
  }

  async removeItem(key: string): Promise<void> {
    try {
      await this.AsyncStorage.removeItem(key);
    } catch (error) {
      console.error('AsyncStorage removeItem error:', error);
    }
  }

  async multiGet(keys: string[]): Promise<[string, string | null][]> {
    try {
      return await this.AsyncStorage.multiGet(keys);
    } catch (error) {
      console.error('AsyncStorage multiGet error:', error);
      return keys.map(key => [key, null]);
    }
  }

  async multiSet(keyValuePairs: [string, string][]): Promise<void> {
    try {
      await this.AsyncStorage.multiSet(keyValuePairs);
    } catch (error) {
      console.error('AsyncStorage multiSet error:', error);
    }
  }

  async multiRemove(keys: string[]): Promise<void> {
    try {
      await this.AsyncStorage.multiRemove(keys);
    } catch (error) {
      console.error('AsyncStorage multiRemove error:', error);
    }
  }
}