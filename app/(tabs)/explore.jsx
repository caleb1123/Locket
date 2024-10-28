import React, { useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  ScrollView,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Explore = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filter, setFilter] = useState("Couple");

  const fadeAnim = useState(new Animated.Value(0))[0];
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const endpoint =
        filter === "Couple"
          ? "https://locketcouplebe-production.up.railway.app/photo/findByCoupleId"
          : "https://locketcouplebe-production.up.railway.app/photo/findByLover";

      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(endpoint, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      const photosWithSenderInfo = response.data.data.map((photo) => ({
        ...photo,
        senderFullName: photo.senderId.fullName,
        senderAvatarUrl: photo.senderId.avatarUrl,
      }));

      setPhotos(photosWithSenderInfo);
    } catch (error) {
      console.error(
        "Error fetching photos:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  const fetchComments = async (photoId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      const response = await axios.get(
        `https://locketcouplebe-production.up.railway.app/message/all`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const photoComments = response.data.data.filter((comment) => comment.photoId === photoId);
      setComments(photoComments);
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error.response?.data || error.message
      );
    }
  };

  const toggleDropdown = () => {
    setDropdownVisible(!dropdownVisible);
  };

  const selectFilter = (selectedFilter) => {
    setFilter(selectedFilter);
    setDropdownVisible(false);
  };

  const openPhoto = (photo) => {
    setSelectedPhoto(photo);
    setNewComment("");
    fetchComments(photo.photoId);
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
    setComments([]);
  };

  const handleCommentChange = (text) => {
    setNewComment(text);
  };

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      await axios.post(
        "https://locketcouplebe-production.up.railway.app/message/create",
        {
          messageContent: newComment,
          photoId: selectedPhoto.photoId,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      // Add the new comment
      const updatedComments = [
        ...comments,
        { messageContent: newComment, photoId: selectedPhoto.photoId },
      ];
      setComments(updatedComments);
      setNewComment("");
    } catch (error) {
      console.error(
        "Error posting comment:",
        error.response?.data || error.message
      );
    }
  };

  const startFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const handlePressIn = () => {
    Animated.spring(scaleAnim, {
      toValue: 0.95,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(scaleAnim, {
      toValue: 1,
      friction: 3,
      useNativeDriver: true,
    }).start();
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <ActivityIndicator size="large" color="#ffffff" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerTextContainer}
          onPress={toggleDropdown}
        >
          <Text style={styles.headerText}>
            {filter === "Couple" ? "Couple Pictures" : "Lover Pictures"}
          </Text>
        </TouchableOpacity>
      </View>
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity onPress={() => selectFilter("Couple")}>
            <Text style={styles.dropdownItem}>Couple Pictures</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => selectFilter("Lover")}>
            <Text style={styles.dropdownItem}>Lover Pictures</Text>
          </TouchableOpacity>
        </View>
      )}

      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          {photos.map((photo) => (
            <TouchableOpacity
              key={photo.photoId}
              onPress={() => openPhoto(photo)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View
                style={[
                  styles.photoContainer,
                  { transform: [{ scale: scaleAnim }] },
                ]}
              >
                <Animated.Image
                  source={{ uri: photo.photoUrl }}
                  style={[styles.photo, { opacity: fadeAnim }]}
                  onLoad={startFadeIn}
                />
                <View style={styles.overlay}>
                  <Text style={styles.photoName}>{photo.photoName}</Text>
                  <View style={styles.senderInfo}>
                    {photo.senderAvatarUrl && (
                      <Image
                        source={{ uri: photo.senderAvatarUrl }}
                        style={styles.avatar}
                      />
                    )}
                    <Text style={styles.senderName}>
                      {photo.senderFullName}
                    </Text>
                  </View>
                </View>
              </Animated.View>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>

      {selectedPhoto && (
        <Modal visible={true} transparent={true}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closePhoto}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            <Animated.Image
              source={{ uri: selectedPhoto.photoUrl }}
              style={styles.fullScreenPhoto}
              onLoad={startFadeIn}
            />
            <Text style={styles.photoName}>{selectedPhoto.photoName}</Text>

            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="lightgray"
              value={newComment}
              onChangeText={handleCommentChange}
              onSubmitEditing={handleCommentSubmit}
            />

            <View style={styles.commentsContainer}>
              {comments.map((comment, index) => (
                <View key={`${comment.photoId}-${index}`} style={styles.commentItem}>
                  <Text style={styles.commentText}>
                    {comment.messageContent}
                  </Text>
                  <Text style={styles.commentMetadata}>
                    User ID: {comment.userId} | Photo ID: {comment.photoId}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
};

export default Explore;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  header: {
    padding: 15,
    backgroundColor: "#222",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    backgroundColor: "#555",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
  },
  headerText: {
    fontSize: 18,
    color: "white",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 5,
    width: 160,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: "white",
    textAlign: "center",
  },
  innerContainer: {
    alignItems: "center",
  },
  innerContainer: {
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 20,
  },
  photoContainer: {
    width: 300,
    height: 400,
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: "100%",
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
  },
  photoName: {
    color: "white",
    fontSize: 14,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 5,
  },
  senderName: {
    color: "white",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
    padding: 10,
    backgroundColor: "#444",
    borderRadius: 5,
  },
  closeText: {
    color: "white",
    fontSize: 16,
  },
  fullScreenPhoto: {
    width: "100%",
    height: "50%",
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 70,
  },
  commentInput: {
    width: "100%",
    padding: 10,
    backgroundColor: "#222",
    borderRadius: 5,
    color: "white",
    marginBottom: 20,
  },
  commentsContainer: {
    width: "100%",
    marginTop: 20,
  },
  commentItem: {
    backgroundColor: "#444",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  commentText: {
    color: "white",
  },
  commentMetadata: {
    color: "lightgray",
    fontSize: 12,
  },
});
