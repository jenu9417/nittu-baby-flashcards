import React, { useEffect, useState } from 'react';
import { View, Text, Pressable, FlatList, StyleSheet, Alert, ToastAndroid } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';

const builtInPlaylists = [
  { id: 'alphabet', title: 'A–Z' },
  { id: 'numbers', title: '0–9' },
  { id: 'animals', title: 'Animals 🐾' },
];

const MAX_CUSTOM_PLAYLISTS = 10;

export default function HomeScreen() {
  const [customPlaylists, setCustomPlaylists] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    const loadPlaylists = async () => {
      try {
        const data = await AsyncStorage.getItem('customPlaylists');
        setCustomPlaylists(data ? JSON.parse(data) : []);
      } catch (err) {
        console.error('Failed to load playlists:', err);
        setCustomPlaylists([]);
      }
    };
    const unsubscribe = navigation.addListener('focus', loadPlaylists);
    return unsubscribe;
  }, [navigation]);

  const deletePlaylist = async (index) => {
    try {
      const updated = [...customPlaylists];
      updated.splice(index, 1);
      setCustomPlaylists(updated);
      await AsyncStorage.setItem('customPlaylists', JSON.stringify(updated));
    } catch (err) {
      Alert.alert('Error', 'Failed to delete playlist.');
    }
  };

  const handleCreate = () => {
    if (customPlaylists.length >= MAX_CUSTOM_PLAYLISTS) {
      ToastAndroid.show("Maximum of 10 custom playlists reached.", ToastAndroid.SHORT);
      return;
    }
    navigation.navigate('CustomPlaylist');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Nittu - Baby Flashcards</Text>

      {builtInPlaylists.map((pl) => (
        <Pressable
          key={pl.id}
          style={styles.playlistButton}
          onPress={() => navigation.navigate('Flashcard', { playlistId: pl.id })}>
          <Text style={styles.buttonText}>{pl.title}</Text>
        </Pressable>
      ))}

      {customPlaylists && customPlaylists.map((pl, idx) => (
        <View key={idx} style={styles.playlistRow}>
          <Pressable
            style={styles.playlistButton}
            onPress={() => navigation.navigate('Flashcard', {
              playlistId: `custom-${idx}`,
              custom: pl.slides,
              customDelay: pl.delay || 3000,
            })}>
            <Text style={styles.buttonText}>{pl.name}</Text>
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => navigation.navigate('CustomPlaylist', {
              editIndex: idx,
              playlistData: pl
            })}>
            <Text>✏️</Text>
          </Pressable>
          <Pressable
            style={styles.iconBtn}
            onPress={() => deletePlaylist(idx)}>
            <Text>🗑️</Text>
          </Pressable>
        </View>
      ))}

      <Pressable
        style={[styles.button, customPlaylists.length >= MAX_CUSTOM_PLAYLISTS && { backgroundColor: '#999' }]}
        onPress={handleCreate}
        disabled={customPlaylists.length >= MAX_CUSTOM_PLAYLISTS}>
        <Text style={styles.buttonText}>+ Custom Playlist</Text>
      </Pressable>

      <Pressable style={[styles.button, { backgroundColor: 'gray' }]} onPress={() => navigation.navigate('Settings')}>
        <Text style={styles.buttonText}>⚙ Settings</Text>
      </Pressable>

      <View style={styles.footer}>
        <Text style={styles.footerText}>Created with ❤️ by Jenu</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20 },
  playlistButton: {
    backgroundColor: '#000',
    padding: 12,
    borderRadius: 10,
    marginBottom: 10,
    flex: 1
  },
  button: {
    backgroundColor: '#000',
    padding: 12,
    alignItems: 'center',
    borderRadius: 10,
    marginTop: 10
  },
  buttonText: { color: '#fff', fontWeight: 'bold', textAlign: 'center' },
  playlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
    gap: 6
  },
  iconBtn: {
    padding: 8,
  },
  footer: {
    marginTop: 'auto',
    alignItems: 'center',
    marginBottom: 10,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
  },
});