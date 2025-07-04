import { useRouter, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  View, Text, FlatList, Image, TouchableOpacity,
  StyleSheet, ActivityIndicator, ScrollView, Modal, TextInput, Alert
} from "react-native";
import {
  getUserProfile,
  getUserPosts,
  updatePostReview,
  addPatientTreatment,
  getPatientTreatments,
  deactivatePatientTreatment,
  getQuestionsAndAnswers,
  sendAnswerToPatientQuestion
} from "../../../../../lib/firebase-service";
import { Colors } from "../../../../../constants/Colors";
import { useColorScheme } from "react-native";
import { Ionicons } from "@expo/vector-icons";

const PatientJourneyScreen = () => {
  const { patientId } = useLocalSearchParams<{ patientId: string }>();
  const colorScheme = useColorScheme();
  const theme = Colors[colorScheme ?? "light"];
  const [user, setUser] = useState<any>(null);
  const [posts, setPosts] = useState<any[]>([]);
  const [filteredPosts, setFilteredPosts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showReviewedOnly, setShowReviewedOnly] = useState(false);
  const router = useRouter();
  const [selectedPost, setSelectedPost] = useState<any | null>(null);
  const [feedbackText, setFeedbackText] = useState("");
  const [showTreatmentModal, setShowTreatmentModal] = useState(false);
  const [treatmentInput, setTreatmentInput] = useState(user?.treatment || "");
  const [treatments, setTreatments] = useState<{ name: string; instructions: string }[]>([]);
  const [currentTreatment, setCurrentTreatment] = useState("");
  const [currentInstructions, setCurrentInstructions] = useState("");
  const [notes, setNotes] = useState("");
  const [savedTreatments, setSavedTreatments] = useState<any[]>([]);
  const [showAllTreatmentsModal, setShowAllTreatmentsModal] = useState(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [showQuestionsModal, setShowQuestionsModal] = useState(false);
  const [selectedQuestion, setSelectedQuestion] = useState<any | null>(null);
  const [answerText, setAnswerText] = useState("");

  // Fetch user profile and posts
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const userData = await getUserProfile(patientId!);
        const userPosts = await getUserPosts(patientId!);
        setUser(userData);
        setPosts(userPosts);
        setFilteredPosts(userPosts);
      } catch (e) {
        console.error("Error fetching data:", e);
      } finally {
        setLoading(false);
      }
    };
    if (patientId) fetchData();
  }, [patientId]);

  // Filter posts based on review status
  useEffect(() => {
    if (showReviewedOnly) {
      setFilteredPosts(posts.filter((post) => !post.reviewed));
    } else {
      setFilteredPosts(posts);
    }
  }, [showReviewedOnly, posts]);

  // Fetch all patient questions
  useEffect(() => {
    if (!patientId) return;
    const fetchQuestions = async () => {
      const data = await getQuestionsAndAnswers(patientId);
      setQuestions(data);
    };
    fetchQuestions();
  }, [patientId, showQuestionsModal, selectedQuestion]);

  const reviewedCount = posts.filter((p) => p.reviewed).length;

  // Render a single post item
  const renderItem = ({ item }: { item: any }) => {
    console.log("Image URL:", item.imageUrl);
    return (
      <TouchableOpacity
        style={styles.postButton}
        onPress={() => {
          setSelectedPost(item);
          setFeedbackText(item.feedback || "");
        }}
      >
        <Image source={{ uri: item.imageUrl }} style={styles.image} />
        <Text style={styles.postText}>
          {item.reviewed ? "✅ Reviewed" : "🕒 To review"}
        </Text>
      </TouchableOpacity>
    );
  };

  // Add a treatment to the local list
  const handleAddTreatment = () => {
    if (!currentTreatment) return;
    setTreatments([...treatments, { name: currentTreatment, instructions: currentInstructions }]);
    setCurrentTreatment("");
    setCurrentInstructions("");
  };

  // Save all treatments to Firestore
  const handleSaveAll = async () => {
    if (treatments.length === 0) {
      Alert.alert("Attention", "Add at least one treatment using the + button before saving!");
      return;
    }
    let success = true;
    for (const t of treatments) {
      try {
        await addPatientTreatment(patientId!, {
          name: t.name,
          instructions: t.instructions,
          notes,
        });
      } catch (e) {
        console.error("[addPatientTreatment] error:", e);
        Alert.alert("Error adding treatment", String(e));
        success = false;
      }
    }
    setTreatments([]);
    setNotes("");
    setShowTreatmentModal(false);
    if (patientId) {
      const treatments = await getPatientTreatments(patientId);
      setSavedTreatments(treatments);
    }
    if (success) {
      Alert.alert("Success", "Treatments have been saved successfully!");
    }
  };

  // Number of unanswered questions
  const unansweredCount = questions.filter(q => !q.answer).length;

  // Send answer to a patient question
  const handleSendAnswer = async () => {
    if (!selectedQuestion) return;
    await sendAnswerToPatientQuestion(patientId!, selectedQuestion.id, answerText);
    setSelectedQuestion(null);
    setAnswerText("");
    setShowQuestionsModal(true); // reopen the list after answering
  };

  if (loading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={theme.primary} />
      </View>
    );
  }

  return (
    <>
      {/* Top right messages button */}
      <View style={{ position: "absolute", top: 36, right: 24, zIndex: 10 }}>
        <TouchableOpacity onPress={() => setShowQuestionsModal(true)}>
          <Ionicons name="chatbubble-ellipses-outline" size={32} color={theme.primary} />
          {unansweredCount > 0 && (
            <View style={{
              position: "absolute",
              top: -4,
              right: -4,
              backgroundColor: "red",
              borderRadius: 10,
              minWidth: 20,
              height: 20,
              justifyContent: "center",
              alignItems: "center",
              paddingHorizontal: 5,
            }}>
              <Text style={{ color: "#fff", fontWeight: "bold", fontSize: 12 }}>{unansweredCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <FlatList
        ListHeaderComponent={
          <View style={[styles.header, { backgroundColor: theme.cardBackground }]}>
            <Image source={{ uri: user?.profileImage }} style={styles.profileImage} />
            <Text style={[styles.title, { color: theme.title }]}>{user?.name || user?.username || user?.email}</Text>
            <Text style={[styles.subTitle, { color: theme.textSecondary }]}>Posts: {reviewedCount}/{posts.length} reviewed</Text>
            
            {/* Treatment buttons */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "center" }}>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: theme.primary }]}
                onPress={() => setShowTreatmentModal(true)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Add treatment</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: theme.primary }]}
                onPress={async () => {
                  if (patientId) {
                    const treatments = await getPatientTreatments(patientId);
                    setSavedTreatments(treatments);
                  }
                  setShowAllTreatmentsModal(true);
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>View treatments</Text>
              </TouchableOpacity>
            </View>
            {/* Filter buttons */}
            <View style={styles.buttonsRow}>
              <TouchableOpacity
                onPress={() => setShowReviewedOnly(false)}
                activeOpacity={0.8}
                disabled={!showReviewedOnly}
              >
                <Text style={{
                  color: !showReviewedOnly ? theme.primary : theme.textSecondary,
                  fontWeight: "bold",
                  fontSize: 16,
                  textDecorationLine: !showReviewedOnly ? "underline" : "none",
                  opacity: !showReviewedOnly ? 1 : 0.7,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}>
                  All posts
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setShowReviewedOnly(true)}
                activeOpacity={0.8}
                disabled={showReviewedOnly}
              >
                <Text style={{
                  color: showReviewedOnly ? theme.primary : theme.textSecondary,
                  fontWeight: "bold",
                  fontSize: 16,
                  textDecorationLine: showReviewedOnly ? "underline" : "none",
                  opacity: showReviewedOnly ? 1 : 0.7,
                  paddingHorizontal: 8,
                  paddingVertical: 4,
                }}>
                  To review
                </Text>
              </TouchableOpacity>
            </View>
            
          </View>
        }
        data={filteredPosts}
        numColumns={2}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={{
          backgroundColor: theme.background,
          padding: 8,
          paddingBottom: 80, 
        }}
      />

      {/* Modal for post feedback */}
      <Modal
        visible={!!selectedPost}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedPost(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Image source={{ uri: selectedPost?.imageUrl }} style={styles.modalImage} />
            <Text style={{ fontWeight: "bold", marginBottom: 4, color: theme.textPrimary }}>
              Description: {selectedPost?.description}
            </Text>

            <TextInput
              multiline
              placeholder="Add feedback..."
              value={feedbackText}
              onChangeText={setFeedbackText}
              style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary }]}
              placeholderTextColor={theme.textSecondary}
            />

            <View style={{ flexDirection: "row", gap: 10, justifyContent: "center", marginTop: 8 }}>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 32,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 4,
                  minWidth: 48,
                  minHeight: 48,
                }}
                onPress={async () => {
                  try {
                    await updatePostReview(patientId!, selectedPost.id, {
                      reviewed: true,
                      feedback: feedbackText,
                      feedbackTimestamp: new Date().toISOString(),
                    });

                    setSelectedPost({ ...selectedPost, feedback: feedbackText, reviewed: true, feedbackTimestamp: new Date().toISOString() });
                    setPosts((prev) =>
                      prev.map((p) =>
                        p.id === selectedPost.id
                          ? { ...p, feedback: feedbackText, reviewed: true, feedbackTimestamp: new Date().toISOString() }
                          : p
                      )
                    );
                    setSelectedPost(null);
                  } catch (e) {
                    console.error("Error saving feedback:", e);
                  }
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Save feedback</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={{
                  backgroundColor: theme.primary,
                  borderRadius: 32,
                  paddingVertical: 12,
                  paddingHorizontal: 24,
                  alignItems: "center",
                  justifyContent: "center",
                  marginHorizontal: 4,
                  minWidth: 48,
                  minHeight: 48,
                }}
                onPress={() => setSelectedPost(null)}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
              </TouchableOpacity>
            </View>

            {selectedPost?.reviewed && selectedPost?.feedback && (
              <View style={{ marginTop: 16, backgroundColor: theme.succesBackground, borderRadius: 8, padding: 10, alignSelf: "stretch" }}>
                <Text style={{ color: theme.succesText, fontWeight: "bold", marginBottom: 2 }}>
                  Doctor's feedback:
                </Text>
                <Text style={{ color: theme.succesText, fontStyle: "italic" }}>
                  {selectedPost.feedback}
                </Text>
                {selectedPost.feedbackTimestamp && (
                  <Text style={{ color: theme.textSecondary, fontSize: 12, marginTop: 4 }}>
                    {formatTimeAgo(selectedPost.feedbackTimestamp)}
                  </Text>
                )}
              </View>
            )}
          </View>
        </View>
      </Modal>

      {/* Modal for adding treatments */}
      <Modal visible={showTreatmentModal} transparent animationType="slide" onRequestClose={() => {
        setShowTreatmentModal(false);
        setCurrentTreatment("");
        setCurrentInstructions("");
        setTreatments([]);
        setNotes("");
      }}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground }]}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8, color: theme.textPrimary }}>
              Add treatment
            </Text>
            {/* Treatment input and add button */}
            <View style={{ flexDirection: "row", alignItems: "center", width: "80%", gap: 8 }}>
              <TextInput
                value={currentTreatment}
                onChangeText={setCurrentTreatment}
                placeholder="Treatment name"
                style={[
                  styles.treatmentInput,
                  { backgroundColor: theme.textInputBackground, color: theme.textPrimary, flex: 1, marginBottom: 0 }
                ]}
                placeholderTextColor={theme.textSecondary}
              />
              <TouchableOpacity
                onPress={handleAddTreatment}
                style={{
                  marginLeft: 8,
                  backgroundColor: theme.primary,
                  borderRadius: 20,
                  width: 36,
                  height: 36,
                  alignItems: "center",
                  justifyContent: "center",
                }}
                disabled={!currentTreatment}
              >
                <Ionicons name="add" size={24} color="#fff" />
              </TouchableOpacity>
            </View>
            {/* Instructions input */}
            {currentTreatment.length > 0 && (
              <TextInput
                value={currentInstructions}
                onChangeText={setCurrentInstructions}
                placeholder="Usage instructions"
                style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary }]}
                placeholderTextColor={theme.textSecondary}
              />
            )}
            
            {/* List of added treatments */}
            {treatments.map((t, idx) => (
              <View key={idx} style={{ marginTop: 10, backgroundColor: "#eee", borderRadius: 8, padding: 5, flexDirection: "row", alignItems: "center" }}>
                <View style={{ flex: 1 }}>
                  <Text style={{ fontWeight: "bold" }}>{t.name}</Text>
                  <Text style={{ color: theme.textSecondary }}>Instructions: {t.instructions}</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    // Remove treatment only from local list (not from Firestore)
                    setTreatments(prev => prev.filter((_, i) => i !== idx));
                  }}
                  style={{ marginLeft: 8, padding: 4 }}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  <Ionicons name="close-circle" size={24} color="#d00" />
                </TouchableOpacity>
              </View>
            ))}

            {/* Notes input */}
            <TextInput
              value={notes}
              onChangeText={setNotes}
              placeholder="General notes (optional)"
              style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, minHeight: 40 }]}
              placeholderTextColor={theme.textSecondary}
              multiline
            />

            {/* Save and Cancel buttons */}
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "center" }}>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: theme.primary }]}
                onPress={handleSaveAll}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Save all</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: "#bbb" }]}
                onPress={() => {
                  setShowTreatmentModal(false);
                  setCurrentTreatment("");
                  setCurrentInstructions("");
                  setTreatments([]);
                  setNotes("");
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Modal for viewing all treatments */}
      <Modal
        visible={showAllTreatmentsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowAllTreatmentsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, maxHeight: 400 }]}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8, color: theme.textPrimary }}>
              All patient treatments
            </Text>
            <ScrollView style={{ width: "100%" }}>
              {savedTreatments.length === 0 ? (
                <Text style={{ color: "#888" }}>No treatments saved.</Text>
              ) : (
                savedTreatments.map((t, idx) => (
                  <View key={t.id || idx} style={{ marginTop: 10, backgroundColor: "#eee", borderRadius: 8, padding: 10, flexDirection: "row", alignItems: "center" }}>
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontWeight: "bold" }}>{t.name}</Text>
                      <Text style={{ color: theme.textSecondary }}>Instructions: {t.instructions}</Text>
                      {t.notes && <Text style={{ color: theme.textSecondary }}>Notes: {t.notes}</Text>}
                      {t.active === false && (
                        <Text style={{ color: "#d00", fontWeight: "bold" }}>Inactive</Text>
                      )}
                    </View>
                    {t.active !== false && (
                      <TouchableOpacity
                        onPress={async () => {
                          await deactivatePatientTreatment(patientId!, t.id);
                          // Refresh list after deactivation
                          const treatments = await getPatientTreatments(patientId!);
                          setSavedTreatments(treatments);
                        }}
                        style={{ marginLeft: 8, padding: 4 }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Ionicons name="close-circle" size={24} color="#d00" />
                      </TouchableOpacity>
                    )}
                  </View>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={[styles.roundButton, { backgroundColor: "#bbb", marginTop: 16 }]}
              onPress={() => setShowAllTreatmentsModal(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for patient questions */}
      <Modal
        visible={showQuestionsModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowQuestionsModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, maxHeight: 400 }]}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8, color: theme.textPrimary }}>
              Patient questions
            </Text>
            <ScrollView style={{ width: "100%" }}>
              {questions.length === 0 ? (
                <Text style={{ color: "#888" }}>No patient questions.</Text>
              ) : (
                questions.map((q, idx) => (
                  <TouchableOpacity
                    key={q.id || idx}
                    onPress={() => {
                      setShowQuestionsModal(false);
                      setSelectedQuestion(q);
                      setAnswerText(q.answer || "");
                    }}
                    style={{
                      marginTop: 10,
                      backgroundColor: q.answer ? "#eee" : "#ffeaea",
                      borderRadius: 8,
                      padding: 10,
                      borderWidth: q.answer ? 0 : 1,
                      borderColor: q.answer ? "#eee" : "#d00",
                    }}
                  >
                    <Text style={{ fontWeight: "bold" }}>Question:</Text>
                    <Text style={{ color: theme.textPrimary }}>{q.question}</Text>
                    {q.answer ? (
                      <Text style={{ color: theme.primary, marginTop: 4 }}>
                        <Text style={{ fontWeight: "bold" }}>Answer: </Text>
                        {q.answer}
                      </Text>
                    ) : (
                      <Text style={{ color: "#d00", marginTop: 4, fontStyle: "italic" }}>No Answer</Text>
                    )}
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            <TouchableOpacity
              style={[styles.roundButton, { backgroundColor: "#bbb", marginTop: 16 }]}
              onPress={() => setShowQuestionsModal(false)}
            >
              <Text style={{ color: "#fff", fontWeight: "bold" }}>Close</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Modal for answering a question */}
      <Modal
        visible={!!selectedQuestion}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedQuestion(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: theme.cardBackground, maxHeight: 350 }]}>
            <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 8, color: theme.textPrimary }}>
              Answer the question
            </Text>
            <Text style={{ marginBottom: 8, color: theme.textPrimary }}>
              {selectedQuestion?.question}
            </Text>
            <TextInput
              value={answerText}
              onChangeText={setAnswerText}
              placeholder="Write your answer here..."
              style={[styles.input, { backgroundColor: theme.textInputBackground, color: theme.textPrimary, minHeight: 60 }]}
              placeholderTextColor={theme.textSecondary}
              multiline
            />
            <View style={{ flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "center" }}>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: theme.primary }]}
                onPress={handleSendAnswer}
                disabled={!answerText.trim()}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Send answer</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.roundButton, { backgroundColor: "#bbb" }]}
                onPress={() => {
                  setSelectedQuestion(null);
                  setAnswerText("");
                  setShowQuestionsModal(true); // reopen the list on close
                }}
              >
                <Text style={{ color: "#fff", fontWeight: "bold" }}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </>
  );
};

