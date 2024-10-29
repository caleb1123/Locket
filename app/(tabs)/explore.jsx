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
import { Video } from "expo-av";

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
        mediaType: photo.photoUrl.endsWith(".mp4") ? "video" : "image",
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

      const photoComments = response.data.data.filter(
        (comment) => comment.photoId === photoId
      );
      setComments(photoComments);
    } catch (error) {
      console.error(
        "Error fetching comments:",
        error.response?.data || error.message
      );
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
      console.error(
        "Error posting comment:",
        error.response?.data || error.message
      );
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
            <Animated.View
              style={[
                styles.photoContainer,
                { transform: [{ scale: scaleAnim }] },
              ]}
            >
              {item.mediaType === "video" ? (
                <Video
                  source={{ uri: item.photoUrl }}
                  style={styles.photo}
                  resizeMode="cover"
                  isLooping
                  shouldPlay={false}
                />
              ) : (
                <Image source={{ uri: item.photoUrl }} style={styles.photo} />
              )}
              <View style={styles.overlay}>
                <Text style={styles.photoName}>{item.photoName}</Text>
                <View style={styles.senderInfo}>
                  {item.senderAvatarUrl && (
                    <Image
                      source={{ uri: item.senderAvatarUrl }}
                      style={styles.avatar}
                    />
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
                <View
                  key={`${comment.photoId}-${index}`}
                  style={styles.commentItem}
                >
                  <View style={styles.commentHeader}>
                    {comment.userId?.avatarUrl ? (
                      <Image
                        source={{ uri: comment.userId.avatarUrl }}
                        style={styles.avatar}
                      />
                    ) : null}
                    <Text style={styles.commentUsername}>
                      {comment.userId?.fullName || "Anonymous"}
                    </Text>
                  </View>
                  <Text style={styles.commentText}>
                    {comment.messageContent}
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
    zIndex: 10,
    elevation: 10,
  },
  dropdownItem: {
    fontSize: 16,
    color: "white",
    paddingVertical: 5,
  },
  innerContainer: {
    padding: 10,
  },
  photoContainer: {
    marginBottom: 15,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
  },
  photo: {
    width: "100%",
    height: 200,
    borderRadius: 10,
  },
  overlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    padding: 10,
    backgroundColor: "rgba(0,0,0,0.6)",
  },
  photoName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
  senderInfo: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 5,
  },
  avatar: {
    width: 25,
    height: 25,
    borderRadius: 12.5,
    marginRight: 10,
  },
  senderName: {
    color: "white",
    fontSize: 14,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.9)",
    justifyContent: "center",
    alignItems: "center",
  },
  closeButton: {
    alignSelf: "flex-end",
    padding: 10,
  },
  closeText: {
    color: "white",
    fontSize: 16,
  },
  fullScreenPhoto: {
    width: "100%",
    height: "50%",
    borderRadius: 10,
  },
  commentInput: {
    height: 40,
    width: "90%",
    backgroundColor: "#333",
    color: "white",
    borderRadius: 10,
    paddingHorizontal: 10,
    marginVertical: 10,
  },
  commentsContainer: {
    width: "90%",
    paddingTop: 10,
  },
  commentItem: {
    marginBottom: 10,
    backgroundColor: "#333",
    padding: 10,
    borderRadius: 10,
  },
  commentHeader: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 5,
  },
  commentUsername: {
    color: "white",
    fontSize: 14,
    fontWeight: "bold",
  },
  commentText: {
    color: "white",
    fontSize: 14,
  },
});
