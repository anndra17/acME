// components/PostGrid.tsx
import { FlatList, View, TouchableOpacity } from "react-native";
import FadeInImage from "./FadeInImage";
import { Post } from "../types/Post"; // asigură-te că importul e corect

interface PostGridProps {
  posts: Post[];
  numColumns: number;
  spacing: number;
  openModal: (index: number) => void;
}

export default function PostGrid({ posts, numColumns, spacing, openModal }: PostGridProps) {
  const borderRadiusValue = 90; // trebuie să fie identic cu cel din postsContainer

  return (
    <FlatList
      data={posts}
      numColumns={numColumns}
      columnWrapperStyle={{ justifyContent: 'space-between', paddingHorizontal: spacing }}
      contentContainerStyle={{ paddingVertical: spacing }}
      keyExtractor={(item) => item.id}
      renderItem={({ item, index }) => {
        const isFirstRow = index < numColumns;
        const isFirstItem = index % numColumns === 0;
        const isLastItem = (index + 1) % numColumns === 0;
        const customBorderRadius = {
          borderTopLeftRadius: isFirstRow && isFirstItem ? borderRadiusValue : 0,
          borderTopRightRadius: isFirstRow && isLastItem ? borderRadiusValue : 0,
        };
        return (
          <View style={{ marginBottom: spacing }}>
            <TouchableOpacity onPress={() => openModal(index)}>
              <FadeInImage uri={item.imageUrl} customStyle={customBorderRadius} />
            </TouchableOpacity>
          </View>
        );
      }}
    />
  );
}