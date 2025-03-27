import React, { useState } from 'react';
import { View, Text, Pressable, StyleSheet, Modal, Button, ScrollView, useColorScheme } from 'react-native';
import { Colors } from '../constants/Colors'; // Adjust the path as needed

interface ModalDatePickerProps {
  isVisible: boolean;
  onClose: () => void;
  onDateSelected: (date: Date) => void;
  initialDate?: Date | null; // Optional initial date
}

const months = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

const ModalDatePicker: React.FC<ModalDatePickerProps> = ({ isVisible, onClose, onDateSelected, initialDate }) => {
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ? 'light' : 'dark'];
  const [selectedYear, setSelectedYear] = useState(initialDate ? initialDate.getFullYear() : new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(initialDate ? initialDate.getMonth() : new Date().getMonth());
  const [selectedDay, setSelectedDay] = useState(initialDate ? initialDate.getDate() : new Date().getDate());

  const confirmDate = () => {
    const newDate = new Date(selectedYear, selectedMonth, selectedDay);
    onDateSelected(newDate);
    onClose();
  };

  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={isVisible}
      onRequestClose={onClose}
    >
      <View style={styles.centeredView}>
        <View style={[styles.modalView, { backgroundColor: theme.background }]}>
          <Text style={[styles.modalText, { color: theme.textPrimary }]}>Select Date of Birth</Text>

          <View style={styles.datePickerContainer}>
            {/* Year Picker */}
            <View style={styles.pickerColumn}>
              <ScrollView>
                {Array.from({ length: 100 }, (_, i) => new Date().getFullYear() - i).map((year) => (
                  <Pressable key={year} onPress={() => setSelectedYear(year)}>
                    <Text style={[styles.pickerItem, { color: theme.textPrimary }, selectedYear === year ? styles.selectedPickerItem : null]}>{year}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Month Picker */}
            <View style={styles.pickerColumn}>
              <ScrollView>
                {months.map((month, index) => (
                  <Pressable key={month} onPress={() => setSelectedMonth(index)}>
                    <Text style={[styles.pickerItem, { color: theme.textPrimary }, selectedMonth === index ? styles.selectedPickerItem : null]}>{month}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>

            {/* Day Picker */}
            <View style={styles.pickerColumn}>
              <ScrollView>
                {Array.from({ length: new Date(selectedYear, selectedMonth + 1, 0).getDate() }, (_, i) => i + 1).map((day) => (
                  <Pressable key={day} onPress={() => setSelectedDay(day)}>
                    <Text style={[styles.pickerItem, { color: theme.textPrimary }, selectedDay === day ? styles.selectedPickerItem : null]}>{day}</Text>
                  </Pressable>
                ))}
              </ScrollView>
            </View>
          </View>

          {/* Finish Button */}
          <Button
            title="Finish"
            onPress={confirmDate}
            color={theme.link}
          />
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  centeredView: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 22
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 20,
    padding: 35,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: '80%', // Smaller width
    maxWidth: 400, // Maximum width
  },
  modalText: {
    marginBottom: 15,
    textAlign: "center"
  },
  datePickerContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: 10,
    height: 150, // Set a fixed height
  },
  pickerColumn: {
    flex: 1,
    marginHorizontal: 5,
  },
  pickerItem: {
    fontSize: 18,
    textAlign: 'center',
    paddingVertical: 5,
  },
  selectedPickerItem: {
    fontWeight: 'bold',
  },
});

export default ModalDatePicker;