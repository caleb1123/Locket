import { ScrollView, Text, View, Image, Alert } from 'react-native';
import React, { useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { images } from '../../constants';
import FormField from '../../components/FormField';
import CustomButton from '../../components/CustomButton';
import { Link, router } from 'expo-router';
import { Picker } from '@react-native-picker/picker';

const SignUp = () => {
  const [form, setForm] = useState({
    fullName: '',
    username: '',
    email: '',
    password: '',
    sex: '', // Default value
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sexInput, setSexInput] = useState(''); // Trạng thái cho giá trị nhập vào
  const submit = async () => {
    if (
      form.fullName === '' ||
      form.username === '' ||
      form.email === '' ||
      form.password === ''
    ) {
      Alert.alert('Error', 'Vui lòng nhập đầy đủ');
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await fetch('https://locketcouplebe-production.up.railway.app/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: form.fullName,
          userName: form.username,
          password: form.password,
          email: form.email,
          sex: form.sex,
        }),
      });

      if (!response.ok) {
        throw new Error('Signup failed');
      }

      const result = await response.json();
      // Handle user context
      setUser(result);
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

          <Text className="text-2xl text-white text-semiboldb mt-10 font-psemibold">
            Đăng ký Blinket
          </Text>

          <FormField
            title="Họ và tên"
            value={form.fullName}
            handleChangeText={(e) => setForm({ ...form, fullName: e })}
            otherStyles="mt-10"
          />

          <FormField
            title="Username"
            value={form.username}
            handleChangeText={(e) => setForm({ ...form, username: e })}
            otherStyles="mt-7"
          />

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

          <FormField
            title="Giới tính (Nam/Nữ/Chưa xác định)"
            value={sexInput} // Sử dụng trạng thái cho giá trị nhập vào
            handleChangeText={(e) => {
              const newValue = e.toLowerCase(); // Chuyển về chữ thường để so sánh dễ hơn
              setSexInput(newValue); // Cập nhật trạng thái với giá trị nhập vào

              // Chuyển đổi giá trị và lưu vào form.sex khi nhập đúng
              if (newValue === "nam") {
                setForm({ ...form, sex: "MALE" });
              } else if (newValue === "nữ") {
                setForm({ ...form, sex: "FEMALE" });
              } else if (newValue === "chưa xác định") {
                setForm({ ...form, sex: "OTHER" });
              }
            }}
            otherStyles="mt-7"
          />



          <CustomButton
            title="Đăng ký"
            handlePress={submit}
            containerStyles="mt-7 bg-primary-300"
            isLoading={isSubmitting}
          />

          <View className="justify-center pt-5 flex-row gap-2">
            <Text className="text-lg text-gray-100 font-pregular">
              Bạn đã có tài khoản?
            </Text>
            <Link href="/sign-in" className="text-lg font-pmedium text-primary-300">Đăng nhập</Link>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default SignUp;