// Format ISO date to "time ago" string
function formatTimeAgo(isoDate: string) {
  const date = new Date(isoDate);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  if (diffD > 0) return `${diffD} day${diffD > 1 ? "s" : ""} ago`;
  if (diffH > 0) return `${diffH} hour${diffH > 1 ? "s" : ""} ago`;
  if (diffMin > 0) return `${diffMin} minute${diffMin > 1 ? "s" : ""} ago`;
  return "just now";
}

// Styles
const styles = StyleSheet.create({
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  header: { alignItems: "center", padding: 16 },
  title: { fontSize: 22, fontWeight: "bold", marginTop: 8 },
  subTitle: { fontSize: 16, marginVertical: 4 },
  profileImage: {
    width: 100, height: 100, borderRadius: 50, backgroundColor: "#ccc",
  },
  details: {
    marginTop: 10, alignItems: "flex-start", width: "100%", paddingHorizontal: 32
  },
  buttonsRow: {
    flexDirection: "row", gap: 10, marginTop: 12, justifyContent: "space-evenly"
  },
  postButton: {
    flex: 1,
    alignItems: "center",
    margin: 8,
    padding: 8,
    backgroundColor: "#eee",
    borderRadius: 12,
    // iOS shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    // Android shadow
    elevation: 3,
  },
  image: { width: 140, height: 140, borderRadius: 8 },
  postText: { marginTop: 6, fontSize: 14, fontWeight: "500" },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 12,
    width: "85%",
    alignItems: "center",
  },
  modalImage: {
    width: 200,
    height: 200,
    borderRadius: 8,
    marginBottom: 12,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    width: "80%",
    minHeight: 80,
    textAlignVertical: "top",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  treatmentInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 8,
    width: "80%",
    minHeight: 20,
    textAlignVertical: "top",
    marginBottom: 10,
  },
  roundButton: {
    borderRadius: 24,
    paddingVertical: 10,
    paddingHorizontal: 22,
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: 4,
    minWidth: 48,
    minHeight: 40,
  },
  buttonInactive: {
    backgroundColor: "#bbb",
  },
});

export default PatientJourneyScreen;
