import React from 'react';
import { Text, Pressable, StyleSheet, View, useColorScheme, ActivityIndicator  } from 'react-native';
import { Colors } from '../constants/Colors';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ButtonProps {
  label: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  onPress?: () => void;
  type?: 'primary' | 'secondary';
  loading?: boolean; 
}

const Button: React.FC<ButtonProps> = ({ label, icon, onPress, type, loading }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"];

  if ( type === 'primary') {
  return (
    <View style={styles.buttonContainer}>
      <Pressable
        style={[
          styles.button, 
          { backgroundColor: theme.buttonBackground }]}
        onPress={onPress}
        >
        {icon && <FontAwesome name={icon} size={18} color={theme.buttonText} style={styles.buttonIcon} />}
        <Text style={[styles.buttonLabel, { color: theme.buttonText }]}>{label}</Text>
      </Pressable>
    </View>
  );
  }

  return (
  <View style={styles.buttonContainer}>
      <Pressable 
      style={styles.button
      } 
      onPress={onPress}>
        {loading ? (
    <ActivityIndicator color={theme.buttonBackground} />
        ) : (
        
        <Text style={[styles.buttonLabel, {color: theme.title}]}>{label}</Text>
      )}
      </Pressable>
  </View>)
};

const styles = StyleSheet.create({
  buttonContainer: {
    width: 320,
    height: 68,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
  button: {
    borderRadius: 20,
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
  },
  buttonIcon: {
    paddingRight: 8,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});

export default Button;
