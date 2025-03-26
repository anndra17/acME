import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Platform, StyleProp, ViewStyle, useColorScheme } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { Colors } from '../constants/Colors';
import { Ionicons } from '@expo/vector-icons';

interface DatePickerInputProps {
    label?: string;
    value: Date | null;
    onChange: (date: Date) => void;
    containerStyle?: StyleProp<ViewStyle>;
}

const DatePickerInput: React.FC<DatePickerInputProps> = ({ label, value, onChange, containerStyle }) => {
    const [showDatePicker, setShowDatePicker] = useState(false);
    const colorScheme = useColorScheme();
    const theme = Colors[colorScheme ? "light" : "dark"];

    const showMode = () => {
        setShowDatePicker(true);
    };

    const handleConfirm = (event: any, selectedDate: Date | undefined) => {
         const currentDate = selectedDate || value || new Date();

        setShowDatePicker(false);
        if (selectedDate) {
            onChange(selectedDate);
        }
    };

    const formatDate = (date: Date | null): string => {
        if (!date) return '';
        const day = String(date.getDate()).padStart(2, '0');
        const month = String(date.getMonth() + 1).padStart(2, '0'); // Month is 0-indexed
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    return (
        <View style={ containerStyle}>
            <Pressable onPress={showMode} style={[styles.inputContainer, {borderColor: theme.border}]}>
                <Ionicons name="calendar" size={20} color={theme.icon} style={styles.icon} />
                <Text style={[styles.inputText, { color: value ? theme.textPrimary : theme.textSecondary }]}>
                    {formatDate(value) || 'Select date of birth'}
                </Text>
            </Pressable>

            {showDatePicker && (
                <DateTimePicker
                    testID="dateTimePicker"
                    value={value || new Date()}
                    mode="date"
                    is24Hour={true}
                    display="default"
                    onChange={handleConfirm}
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    inputContainer: {
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 20,
        padding: 12,
        flexDirection: 'row',
        alignItems: 'center'
    },
    inputText: {
        fontSize: 16,
    },
    icon: {
        marginRight: 10
    }
});

export default DatePickerInput;
