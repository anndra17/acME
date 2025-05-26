import React, { useState } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, Alert } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '../../../../constants/Colors';
import Button from '../../../../components/Button';
import { BlogPost, BlogCategory, BlogSection } from '../../../../types/BlogPost';
import { getAuth } from 'firebase/auth';
import { uploadImageAndSaveToFirestore, createBlogPost } from '../../../../lib/firebase-service';

const CATEGORIES: BlogCategory[] = [
  'treatments',
  'lifestyle',
  'nutrition',
  'mental-health',
  'research',
  'success-stories',
  'expert-advice'
];

const BlogEditor = () => {
  const router = useRouter();
  const auth = getAuth();
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<BlogCategory>('treatments');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [sections, setSections] = useState<BlogSection[]>([
    { title: '', content: '', imageUrl: undefined }
  ]);
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');

  const pickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [16, 9],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0].uri) {
      const imageUrl = await uploadImageAndSaveToFirestore(result.assets[0].uri, auth.currentUser?.uid || '');
      setFeaturedImage(imageUrl);
    }
  };

  const addSection = () => {
    setSections([...sections, { title: '', content: '', imageUrl: undefined }]);
  };

  const updateSection = (index: number, field: keyof BlogSection, value: string) => {
    const newSections = [...sections];
    newSections[index] = { ...newSections[index], [field]: value };
    setSections(newSections);
  };

  const removeSection = (index: number) => {
    setSections(sections.filter((_, i) => i !== index));
  };

  const addTag = () => {
    if (currentTag.trim() && !tags.includes(currentTag.trim())) {
      setTags([...tags, currentTag.trim()]);
      setCurrentTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  const handleSubmit = async () => {
    if (!title || !summary || !featuredImage || sections.some(s => !s.title || !s.content)) {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields: title, summary, featured image, and all section titles and content.'
      );
      return;
    }

    try {
      const blogPost: Omit<BlogPost, 'id' | 'createdAt' | 'updatedAt' | 'forumThreadId' | 'likes' | 'views'> = {
        title,
        slug: title.toLowerCase().replace(/\s+/g, '-'),
        authorId: auth.currentUser?.uid || '',
        featuredImage,
        category,
        sections,
        tags,
        summary,
        isPublished: false
      };

      await createBlogPost(blogPost);
      Alert.alert('Success', 'Blog post saved successfully!');
      router.back();
    } catch (error) {
      console.error('Error saving blog post:', error);
      Alert.alert('Error', 'Failed to save blog post. Please try again.');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>Create New Blog Post</Text>
      </View>

      <View style={styles.form}>
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          value={title}
          onChangeText={setTitle}
          placeholder="Enter post title"
        />

        <Text style={styles.label}>Summary</Text>
        <TextInput
          style={[styles.input, styles.textArea]}
          value={summary}
          onChangeText={setSummary}
          placeholder="Enter a brief summary"
          multiline
          numberOfLines={3}
        />

        <Text style={styles.label}>Category</Text>
        <View style={styles.categoryContainer}>
          {CATEGORIES.map((cat) => (
            <TouchableOpacity
              key={cat}
              style={[
                styles.categoryButton,
                category === cat && styles.categoryButtonActive
              ]}
              onPress={() => setCategory(cat)}
            >
              <Text style={[
                styles.categoryButtonText,
                category === cat && styles.categoryButtonTextActive
              ]}>
                {cat.replace('-', ' ')}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Featured Image</Text>
        <TouchableOpacity style={styles.imagePicker} onPress={pickImage}>
          {featuredImage ? (
            <Image source={{ uri: featuredImage }} style={styles.featuredImage} />
          ) : (
            <View style={styles.imagePlaceholder}>
              <Ionicons name="image-outline" size={32} color="#666" />
              <Text style={styles.imagePlaceholderText}>Tap to add image</Text>
            </View>
          )}
        </TouchableOpacity>

        <Text style={styles.label}>Sections</Text>
        {sections.map((section, index) => (
          <View key={index} style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Section {index + 1}</Text>
              {sections.length > 1 && (
                <TouchableOpacity onPress={() => removeSection(index)}>
                  <Ionicons name="trash-outline" size={24} color="#ff4444" />
                </TouchableOpacity>
              )}
            </View>
            <TextInput
              style={styles.input}
              value={section.title}
              onChangeText={(value) => updateSection(index, 'title', value)}
              placeholder="Section title"
            />
            <TextInput
              style={[styles.input, styles.textArea]}
              value={section.content}
              onChangeText={(value) => updateSection(index, 'content', value)}
              placeholder="Section content"
              multiline
              numberOfLines={4}
            />
          </View>
        ))}
        <Button
          label="Add Section"
          type="secondary"
          icon="plus"
          onPress={addSection}
          style={styles.addSectionButton}
        />

        <Text style={styles.label}>Tags</Text>
        <View style={styles.tagsContainer}>
          {tags.map((tag) => (
            <View key={tag} style={styles.tag}>
              <Text style={styles.tagText}>{tag}</Text>
              <TouchableOpacity onPress={() => removeTag(tag)}>
                <Ionicons name="close-circle" size={20} color="#666" />
              </TouchableOpacity>
            </View>
          ))}
        </View>
        <View style={styles.tagInputContainer}>
          <TextInput
            style={styles.tagInput}
            value={currentTag}
            onChangeText={setCurrentTag}
            placeholder="Add a tag"
            onSubmitEditing={addTag}
          />
          <Button
            label="Add"
            type="secondary"
            onPress={addTag}
            style={styles.addTagButton}
          />
        </View>

        <View style={styles.actions}>
          <Button
            label="Save Draft"
            type="secondary"
            icon="save"
            onPress={() => {/* TODO */}}
            style={styles.actionButton}
          />
          <Button
            label="Publish"
            type="primary"
            icon="paper-plane"
            onPress={handleSubmit}
            style={styles.actionButton}
          />
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  header: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    marginBottom: 16,
    fontSize: 16,
  },
  textArea: {
    height: 100,
    textAlignVertical: 'top',
  },
  categoryContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 16,
  },
  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryButtonText: {
    color: '#666',
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  imagePicker: {
    height: 200,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholderText: {
    marginTop: 8,
    color: '#666',
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  section: {
    marginBottom: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eee',
    borderRadius: 8,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#333',
  },
  addSectionButton: {
    marginBottom: 24,
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 12,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    gap: 4,
  },
  tagText: {
    color: '#666',
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  tagInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  addTagButton: {
    width: 80,
  },
  actions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
  },
});

export default BlogEditor; 