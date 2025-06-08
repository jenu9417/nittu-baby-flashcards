import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

export const useFlashcardStore = create(set => ({
  delay: 3000,
  fontSize: 120,
  fontColor: '#ffffff',
  fontFamily: 'System',
  backgroundColor: '#000000',
  currentPlaylist: [],
  setPlaylist: (cards) => set({ currentPlaylist: cards }),

  updateSettings: async (settings) => {
    set(settings);
    await AsyncStorage.setItem('userSettings', JSON.stringify(settings));
  },

  loadSettings: async () => {
    const raw = await AsyncStorage.getItem('userSettings');
    if (raw) set(JSON.parse(raw));
  }
}));