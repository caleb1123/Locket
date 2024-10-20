import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, View, Text, TouchableOpacity, Image, RefreshControl, StyleSheet, Modal } from 'react-native'; // Ensure Modal is imported
import { useGlobalContext } from '../../context/GlobalProvider';
import VideoCard from '../../components/VideoCard';
import InfoBox from '../../components/InfoBox';
import { MaterialIcons } from '@expo/vector-icons';
import FormField from '../../components/FormField';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';

const Profile = () => {
  const { user, setIsLogged } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // State for modal visibility
  const [modalVisible, setModalVisible] = useState(false);

  // State for profile information
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [dob, setDob] = useState('');
  const [avtUrl, setAvatarUrl] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('authToken');
        const response = await fetch('https://locketcouplebe-production.up.railway.app/auth/my-profile', {
          method: 'GET',
          headers: {
            Authorization: `Bearer ${storedToken}`,
            'Content-Type': 'application/json',
          },
        });

        const data = await response.json();
        console.log(storedToken);
        if (data.code === 200) {
          setFullName(data.data.fullName);
          setUserName(data.data.userName);
          setEmail(data.data.email);
          setAvatarUrl(data.data.avatarUrl);
          setDob(data.data.dob);
          setAddress(data.data.address);
        } else {
          console.error(data.message);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchProfile();
  }, [user]);

  const logout = async () => {
    try {
      await AsyncStorage.removeItem('authToken');
      setIsLogged(false);
      router.replace('/sign-in');
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    // Refresh logic here
    setRefreshing(false);
  };
  console.log('Avatar URL:', avtUrl);

  const handleEditProfile = () => {
    // Handle saving edited information
    console.log({ fullName, userName, email, phone });
    setModalVisible(false); // Close modal after saving
  };

  return (
    <SafeAreaView className="bg-black-100 h-full">
      <FlatList
        data={posts}
        keyExtractor={(item) => item.$id}
        renderItem={({ item }) => (
          <VideoCard
            title={item.title}
            thumbnail={item.thumbnail}
            video={item.video}
            creator={item.creator.username}
            avatar={item.creator.avatar}
            fromUser={true}
            docId={item.$id}
            time={item.$createdAt}
          />
        )}
        ListHeaderComponent={() => (
          <View className="w-full flex justify-center items-center mt-6 mb-12 px-4">
            {/* Avatar Section */}
            <View className="mt-5 w-20 h-20 border border-secondary rounded-[46px] flex justify-center items-center relative">
              <Image
                source={{ uri: avtUrl }}
                className="w-[90%] h-[90%] rounded-[46px]"
                resizeMode="cover"
              />
              <TouchableOpacity
                className="absolute bottom-0 right-0 bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center"
                onPress={() => setModalVisible(true)}
              >
                <Text style={{ fontSize: 14, color: 'white' }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Display user information */}
            <InfoBox
              title={userName}
              containerStyles="mt-5"
              titleStyles="text-lg font-poppins-medium text"
            />

            {/* General Settings */}
            <View className="w-full mt-5">
              {/* General Title */}
              <View className="flex flex-row items-center mb-2">
                <MaterialIcons name="person" size={20} color="#7B7B8B" />
                <Text style={[styles.headerText, { marginLeft: 8 }]}>General</Text>
              </View>

              {/* Edit Profile */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 rounded-t-lg bg-gray-800"
                onPress={() => setModalVisible(true)}
              >
                <Text style={styles.buttonText}>Edit Profile</Text>
                <MaterialIcons name="person" size={20} color="white" />
              </TouchableOpacity>

              {/* Log Out */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 rounded-b-lg bg-gray-800"
                onPress={logout}
              >
                <Text style={styles.logoutText}>Log Out</Text>
                <MaterialIcons name="logout" size={20} color="red" />
              </TouchableOpacity>
            </View>
          </View>
        )}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      />

      {/* Popup Edit Profile Modal */}
      <Modal transparent={true} animationType="slide" visible={modalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: '#222222' }]}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <FormField
              title="Full Name"
              value={fullName}
              handleChangeText={(e) => setFullName(e)}
              otherStyles="mt-7"
            />
            <FormField
              title="Address"
              value={address}
              handleChangeText={(e) => setAddress(e)}
              otherStyles="mt-7"
            />
            <FormField
              title="Email"
              value={email}
              handleChangeText={(e) => setEmail(e)}
              otherStyles="mt-7"
              keyboardType="email-address"
            />
            <FormField
              title="Date of Birth"
              value={dob}
              handleChangeText={(e) => setDob(e)}
              keyboardType="default" // Change this to "numeric" if you prefer
              placeholder="DD/MM/YYYY" // Optional placeholder to guide users
              otherStyles="mt-7"
            />

            {/* Button Container */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleEditProfile} style={[styles.button, { backgroundColor: '#63B5F6' }]}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={[styles.button, { backgroundColor: '#63B5F6' }]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  headerText: {
    fontFamily: 'Poppins-Medium',
    color: '#7B7B8B',
    fontSize: 16,
  },
  buttonText: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
    fontSize: 16,
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    color: 'red',
    fontSize: 16,
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContent: {
    width: '80%',
    backgroundColor: 'white',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 15,
    color: '#7B7B8B',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    flex: 1,
    marginHorizontal: 5,
    padding: 10, // Add padding for a better touch area
    borderRadius: 5, // Round the corners of the button
    alignItems: 'center', // Center text horizontally
  },
});
