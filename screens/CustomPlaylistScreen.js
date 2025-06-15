import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, Pressable, FlatList, Modal, ToastAndroid
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useRoute } from '@react-navigation/native';
import { Picker } from '@react-native-picker/picker';

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

const MAX_SLIDES = 30;

const isValidHex = (val) => /^#([0-9A-F]{3}){1,2}$/i.test(val);

export default function CustomPlaylistScreen({ navigation }) {
  const [playlistError, setPlaylistError] = useState('');
  const [slideTextError, setSlideTextError] = useState('');
  const route = useRoute();
  const { editIndex, playlistData } = route.params || {};

  const [playlistName, setPlaylistName] = useState('');
  const [autoplayDelay, setAutoplayDelay] = useState('3000');
  const [slides, setSlides] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [newSlide, setNewSlide] = useState({
    text: '',
    fontSize: 120,
    fontColor: '#ffffff',
    backgroundColor: '#000000',
    fontFamily: 'System'
  });

  useEffect(() => {
    if (playlistData) {
      setPlaylistName(playlistData.name);
      setSlides(playlistData.slides);
      if (playlistData.delay) setAutoplayDelay(String(playlistData.delay));
    }
  }, []);

  const savePlaylist = async () => {
    if (!playlistName.trim()) {
      setPlaylistError('Playlist Name is required.');
      return;
    }
    setPlaylistError(''); // clear if valid
  
    try {
      const existing = await AsyncStorage.getItem('customPlaylists');
      let parsed = [];
  
      if (existing) {
        try {
          parsed = JSON.parse(existing);
          if (!Array.isArray(parsed)) {
            parsed = [];
          }
        } catch (parseErr) {
          console.error('JSON parse error:', parseErr);
          parsed = [];
        }
      }
  
      const newEntry = {
        name: playlistName,
        slides: Array.isArray(slides) ? slides : [],
        delay: parseInt(autoplayDelay) || 0,
      };
  
      const updated = [...parsed];
      if (editIndex !== undefined) {
        updated[editIndex] = newEntry;
      } else {
        updated.push(newEntry);
      }
  
      await AsyncStorage.setItem('customPlaylists', JSON.stringify(updated));
      navigation.goBack();
    } catch (err) {
      console.error('Error saving playlist:', err);
    }
  };  

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Create Custom Playlist</Text>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder=""
          style={styles.input}
          value={playlistName}
          onChangeText={setPlaylistName}
        />
        <Text style={styles.watermark}>Playlist Name</Text>
        {playlistError ? <Text style={styles.error}>{playlistError}</Text> : null}
      </View>

      <View style={styles.inputWrapper}>
        <TextInput
          placeholder=""
          style={styles.input}
          value={autoplayDelay}
          onChangeText={setAutoplayDelay}
          keyboardType="numeric"
        />
        <Text style={styles.watermark}>Autoplay Delay (ms)</Text>
      </View>

      <Pressable
        style={[
          styles.button,
          slides.length >= MAX_SLIDES && { backgroundColor: '#999' },
        ]}
        onPress={() => {
          if (slides.length >= MAX_SLIDES) {
            ToastAndroid.show(`Maximum of ${MAX_SLIDES} slides can be added.`, ToastAndroid.SHORT);
          } else {
            setModalVisible(true);
          }
        }}
      >
        <Text style={styles.buttonText}>Add Slide</Text>
      </Pressable>

      <FlatList
        data={slides}
        keyExtractor={(_, i) => i.toString()}
        renderItem={({ item, index }) => (
          <View
            style={StyleSheet.flatten([
              styles.previewItem,
              {
                backgroundColor: item?.backgroundColor || '#000000',
              },
            ])}
          >
            <Text
              style={{
                color: item?.fontColor || '#ffffff',
                fontSize: item?.fontSize || 20,
                fontFamily: item?.fontFamily || 'System',
              }}
            >
              {item.text}
            </Text>
            <Pressable
              style={styles.deleteSlideButton}
              onPress={() => {
                const updatedSlides = [...slides];
                updatedSlides.splice(index, 1);
                setSlides(updatedSlides);
              }}
            >
              <Text style={styles.deleteSlideText}>🗑️</Text>
            </Pressable>
          </View>
        )}
      />

      <Pressable style={[styles.button, { backgroundColor: 'green' }]} onPress={savePlaylist}>
        <Text style={styles.buttonText}>Save Playlist</Text>
      </Pressable>

      {/* Modal for New Slide */}
      <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.title}>New Slide</Text>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder=""
                style={styles.input}
                value={newSlide.text}
                onChangeText={(val) => setNewSlide({ ...newSlide, text: val })}
              />
              <Text style={styles.watermark}>Slide Text</Text>
              {slideTextError ? <Text style={styles.error}>{slideTextError}</Text> : null}
            </View>

            <View style={styles.inputWrapper}>
              <TextInput
                placeholder=""
                style={styles.input}
                keyboardType="numeric"
                value={String(newSlide.fontSize)}
                onChangeText={(val) => setNewSlide({ ...newSlide, fontSize: parseInt(val) || 0 })}
              />
              <Text style={styles.watermark}>Font Size</Text>
            </View>

            <Text style={styles.label}>Font Color</Text>
            <View style={styles.swatchRow}>
              {colorOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    setNewSlide({ ...newSlide, fontColor: opt.value })
                  }
                  style={({ pressed }) => [
                    styles.swatch,
                    {
                      backgroundColor: opt.value,
                      borderColor:
                        newSlide?.fontColor === opt.value ? '#000' : 'transparent',
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={styles.label}>Background Color</Text>
            <View style={styles.swatchRow}>
              {colorOptions.map((opt) => (
                <Pressable
                  key={opt.value}
                  onPress={() =>
                    setNewSlide({ ...newSlide, backgroundColor: opt.value })
                  }
                  style={({ pressed }) => [
                    styles.swatch,
                    {
                      backgroundColor: opt.value,
                      borderColor:
                        newSlide?.backgroundColor === opt.value ? '#000' : 'transparent',
                      opacity: pressed ? 0.6 : 1,
                    },
                  ]}
                />
              ))}
            </View>

            <Text style={styles.label}>Font Style</Text>
            <Picker
              selectedValue={newSlide.fontFamily}
              onValueChange={(val) => setNewSlide({ ...newSlide, fontFamily: val })}
              style={styles.picker}
            >
              <Picker.Item label="System" value="System" />
              <Picker.Item label="Courier" value="Courier" />
              <Picker.Item label="Georgia" value="Georgia" />
              <Picker.Item label="Times New Roman" value="Times New Roman" />
              <Picker.Item label="Verdana" value="Verdana" />
            </Picker>

            <View style={[
              styles.previewCard,
              {
                backgroundColor: isValidHex(newSlide?.backgroundColor)
                  ? newSlide.backgroundColor
                  : '#000',
              }
            ]}>
              <Text
                style={{
                  color: isValidHex(newSlide?.fontColor)
                    ? newSlide.fontColor
                    : '#fff',
                  fontSize: newSlide.fontSize,
                  fontFamily: newSlide.fontFamily,
                }}
              >
                {newSlide.text || 'Preview'}
              </Text>
            </View>

            <View style={styles.modalButtons}>
              <Pressable
                style={[styles.smallButton, { backgroundColor: 'green' }]}
                onPress={() => {
                  if (!newSlide.text.trim()) {
                    setSlideTextError('Slide Text is required.');
                    return;
                  }
                  setSlideTextError('');
                  setSlides([...slides, newSlide]);
                  setNewSlide({
                    text: '',
                    fontSize: 120,
                    fontColor: '#ffffff',
                    backgroundColor: '#000000',
                    fontFamily: 'System'
                  });
                  setModalVisible(false);
                }}
              >
                <Text style={styles.smallButtonText}>Save</Text>
              </Pressable>

              <Pressable
                style={[styles.smallButton, { backgroundColor: 'gray' }]}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.smallButtonText}>Cancel</Text>
              </Pressable>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, paddingVertical: 60, flex: 1 },
  title: { fontSize: 30, fontWeight: 'bold', marginBottom: 20 },
  inputWrapper: {
    position: 'relative',
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    padding: 10,
    borderRadius: 8,
    borderColor: '#ccc',
    height: 45,
  },
  watermark: {
    position: 'absolute',
    right: 12,
    top: 13,
    color: '#aaa',
    fontSize: 13,
  },
  button: {
    backgroundColor: '#000',
    padding: 12,
    alignItems: 'center',
    borderRadius: 8,
    marginBottom: 20,
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  previewItem: {
    padding: 12,
    marginBottom: 10,
    borderRadius: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  deleteSlideButton: {
    position: 'absolute',
    right: 10,
    top: 5,
  },
  deleteSlideText: {
    fontSize: 18,
    color: 'red',
  },
  label: {
    marginBottom: 4,
    marginTop: 12,
    fontWeight: 'bold',
  },
  picker: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 12,
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
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '85%',
    elevation: 4,
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 16,
  },
  smallButton: {
    padding: 10,
    borderRadius: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  smallButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  previewCard: {
    height: 120,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  error: {
    color: 'red',
    fontSize: 13,
    marginBottom: 8,
    paddingLeft: 4,
  },
});