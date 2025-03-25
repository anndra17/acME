import React from 'react';
import { TextInput as RNTextInput, StyleSheet, useColorScheme, ViewStyle, TextStyle, TextInputProps, StyleProp } from 'react-native'; // Importăm TextInput-ul de bază din React Native
import { Colors } from '../constants/Colors';
import { Text } from 'react-native';


interface TextInputCustomProps extends TextInputProps{
  label?: string;
  style?: StyleProp<TextStyle>;  //Permite adaugarea de stiluri extra
  inputStyle?: TextStyle;
}

const TextInputCustom: React.FC<TextInputCustomProps> = ({ label, style, inputStyle, ...props }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? "light" : "dark"];

  return (
    <>
      {label && <Text style={[styles.label,{color: theme.title}]}>{label}</Text>}
      <RNTextInput
        style={[
          styles.input,
          { borderColor: theme.border, color: theme.textPrimary },
            style
        ]}
        placeholderTextColor={theme.textSecondary} // Placeholder mai deschis la culoare
        {...props} // Toate celelalte props-uri (value, onChangeText, etc.)
          
      />
    </>
  );
};

const styles = StyleSheet.create({
  input: {
    width: '100%',
    padding: 12,
      paddingHorizontal: 20,
    borderWidth: 2, // Bordură mai groasă, ca în imagine
    borderRadius: 20, // Colțuri rotunjite
    fontSize: 16,
      fontFamily: 'System'
    // Alte stiluri comune
  },
  label: {
      fontSize: 18,
      fontWeight: "400",
      marginLeft: 12,
  }
});

export default TextInputCustom;