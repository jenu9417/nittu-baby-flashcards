import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, Pressable, StyleSheet, FlatList, Modal, ToastAndroid,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Picker } from '@react-native-picker/picker';
import { useRoute, useNavigation } from '@react-navigation/native';

const MAX_SLIDES = 30;

const colorOptions = [
  { name: 'Black', value: '#000000' },
  { name: 'White', value: '#ffffff' },
  { name: 'Red', value: '#ff0000' },
  { name: 'Green', value: '#00ff00' },
  { name: 'Blue', value: '#0000ff' },
  { name: 'Yellow', value: '#ffff00' },
  { name: 'Orange', value: '#ffa500' },
  { name: 'Purple', value: '#800080' },
  { name: 'Pink', value: '#ffc0cb' },
  { name: 'Gray', value: '#808080' },
];

export default function CustomPlaylistScreen() {
  const route = useRoute();
  const navigation = useNavigation();
  const editIndex = route.params?.editIndex;
  const playlistData = route.params?.playlistData;

  const [playlistName, setPlaylistName] = useState(playlistData?.name || '');
  const [autoplayDelay, setAutoplayDelay] = useState(String(playlistData?.delay || '3000'));
  const [slides, setSlides] = useState(playlistData?.slides || []);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSlide, setNewSlide] = useState({
    text: '', fontSize: 120, fontColor: '#ffffff', backgroundColor: '#000000', fontFamily: 'System'
  });

  const handleSavePlaylist = async () => {
    if (!playlistName.trim()) {
      ToastAndroid.show("Playlist name is required.", ToastAndroid.SHORT);
      return;
    }
    const existing = await AsyncStorage.getItem('customPlaylists');
    const parsed = existing ? JSON.parse(existing) : [];
    const newEntry = {
      name: playlistName,
      slides,
      delay: parseInt(autoplayDelay) || 3000
    };
    if (editIndex !== undefined) {
      parsed[editIndex] = newEntry;
    } else {
      parsed.push(newEntry);
    }
    await AsyncStorage.setItem('customPlaylists', JSON.stringify(parsed));
    navigation.goBack();
  };

  const handleAddSlide = () => {
    if (slides.length >= MAX_SLIDES) {
      ToastAndroid.show("Maximum of 30 slides reached.", ToastAndroid.SHORT);
      return;
    }
    if (!newSlide.text.trim()) {
      ToastAndroid.show("Slide text is required.", ToastAndroid.SHORT);
      return;
    }
    setSlides([...slides, newSlide]);
    setNewSlide({
      text: '', fontSize: 120, fontColor: '#ffffff', backgroundColor: '#000000', fontFamily: 'System'
    });
    setModalVisible(false);
  };

  const handleDeleteSlide = (index) => {
    const updated = [...slides];
    updated.splice(index, 1);
    setSlides(updated);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Custom Playlist</Text>

      <TextInput
        style={styles.input}
        value={playlistName}
        onChangeText={setPlaylistName}
        placeholder="Playlist Name"
      />

      <TextInput
        style={styles.input}
        value={autoplayDelay}
        onChangeText={setAutoplayDelay}
        placeholder="Autoplay Delay (ms)"
        keyboardType="numeric"
      />

      <Pressable
        style={[styles.button, slides.length >= MAX_SLIDES && { backgroundColor: '#999' }]}
        onPress={() => {
          if (slides.length < MAX_SLIDES) setModalVisible(true);
          else ToastAndroid.show("Maximum of 30 slides reached.", ToastAndroid.SHORT);
        }}
        disabled={slides.length >= MAX_SLIDES}
      >
        <Text style={styles.buttonText}>Add Slide</Text>
      </Pressable>

      <FlatList
        data={slides}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View style={[styles.previewItem, { backgroundColor: item.backgroundColor || '#eee' }]}>
            <Text style={{ color: item.fontColor || '#000', fontSize: item.fontSize || 20 }}>{item.text}</Text>
            <Pressable onPress={() => handleDeleteSlide(index)}>
              <Text style={{ fontSize: 16, color: 'red' }}>🗑️</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={[styles.button, { backgroundColor: 'green' }]} onPress={handleSavePlaylist}>
        <Text style={styles.buttonText}>Save Playlist</Text>
      </Pressable>

      <Modal visible={modalVisible} animationType="slide">
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>New Slide</Text>

          <TextInput
            style={styles.input}
            placeholder="Slide Text"
            value={newSlide.text}
            onChangeText={(text) => setNewSlide({ ...newSlide, text })}
          />

          <TextInput
            style={styles.input}
            placeholder="Font Size"
            keyboardType="numeric"
            value={String(newSlide.fontSize)}
            onChangeText={(text) => setNewSlide({ ...newSlide, fontSize: parseInt(text) || 0 })}
          />

          <Text style={styles.label}>Font Color</Text>
          <View style={styles.swatchRow}>
            {colorOptions.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.swatch, {
                  backgroundColor: opt.value,
                  borderColor: newSlide.fontColor === opt.value ? '#000' : 'transparent'
                }]}
                onPress={() => setNewSlide({ ...newSlide, fontColor: opt.value })}
              />
            ))}
          </View>

          <Text style={styles.label}>Background Color</Text>
          <View style={styles.swatchRow}>
            {colorOptions.map((opt) => (
              <Pressable
                key={opt.value}
                style={[styles.swatch, {
                  backgroundColor: opt.value,
                  borderColor: newSlide.backgroundColor === opt.value ? '#000' : 'transparent'
                }]}
                onPress={() => setNewSlide({ ...newSlide, backgroundColor: opt.value })}
              />
            ))}
          </View>

          <Text style={styles.label}>Font Style</Text>
          <Picker
            selectedValue={newSlide.fontFamily}
            onValueChange={(val) => setNewSlide({ ...newSlide, fontFamily: val })}>
            <Picker.Item label="System" value="System" />
            <Picker.Item label="Courier" value="Courier" />
            <Picker.Item label="Georgia" value="Georgia" />
            <Picker.Item label="Times New Roman" value="Times New Roman" />
            <Picker.Item label="Verdana" value="Verdana" />
          </Picker>

          <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
            <Pressable style={styles.button} onPress={handleAddSlide}>
              <Text style={styles.buttonText}>Save</Text>
            </Pressable>
            <Pressable style={[styles.button, { backgroundColor: 'gray' }]} onPress={() => setModalVisible(false)}>
              <Text style={styles.buttonText}>Cancel</Text>
            </Pressable>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 12 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
    paddingHorizontal: 10,
    height: 45,
  },
  label: { marginBottom: 4, fontWeight: 'bold' },
  button: {
    backgroundColor: '#000',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 12
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  previewItem: {
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  modalContent: {
    flex: 1,
    padding: 20,
    paddingTop: 60,
    backgroundColor: '#fff'
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 12
  },
  swatchRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  swatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    margin: 6,
    borderWidth: 2,
  },
});