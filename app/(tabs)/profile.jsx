import { useState, useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { FlatList, View, Text, TouchableOpacity, Image, RefreshControl, StyleSheet } from 'react-native';
import { useGlobalContext } from '../../context/GlobalProvider';
import VideoCard from '../../components/VideoCard';
import InfoBox from '../../components/InfoBox';
import { MaterialIcons } from '@expo/vector-icons';
import { signOut } from '../../service/appwrite'; // Nếu bạn cần
import { router } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';


const Profile = () => {
  const { user, setIsLogged } = useGlobalContext();
  const [posts, setPosts] = useState([]);
  const [refreshing, setRefreshing] = useState(false);

  // State riêng cho từng thông tin từ API
  const [fullName, setFullName] = useState('');
  const [userName, setUserName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [avatarUrl, setAvatarUrl] = useState(null);

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
          // Cập nhật từng state với dữ liệu từ API
          setFullName(data.data.fullName);
          setUserName(data.data.userName);
          setEmail(data.data.email);
          setPhone(data.data.phone);
          setAvatarUrl(data.data.avatarUrl);
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
      await signOut();
      setIsLogged(false);
      router.replace('/sign-in');
    } catch (error) {
      console.error(error);
    }
  };

  const onRefresh = async () => {
    // Logic refresh cho danh sách bài đăng
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
                source={{ uri: avatarUrl }} // Sử dụng avatarUrl từ state
                className="w-[90%] h-[90%] rounded-[46px]"
                resizeMode="cover"
              />
              <TouchableOpacity
                className="absolute bottom-0 right-0 bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center"
              >
                <Text style={{ fontSize: 14, color: 'white' }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Hiển thị thông tin user */}
            <InfoBox
              title={userName} // Hiển thị tên người dùng từ profile
              containerStyles="mt-5"
              titleStyles="text-lg"
            />

            {/* General Settings */}
            <View className="w-full mt-5">
              {/* General Title */}
              <View className="flex flex-row items-center mb-2">
                <MaterialIcons name="person" size={20} color="white" />
                <Text style={[styles.headerText, { marginLeft: 8 }]}>General</Text>
              </View>

              {/* Edit Profile */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 rounded-t-lg bg-gray-800"
                onPress={() => {/* Add your edit profile functionality here */ }}
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
    </SafeAreaView>
  );
};

export default Profile;

const styles = StyleSheet.create({
  headerText: {
    fontFamily: 'Poppins-Medium',
    color: 'white',
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
});
