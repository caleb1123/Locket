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

const Explore = () => {
  const [photos, setPhotos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPhoto, setSelectedPhoto] = useState(null);
  const [comments, setComments] = useState({});
  const [newComment, setNewComment] = useState("");

  // Fade animation
  const fadeAnim = useState(new Animated.Value(0))[0];
  const [scaleAnim] = useState(new Animated.Value(1));

  useEffect(() => {
    const fetchPhotos = async () => {
      try {
        const response = await axios.get(
          "https://locketcouplebe-production.up.railway.app/photo/findAll",
          { params: { coupleId: 1 } }
        );
        setPhotos(response.data.data);
        setLoading(false);
      } catch (error) {
        console.error(
          "Error fetching photos:",
          error.response?.data || error.message
        );
        setLoading(false);
      }
    };

    fetchPhotos();
  }, []);

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

  // Start fade animation when photo loads
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
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.innerContainer}>
          {photos.map((photo) => (
            <TouchableOpacity
              key={photo.photoId}
              onPress={() => openPhoto(photo)}
              onPressIn={handlePressIn}
              onPressOut={handlePressOut}
            >
              <Animated.View style={[styles.photoContainer, { transform: [{ scale: scaleAnim }] }]}>
                <Animated.Image
                  source={{ uri: photo.photoUrl }}
                  style={[styles.photo, { opacity: fadeAnim }]}
                  onLoad={startFadeIn} // Trigger fade-in on image load
                />
                <View style={styles.overlay}>
                  <Text style={styles.photoName}>{photo.photoName}</Text>
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

            <Image
              source={{ uri: selectedPhoto.photoUrl }}
              style={styles.fullScreenPhoto}
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
    width: 400,
    height: 400,
    position: "relative",
    borderRadius: 20,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3,
    elevation: 5,
  },
  photo: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  overlay: {
    position: "absolute",
    bottom: 10,
    left: 10,
    right: 10,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    paddingVertical: 5,
    alignItems: "center",
    borderRadius: 10,
  },
  photoName: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
    marginTop: 5,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "black",
    justifyContent: "center",
    alignItems: "center",
  },
  fullScreenPhoto: {
    width: "90%",
    height: "80%",
    resizeMode: "contain",
  },
  closeButton: {
    position: "absolute",
    top: 50,
    right: 20,
    zIndex: 1,
  },
  closeText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  commentInput: {
    width: "80%",
    borderWidth: 1,
    borderColor: "lightgray",
    borderRadius: 10,
    padding: 5,
    marginTop: 10,
    backgroundColor: "white",
  },
  commentsContainer: {
    marginTop: 10,
    width: "80%",
  },
  commentText: {
    color: "white",
    marginTop: 5,
    textAlign: "left",
  },
});
