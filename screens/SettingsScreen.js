import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, StyleSheet, Pressable, ToastAndroid } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import { useFlashcardStore } from '../store/useFlashcardStore';

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

export default function SettingsScreen({ navigation }) {
  const {
    delay, fontSize, fontColor, fontFamily, backgroundColor,
    updateSettings, loadSettings
  } = useFlashcardStore();

  const [localSettings, setLocalSettings] = useState({
    delay: delay || 3000,
    fontSize: fontSize || 120,
    fontColor: fontColor || '#ffffff',
    fontFamily: fontFamily || 'System',
    backgroundColor: backgroundColor || '#000000'
  });

  useEffect(() => {
    loadSettings();
  }, []);

  const handleChange = (key, value) => {
    setLocalSettings({ ...localSettings, [key]: value });
  };

  const save = async () => {
    await updateSettings(localSettings);
    ToastAndroid.show("Settings saved", ToastAndroid.SHORT);
    navigation.goBack();
  };

  return (
    <View style={styles.container}>
      <Text style={styles.heading}>Settings</Text>

      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={String(localSettings.delay)}
        onChangeText={text => handleChange('delay', parseInt(text) || 0)}
        placeholder="Autoplay Delay (ms)"
      />

      <TextInput
        keyboardType="numeric"
        style={styles.input}
        value={String(localSettings.fontSize)}
        onChangeText={text => handleChange('fontSize', parseInt(text) || 0)}
        placeholder="Font Size"
      />

      <Text style={styles.label}>Font Color</Text>
      <View style={styles.swatchRow}>
        {colorOptions.map((opt) => (
          <Pressable
            key={opt.value}
            style={[styles.swatch, {
              backgroundColor: opt.value,
              borderColor: localSettings.fontColor === opt.value ? '#000' : 'transparent'
            }]}
            onPress={() => handleChange('fontColor', opt.value)}
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
              borderColor: localSettings.backgroundColor === opt.value ? '#000' : 'transparent'
            }]}
            onPress={() => handleChange('backgroundColor', opt.value)}
          />
        ))}
      </View>

      <Text style={styles.label}>Font Style</Text>
      <Picker
        selectedValue={localSettings.fontFamily}
        onValueChange={(val) => handleChange('fontFamily', val)}
        style={styles.picker}
      >
        <Picker.Item label="System" value="System" />
        <Picker.Item label="Courier" value="Courier" />
        <Picker.Item label="Georgia" value="Georgia" />
        <Picker.Item label="Times New Roman" value="Times New Roman" />
        <Picker.Item label="Verdana" value="Verdana" />
      </Picker>

      <Pressable style={styles.button} onPress={save}>
        <Text style={styles.buttonText}>Save & Go Back</Text>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1, paddingVertical: 60, backgroundColor: '#fff' },
  heading: { fontSize: 30, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 16,
    paddingHorizontal: 10,
    height: 40,
  },
  picker: { marginBottom: 16 },
  button: {
    backgroundColor: 'black',
    padding: 12,
    borderRadius: 10,
    alignItems: 'center'
  },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  label: {
    marginBottom: 4,
    marginTop: 12,
    fontWeight: 'bold',
    paddingLeft: 3,
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