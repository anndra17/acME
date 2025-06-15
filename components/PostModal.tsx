import React, { useState } from 'react';
import { View, Text, Image, TextInput, StyleSheet, ScrollView, TouchableOpacity, useColorScheme, Dimensions, Platform, KeyboardAvoidingView  } from 'react-native';
import Checkbox from 'expo-checkbox';
import { Ionicons } from '@expo/vector-icons';
import Modal from './Modal';
import Button from './Button';
import StressLevelPicker from './StressLevelPicker';

import type { SkinCondition } from '../types/Post';
import { Colors } from '../constants/Colors';

export interface PostModalProps {
  visible: boolean;
  onClose: () => void;
  imageUri?: string;
  initialValues?: {
    description?: string;
    stressLevel?: number;
    skinConditions?: SkinCondition[];
    treatmentUsed?: string;
  };
  onSubmit: (data: {
    description?: string;
    stressLevel: number;
    skinConditions?: SkinCondition[];
    treatmentUsed?: string;
  }) => Promise<void>;
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

const PostModal: React.FC<PostModalProps> = ({
  visible,
  onClose,
  imageUri,
  initialValues,
  onSubmit,
}) => {
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
    // Reset form fields
    setDescription('');
    setTreatmentUsed('');
    setStressLevel(2);
    setSkinConditions([]);

    onClose();
  };

  return (
    <Modal 
      visible={visible} 
      onClose={onClose} 
      title="Complete your post">
        
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={true}
      >
        {imageUri ? (
          <View style={styles.imageContainer}>
            <Image 
              source={{ uri: imageUri }} 
              style={styles.image} 
              resizeMode="cover"
            />
          </View>
        ) : null}
        
        <View style={styles.formContainer}>
          <Text style={[styles.label, {color: theme.textPrimary}]}>Description</Text> 
          <TextInput
            value={description}
            onChangeText={setDescription}
            style={[styles.input, {backgroundColor: theme.textInputBackground}]}
            placeholder="How do you feel today?"
            placeholderTextColor="#999"
            multiline
          />

          <Text style={[styles.label, {color: theme.textPrimary}]}>Treatment used</Text>
          <TextInput
            value={treatmentUsed}
            onChangeText={setTreatmentUsed}
            style={[styles.input, {backgroundColor: theme.textInputBackground}]}
            placeholder="Ex: Epiduo, MaskGel, etc."
            placeholderTextColor="#999"
          />

          <Text style={[styles.label, {color: theme.textPrimary}]}>Stress Level</Text>
          <StressLevelPicker value={stressLevel} onChange={setStressLevel} />

          <Text style={[styles.label, {color: theme.textPrimary}]}>Skin conditions</Text>
          <View style={styles.checkboxContainer}>
            {SKIN_OPTIONS.map((condition) => (
              <View key={condition} style={styles.checkboxRow}>
                <Checkbox
                  value={skinConditions.includes(condition)}
                  onValueChange={() => toggleCondition(condition)}
                  color={skinConditions.includes(condition) ? theme.buttonBackground : undefined}
                  style={styles.checkbox}
                />
                <Text style={[styles.checkboxLabel, {color: theme.textPrimary}]}>{condition}</Text>
              </View>
            ))}
          </View>

          <View style={styles.buttonContainer}>  
            <Button
              label="Post"
              type="primary"
              icon="paper-plane"
              onPress={handleSubmit}
              style={styles.submitButton}
            />
          </View>
        </View>
      </ScrollView>
    </Modal>
  );
};

const { width, height } = Dimensions.get('window');

const styles = StyleSheet.create({
  scrollView: {
    width: '100%',
    maxHeight: Platform.OS === 'android' ? height * 0.7 : 500,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 20,
  },
  imageContainer: {
    width: '100%',
    alignItems: 'center',
    marginBottom: 12,
  },
  formContainer: {
    width: '100%',
    paddingHorizontal: Platform.OS === 'android' ? 5 : 0,
  },
  image: {
    width: '100%',
    height: 180,
    borderRadius: 12,
  },
  label: {
    fontWeight: '600',
    marginVertical: 8,
  },
  input: {
    borderRadius: 8,
    padding: 10,
    width: '100%',
    minHeight: 40,
  },
  checkboxContainer: {
    width: '100%',
  },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    width: '100%',
  },
  checkbox: {
    marginRight: 8,
  },
  checkboxLabel: {
    marginLeft: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    marginTop: 16,
    width: '100%',
    marginBottom: Platform.OS === 'android' ? 10 : 0,
  },
  submitButton: {
    width: 120,
    height: 44,
  }
});

export default PostModal;