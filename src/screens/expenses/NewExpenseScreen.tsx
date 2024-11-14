import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function NewExpenseScreen({ navigation }) {
  const [description, setDescription] = useState('');
  const [amount, setAmount] = useState('');
  const [date, setDate] = useState(new Date());
  const [category, setCategory] = useState('Food');
  const [installments, setInstallments] = useState('1');
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = ['Food', 'Transport', 'Bills', 'Entertainment', 'Other'];

  const handleSave = async () => {
    if (!description.trim() || !amount) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const numAmount = parseFloat(amount.replace(',', '.'));
    if (isNaN(numAmount) || numAmount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    const numInstallments = parseInt(installments) || 1;
    if (numInstallments < 1) {
      Alert.alert('Error', 'Number of installments must be at least 1');
      return;
    }

    try {
      const userId = auth().currentUser?.uid;
      const installmentAmount = numAmount / numInstallments;

      for (let i = 0; i < numInstallments; i++) {
        const installmentDate = new Date(date);
        installmentDate.setMonth(date.getMonth() + i);

        await firestore().collection('expenses').add({
          userId,
          description: description.trim() + (numInstallments > 1 ? ` (${i + 1}/${numInstallments})` : ''),
          amount: installmentAmount,
          date: firestore.Timestamp.fromDate(installmentDate),
          category,
          totalInstallments: numInstallments,
          installmentNumber: i + 1,
          createdAt: firestore.FieldValue.serverTimestamp(),
        });
      }

      navigation.goBack();
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <TextInput
          className="bg-white p-4 rounded-lg mb-4"
          placeholder="Description"
          value={description}
          onChangeText={setDescription}
        />

        <TextInput
          className="bg-white p-4 rounded-lg mb-4"
          placeholder="Amount"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />

        <TouchableOpacity
          className="bg-white p-4 rounded-lg mb-4 flex-row justify-between items-center"
          onPress={() => setShowDatePicker(true)}
        >
          <Text>Date: {format(date, 'dd/MM/yyyy')}</Text>
          <Icon name="calendar" size={24} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={date}
            mode="date"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDate(selectedDate);
            }}
          />
        )}

        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="mb-2 font-semibold">Category</Text>
          <View className="flex-row flex-wrap">
            {categories.map(cat => (
              <TouchableOpacity
                key={cat}
                className={`mr-2 mb-2 px-4 py-2 rounded-full ${
                  category === cat ? 'bg-blue-500' : 'bg-gray-200'
                }`}
                onPress={() => setCategory(cat)}
              >
                <Text className={category === cat ? 'text-white' : 'text-gray-700'}>
                  {cat}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        <TextInput
          className="bg-white p-4 rounded-lg mb-4"
          placeholder="Number of Installments (optional)"
          value={installments}
          onChangeText={setInstallments}
          keyboardType="number-pad"
        />

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg"
          onPress={handleSave}
        >
          <Text className="text-white text-center font-semibold">Save Expense</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}