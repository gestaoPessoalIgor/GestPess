import React, { useState, useEffect } from 'react';
import { View, FlatList, TouchableOpacity, Text } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TasksScreen({ navigation }) {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    const userId = auth().currentUser?.uid;
    if (!userId) return;

    const unsubscribe = firestore()
      .collection('tasks')
      .where('userId', '==', userId)
      .orderBy('dueDate', 'asc')
      .onSnapshot(snapshot => {
        const taskList = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          dueDate: doc.data().dueDate.toDate()
        }));
        setTasks(taskList);
      });

    return () => unsubscribe();
  }, []);

  const getProgressColor = (completed, total) => {
    const progress = completed / total;
    if (progress === 1) return 'bg-green-500';
    if (progress > 0.5) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const renderTask = ({ item }) => {
    const completedSubtasks = item.subtasks?.filter(st => st.completed).length || 0;
    const totalSubtasks = item.subtasks?.length || 0;
    const progressColor = getProgressColor(completedSubtasks, totalSubtasks);

    return (
      <TouchableOpacity
        className="bg-white p-4 mb-2 rounded-lg shadow"
        onPress={() => navigation.navigate('TaskDetail', { taskId: item.id })}
      >
        <View className="flex-row justify-between items-center">
          <Text className="text-lg font-semibold flex-1">{item.title}</Text>
          <Text className="text-sm text-gray-500">
            {format(item.dueDate, 'dd/MM/yyyy HH:mm')}
          </Text>
        </View>

        <View className="mt-2">
          <View className="h-2 bg-gray-200 rounded-full">
            <View 
              className={`h-2 rounded-full ${progressColor}`} 
              style={{ width: `${(completedSubtasks / totalSubtasks) * 100}%` }} 
            />
          </View>
          <Text className="text-xs text-gray-500 mt-1">
            {completedSubtasks}/{totalSubtasks} subtasks completed
          </Text>
        </View>

        <View className="mt-2 flex-row items-center">
          <Icon 
            name={item.category === 'Work' ? 'briefcase' : 
                  item.category === 'Training' ? 'dumbbell' :
                  item.category === 'Study' ? 'book' : 'dots-horizontal'} 
            size={16} 
            color="#666"
          />
          <Text className="text-sm text-gray-600 ml-1">{item.category}</Text>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View className="flex-1 bg-gray-100">
      <View className="p-4">
        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg mb-4"
          onPress={() => navigation.navigate('NewTask')}
        >
          <Text className="text-white text-center font-semibold">Add New Task</Text>
        </TouchableOpacity>

        <FlatList
          data={tasks}
          renderItem={renderTask}
          keyExtractor={item => item.id}
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 20 }}
        />
      </View>
    </View>
  );
}