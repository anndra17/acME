import React, { useState, useRef } from 'react';
import { View, Text, TextInput, ScrollView, StyleSheet, TouchableOpacity, Image, Alert, KeyboardAvoidingView, Platform, Dimensions, Modal } from 'react-native';
import { useRouter } from 'expo-router';
import * as ImagePicker from 'expo-image-picker';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import Markdown from 'react-native-markdown-display';

import { Colors } from '../../../../constants/Colors';
import Button from '../../../../components/Button';
import { BlogPost, BlogCategory, Citation } from '../../../../types/BlogPost';
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

const CITATION_TYPES = ['article', 'website', 'book', 'journal', 'other'];

const { width: SCREEN_WIDTH, height: SCREEN_HEIGHT } = Dimensions.get('window');

const markdownStyles = StyleSheet.create({
  body: {
    color: '#333',
    fontSize: 16,
  },
  heading1: {
    fontSize: 24,
    fontWeight: '700',
    marginBottom: 10,
  },
  heading2: {
    fontSize: 20,
    fontWeight: '700',
    marginBottom: 8,
  },
  strong: {
    fontWeight: '700',
  },
  em: {
    fontStyle: 'italic',
  },
  list_item: {
    marginBottom: 5,
  },
  link: {
    color: Colors.light.primary,
  },
  image: {
    width: '100%',
    height: 200,
    resizeMode: 'contain',
  },
});

// Definim interfața pentru parametrii renderImage
interface ImageProps {
  source: { uri: string };
  style: any;
}

