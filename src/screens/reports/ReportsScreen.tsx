import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { format, startOfMonth, endOfMonth } from 'date-fns';

export default function ReportsScreen() {
  const [monthlyExpenses, setMonthlyExpenses] = useState([]);
  const [taskStats, setTaskStats] = useState({
    completed: 0,
    pending: 0,
    total: 0
  });

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    // Load expenses
    const startDate = startOfMonth(new Date());
    const endDate = endOfMonth(new Date());

    const unsubscribeExpenses = firestore()
      .collection('expenses')
      .where('userId', '==', userId)
      .where('date', '>=', startDate)
      .where('date', '<=', endDate)
      .onSnapshot(snapshot => {
        const expenses = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setMonthlyExpenses(expenses);
      });

    // Load tasks
    const unsubscribeTasks = firestore()
      .collection('tasks')
      .where('userId', '==', userId)
      .onSnapshot(snapshot => {
        const tasks = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));

        const completed = tasks.filter(task => 
          task.subtasks.every(subtask => subtask.completed)
        ).length;

        setTaskStats({
          completed,
          pending: tasks.length - completed,
          total: tasks.length
        });
      });

    return () => {
      unsubscribeExpenses();
      unsubscribeTasks();
    };
  }, []);

  const totalMonthlyExpenses = monthlyExpenses.reduce(
    (sum, expense) => sum + expense.amount,
    0
  );

  const expensesByCategory = monthlyExpenses.reduce((acc, expense) => {
    acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
    return acc;
  }, {});

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-xl font-bold mb-4">Task Statistics</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-2xl font-bold text-green-600">
                {taskStats.completed}
              </Text>
              <Text className="text-sm text-gray-500">Completed</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-red-500">
                {taskStats.pending}
              </Text>
              <Text className="text-sm text-gray-500">Pending</Text>
            </View>
            <View className="items-center">
              <Text className="text-2xl font-bold text-blue-500">
                {taskStats.total}
              </Text>
              <Text className="text-sm text-gray-500">Total</Text>
            </View>
          </View>
        </View>

        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-xl font-bold mb-4">Monthly Expenses</Text>
          <Text className="text-2xl font-bold text-green-600 mb-4">
            R$ {totalMonthlyExpenses.toFixed(2)}
          </Text>

          <Text className="font-semibold mb-2">By Category:</Text>
          {Object.entries(expensesByCategory).map(([category, amount]) => (
            <View key={category} className="flex-row justify-between mb-2">
              <Text>{category}</Text>
              <Text>R$ {amount.toFixed(2)}</Text>
            </View>
          ))}
        </View>
      </View>
    </ScrollView>
  );
}