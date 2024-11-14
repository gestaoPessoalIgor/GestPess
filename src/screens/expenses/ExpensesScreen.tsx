import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function ExpensesScreen({ navigation }) {
  const [expenses, setExpenses] = useState([]);
  const [totalExpenses, setTotalExpenses] = useState(0);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('expenses')
      .where('userId', '==', userId)
      .orderBy('date', 'desc')
      .onSnapshot(snapshot => {
        const expenseList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          date: doc.data().date.toDate()
        }));
        setExpenses(expenseList);
        calculateTotal(expenseList);
      });

    return () => unsubscribe();
  }, []);

  const calculateTotal = (expenseList) => {
    const total = expenseList.reduce((sum, expense) => sum + expense.amount, 0);
    setTotalExpenses(total);
  };

  const renderExpense = ({ item }) => (
    <TouchableOpacity
      className="bg-white p-4 mb-2 rounded-lg shadow"
      onPress={() => navigation.navigate('ExpenseDetail', { expenseId: item.id })}
    >
      <View className="flex-row justify-between items-center">
        <View>
          <Text className="text-lg font-semibold">{item.description}</Text>
          <Text className="text-sm text-gray-500">
            {format(item.date, 'dd/MM/yyyy')}
          </Text>
        </View>
        <View className="items-end">
          <Text className="text-lg font-bold text-green-600">
            R$ {item.amount.toFixed(2)}
          </Text>
          {item.totalInstallments > 1 && (
            <Text className="text-xs text-gray-500">
              {item.installmentNumber}/{item.totalInstallments}
            </Text>
          )}
        </View>
      </View>

      <View className="mt-2 flex-row items-center">
        <Icon 
          name={
            item.category === 'Food' ? 'food' :
            item.category === 'Transport' ? 'car' :
            item.category === 'Bills' ? 'file-document' :
            item.category === 'Entertainment' ? 'gamepad-variant' : 'tag'
          }
          size={16}
          color="#666"
        />
        <Text className="text-sm text-gray-600 ml-1">{item.category}</Text>
      </View>
    </TouchableOpacity>
  );

  return (
    <View className="flex-1 bg-gray-100">
      <View className="bg-white p-4 mb-4">
        <Text className="text-sm text-gray-500">Total Expenses</Text>
        <Text className="text-2xl font-bold text-green-600">
          R$ {totalExpenses.toFixed(2)}
        </Text>
      </View>

      <View className="px-4 flex-1">
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mb-4"
          onPress={() => navigation.navigate('NewExpense')}
        >
          <Text className="text-white text-center font-semibold">
            Add New Expense
          </Text>
        </TouchableOpacity>

        <FlatList
          data={expenses}
          renderItem={renderExpense}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}