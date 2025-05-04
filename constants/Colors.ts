const tintColorLight = '#888888';
const tintColorDark = '#B23E3E';

export const Colors = {
  light: {
    textPrimary: '#2F2F2F',
    textSecondary: '#A5A5A5',
    title: '#B23E3E',
    background: '#FFFFFF',
    textInputBackground: '#EDEDED',
    primary: '#A6012B',
    border: '#FFC112',
    buttonBackground: '#A6012B',
    buttonText: '#FFFFFF',
    link: "#FFC112",
    errorText: '#721c24',
    errorBackground: "#f8d7da",
    succesText: '#363F2C',
    succesBackground: '#FFF6EC',
    tint: tintColorLight,
    icon: '#B23E3E', 
    tabIconDefault: '#FFC112', 
    tabIconSelected: '#A6012B', 
  },
  dark: {
    textPrimary: '',
    textSecondary: '#F8F2EC',
    title: '',
    primary: '',
    border: '',
    errorText: '',
    errorBackground: '',
    succesText: '',
    succesBackground: '',
    buttonBackground: '',
    buttonText: '',
    link: '',
    background: '#310F0F',
    textInputBackground: '#EDEDED',

    tint: tintColorDark,
    icon: '#9BA1A6',
    tabIconDefault: '#9BA1A6', // Culoare pentru tab-urile inactive
    tabIconSelected: tintColorDark, // Culoare pentru tab-ul activ
  },
};