import React, { useEffect, useState, useRef } from 'react';
import { View, Text, StyleSheet, Pressable } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useFlashcardStore } from '../store/useFlashcardStore';

export default function FlashcardScreen({ route, navigation }) {
  const { playlistId, custom } = route.params;
  const [index, setIndex] = useState(0);
  const [paused, setPaused] = useState(false);
  const timerRef = useRef(null);

  const {
    setPlaylist,
    currentPlaylist,
    fontSize, fontColor, fontFamily, backgroundColor,
    delay
  } = useFlashcardStore();

  const insets = useSafeAreaInsets();

  const isCustom = !!custom;
  const playlist = isCustom ? custom : currentPlaylist;

  // Load default playlist if not custom
  useEffect(() => {
    if (!isCustom) {
      let cards = [];
      if (playlistId === 'alphabet') {
        cards = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
      } else if (playlistId === 'numbers') {
        cards = Array.from({ length: 10 }, (_, i) => String(i));
      } else if (playlistId === 'animals') {
        cards = ['🐱', '🐶', '🦁', '🐯', '🦆', '🐻', '🐢', '🦒', '🦓'];
      }
      setPlaylist(cards);
    }
  }, []);

  // Autoplay
  useEffect(() => {
    if (!paused && playlist.length > 0) {
      timerRef.current = setTimeout(() => {
        if (index < playlist.length - 1) {
          setIndex(index + 1);
        } else {
          navigation.goBack();
        }
      }, delay);
    }
    return () => clearTimeout(timerRef.current);
  }, [index, paused, playlist]);

  const next = () => {
    setPaused(true);
    if (index < playlist.length - 1) setIndex(index + 1);
    else navigation.goBack();
  };

  const prev = () => {
    setPaused(true);
    if (index > 0) setIndex(index - 1);
  };

  const slide = playlist[index];

  return (
    <View style={[styles.container, { backgroundColor: slide?.backgroundColor || backgroundColor }]}>
      <Pressable onPress={() => navigation.goBack()} style={[styles.closeButton, { top: insets.top + 10 }]}>
        <Text style={styles.closeText}>✕</Text>
      </Pressable>

      {slide ? (
        <Text
          style={{
            color: slide?.fontColor || fontColor,
            fontSize: slide?.fontSize || (playlistId === 'animals' ? 160 : fontSize),
            fontFamily: slide?.fontFamily || fontFamily,
          }}
        >
          {typeof slide === 'string' ? slide : slide?.text || '[No Text]'}
        </Text>
      ) : (
        <Text style={{ color: '#fff' }}>[Slide Missing]</Text>
      )}

      <Pressable style={styles.leftZone} onPress={prev} />
      <Pressable style={styles.rightZone} onPress={next} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  closeButton: {
    position: 'absolute',
    right: 20,
    zIndex: 10,
  },
  closeText: {
    color: '#fff',
    fontSize: 26,
  },
  leftZone: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 5,
  },
  rightZone: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    zIndex: 5,
  },
});