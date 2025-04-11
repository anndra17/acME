import { View, StyleSheet } from 'react-native';
import ImageViewer from '../../../../components/ImageViewer'; 
import Button from '../../../../components/Button';


const PlaceholderImage = require('../../../../assets/images/icon.png');


const AcneCheck = () => {
    return (
        <View style={styles.container}>
          <View style={styles.imageContainer}>
            <ImageViewer imgSource={PlaceholderImage} />
          </View>
          <View style={styles.footerContainer}>
            <Button label="Choose a photo"  icon='picture-o' type='primary' />
            <Button label="Use this photo" />
          </View>
        </View>
      );
    }

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
  },
  imageContainer: {
    flex: 1,
    paddingTop:15
  },
  image: {
    width: 320,
    height: 440,
    borderRadius: 18,
  },
  footerContainer: {
    flex: 1 / 3,
    alignItems: 'center',
  },
  buttonContainer: {
    width: 320,
    height: 68,
    marginHorizontal: 20,
    alignItems: 'center',
    justifyContent: 'center',
    padding: 3,
  },
});

export default AcneCheck;