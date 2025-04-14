import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, ScrollView, TouchableOpacity, useColorScheme } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import Button from './Button';
import StressLevelPicker from './StressLevelPicker';


import type { SkinCondition } from '../types/Post'; // Dacă ai folder cu tipuri
import { Colors } from '../constants/Colors';

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string;
  onSubmit: (postData: {
    description?: string;
    stressLevel: number;
    skinConditions?: SkinCondition[];
    treatmentUsed?: string;
  }) => void;
}

const SKIN_OPTIONS: SkinCondition[] = [
  'normal',
  'dry',
  'oily',
  'irritated',
  'inflamed',
  'burned',
  'painful',
];

const PostModal: React.FC<PostModalProps> = ({ visible, onClose, imageUri, onSubmit }) => {
  const [description, setDescription] = useState('');
  const [treatmentUsed, setTreatmentUsed] = useState('');
  const [stressLevel, setStressLevel] = useState(2);
  const [skinConditions, setSkinConditions] = useState<SkinCondition[]>([]);

  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];

  const toggleCondition = (condition: SkinCondition) => {
    setSkinConditions((prev) =>
      prev.includes(condition)
        ? prev.filter((c) => c !== condition)
        : [...prev, condition]
    );
  };

  const handleSubmit = () => {
    onSubmit({
      description,
      treatmentUsed,
      stressLevel,
      skinConditions,
    });
    // Resetăm doar dacă vrei
    setDescription('');
    setTreatmentUsed('');
    setStressLevel(2);
    setSkinConditions([]);

    onClose();
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Complete your post">
      
      <ScrollView style={{ maxHeight: 450 }}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        
        <Text style={[styles.label, {color: theme.textPrimary}]}>Description</Text> 
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={[ {backgroundColor: theme.textInputBackground}, styles.input]}
          placeholder="How do you feel today?"
        />

        <Text style={[styles.label, {color: theme.textPrimary}]}>Treatment used</Text>
        <TextInput
          value={treatmentUsed}
          onChangeText={setTreatmentUsed}
          style={[styles.input, {backgroundColor: theme.textInputBackground}]}
          placeholder="Ex: Epiduo, MaskGel, etc."
        />

        <Text style={[styles.label, {color: theme.textPrimary}]}>Stress Level</Text>
        <StressLevelPicker value={stressLevel} onChange={setStressLevel} />


        <Text style={[styles.label, {color: theme.textPrimary}]}>Skin conditions</Text>
        {SKIN_OPTIONS.map((condition) => (
          <View key={condition} style={styles.checkboxRow}>
            <Checkbox
              value={skinConditions.includes(condition)}
              onValueChange={() => toggleCondition(condition)}
              color={skinConditions.includes(condition) ? theme.buttonBackground : undefined}
            />
            <Text style={[styles.checkboxLabel, {color: theme.textPrimary}]}>{condition}</Text>
          </View>
        ))}

        <View style={{ alignItems: 'center', marginTop: 16 }}>  
          <Button
            label="Post"
            type="primary"
            icon="paper-plane"
            onPress={handleSubmit}
            style={{ width: 100, height: 40,  }}
          />
        </View>
      </ScrollView>
    </Modal>
  );
};

const styles = StyleSheet.create({
  
  image: {
    width: '100%',
    height: 200,
    borderRadius: 12,
    marginBottom: 12,
  },
  label: {
    fontWeight: '600',
    marginVertical: 8,
  },
  input: {
    borderRadius: 8,
    padding: 10,
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 12,
  },
});

export default PostModal;
