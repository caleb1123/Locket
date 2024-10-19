import { FlatList, StyleSheet, Text, TouchableOpacity, RefreshControl, View, Image } from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import EmptyState from '../../components/EmptyState'
import { getUserPosts, signOut } from '../../service/appwrite'
import useAppwrite from '../../service/useAppwrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'
import { icons } from '../../constants'
import InfoBox from '../../components/InfoBox'
import { router } from 'expo-router'
import MaterialIcons from '@expo/vector-icons/MaterialIcons';

const Profile = () => {
  const { setIsLogged, user, setUser } = useGlobalContext()
  const { data: posts, refetch } = useAppwrite(() => getUserPosts(user.$id))
  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  const handleDeleteImageChange = (value) => {
    if (value) onRefresh();
  };



  const logout = async () => {
    await signOut();
    setUser(null);
    setIsLogged(false);

    router.replace("/sign-in");
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
                source={{ uri: profile?.avatarUrl }} // Sử dụng avatar từ profile
                className="w-[90%] h-[90%] rounded-[46px]"
                resizeMode="cover"
              />
              {/* Add Button Overlay */}
              <TouchableOpacity
                className="absolute bottom-0 right-0 bg-yellow-500 w-6 h-6 rounded-full flex items-center justify-center"
              >
                <Text style={{ fontSize: 14, color: 'white' }}>+</Text>
              </TouchableOpacity>
            </View>

            {/* Username */}
            <InfoBox
              title={profile?.userName} // Hiển thị tên người dùng từ profile
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

              {/* Change Email */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800"
                onPress={() => {/* Add your change email functionality here */ }}
              >
                <Text style={styles.buttonText}>Change email address</Text>
                <MaterialIcons name="email" size={20} color="white" />
              </TouchableOpacity>

              {/* Report a Problem */}
              <TouchableOpacity
                style={{ backgroundColor: '#3b3a3a' }}
                className="flex flex-row justify-between items-center px-4 py-3 border-b border-gray-700 bg-gray-800"
                onPress={() => {/* Add your report problem functionality here */ }}
              >
                <Text style={styles.buttonText}>Report a problem</Text>
                <MaterialIcons name="report-problem" size={20} color="white" />
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
