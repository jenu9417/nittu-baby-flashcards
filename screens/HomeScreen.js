import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, FlatList, Alert, ToastAndroid, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useFocusEffect } from '@react-navigation/native';

const builtInPlaylists = [
  { id: 'alphabet', title: 'A–Z' },
  { id: 'numbers', title: '0–9' },
  { id: 'animals', title: 'Animals 🐾' },
];

const MAX_CUSTOM_PLAYLISTS = 10;
const MAX_LIST_HEIGHT = Dimensions.get('window').height * 0.36;

export default function HomeScreen({ navigation }) {
  const [customPlaylists, setCustomPlaylists] = useState([]);

  useFocusEffect(
    React.useCallback(() => {
      (async () => {
        try {
          const stored = await AsyncStorage.getItem('customPlaylists');
          const parsed = stored ? JSON.parse(stored) : [];
          setCustomPlaylists(Array.isArray(parsed) ? parsed : []);
        } catch (e) {
          console.error('Failed to load playlists:', e);
          setCustomPlaylists([]);
        }
      })();
    }, [])
  );

  const handleDelete = async (idx) => {
    try {
      const existing = await AsyncStorage.getItem('customPlaylists');
      if (!existing) return;
      const parsed = JSON.parse(existing);
      if (!Array.isArray(parsed)) return;

      parsed.splice(idx, 1);
      await AsyncStorage.setItem('customPlaylists', JSON.stringify(parsed));
      setCustomPlaylists(parsed);
    } catch (e) {
      Alert.alert('Error', 'Could not delete playlist.');
    }
  };

  const isAtLimit = customPlaylists.length >= MAX_CUSTOM_PLAYLISTS;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: 'white' }}>
      <View style={styles.container}>
        <View style={styles.textContainer}>
          <Text style={styles.title}>Nittu - Baby Flashcards</Text>
        </View>

        <Text style={styles.sectionHeader}>Default Playlists</Text>
        {builtInPlaylists.map((item) => (
          <Pressable
            key={item.id}
            style={styles.card}
            onPress={() => navigation.navigate('Flashcard', { playlistId: item.id })}
          >
            <Text style={styles.cardText}>{item.title}</Text>
          </Pressable>
        ))}

        <Text style={styles.sectionHeader}>Custom Playlists</Text>
        <FlatList
          data={customPlaylists}
          keyExtractor={(_, idx) => idx.toString()}
          style={{ maxHeight: MAX_LIST_HEIGHT }}
          renderItem={({ item: pl, index: idx }) => (
            <View key={idx} style={styles.cardWithActions}>
              <Pressable
                style={[styles.card, styles.customCard]}
                onPress={() =>
                  navigation.navigate('Flashcard', {
                    playlistId: `custom-${idx}`,
                    custom: Array.isArray(pl.slides) ? pl.slides : [],
                  })
                }
              >
                <Text style={styles.cardText}>{pl.name}</Text>
                <View style={styles.iconRow}>
                  <Pressable
                    onPress={() =>
                      navigation.navigate('CustomPlaylist', { editIndex: idx, playlistData: pl })
                    }
                  >
                    <Text style={styles.iconText}>✏️</Text>
                  </Pressable>
                  <Pressable onPress={() => handleDelete(idx)}>
                    <Text style={[styles.iconText, { marginLeft: 10 }]}>🗑️</Text>
                  </Pressable>
                </View>
              </Pressable>
            </View>
          )}
        />

        <Pressable
          style={[
            styles.card,
            styles.customButton,
            isAtLimit && { backgroundColor: '#999' },
          ]}
          onPress={() => {
            if (isAtLimit) {
              ToastAndroid.show('Maximum of 10 custom playlists can be created.', ToastAndroid.SHORT);
            } else {
              navigation.navigate('CustomPlaylist');
            }
          }}
        >
          <Text style={styles.cardText}>+ Create Custom Playlist</Text>
        </Pressable>

        <Pressable style={[styles.card, styles.customButton]} onPress={() => navigation.navigate('Settings')}>
          <Text style={styles.cardText}>⚙ Settings</Text>
        </Pressable>

        <View style={styles.footer}>
          <Text style={styles.footerText}>Created with ❤️ by Jenu</Text>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    padding: 20, 
    paddingBottom: 40,
    backgroundColor: '#fff',
    justifyContent: 'space-between',
  },
  title: {
    fontSize: 30,
    fontWeight: 'bold',
    fontFamily: 'Roboto',
    fontStyle: 'Italic',
    marginBottom: 5
  },
  card: {
    padding: 20,
    borderRadius: 10,
    backgroundColor: '#000',
    marginVertical: 5,
  },
  textContainer: {
    borderWidth: 2,
    borderColor: 'black',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10
  },
  customCard: { backgroundColor: '#444' },
  customButton: { backgroundColor: '#000' },
  cardText: { color: '#fff', fontSize: 18 },
  sectionHeader: {
    fontSize: 16,
    fontWeight: 'bold',
    marginTop: 1,
    marginBottom: 1,
    color: '#333',
  },
  cardGroup: {
    marginBottom: 20,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    marginHorizontal: 10,
  },
  smallButton: {
    backgroundColor: '#333',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  smallButtonText: {
    color: 'white',
    fontSize: 14,
  },
  cardWithActions: {
    position: 'relative',
    marginBottom: 1,
  },
  iconRow: {
    position: 'absolute',
    right: 20,
    top: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  iconText: {
    fontSize: 18,
    color: '#fff',
  },
  footer: {
    alignItems: 'center',
    marginTop: 'auto',
    marginTop: 5,
    marginBottom: 1,
  },
  footerText: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
});