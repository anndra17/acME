import React from 'react';
import {
  Text,
  Pressable,
  StyleSheet,
  ActivityIndicator,
  useColorScheme,
  ViewStyle } from 'react-native';
import { Colors } from '../constants/Colors';
import Animated, {
  useSharedValue,
  withSpring,
  useAnimatedStyle,
} from 'react-native-reanimated';
import FontAwesome from '@expo/vector-icons/FontAwesome';

interface ButtonProps {
  label: string;
  icon?: keyof typeof FontAwesome.glyphMap;
  onPress?: () => void;
  type?: 'primary' | 'secondary';
  loading?: boolean;
  style?: ViewStyle;

}

const Button: React.FC<ButtonProps> = ({ label, icon, onPress, type, loading, style }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];

  const scale = useSharedValue(1);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  const handlePressIn = () => {
    scale.value = withSpring(0.96);
  };

  const handlePressOut = () => {
    scale.value = withSpring(1);
  };

  return (
    <Animated.View
      style={[
        style ? style : styles.buttonContainer,
        animatedStyle,
      ]}>
      <Pressable
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        onPress={onPress}
        style={[
          styles.button,
          type === 'primary'
            ? { backgroundColor: theme.buttonBackground }
            : undefined,
        ]}
      >
        {loading ? (
          <ActivityIndicator
            color={
              type === 'primary' ? theme.buttonText : theme.buttonBackground
            }
          />
        ) : (
          <>
            {icon && (
              <FontAwesome
                name={icon}
                size={18}
                color={
                  type === 'primary' ? theme.buttonText : theme.buttonBackground
                }
                style={styles.buttonIcon}
              />
            )}
            <Text
              style={[
                styles.buttonLabel,
                {
                  color:
                    type === 'primary' ? theme.buttonText : theme.title,
                },
              ]}
            >
              {label}
            </Text>
          </>
        )}
      </Pressable>
    </Animated.View>
  );
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
