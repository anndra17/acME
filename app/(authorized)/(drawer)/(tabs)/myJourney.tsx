import Ionicons from "@expo/vector-icons/Ionicons";
import { Slot } from "expo-router";
import { StyleSheet, Image, Text, View, FlatList, TouchableOpacity, useColorScheme  } from "react-native";
import { Colors} from "../../../../constants/Colors";
import { useEffect, useState } from "react";
import { Post } from "../../../../types/Post";
import { getCurrentUser } from "../../../../lib/firebase-service";


export default function MyJourneyScreen() {
};