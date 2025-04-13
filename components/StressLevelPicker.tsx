import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

interface StressLevelPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const StressLevelPicker: React.FC<StressLevelPickerProps> = ({ value, onChange }) => {
  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((level) => (
        <TouchableOpacity
          key={level}
          onPress={() => onChange(level)}
          style={[
            styles.levelButton,
            value === level && styles.selectedLevel,
          ]}
        >
          <Text style={value === level ? styles.selectedText : styles.levelText}>
            {level}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginVertical: 10,
  },
  levelButton: {
    padding: 12,
    borderRadius: 20,
    backgroundColor: '#eee',
    width: 45,
    alignItems: 'center',
  },
  selectedLevel: {
    backgroundColor: '#2980b9',
  },
  levelText: {
    fontSize: 16,
  },
  selectedText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StressLevelPicker;
