import { FlatList, StyleSheet, Text, View, Image, RefreshControl, Alert } from 'react-native'
import React, { useEffect, useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'
import { images } from '../../constants'
import SearchInput from '../../components/SearchInput'
import ImageCard from '../../components/ImageCard'
import EmptyState from '../../components/EmptyState'
import { getAllImage, getAllPosts, getLastestPosts } from '../../service/appwrite'
import useAppwrite from '../../service/useAppwrite'
import VideoCard from '../../components/VideoCard'
import { useGlobalContext } from '../../context/GlobalProvider'

const Explore = () => {
  const { setIsLogged, user, setUser } = useGlobalContext()
  const { data: posts, refetch } = useAppwrite(getAllPosts)
  const { data: imagesData, refetch: refetchImage } = useAppwrite(getAllImage)
  const { data: lastestPosts } = useAppwrite(getLastestPosts)

  const [refreshing, setRefreshing] = useState(false);

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    await refetchImage();
    setRefreshing(false);
  };


  return (
    <SafeAreaView className="bg-black-100">
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
            time={item.$createdAt}
          />
        )}
        ListHeaderComponent={() => (
          <View className="my-6 px-4 space-y-6">
            <View className="flex justify-between items-start flex-row mb-6">
              <View>
                <Text className="font-pmedium text-sm text-gray-100">
                  Welcome back,
                </Text>
                <Text className="text-2xl font-psemibold text-white">
                  {user?.username}
                </Text>
              </View>
              <View className="mt-1.5">
                <Image
                  source={images.logoSmall}
                  className="w-9 h-10"
                  resizeMode="contain"
                />
              </View>
            </View>

            <SearchInput />

            <View className="w-full flex-1 pt-5 pb-8">
              <Text className="text-lg font-pregular text-gray-100 mb-3">
                Ảnh mới nhất
              </Text>

              <ImageCard posts={imagesData ?? []} />
            </View>


            <Text className="text-lg font-pregular text-gray-100 ">
              Video mới nhất
            </Text>
          </View>
        )}
        ListEmptyComponent={() => (
          <EmptyState
            title="Không tìm thấy ảnh/video nào"
            subtitle="Hãy upload video đầu tiên của bạn"
          />
        )}
        refreshControl={<RefreshControl
          refreshing={refreshing}
          onRefresh={onRefresh}
        />}
      />
    </SafeAreaView>
  )
}

export default Explore

const styles = StyleSheet.create({})
