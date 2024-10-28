import React, { useCallback, useEffect, useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  Image,
  FlatList,
  Modal,
  TouchableOpacity,
  TextInput,
  Animated,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Video } from "expo-av"; // Import Video from expo-av

const Explore = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filter, setFilter] = useState("Couple");
  const [fadeAnim] = useState(new Animated.Value(0));
  const [scaleAnim] = useState(new Animated.Value(1));

  const fetchPhotos = useCallback(async () => {
    setLoading(true);
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const endpoint =
        filter === "Couple"
          ? "https://locketcouplebe-production.up.railway.app/photo/findByCoupleId"
          : "https://locketcouplebe-production.up.railway.app/photo/findByLover";

      const response = await axios.get(endpoint, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const photosWithSenderInfo = response.data.data.map((photo) => ({
        ...photo,
        senderFullName: photo.senderId.fullName,
        senderAvatarUrl: photo.senderId.avatarUrl,
        mediaType: photo.photoUrl.endsWith(".mp4") ? "video" : "image", // Xác định loại phương tiện
      }));

      setPhotos(photosWithSenderInfo);
    } catch (error) {
      console.error("Error fetching photos:", error.response?.data || error.message);
    } finally {
      setLoading(false);
    }
  }, [filter]);

  const startFadeIn = () => {
    Animated.timing(fadeAnim, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  };

  const fetchComments = useCallback(async (photoId) => {
    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      const response = await axios.get(
        "https://locketcouplebe-production.up.railway.app/message/all",
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const photoComments = response.data.data.filter((comment) => comment.photoId === photoId);
      setComments(photoComments);
    } catch (error) {
      console.error("Error fetching comments:", error.response?.data || error.message);
    }
  }, []);

  useEffect(() => {
    fetchPhotos();
  }, [fetchPhotos]);

  const toggleDropdown = () => setDropdownVisible(!dropdownVisible);

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

  const handleCommentChange = (text) => setNewComment(text);

  const handleCommentSubmit = async () => {
    if (newComment.trim() === "") return;

    try {
      const token = await AsyncStorage.getItem("authToken");
      if (!token) return;

      await axios.post(
        "https://locketcouplebe-production.up.railway.app/message/create",
        { messageContent: newComment, photoId: selectedPhoto.photoId },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const updatedComments = [
        ...comments,
        { messageContent: newComment, photoId: selectedPhoto.photoId },
      ];
      setComments(updatedComments);
      setNewComment("");
    } catch (error) {
      console.error("Error posting comment:", error.response?.data || error.message);
    }
  };

  const renderMedia = (media) => {
    if (media.mediaType === "video") {
      return (
        <Video
          source={{ uri: media.photoUrl }}
          style={styles.fullScreenPhoto}
          resizeMode="contain"
          shouldPlay
          isLooping
          useNativeControls
        />
      );
    } else {
      return (
        <Animated.Image
          source={{ uri: selectedPhoto.photoUrl }}
          style={styles.fullScreenPhoto}
          onLoad={startFadeIn}
        />
      );
    }
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

      <FlatList
        data={photos}
        keyExtractor={(item) => item.photoId.toString()}
        contentContainerStyle={styles.innerContainer}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => openPhoto(item)}
            onPressIn={() => scaleAnim.setValue(0.95)}
            onPressOut={() => scaleAnim.setValue(1)}
          >
            <Animated.View style={[styles.photoContainer, { transform: [{ scale: scaleAnim }] }]}>
              {item.mediaType === "video" ? (
                <Video
                  source={{ uri: item.photoUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                  isLooping
                  shouldPlay={false} // Chỉ phát khi được mở
                />
              ) : (
                <Image source={{ uri: item.photoUrl }} style={styles.photo} />
              )}
              <View style={styles.overlay}>
                <Text style={styles.photoName}>{item.photoName}</Text>
                <View style={styles.senderInfo}>
                  {item.senderAvatarUrl && (
                    <Image source={{ uri: item.senderAvatarUrl }} style={styles.avatar} />
                  )}
                  <Text style={styles.senderName}>{item.senderFullName}</Text>
                </View>
              </View>
            </Animated.View>
          </TouchableOpacity>
        )}
      />

      {selectedPhoto && (
        <Modal visible={true} transparent={true}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closePhoto}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            

            {renderMedia(selectedPhoto)}
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
                    User ID: {comment.userId.fullName} | Photo ID: {comment.photoId}
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
    paddingVertical: 10,
    paddingHorizontal: 20,
    elevation: 5,
  },
  dropdownItem: {
    fontSize: 16,
    color: "white",
    paddingVertical: 5,
  },
  innerContainer: {
    paddingBottom: 100,
  },
  photoContainer: {
    margin: 10,
    borderRadius: 10,
    overflow: "hidden",
    elevation: 5,
  },
  photo: {
    width: "100%",
    height: 200,
  },
  fullScreenPhoto: {
    width: "100%",
    height: "50%",
    borderRadius: 10,
    marginBottom: 20,
    marginTop: 70,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 10,
  },
  photoName: {
    color: "white",
    fontSize: 16,
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
  },
  avatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    marginRight: 10,
  },
  senderName: {
    color: "white",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  closeButton: {
    position: "absolute",
    top: 40,
    right: 20,
  },
  closeText: {
    color: "white",
    fontSize: 18,
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
    backgroundColor: "#333",
    borderRadius: 5,
    padding: 10,
    marginBottom: 5,
  },
  commentText: {
    color: "white",
    fontSize: 14,
  },
  commentMetadata: {
    color: "lightgray",
    fontSize: 12,
  },
});
