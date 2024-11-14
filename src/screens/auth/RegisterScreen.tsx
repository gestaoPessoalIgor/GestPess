import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, Alert } from 'react-native';
import auth from '@react-native-firebase/auth';

export default function RegisterScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleRegister() {
    if (!email || !password || !confirmPassword) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      Alert.alert('Error', 'Passwords do not match');
      return;
    }

    if (password.length < 6) {
      Alert.alert('Error', 'Password must be at least 6 characters');
      return;
    }

    setLoading(true);
    try {
      await auth().createUserWithEmailAndPassword(email.trim(), password);
    } catch (error) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <View className="flex-1 bg-gray-100 p-6 justify-center">
      <Text className="text-2xl font-bold text-center mb-6">Create Account</Text>
      
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
          className="mb-2 p-3 border rounded"
          placeholder="Password"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        
        <TextInput
          className="mb-4 p-3 border rounded"
          placeholder="Confirm Password"
          value={confirmPassword}
          onChangeText={setConfirmPassword}
          secureTextEntry
        />
        
        <TouchableOpacity
          className="bg-blue-500 p-3 rounded-lg mb-2"
          onPress={handleRegister}
          disabled={loading}
        >
          <Text className="text-white text-center">
            {loading ? 'Creating Account...' : 'Register'}
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          className="bg-gray-500 p-3 rounded-lg"
          onPress={() => navigation.goBack()}
          disabled={loading}
        >
          <Text className="text-white text-center">Back to Login</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}