import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, View, Text, TouchableOpacity, Image, RefreshControl, StyleSheet, Modal } from 'react-native';
import { useGlobalContext } from '../../context/GlobalProvider';
import VideoCard from '../../components/VideoCard';
import InfoBox from '../../components/InfoBox';
import { MaterialIcons } from '@expo/vector-icons';
import FormField from '../../components/FormField';
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as ImagePicker from 'expo-image-picker';

const Profile = () => {
  const { user, setIsLogged } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);
  const [searchResults, setSearchResults] = useState({});
  const [userNameLover, setUserNameLover] = useState('');
  const [loverInviteResponse, setLoverInvite] = useState({});


  // State for modal visibility
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [addLoverModalVisible, setAddLoverModalVisible] = useState(false);
  const [showLoverModalVisible, setShowLoverModalVisible] = useState(false);
  const [ShowCoupleRequestModalVisible, setShowCoupleRequestModalVisible] = useState(false);
  const [showNoLoverModal, setShowNoLoverModal] = useState(false); // For no lover modal

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
    // Fetch updated data here
    setRefreshing(false);
  };

  const handleSearchLover = async () => {
    try {
      // Lấy token từ AsyncStorage
      const storedToken = await AsyncStorage.getItem('authToken');
      // Kiểm tra xem token có tồn tại không
      if (!storedToken) {
        console.error('No authentication token found');
        return;
      }

      // Thực hiện gọi API để tìm người yêu
      const response = await fetch(`https://locketcouplebe-production.up.railway.app/auth/find-by-user?username=` + userNameLover, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`, // Thêm token vào tiêu đề
          'Content-Type': 'application/json',
        },
      });

      // Kiểm tra phản hồi từ API
      if (!response.ok) {
        throw new Error('Failed to fetch data');
      }

      // Chuyển đổi phản hồi thành JSON
      const data = await response.json();

      // Cập nhật trạng thái với kết quả tìm kiếm
      setSearchResults(data.data); // Chỉ lấy phần 'data' từ phản hồi API
      console.log(data.data);
    } catch (error) {
      console.error('Error searching for lover:', error);
    }
  };

  const acceptInvite = async (coupleId) => {
    console.log('Inviting coupleId:', coupleId); // Log coupleId
  
    if (!coupleId) {
      console.error('No coupleId provided');
      return;
    }
  
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (!storedToken) {
        console.error('No authentication token found');
        return;
      }
  
      const response = await fetch(`https://locketcouplebe-production.up.railway.app/couple/acceptRequest/${coupleId}`, {
        method: 'POST', // Adjust if needed (POST/PUT)
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Log the response details
      console.log('Response status:', response.status); // Log response status
      const data = await response.json(); // Parse the response data
      console.log('Response data:', data); // Log response data
  
      if (response.ok) {
        console.log('API request successful');
        // Handle success (e.g., update UI, show success message, etc.)
      } else {
        console.error('API request failed:', data.message || 'Unknown error'); // Log error message from API
      }
  
    } catch (error) {
      console.error('Error accepting invite:', error);
      alert("An error occurred while accepting the invite."); 
    }
  };
  

  const loverInvite = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      if (!storedToken) {
        console.error('No authentication token found');
        return;
      }
  
      const response = await fetch(`https://locketcouplebe-production.up.railway.app/couple/LoverInvite`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
      });
  
      // Check for 404 response
      if (response.status === 404) {
        console.log('No lovers found');
        setShowNoLoverModal(true); // Show no lover modal
        setLoverInviteResponse(null); // Clear lover invite response
        return; // Exit the function
      }
  
      const data = await response.json();
      console.log('Lover invite response:', data);
  
      // Check if the request was successful
      if (data.code === 200) {
        setLoverInviteResponse(data.data); // Save the response data
        setShowNoLoverModal(false); // Hide no lover modal
      } else {
        console.error('Failed to fetch lover invite:', data.message);
        Alert.alert('Error', data.message || 'An unexpected error occurred');
      }
    } catch (error) {
      console.error('Error fetching lover invite:', error);
      Alert.alert('Error', 'An error occurred while fetching lover invite.');
    }
  };
  const handleEditProfile = async () => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const response = await fetch('https://locketcouplebe-production.up.railway.app/auth/update', {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName,
          address,
          email,
          dob,
        }),
      });

      const data = await response.json();
      console.log(data);

      // Check for a successful update
      if (data.code === 200) {
        console.log('Profile updated successfully');
      } else {
        console.error(data.message);
        alert("Cập nhật không thành công: " + data.message); // Notify error
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert("An error occurred while updating your profile."); // Notify error
    }

    setEditModalVisible(false); // Close modal after saving
  };


  // Function to open image picker and change avatar
  const openImagePicker = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (permissionResult.granted === false) {
      alert("Permission to access camera and gallery is required!");
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      aspect: [4, 3],
      quality: 1,
    });

    if (!result.canceled) {
      const localUri = result.assets[0].uri;
      setAvatarUrl(localUri);
      await handleChangeAvatar(localUri);  // Call API to change avatar
    }
  };

  const sendRequest = async (userId) => {
    try {
      // Retrieve the token from AsyncStorage
      const storedToken = await AsyncStorage.getItem('authToken');

      // Make the API request with userId in the URL
      const response = await fetch(`https://locketcouplebe-production.up.railway.app/couple/sendRequest/${userId}`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'application/json', // adjust if necessary
        },
        // body can be added if the request expects a payload
      });

      // Parse the response
      const data = await response.json();
      // Check if the request was successful
      if (data.code === 200) {
        console.log('Request sent successfully');
        Alert.alert('Success', 'Request sent successfully');
      } else {
        console.error('Failed to send request:', data.message);
        Alert.alert('Error', `Failed to send request: ${data.message}`);
      }
    } catch (error) {
      console.error('Error sending request:', error);
      Alert.alert('Error', 'An error occurred while sending the request');
    }
  };

  const handleChangeAvatar = async (imageUri) => {
    try {
      const storedToken = await AsyncStorage.getItem('authToken');
      const formData = new FormData();
      formData.append('file', {
        uri: imageUri,
        type: 'image/jpeg', // or other image type
        name: 'avatar.jpg',
      });

      const response = await fetch('https://locketcouplebe-production.up.railway.app/auth/change-avt', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${storedToken}`,
          'Content-Type': 'multipart/form-data',
        },
        body: formData,
      });

      const data = await response.json();
      if (data.code === 200) {
        console.log('Avatar changed successfully');
        Alert.alert('Success')
      } else {
        console.error(data.message);
      }
    } catch (error) {
      console.error('Error changing avatar:', error);
    }
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
                onPress={openImagePicker} // Open image picker on press
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

              {/* Sent Request */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 rounded-t-lg bg-gray-800"
                onPress={() => setAddLoverModalVisible(true)}
              >
                <Text style={styles.buttonText}>Add lover</Text>
                <MaterialIcons name="person" size={20} color="white" />
              </TouchableOpacity>

              {/* Lover Invite */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800"
                onPress={() => {
                  loverInvite()
                }}
              >
                <Text style={styles.buttonText}>Lover Invite</Text>
                <MaterialIcons name="person" size={20} color="white" />
              </TouchableOpacity>

              {/* Edit Profile */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800"
                onPress={() => setEditModalVisible(true)}
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

      {/* Popup Add Lover Modal */}
      <Modal transparent={true} animationType="slide" visible={addLoverModalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: '#222222' }]}>
            <Text style={styles.modalTitle}>Add Lover</Text>



            {/* Form to add lover */}
            <FormField
              title="Lover's Name"
              value={userNameLover}
              handleChangeText={(e) => setUserNameLover(e)}
              otherStyles="mt-7"
            />

            {/* Save button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  handleSearchLover(); // Gọi hàm tìm kiếm
                  setUserNameLover(''); // Xóa trường nhập liệu
                  setAddLoverModalVisible(false);
                  setShowLoverModalVisible(true);
                }}
                style={[styles.button, { backgroundColor: '#63B5F6' }]}
              >
                <Text style={styles.buttonText}>Search</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => setAddLoverModalVisible(false)}
                style={[styles.button, { backgroundColor: '#63B5F6' }]}
              >
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>




      {/* Modal to show lover details */}
      <Modal transparent={true} animationType="slide" visible={showLoverModalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: '#222222' }]}>
            <Text style={styles.modalTitle}>Lover Details</Text>
            {/* Hiển thị ảnh avatar nếu có URL */}
            {searchResults.avatarUrl ? (
              <Image
                source={{ uri: searchResults.avatarUrl }}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45, // Bo tròn ảnh
                  alignSelf: 'center',
                  marginBottom: 10,
                }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 10 }}>No avatar available</Text>
            )}
            {/* Form to display lover's information */}
            <FormField
              title="Full Name"
              label="Full Name"
              placeholder="Enter lover's name"
              value={searchResults.fullName || ''} // Hiển thị tên đầy đủ
              editable={false}
            />
            <FormField
              label="Username"
              placeholder="Enter lover's username"
              value={searchResults.userName || ''} // Hiển thị tên người dùng
              editable={false}
            />
            <FormField
              title="Email "
              label="Email"
              placeholder="Enter lover's email"
              value={searchResults.email || ''} // Hiển thị email
              editable={false}
            />

            {/* Save button */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => {
                sendRequest(searchResults.userId); // Call API when Add button is pressed
                setShowLoverModalVisible(false); // Close modal after request
              }} style={[styles.button, { backgroundColor: '#63B5F6' }]}>
                <Text style={styles.buttonText}>Add</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setShowLoverModalVisible(false)} style={[styles.button, { backgroundColor: '#63B5F6' }]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>


      {/* Modal to show lover Invite */}
      <Modal transparent={true} animationType="slide" visible={ShowCoupleRequestModalVisible}>
        <View style={styles.modalContainer}>
          <View style={[styles.modalContent, { backgroundColor: '#222222' }]}>
            <Text style={styles.modalTitle}>Lover Invite</Text>

            {/* Ensure loverInviteResponse and loverInviteResponse.data exist */}
            {loverInviteResponse?.data?.avatarUrl ? (
              <Image
                source={{ uri: loverInviteResponse.data.avatarUrl }}
                style={{
                  width: 90,
                  height: 90,
                  borderRadius: 45, // Round image
                  alignSelf: 'center',
                  marginBottom: 10,
                }}
                resizeMode="cover"
              />
            ) : (
              <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 10 }}>No avatar available</Text>
            )}

            {/* Form to display lover's information */}
            <FormField
              title="Full Name"
              label="Full Name"
              placeholder="Enter lover's name"
              value={loverInviteResponse.data?.fullName || ''} // Show full name
              editable={false}
            />
            <FormField
              label="Username"
              placeholder="Enter lover's username"
              value={loverInviteResponse.data?.userName || ''} // Show username
              editable={false}
            />
            <FormField
              title="Email"
              label="Email"
              placeholder="Enter lover's email"
              value={loverInviteResponse.data?.email || ''} // Show email
              editable={false}
            />

            {/* Action buttons */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity
                onPress={() => {
                  acceptInvite(loverInviteResponse.data?.coupleId); // Pass coupleId to API
                  setShowCoupleRequestModalVisible(false)
                }}
                style={[styles.button, { backgroundColor: '#63B5F6' }]}>
                <Text style={styles.buttonText}>Accept</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowCoupleRequestModalVisible(false);
                }}
                style={[styles.button, { backgroundColor: '#63B5F6' }]}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Popup No Lover */}
      <Modal transparent={true} animationType="slide" visible={showNoLoverModal}>
    <View style={styles.modalContainer}>
      <View style={[styles.modalContent, { backgroundColor: '#222222' }]}>
        <Text style={styles.modalTitle}>No Lovers Found</Text>
        <Text style={{ color: '#fff', textAlign: 'center', marginBottom: 10 }}>There are currently no lovers available.</Text>
        <View style={styles.buttonContainer}>
          <TouchableOpacity onPress={() => setShowNoLoverModal(false)} style={[styles.button, { backgroundColor: '#63B5F6' }]}>
            <Text style={styles.buttonText}>Close</Text>
          </TouchableOpacity>
        </View>
      </View>
    </View>
  </Modal>

      {/* Popup Edit Profile Modal */}
      <Modal transparent={true} animationType="slide" visible={editModalVisible}>
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
              keyboardType="default"
              placeholder="DD/MM/YYYY"
              otherStyles="mt-7"
            />

            {/* Button Container */}
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={handleEditProfile} style={[styles.button, { backgroundColor: '#63B5F6' }]}>
                <Text style={styles.buttonText}>Save</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => {
                setUserNameLover('');
                setEditModalVisible(false)
              }} style={[styles.button, { backgroundColor: '#63B5F6' }]}>
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
  },
  logoutText: {
    fontFamily: 'Poppins-Medium',
    color: 'red',
  },
  modalContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.8)',
  },
  modalContent: {
    width: '90%',
    borderRadius: 10,
    padding: 20,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
  },
  button: {
    padding: 10,
    borderRadius: 5,
    flex: 1,
    marginHorizontal: 5,
  },
  resultText: {
    fontSize: 18,
    color: 'white',
    marginBottom: 10,
  },
});
