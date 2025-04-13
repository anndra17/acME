import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, ScrollView, Button, Switch } from 'react-native';
import Checkbox from 'expo-checkbox';
import Modal from './Modal';
import StressLevelPicker from './StressLevelPicker';

import type { SkinCondition } from '../types/Post'; // Dacă ai folder cu tipuri

interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri: string;
  onSubmit: (postData: {
    description: string;
    stressLevel: number;
    skinConditions: SkinCondition[];
    treatmentUsed: string;
    isPublic: boolean;
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
  const [isPublic, setIsPublic] = useState(true);

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
      isPublic,
    });
    // Resetăm doar dacă vrei
    setDescription('');
    setTreatmentUsed('');
    setStressLevel(2);
    setSkinConditions([]);
    setIsPublic(true);
  };

  return (
    <Modal visible={visible} onClose={onClose} title="Complete your post">
      <ScrollView style={{ maxHeight: 450 }}>
        <Image source={{ uri: imageUri }} style={styles.image} />
        
        <Text style={styles.label}>Description</Text> 
        <TextInput
          value={description}
          onChangeText={setDescription}
          style={styles.input}
          placeholder="How do you feel today?"
        />

        <Text style={styles.label}>Treatment used</Text>
        <TextInput
          value={treatmentUsed}
          onChangeText={setTreatmentUsed}
          style={styles.input}
          placeholder="Ex: Epiduo, MaskGel, etc."
        />

        <Text style={styles.label}>Stress Level</Text>
        <StressLevelPicker value={stressLevel} onChange={setStressLevel} />


        <Text style={styles.label}>Skin conditions</Text>
        {SKIN_OPTIONS.map((condition) => (
          <View key={condition} style={styles.checkboxRow}>
            <Checkbox
              value={skinConditions.includes(condition)}
              onValueChange={() => toggleCondition(condition)}
              color={skinConditions.includes(condition) ? '#27ae60' : undefined}
            />
            <Text style={styles.checkboxLabel}>{condition}</Text>
          </View>
        ))}

        

        <Button title="Post" onPress={handleSubmit} />
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
    backgroundColor: '#f1f1f1',
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
