import React, { useState } from 'react';
import { TextInput as RNTextInput, View, StyleSheet, useColorScheme, TextStyle, TextInputProps, StyleProp, ViewStyle, Pressable } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';

interface TextInputCustomProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>;
  inputStyle?: StyleProp<TextStyle>;
  iconName?: keyof typeof Ionicons.glyphMap;
  secondIconName?: keyof typeof Ionicons.glyphMap;
  onSecondIconPress?: () => void; // New prop to handle icon press
}

const TextInputCustom: React.FC<TextInputCustomProps> = ({ label, containerStyle, inputStyle, iconName, secondIconName, onSecondIconPress, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"];


  return (
    <View style={[styles.container, containerStyle, { borderColor: theme.border }]}>
      {iconName && (
        <Ionicons name={iconName} size={20} color={theme.icon} style={styles.firstIcon} /> // Apply style to the first icon
      )}
      <RNTextInput
        style={[
          styles.input,
          { color: theme.textPrimary },
          inputStyle
        ]}
        placeholderTextColor={theme.textSecondary}
        {...props}
      />
      {secondIconName && (
        <Pressable onPress={onSecondIconPress} style={styles.eyeIcon}>
          <Ionicons name={secondIconName} size={20} color={theme.icon} />
        </Pressable>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    width: '100%',
    height: 50, //Matching DatePicker
    borderWidth: 2,
    borderRadius: 20,
    paddingHorizontal: 8, //Reduced padding
  },
  input: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 16,
    paddingHorizontal: 8, //Reduced padding
    fontFamily: 'System',
    textAlignVertical: 'top',
  },
  eyeIcon: {  //Style for Eye icon
    padding: 10,
  },
    firstIcon: {
        marginRight: 8,
        marginLeft: 8
    }
});

export default TextInputCustom;