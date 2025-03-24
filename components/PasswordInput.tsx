import React, { useState } from 'react';
import { View, Pressable, StyleSheet, useColorScheme, TextInputProps, ViewStyle, TextStyle, StyleProp } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../constants/Colors';
import TextInputCustom from './TextInput';
import { Text } from 'react-native';

interface PasswordInputProps extends TextInputProps {
  label?: string;
  containerStyle?: StyleProp<ViewStyle>; // Stil pentru container
  inputStyle?: StyleProp<TextStyle>; // Stil pentru TextInput
}

const PasswordInput: React.FC<PasswordInputProps> = ({ label, containerStyle, inputStyle, ...props }) => {
  const [showPassword, setShowPassword] = useState(false);
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  return (
    <>
      {label && <Text style={[styles.label, { color: theme.title }]}>{label}</Text>}
      <View style={[styles.passwordContainer, { borderColor: theme.border }, containerStyle]}>
        <TextInputCustom
          style={[styles.passwordInput, inputStyle]} // Stil pentru input
          placeholderTextColor={theme.textSecondary}
          secureTextEntry={!showPassword}
          {...props}
        />
        <Pressable onPress={() => setShowPassword(!showPassword)} style={styles.eyeIcon}>
          <Ionicons name={showPassword ? 'eye-off' : 'eye'} size={20} color={theme.icon} />
        </Pressable>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  passwordContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 2,
    borderRadius: 20,
    width: '100%',
    fontFamily: 'System',
  },
  passwordInput: {
    flex: 1,
    padding: 12,
    fontSize: 16,
    borderWidth: 0,
    paddingHorizontal: 20,
    borderRadius: 20,
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
