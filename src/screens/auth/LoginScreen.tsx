import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert, ActivityIndicator } from 'react-native';
import auth from '@react-native-firebase/auth';
import { GoogleSignin } from '@react-native-google-signin/google-signin';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleLogin() {
    if (!email || !password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setLoading(true);
    try {
      await auth().signInWithEmailAndPassword(email, password);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleLogin() {
    try {
      await GoogleSignin.hasPlayServices();
      const { idToken } = await GoogleSignin.signIn();
      const googleCredential = auth.GoogleAuthProvider.credential(idToken);
      await auth().signInWithCredential(googleCredential);
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  }

  return (
    <View className="flex-1 bg-gray-100 p-6 justify-center">
      <Text className="text-3xl font-bold text-center text-blue-600 mb-8">GestPess</Text>
      
      <View className="bg-white rounded-lg p-4">
        <TextInput
          className="mb-2 p-3 border rounded"
          placeholder="Email"
          value={email}
          onChangeText={setEmail}
          keyboardType="email-address"
          autoCapitalize="none"
        />
        
        <TextInput
          className="mb-4 p-3 border rounded"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg mb-2"
          onPress={handleLogin}
          disabled={loading}
        >
          <Text className="text-white text-center">
            {loading ? 'Loading...' : 'Login'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-red-500 p-3 rounded-lg mb-2"
          onPress={handleGoogleLogin}
          disabled={loading}
        >
          <Text className="text-white text-center">Login with Google</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-gray-500 p-3 rounded-lg"
          onPress={() => navigation.navigate('Register')}
          disabled={loading}
        >
          <Text className="text-white text-center">Create Account</Text>
        </TouchableOpacity>
      </View>
      
      {loading && <ActivityIndicator className="mt-4" />}
    </View>
  );
}