/**
 * Local Hobby Storage
 * 
 * Handles saving and loading hobbies locally without authentication.
 * Uses localStorage (web) or AsyncStorage (mobile) for persistence.
 * 
 * Used for Phase 1: Discovery-First MVP (no auth required)
 */

import { StorageInterface } from '../types';

const STORAGE_KEYS = {
  SAVED_HOBBIES: 'hobihobby_saved_hobbies',
  SAVED_AT: 'hobihobby_saved_at',
} as const;

export interface LocalSavedHobbies {
  savedIds: string[];
  savedAt: Record<string, string>; // ISO date strings
}

/**
 * Local Hobby Storage Service
 * 
 * Manages locally saved hobbies without requiring user authentication.
 */
export class LocalHobbyStorage {
  private storage: StorageInterface;

  constructor(storage: StorageInterface) {
    this.storage = storage;
  }

  /**
   * Get all saved hobby IDs
   */
  async getSavedHobbyIds(): Promise<string[]> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.SAVED_HOBBIES);
      if (!data) return [];
      const parsed: LocalSavedHobbies = JSON.parse(data);
      return parsed.savedIds || [];
    } catch (error) {
      console.error('Error getting saved hobbies:', error);
      return [];
    }
  }

  /**
   * Get the full saved hobbies data including timestamps
   */
  async getSavedHobbiesData(): Promise<LocalSavedHobbies> {
    try {
      const data = await this.storage.getItem(STORAGE_KEYS.SAVED_HOBBIES);
      if (!data) return { savedIds: [], savedAt: {} };
      return JSON.parse(data);
    } catch (error) {
      console.error('Error getting saved hobbies data:', error);
      return { savedIds: [], savedAt: {} };
    }
  }

  /**
   * Check if a hobby is saved
   */
  async isHobbySaved(hobbyId: string): Promise<boolean> {
    const savedIds = await this.getSavedHobbyIds();
    return savedIds.includes(hobbyId);
  }

  /**
   * Save a hobby locally
   */
  async saveHobby(hobbyId: string): Promise<void> {
    try {
      const data = await this.getSavedHobbiesData();
      
      if (!data.savedIds.includes(hobbyId)) {
        data.savedIds.push(hobbyId);
        data.savedAt[hobbyId] = new Date().toISOString();
        await this.storage.setItem(STORAGE_KEYS.SAVED_HOBBIES, JSON.stringify(data));
      }
    } catch (error) {
      console.error('Error saving hobby:', error);
      throw error;
    }
  }

  /**
   * Remove a saved hobby
   */
  async unsaveHobby(hobbyId: string): Promise<void> {
    try {
      const data = await this.getSavedHobbiesData();
      
      data.savedIds = data.savedIds.filter(id => id !== hobbyId);
      delete data.savedAt[hobbyId];
      
      await this.storage.setItem(STORAGE_KEYS.SAVED_HOBBIES, JSON.stringify(data));
    } catch (error) {
      console.error('Error unsaving hobby:', error);
      throw error;
    }
  }

  /**
   * Toggle hobby saved state
   * Returns the new saved state
   */
  async toggleSaveHobby(hobbyId: string): Promise<boolean> {
    const isSaved = await this.isHobbySaved(hobbyId);
    
    if (isSaved) {
      await this.unsaveHobby(hobbyId);
      return false;
    } else {
      await this.saveHobby(hobbyId);
      return true;
    }
  }

  /**
   * Clear all saved hobbies
   */
  async clearAllSaved(): Promise<void> {
    try {
      await this.storage.removeItem(STORAGE_KEYS.SAVED_HOBBIES);
    } catch (error) {
      console.error('Error clearing saved hobbies:', error);
      throw error;
    }
  }

  /**
   * Get count of saved hobbies
   */
  async getSavedCount(): Promise<number> {
    const savedIds = await this.getSavedHobbyIds();
    return savedIds.length;
  }
}

// Default storage key for saved hobbies
export { STORAGE_KEYS };


