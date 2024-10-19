import { ScrollView, Text, View, Image, Alert} from 'react-native'
import React, { useState } from 'react'
import { SafeAreaView } from 'react-native-safe-area-context'

import { images } from '../../constants'

import FormField from '../../components/FormField'
import CustomButton from '../../components/CustomButton'
import { Link, router } from 'expo-router'

import {getCurrentUser, signIn } from '../../service/appwrite'
import { useGlobalContext } from '../../context/GlobalProvider'

const SignIn = () => {
  const {setUser, setIsLogged} =  useGlobalContext()
  const [form, setForm] = useState({
    email: '',
    password: ''
  })
  const [isSubmitting, setIsSubmitting] = useState(false)

  const submit = async () => {
    if (form.email === "" || form.password === "") {
      Alert.alert('Error', 'Vui lòng nhập đầy đủ');
      return; // Add a return to prevent further execution
    }
  
    setIsSubmitting(true);
    try {
      const response = await fetch('https://locketcouplebe-production.up.railway.app/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userName: form.email, // Assuming email is used as userName
          password: form.password,
        }),
      });
  
      if (!response.ok) {
        throw new Error('Login failed');
      }
  
      const result = await response.json();
      setUser(result); // Update with the appropriate user data from the response
      setIsLogged(true);
      router.replace('/home');
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setIsSubmitting(false);
    }
  };
  


  return (
    <SafeAreaView className="bg-black h-full">
      <ScrollView>
        <View className="w-full justify-center min-h-[83vh] px-4 my-6">
          <Image
            source={images.blinket_logo}
            resizeMode='contain'
            className="w-[115px] h-[50px]"
          />

          <Text className="text-2xl text-white text-semiboldb mt-10 font-pmedium">
            Đăng nhập vào Blinket
          </Text>

          <FormField
            title="Email"
            value={form.email} 
            handleChangeText={(e) => setForm({ ...form, email: e })}
            otherStyles="mt-7"
            keyboardType="email-address"
          />

          <FormField
            title="Password"
            value={form.password} 
            handleChangeText={(e) => setForm({ ...form, password: e })}
            otherStyles="mt-7"
          />

          <CustomButton
            title="Đăng nhập"
            handlePress={submit}
            containerStyles="mt-7 bg-primary-300"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Chưa có tài khoản?
            </Text>
            <Link href="/sign-up" className="text-lg font-pmedium text-primary-300">Đăng ký ngay</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  )
}

export default SignIn
