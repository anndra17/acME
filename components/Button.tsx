import React from 'react';
import { Text, Pressable, StyleSheet, useColorScheme, ViewStyle, TextStyle, PressableProps } from 'react-native';
import { Colors } from '../constants/Colors';  

interface ButtonProps extends PressableProps { // mostenim toate props-urile pe care le are un Pressable
  title: string;
  variant?: 'primary' | 'secondary'; // Adăugăm un 'variant' prop
  style?: ViewStyle;  //Permite adaugarea de stiluri extra
  textStyle?: TextStyle;
}

const Button: React.FC<ButtonProps> = ({ title, variant = 'primary', style, textStyle, ...props }) => { //...props ia toate props-urile care nu sunt definite de noi
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? 'light'];

  const buttonStyles = [
    styles.button,
    variant === 'primary' ? { backgroundColor: theme.buttonBackground } : { /* Stilizare diferita pentru secondary */ },
      style //Stilurile custom primeaza
  ];

  const textStyles = [
    styles.buttonText,
    variant === 'primary' ? { color: theme.buttonText } : { /* Stilizare diferita pentru secondary*/ },
    textStyle
  ];

  return (
    <Pressable style={buttonStyles} {...props}>
      <Text style={textStyles}>{title}</Text>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: '100%', //sau orice width vrei tu
    paddingVertical: '5%',
    borderRadius: 20, // Colțuri rotunjite, ca în imagine
    alignItems: 'center',
    // Alte stiluri comune pentru butoane (dacă e cazul)
  },
  buttonText: {
    fontWeight: '600',
    fontSize: 16,
    // Alte stiluri comune pentru textul butoanelor
  },
});

export default Button;