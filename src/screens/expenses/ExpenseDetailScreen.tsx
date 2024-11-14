import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ExpenseDetailScreen({ route, navigation }) {
  const { expenseId } = route.params;
  const [expense, setExpense] = useState(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('expenses')
      .doc(expenseId)
      .onSnapshot(doc => {
        if (doc.exists) {
          setExpense({
            id: doc.id,
            ...doc.data(),
            date: doc.data().date.toDate()
          });
        }
      });

    return () => unsubscribe();
  }, [expenseId]);

  const handleDelete = async () => {
    Alert.alert(
      'Delete Expense',
      'Are you sure you want to delete this expense?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('expenses').doc(expenseId).delete();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (!expense) return null;

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-2xl font-bold mb-2">{expense.description}</Text>
          <Text className="text-3xl font-bold text-green-600 mb-4">
            R$ {expense.amount.toFixed(2)}
          </Text>

          <View className="flex-row items-center mb-4">
            <Icon 
              name={
                expense.category === 'Food' ? 'food' :
                expense.category === 'Transport' ? 'car' :
                expense.category === 'Bills' ? 'file-document' :
                expense.category === 'Entertainment' ? 'gamepad-variant' : 'tag'
              }
              size={20}
              color="#666"
            />
            <Text className="text-gray-600 ml-2">{expense.category}</Text>
          </View>

          <Text className="text-gray-500 mb-2">
            Date: {format(expense.date, 'dd/MM/yyyy')}
          </Text>

          {expense.totalInstallments > 1 && (
            <View className="bg-gray-100 p-4 rounded-lg mb-4">
              <Text className="font-semibold mb-2">Installment Information</Text>
              <Text>
                Installment {expense.installmentNumber} of {expense.totalInstallments}
              </Text>
            </View>
          )}
        </View>

        <TouchableOpacity
          className="bg-red-500 p-4 rounded-lg"
          onPress={handleDelete}
        >
          <Text className="text-white text-center font-semibold">Delete Expense</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}