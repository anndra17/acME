import React, { useState } from 'react';
import { View, Pressable, StyleSheet, useColorScheme, TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import TextInputCustom from './TextInput';

interface PasswordInputProps extends Omit<TextInputProps, 'style'> {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>; // Stil pentru container
  inputStyle?: StyleProp<TextStyle>; // Stil pentru TextInput
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, containerStyle, inputStyle, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"];
  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
        <TextInputCustom
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={!showPassword}
          iconName='lock-closed'
          secondIconName={showPassword ? 'eye-off' : 'eye'}
          onSecondIconPress={togglePasswordVisibility}
          {...props}
         />
        
  );
};

const styles = StyleSheet.create({
  passwordContainer: {
    flexDirection: 'row', 
    alignItems: 'center',
    width: '100%',
    fontFamily: 'System',
  },
  passwordInput: {
    flex: 1, 
    padding: 12,
    fontSize: 16,
    paddingHorizontal: 20,
  },
  eyeIcon: {
    padding: 10,
  },
  label: {
    fontSize: 18,
    fontWeight: '400',
    marginLeft: 12,
  },
});

export default PasswordInput;
