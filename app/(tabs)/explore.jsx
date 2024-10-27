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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import axios from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

const Explore = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [filter, setFilter] = useState("All");

  const fadeAnim = useState(new Animated.Value(0))[0];
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    fetchPhotos();
  }, [filter]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      let endpoint;
      if (filter === "All") {
        endpoint =
          "https://locketcouplebe-production.up.railway.app/photo/findAll";
      } else if (filter === "Couple") {
        endpoint = `https://locketcouplebe-production.up.railway.app/photo/findByCoupleId`;
      } else if (filter === "Lover") {
        endpoint =
          "https://locketcouplebe-production.up.railway.app/photo/findByLover";
      }

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
  };

  const closePhoto = () => {
    setSelectedPhoto(null);
  };

  const handleCommentChange = (text) => {
    setNewComment(text);
  };

  const handleCommentSubmit = () => {
    if (newComment.trim() === "") return;
    setComments((prevComments) => {
      const existingComments = prevComments[selectedPhoto.photoId] || [];
      return {
        ...prevComments,
        [selectedPhoto.photoId]: [...existingComments, newComment],
      };
    });
    setNewComment("");
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
        <Text>Loading...</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="h-full bg-black-100" style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.headerTextContainer}
          onPress={toggleDropdown}
        >
          <Text style={styles.headerText}>
            {filter === "All"
              ? "All Pictures"
              : filter === "Couple"
              ? "Couple Pictures"
              : "Lover Pictures"}
          </Text>
        </TouchableOpacity>
      </View>
      {dropdownVisible && (
        <View style={styles.dropdown}>
          <TouchableOpacity onPress={() => selectFilter("All")}>
            <Text style={styles.dropdownItem}>All Pictures</Text>
          </TouchableOpacity>
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

      {/* Modal to show full-screen photo */}
      {selectedPhoto && (
        <Modal visible={true} transparent={true}>
          <View style={styles.modalContainer}>
            <TouchableOpacity style={styles.closeButton} onPress={closePhoto}>
              <Text style={styles.closeText}>Close</Text>
            </TouchableOpacity>

            <Animated.Image
              source={{ uri: selectedPhoto.photoUrl }}
              style={styles.fullScreenPhoto}
              onLoad={startFadeIn} // Trigger fade-in on image load
            />
            <Text style={styles.photoName}>{selectedPhoto.photoName}</Text>

            {/* Comment Input */}
            <TextInput
              style={styles.commentInput}
              placeholder="Add a comment..."
              placeholderTextColor="lightgray"
              value={newComment}
              onChangeText={handleCommentChange}
              onSubmitEditing={handleCommentSubmit}
            />

            {/* Display comments */}
            <View style={styles.commentsContainer}>
              {(comments[selectedPhoto.photoId] || []).map((comment, index) => (
                <Text key={index} style={styles.commentText}>
                  {comment}
                </Text>
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
  },
  header: {
    padding: 15,
    backgroundColor: "#222",
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  headerTextContainer: {
    backgroundColor: "#555",
    borderRadius: 10,
    paddingVertical: 8,
    paddingHorizontal: 12,
    alignItems: "center",
  },
  headerText: {
    fontSize: 18,
    color: "white",
  },
  dropdown: {
    position: "absolute",
    top: 60,
    alignSelf: "center",
    left: 15,
    backgroundColor: "#333",
    borderRadius: 10,
    paddingVertical: 5,
    width: 150,
    zIndex: 1,
  },
  dropdownItem: {
    padding: 10,
    fontSize: 16,
    color: "white",
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  innerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  photoContainer: {
    width: 300,
    height: 400,
    marginBottom: 15,
    borderRadius: 10,
    overflow: "hidden",
    position: "relative",
  },
  photo: {
    width: "100%",
    height: "100%",
    borderRadius: 10,
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
    color: "lightgray",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    alignItems: "center",
    justifyContent: "center",
    padding: 20,
    overflow: "hidden", 
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
  fullScreenContainer: {
    alignItems: "center",
  },
  fullScreenPhoto: {
    width: "100%",
    height: "70%",
    resizeMode: "contain",
    borderRadius: 30, 
    marginBottom: 20, 
    borderWidth: 2,
},
  fullScreenAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 5,
  },
  commentInput: {
    height: 40,
    borderColor: "gray",
    borderWidth: 1,
    borderRadius: 5,
    paddingHorizontal: 10,
    width: "100%",
    color: "white",
  },
  commentsContainer: {
    marginTop: 10,
    width: "100%",
  },
  commentText: {
    color: "lightgray",
    marginVertical: 2,
  },
});
