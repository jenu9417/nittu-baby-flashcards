import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFlashcardStore = create((set) => ({
  delay: 1500,
  fontSize: 160,
  fontColor: '#ffffff',
  fontFamily: 'System',
  backgroundColor: '#000000',
  currentPlaylist: [],
  
  setPlaylist: (cards) => set({ currentPlaylist: Array.isArray(cards) ? cards : [] }),

  updateSettings: async (settings) => {
    try {
      if (typeof settings === 'object') {
        set(settings);
        await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
      }
    } catch (err) {
      console.error('Error updating settings:', err);
    }
  },

  loadSettings: async () => {
    try {
      const raw = await AsyncStorage.getItem('userSettings');
      if (raw) {
        const parsed = JSON.parse(raw);
        if (typeof parsed === 'object') {
          set(parsed);
        }
      }
    } catch (err) {
      console.error('Error loading user settings:', err);
    }
  },
}));