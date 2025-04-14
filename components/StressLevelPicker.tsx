import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors';

interface StressLevelPickerProps {
  value: number;
  onChange: (value: number) => void;
}

const StressLevelPicker: React.FC<StressLevelPickerProps> = ({ value, onChange }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];

  return (
    <View style={styles.container}>
      {[0, 1, 2, 3, 4, 5].map((level) => (
        <TouchableOpacity
          key={level}
          onPress={() => onChange(level)}
          style={[
            {backgroundColor: theme.textInputBackground},
            styles.levelButton,
            value === level && {backgroundColor: theme.primary},
          ]}
        >
          <Text style={value === level ? {color: theme.buttonText} : {color: theme.textPrimary, fontSize: 16}}>
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
    width: 45,
    alignItems: 'center',
  },
  selectedText: {
    fontWeight: 'bold',
    fontSize: 16,
  },
});

export default StressLevelPicker;