const BlogEditor = () => {
  const router = useRouter();
  const auth = getAuth();
  const contentInputRef = useRef<TextInput>(null);
  
  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [category, setCategory] = useState<BlogCategory>('treatments');
  const [featuredImage, setFeaturedImage] = useState<string | null>(null);
  const [content, setContent] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [currentTag, setCurrentTag] = useState('');
  const [citations, setCitations] = useState<Citation[]>([]);
  const [currentCitation, setCurrentCitation] = useState<Citation>({
    authors: [],
    title: '',
    journal: '',
    year: undefined,
    url: '',
    doi: '',
    description: '',
    type: 'article'
  });
  const [currentAuthor, setCurrentAuthor] = useState('');
  const [isCitationModalVisible, setIsCitationModalVisible] = useState(false);
  const [cursorPosition, setCursorPosition] = useState(0);
  const [selection, setSelection] = useState({ start: 0, end: 0 });
  const [selectedText, setSelectedText] = useState('');
  const [isPreviewModalVisible, setIsPreviewModalVisible] = useState(false);
  const [isImagePickerVisible, setIsImagePickerVisible] = useState(false);

  // Funcție pentru aplicarea formatării
  const applyFormatting = (tag: string) => {
    if (!contentInputRef.current) return;

    const beforeText = content.substring(0, selection.start);
    const selectedText = content.substring(selection.start, selection.end);
    const afterText = content.substring(selection.end);
    
    let newContent = '';
    let newSelection = { start: selection.start, end: selection.end };

    switch (tag) {
      case 'bold':
        newContent = beforeText + `**${selectedText}**` + afterText;
        newSelection = {
          start: selection.start + 2,
          end: selection.end + 2
        };
        break;
      case 'italic':
        newContent = beforeText + `*${selectedText}*` + afterText;
        newSelection = {
          start: selection.start + 1,
          end: selection.end + 1
        };
        break;
      case 'header':
        newContent = beforeText + `## ${selectedText}` + afterText;
        newSelection = {
          start: selection.start + 3,
          end: selection.end + 3
        };
        break;
      case 'list':
        newContent = beforeText + `\n• ${selectedText}` + afterText;
        newSelection = {
          start: selection.start + 3,
          end: selection.end + 3
        };
        break;
      case 'link':
        newContent = beforeText + `[${selectedText}](URL)` + afterText;
        newSelection = {
          start: selection.start + 1,
          end: selection.end + 1
        };
        break;
      default:
        return;
    }

    setContent(newContent);
    
    // Focus și setare cursor
    setTimeout(() => {
      if (contentInputRef.current) {
        contentInputRef.current.focus();
        contentInputRef.current.setNativeProps({
          selection: newSelection
        });
      }
    }, 100);
  };

  const pickFeaturedImage = async () => {
    try {
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
    } catch (error) {
      console.error('Error picking featured image:', error);
      Alert.alert('Error', 'Failed to upload featured image. Please try again.');
    }
  };

  const pickContentImage = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [16, 9],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0].uri) {
        const imageUrl = await uploadImageAndSaveToFirestore(result.assets[0].uri, auth.currentUser?.uid || '');
        insertImage(imageUrl);
      }
    } catch (error) {
      console.error('Error picking content image:', error);
      Alert.alert('Error', 'Failed to upload image. Please try again.');
    }
  };

  const insertImage = (imageUrl: string) => {
    if (!contentInputRef.current) return;

    const beforeText = content.substring(0, selection.start);
    const afterText = content.substring(selection.end);
    
    // Modificăm formatul pentru a include un ID unic pentru imagine
    const imageId = generateUniqueId();
    const imageMarkdown = `\n![Image ${imageId}](${imageUrl})\n`;
    const newContent = beforeText + imageMarkdown + afterText;
    
    setContent(newContent);
    
    // Focus și setare cursor după imagine
    setTimeout(() => {
      if (contentInputRef.current) {
        const newPosition = selection.start + imageMarkdown.length;
        contentInputRef.current.focus();
        contentInputRef.current.setNativeProps({
          selection: { start: newPosition, end: newPosition }
        });
      }
    }, 100);
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
  
  const generateUniqueId = () => Math.random().toString(36).substring(2, 9);

  const addAuthor = () => {
    if (currentAuthor.trim()) {
      setCurrentCitation({
        ...currentCitation,
        authors: [...currentCitation.authors, currentAuthor.trim()]
      });
      setCurrentAuthor('');
    }
  };

  const removeAuthor = (authorToRemove: string) => {
    setCurrentCitation({
      ...currentCitation,
      authors: currentCitation.authors.filter(author => author !== authorToRemove)
    });
  };

  const addCitation = () => {
    if (currentCitation.title.trim() && currentCitation.authors.length > 0) {
      setCitations([...citations, {...currentCitation, id: generateUniqueId()}]);
      // Reset form
      setCurrentCitation({
        authors: [],
        title: '',
        journal: '',
        year: undefined,
        url: '',
        doi: '',
        description: '',
        type: 'article'
      });
      setCurrentAuthor('');
      setIsCitationModalVisible(false);
    } else {
      Alert.alert('Validation error', 'Please provide title and at least one author');
    }
  };

  const removeCitation = (index: number) => {
    setCitations(citations.filter((_, i) => i !== index));
  };

  const resetCitationModal = () => {
    setCurrentCitation({
      authors: [],
      title: '',
      journal: '',
      year: undefined,
      url: '',
      doi: '',
      description: '',
      type: 'article'
    });
    setCurrentAuthor('');
    setIsCitationModalVisible(false);
  };

  // Funcție pentru a determina ce câmpuri să afișeze în funcție de tipul citării
  const getCitationFields = (type: string) => {
    const baseFields = ['authors', 'title', 'year', 'description'];
    
    switch (type) {
      case 'article':
      case 'journal':
        return [...baseFields, 'journal', 'doi', 'url'];
      case 'book':
        return [...baseFields, 'journal']; // journal va fi folosit ca publisher pentru cărți
      case 'website':
        return [...baseFields, 'url'];
      case 'other':
        return [...baseFields, 'journal', 'url', 'doi'];
      default:
        return baseFields;
    }
  };

  const getFieldLabel = (field: string, type: string) => {
    if (field === 'journal' && type === 'book') return 'Publisher';
    if (field === 'journal') return 'Journal/Source';
    return field.charAt(0).toUpperCase() + field.slice(1);
  };

  const handleSubmit = async () => {
    if (!title || !summary || !featuredImage || !content) {
      Alert.alert(
        'Validation Error',
        'Please fill in all required fields: title, summary, featured image, and content.'
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
        content,
        tags,
        citations,
        summary,
        isPublished: false
      };

      await createBlogPost(blogPost);
      
      // Reset all fields
      setTitle('');
      setSummary('');
      setFeaturedImage(null);
      setContent('');
      setTags([]);
      setCitations([]);
      setCategory('treatments');
      
      Alert.alert('Success', 'Blog post saved successfully!');
      router.push('/moderator/blog-posts');
    } catch (error) {
      console.error('Error saving blog post:', error);
      Alert.alert('Error', 'Failed to save blog post. Please try again.');
    }
  };

  const renderCitationField = (field: string, type: string) => {
    const label = getFieldLabel(field, type);
    
    switch (field) {
      case 'title':
        return (
          <View key={field} style={styles.fieldContainer}>
            <Text style={styles.subLabel}>{label} *</Text>
            <TextInput
              style={styles.input}
              value={currentCitation.title}
              onChangeText={(text) => setCurrentCitation({...currentCitation, title: text})}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </View>
        );
      
      case 'journal':
        return (
          <View key={field} style={styles.fieldContainer}>
            <Text style={styles.subLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              value={currentCitation.journal}
              onChangeText={(text) => setCurrentCitation({...currentCitation, journal: text})}
              placeholder={`Enter ${label.toLowerCase()}`}
            />
          </View>
        );
      
      case 'year':
        return (
          <View key={field} style={styles.fieldContainer}>
            <Text style={styles.subLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              value={currentCitation.year?.toString() || ''}
              onChangeText={(text) => setCurrentCitation({...currentCitation, year: parseInt(text) || undefined})}
              placeholder="YYYY"
              keyboardType="numeric"
              maxLength={4}
            />
          </View>
        );
      
      case 'url':
        return (
          <View key={field} style={styles.fieldContainer}>
            <Text style={styles.subLabel}>{label}</Text>
            <TextInput
              style={styles.input}
              value={currentCitation.url}
              onChangeText={(text) => setCurrentCitation({...currentCitation, url: text})}
              placeholder="https://..."
              keyboardType="url"
            />
          </View>
        );
      
      case 'doi':
        return (
          <View key={field} style={styles.fieldContainer}>
            <Text style={styles.subLabel}>DOI</Text>
            <TextInput
              style={styles.input}
              value={currentCitation.doi}
              onChangeText={(text) => setCurrentCitation({...currentCitation, doi: text})}
              placeholder="10.1000/182"
            />
          </View>
        );
      
      case 'description':
        return (
          <View key={field} style={styles.fieldContainer}>
            <Text style={styles.subLabel}>Notes/Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={currentCitation.description}
              onChangeText={(text) => setCurrentCitation({...currentCitation, description: text})}
              placeholder="Additional notes or description"
              multiline
              numberOfLines={3}
            />
          </View>
        );
      
      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      
      
      <ScrollView 
        style={styles.scrollView}
        contentContainerStyle={styles.scrollViewContent}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.form}>
          {/* Required Fields Legend */}
          <View style={styles.requiredFieldsLegend}>
            <Text style={styles.requiredFieldsText}>
              <Text style={styles.requiredStar}>*</Text> Required fields
            </Text>
          </View>

          {/* Title and Summary Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Title <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Enter post title"
            />

            <Text style={styles.label}>Summary <Text style={styles.requiredStar}>*</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={summary}
              onChangeText={setSummary}
              placeholder="Enter a brief summary"
              multiline
              numberOfLines={3}
            />
          </View>

          {/* Category Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Category <Text style={styles.requiredStar}>*</Text></Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryScroll}>
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
            </ScrollView>
          </View>

          {/* Featured Image Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Featured Image <Text style={styles.requiredStar}>*</Text></Text>
            <TouchableOpacity style={styles.imagePicker} onPress={pickFeaturedImage}>
              {featuredImage ? (
                <Image source={{ uri: featuredImage }} style={styles.featuredImage} />
              ) : (
                <View style={styles.imagePlaceholder}>
                  <Ionicons name="image-outline" size={32} color="#666" />
                  <Text style={styles.imagePlaceholderText}>Tap to add featured image</Text>
                </View>
              )}
            </TouchableOpacity>
          </View>

          {/* Content Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Content <Text style={styles.requiredStar}>*</Text></Text>
            <View style={styles.editorContainer}>
              <View style={styles.toolbar}>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={() => applyFormatting('bold')}
                >
                  <MaterialCommunityIcons name="format-bold" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={() => applyFormatting('italic')}
                >
                  <MaterialCommunityIcons name="format-italic" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={() => applyFormatting('header')}
                >
                  <MaterialCommunityIcons name="format-header-1" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={() => applyFormatting('list')}
                >
                  <MaterialCommunityIcons name="format-list-bulleted" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={() => applyFormatting('link')}
                >
                  <MaterialCommunityIcons name="link-variant" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={styles.toolbarButton}
                  onPress={pickContentImage}
                >
                  <MaterialCommunityIcons name="image-plus" size={20} color="#333" />
                </TouchableOpacity>
                <TouchableOpacity 
                  style={[styles.toolbarButton, styles.previewButton]}
                  onPress={() => setIsPreviewModalVisible(true)}
                >
                  <MaterialCommunityIcons name="eye-outline" size={20} color="#333" />
                </TouchableOpacity>
              </View>
              <View style={styles.editorAndPreview}>
                <TextInput
                  ref={contentInputRef}
                  style={[styles.input, styles.contentInput]}
                  value={content}
                  onChangeText={setContent}
                  onSelectionChange={(event) => {
                    setSelection(event.nativeEvent.selection);
                    setSelectedText(content.substring(
                      event.nativeEvent.selection.start,
                      event.nativeEvent.selection.end
                    ));
                  }}
                  placeholder="Write your content here..."
                  multiline
                  textAlignVertical="top"
                />
                <View style={styles.previewContainer}>
                  <Text style={styles.previewLabel}>Preview:</Text>
                  <ScrollView style={styles.previewScroll}>
                    <Markdown style={{
                      ...markdownStyles,
                      image: {
                        width: '100%',
                        height: 200,
                        resizeMode: 'contain',
                      }
                    }}>
                      {content}
                    </Markdown>
                  </ScrollView>
                </View>
              </View>
            </View>
          </View>

          {/* Tags Section */}
          <View style={styles.section}>
            <Text style={styles.label}>Tags</Text>
            {tags.length > 0 && (
              <View style={styles.tagsContainer}>
                {tags.map((tag, index) => (
                  <View key={index} style={styles.tag}>
                    <Text style={styles.tagText}>{tag}</Text>
                    <TouchableOpacity onPress={() => removeTag(tag)}>
                      <Ionicons name="close" size={16} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
            <View style={styles.tagInputContainer}>
              <TextInput
                style={[styles.input, styles.tagInput]}
                value={currentTag}
                onChangeText={setCurrentTag}
                placeholder="Add a tag"
                onSubmitEditing={addTag}
              />
              <TouchableOpacity style={styles.addTagButton} onPress={addTag}>
                <Ionicons name="add" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </View>

          {/* Citations Section */}
          <View style={[styles.section, styles.lastSection]}>
            <View style={styles.sectionHeader}>
              <Text style={styles.label}>Citations</Text>
              <TouchableOpacity 
                style={styles.addCitationHeaderButton}
                onPress={() => setIsCitationModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={Colors.light.primary} />
                <Text style={styles.addCitationText}>Add Citation</Text>
              </TouchableOpacity>
            </View>
            
            {citations.length > 0 && (
              <View style={styles.citationsList}>
                {citations.map((citation, index) => (
                  <View key={index} style={styles.citationItem}>
                    <View style={styles.citationInfo}>
                      <Text style={styles.citationTitle}>{citation.title}</Text>
                      <Text style={styles.citationAuthors}>
                        {citation.authors.join(', ')} ({citation.year || 'No year'})
                      </Text>
                      <Text style={styles.citationType}>{citation.type}</Text>
                    </View>
                    <TouchableOpacity onPress={() => removeCitation(index)}>
                      <Ionicons name="close" size={20} color="#666" />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            )}
          </View>
        </View>
      </ScrollView>

      {/* Fixed Action Buttons at bottom */}
      <View style={styles.fixedActions}>
        <TouchableOpacity style={[styles.actionButtonCustom, styles.secondaryButton]} onPress={() => {/* TODO */}}>
          <Ionicons name="save" size={20} color="#666" style={{ marginRight: 8 }} />
          <Text style={styles.secondaryButtonText}>Save Draft</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionButtonCustom, styles.primaryButton]} onPress={handleSubmit}>
          <Ionicons name="paper-plane" size={20} color="#fff" style={{ marginRight: 8 }} />
          <Text style={styles.primaryButtonText}>Publish</Text>
        </TouchableOpacity>
      </View>

      {/* Citation Modal */}
      <Modal
        visible={isCitationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={resetCitationModal}
      >
        <View style={styles.modalOverlay}>
          <KeyboardAvoidingView 
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.modalKeyboardView}
          >
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Add Citation</Text>
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={resetCitationModal}
                >
                  <Ionicons name="close" size={24} color="#666" />
                </TouchableOpacity>
              </View>
              
              <ScrollView 
                style={styles.modalScrollView}
                contentContainerStyle={styles.modalScrollContent}
                showsVerticalScrollIndicator={false}
                keyboardShouldPersistTaps="handled"
              >
                <View style={styles.citationForm}>
                  {/* Citation Type */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.subLabel}>Citation Type</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                      <View style={styles.citationTypeContainer}>
                        {CITATION_TYPES.map((type) => (
                          <TouchableOpacity
                            key={type}
                            style={[
                              styles.citationTypeButton,
                              currentCitation.type === type && styles.citationTypeButtonActive
                            ]}
                            onPress={() => setCurrentCitation({...currentCitation, type: type as any})}
                          >
                            <Text style={[
                              styles.citationTypeText,
                              currentCitation.type === type && styles.citationTypeTextActive
                            ]}>
                              {type.charAt(0).toUpperCase() + type.slice(1)}
                            </Text>
                          </TouchableOpacity>
                        ))}
                      </View>
                    </ScrollView>
                  </View>

                  {/* Authors */}
                  <View style={styles.fieldContainer}>
                    <Text style={styles.subLabel}>Authors *</Text>
                    {currentCitation.authors.length > 0 && (
                      <View style={styles.authorsList}>
                        {currentCitation.authors.map((author, index) => (
                          <View key={index} style={styles.authorTag}>
                            <Text style={styles.authorText}>{author}</Text>
                            <TouchableOpacity onPress={() => removeAuthor(author)}>
                              <Ionicons name="close" size={14} color="#666" />
                            </TouchableOpacity>
                          </View>
                        ))}
                      </View>
                    )}
                    <View style={styles.authorInputContainer}>
                      <TextInput
                        style={[styles.input, { flex: 1, marginBottom: 0 }]}
                        value={currentAuthor}
                        onChangeText={setCurrentAuthor}
                        placeholder="Enter author name"
                        onSubmitEditing={addAuthor}
                      />
                      <TouchableOpacity style={styles.addAuthorButton} onPress={addAuthor}>
                        <Ionicons name="add" size={20} color={Colors.light.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Dynamic fields based on citation type */}
                  {getCitationFields(currentCitation.type).filter(field => field !== 'authors').map(field => 
                    renderCitationField(field, currentCitation.type)
                  )}
                </View>
              </ScrollView>

              {/* Modal Footer with Add Button */}
              <View style={styles.modalFooter}>
                <TouchableOpacity 
                  style={styles.addCitationModalButton}
                  onPress={addCitation}
                >
                  <Text style={styles.addCitationModalButtonText}>Add Citation</Text>
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>

      {/* Full Preview Modal */}
      <Modal
        visible={isPreviewModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsPreviewModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.fullPreviewModal}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Full Preview</Text>
              <TouchableOpacity 
                style={styles.closeButton}
                onPress={() => setIsPreviewModalVisible(false)}
              >
                <Ionicons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>
            <ScrollView style={styles.fullPreviewContent}>
              <Markdown style={{
                ...markdownStyles,
                image: {
                  width: '100%',
                  height: 200,
                  resizeMode: 'contain',
                }
              }}>
                {content}
              </Markdown>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
};


const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  scrollView: {
    flex: 1,
  },
  scrollViewContent: {
    flexGrow: 1,
  },
  header: {
    padding: SCREEN_HEIGHT * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  title: {
    fontSize: SCREEN_WIDTH * 0.06,
    fontWeight: 'bold',
    color: '#333',
  },
  form: {
    padding: SCREEN_WIDTH * 0.05,
  },
  section: {
    marginBottom: SCREEN_HEIGHT * 0.025,
  },
  lastSection: {
    marginBottom: 0, // No margin for last section
  },
  label: {
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
    color: '#333',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: SCREEN_WIDTH * 0.02,
    padding: SCREEN_WIDTH * 0.03,
    marginBottom: SCREEN_HEIGHT * 0.02,
    fontSize: SCREEN_WIDTH * 0.04,
  },
  textArea: {
    height: SCREEN_HEIGHT * 0.20,
    textAlignVertical: 'top',
  },
  categoryScroll: {
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  categoryContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
    paddingBottom: SCREEN_HEIGHT * 0.01,
  },
  categoryButton: {
    paddingHorizontal: SCREEN_WIDTH * 0.04,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderRadius: SCREEN_WIDTH * 0.05,
    backgroundColor: '#f0f0f0',
  },
  categoryButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  categoryButtonText: {
    color: '#666',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  categoryButtonTextActive: {
    color: '#fff',
  },
  imagePicker: {
    height: SCREEN_HEIGHT * 0.25,
    borderWidth: 2,
    borderColor: '#ddd',
    borderStyle: 'dashed',
    borderRadius: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.02,
    overflow: 'hidden',
  },
  imagePlaceholder: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f9f9f9',
  },
  imagePlaceholderText: {
    marginTop: SCREEN_HEIGHT * 0.01,
    color: '#666',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  featuredImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  editorContainer: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: SCREEN_WIDTH * 0.02,
    overflow: 'hidden',
  },
  toolbar: {
    flexDirection: 'row',
    padding: SCREEN_WIDTH * 0.02,
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    backgroundColor: '#f9f9f9',
  },
  toolbarButton: {
    padding: SCREEN_WIDTH * 0.02,
    marginRight: SCREEN_WIDTH * 0.02,
  },
  editorAndPreview: {
    flexDirection: 'row',
    height: SCREEN_HEIGHT * 0.25,
    borderTopWidth: 1,
    borderTopColor: '#ddd',
  },
  contentInput: {
    flex: 1,
    marginBottom: 0,
    borderRightWidth: 1,
    borderRightColor: '#ddd',
    padding: 10,
  },
  previewContainer: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f9f9f9',
  },
  previewScroll: {
    flex: 1,
  },
  previewLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  previewButton: {
    marginLeft: 'auto',
  },
  // Tags styles
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderRadius: SCREEN_WIDTH * 0.05,
    gap: SCREEN_WIDTH * 0.02,
  },
  tagText: {
    color: '#666',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  tagInputContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
    alignItems: 'flex-start',
  },
  tagInput: {
    flex: 1,
    marginBottom: 0,
  },
  addTagButton: {
    backgroundColor: Colors.light.primary,
    padding: SCREEN_WIDTH * 0.03,
    borderRadius: SCREEN_WIDTH * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Citations styles
  citationsList: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  citationItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.03,
    backgroundColor: '#f9f9f9',
    borderRadius: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  citationTitle: {
    fontSize: SCREEN_WIDTH * 0.035,
    color: '#333',
    fontWeight: '600',
  },
  citationAuthors: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    marginTop: SCREEN_HEIGHT * 0.005,
  },
  citationInfo: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SCREEN_HEIGHT * 0.015,
  },
  addCitationHeaderButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: SCREEN_WIDTH * 0.01,
  },
  addCitationText: {
    color: Colors.light.primary,
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
  },
  // Modal styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: SCREEN_WIDTH * 0.05,
    borderTopRightRadius: SCREEN_WIDTH * 0.05,
    height: SCREEN_HEIGHT * 0.8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: SCREEN_WIDTH * 0.05,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  modalTitle: {
    fontSize: SCREEN_WIDTH * 0.05,
    fontWeight: 'bold',
    color: '#333',
  },
  closeButton: {
    padding: SCREEN_WIDTH * 0.02,
  },
  modalScrollView: {
    flex: 1,
    padding: SCREEN_WIDTH * 0.05,
  },
  citationForm: {
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  citationTypeContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  citationTypeButton: {
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderRadius: SCREEN_WIDTH * 0.03,
    backgroundColor: '#f0f0f0',
  },
  citationTypeButtonActive: {
    backgroundColor: Colors.light.primary,
  },
  citationTypeText: {
    color: '#666',
    fontSize: SCREEN_WIDTH * 0.035,
  },
  citationTypeTextActive: {
    color: '#fff',
  },
  authorsContainer: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  subLabel: {
    fontSize: SCREEN_WIDTH * 0.035,
    fontWeight: '600',
    color: '#666',
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  authorsList: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: SCREEN_WIDTH * 0.02,
    marginBottom: SCREEN_HEIGHT * 0.01,
  },
  authorTag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
    paddingHorizontal: SCREEN_WIDTH * 0.03,
    paddingVertical: SCREEN_HEIGHT * 0.01,
    borderRadius: SCREEN_WIDTH * 0.05,
    gap: SCREEN_WIDTH * 0.02,
  },
  authorText: {
    color: '#666',
  },
  authorInputContainer: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.02,
    alignItems: 'flex-start',
  },
  addAuthorButton: {
    padding: SCREEN_WIDTH * 0.03,
    borderWidth: 1,
    borderColor: Colors.light.primary,
    borderRadius: SCREEN_WIDTH * 0.02,
    justifyContent: 'center',
    alignItems: 'center',
  },
  addCitationButton: {
    marginTop: SCREEN_HEIGHT * 0.02,
  },
  // Fixed Action buttons at bottom
  fixedActions: {
    flexDirection: 'row',
    gap: SCREEN_WIDTH * 0.03,
    padding: SCREEN_WIDTH * 0.05,
    backgroundColor: '#fff',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    paddingBottom: Platform.OS === 'ios' ? SCREEN_HEIGHT * 0.05 : SCREEN_WIDTH * 0.05, // Account for safe area
  },
  actionButtonCustom: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 20,
    borderRadius: SCREEN_WIDTH * 0.02,
    minHeight: 50,
  },
  primaryButton: {
    backgroundColor: Colors.light.primary,
  },
  secondaryButton: {
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  secondaryButtonText: {
    color: '#666',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  fieldContainer: {
    marginBottom: SCREEN_HEIGHT * 0.02,
  },
  citationType: {
    fontSize: SCREEN_WIDTH * 0.03,
    color: '#666',
    marginTop: SCREEN_HEIGHT * 0.005,
    fontStyle: 'italic',
  },
  modalKeyboardView: {
    flex: 1,
    justifyContent: 'flex-end',
  },
  modalScrollContent: {
    flexGrow: 1,
    paddingBottom: SCREEN_HEIGHT * 0.05,
  },
  modalFooter: {
    padding: SCREEN_WIDTH * 0.05,
    borderTopWidth: 1,
    borderTopColor: '#eee',
    backgroundColor: '#fff',
  },
  addCitationModalButton: {
    backgroundColor: Colors.light.primary,
    paddingVertical: SCREEN_HEIGHT * 0.015,
    paddingHorizontal: SCREEN_WIDTH * 0.05,
    borderRadius: SCREEN_WIDTH * 0.02,
    alignItems: 'center',
  },
  addCitationModalButtonText: {
    color: '#fff',
    fontSize: SCREEN_WIDTH * 0.04,
    fontWeight: '600',
  },
  fullPreviewModal: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    flex: 1,
    maxHeight: '80%',
  },
  fullPreviewContent: {
    padding: 20,
  },
  requiredFieldsLegend: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    paddingBottom: 0,
  },
  requiredFieldsText: {
    color: '#666',
    fontSize: 12,
  },
  requiredStar: {
    color: '#ff4444',
    fontSize: 12,
  },
});
export default BlogEditor;