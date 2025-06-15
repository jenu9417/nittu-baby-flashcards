import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Pressable, Dimensions } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';

export default function FlashcardScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const playlistId = route.params?.playlistId || 'alphabet';
  const customSlides = route.params?.custom || null;
  const customDelay = route.params?.customDelay || 3000;

  const [index, setIndex] = useState(0);
  const [slides, setSlides] = useState([]);

  useEffect(() => {
    let cards = [];
    if (customSlides && Array.isArray(customSlides)) {
      cards = customSlides;
    } else if (playlistId === 'alphabet') {
      cards = Array.from({ length: 26 }, (_, i) => String.fromCharCode(65 + i));
    } else if (playlistId === 'numbers') {
      cards = Array.from({ length: 10 }, (_, i) => String(i));
    } else if (playlistId === 'animals') {
      cards = ['🐱', '🐶', '🦁', '🐯', '🦆', '🐻', '🐢', '🦒', '🦓'];
    }
    setSlides(cards);
  }, [playlistId, customSlides]);

  useEffect(() => {
    if (!customSlides && slides.length > 0) {
      const timer = setTimeout(() => {
        setIndex(prev => (prev + 1 < slides.length ? prev + 1 : 0));
      }, customDelay);
      return () => clearTimeout(timer);
    }
  }, [index, slides, customDelay, customSlides]);

  const goBack = () => setIndex(prev => (prev > 0 ? prev - 1 : 0));
  const goForward = () => setIndex(prev => (prev + 1 < slides.length ? prev + 1 : 0));

  const current = slides[index];
  const backgroundColor = current?.backgroundColor || '#000';
  const fontColor = current?.fontColor || '#fff';
  const fontSize = current?.fontSize || 120;
  const fontFamily = current?.fontFamily || 'System';
  const displayText = typeof current === 'string' ? current : current?.text || '?';

  return (
    <View style={[styles.container, { backgroundColor }]}>
      <Pressable style={styles.backButton} onPress={() => navigation.goBack()}>
        <Text style={styles.backText}>✕</Text>
      </Pressable>

      <Pressable
        style={styles.leftArea}
        onPress={goBack}
      />

      <View style={styles.centerArea}>
        <Text style={{ color: fontColor, fontSize, fontFamily }}>{displayText}</Text>
      </View>

      <Pressable
        style={styles.rightArea}
        onPress={goForward}
      />
    </View>
  );
}

const { width } = Dimensions.get('window');

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backButton: {
    position: 'absolute',
    top: 40,
    right: 20,
    zIndex: 10,
  },
  backText: {
    fontSize: 28,
    color: '#fff',
  },
  centerArea: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  leftArea: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: width / 2,
  },
  rightArea: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: width / 2,
  },
});