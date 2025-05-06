import { Animated, Dimensions } from 'react-native';
import { useRef } from 'react';

const { width, height } = Dimensions.get('window');

export default function FadeInImage ({
    uri,
    customStyle = {},
  }: {
    uri: string;
    customStyle?: object;
  }) {
    const opacity = useRef(new Animated.Value(0)).current;
  
    const onLoad = () => {
      Animated.timing(opacity, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start();
    };
  
    const imageSize = (width - 40) / 3; // 40 = spacing * (numColumns + 1)
  
    return (
      <Animated.Image
        source={{ uri }}
        onLoad={onLoad}
        style={{
          width: imageSize,
          height: imageSize,
          opacity,
          ...customStyle, // suprascrie colțurile
        }}
        resizeMode="cover"
      />
    );
  };
  