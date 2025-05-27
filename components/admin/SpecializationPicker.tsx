import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, useColorScheme } from 'react-native';
import { Colors } from '../../constants/Colors';

interface SpecializationPickerProps {
  value: 'rezident' | 'specialist' | 'primar';
  onChange: (value: 'rezident' | 'specialist' | 'primar') => void;
}

const options = [
  { label: 'Rezident', value: 'rezident' },
  { label: 'Specialist', value: 'specialist' },
  { label: 'Primar', value: 'primar' },
];

const SpecializationPicker: React.FC<SpecializationPickerProps> = ({ value, onChange }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <View style={styles.container}>
      {options.map((opt) => (
        <TouchableOpacity
          key={opt.value}
          onPress={() => onChange(opt.value as any)}
          style={[
            styles.button,
            { backgroundColor: value === opt.value ? theme.primary : theme.textInputBackground, borderColor: theme.border },
          ]}
        >
          <Text style={{ color: value === opt.value ? theme.buttonText : theme.textPrimary, fontWeight: 'bold' }}>
            {opt.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    marginTop: 5,
  },
  button: {
    flex: 1,
    marginHorizontal: 4,
    paddingVertical: 10,
    borderRadius: 8,
    borderWidth: 1,
    alignItems: 'center',
  },
});

export default SpecializationPicker;