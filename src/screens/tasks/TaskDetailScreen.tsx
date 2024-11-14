import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert, ScrollView } from 'react-native';
import firestore from '@react-native-firebase/firestore';
import { format } from 'date-fns';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function TaskDetailScreen({ route, navigation }) {
  const { taskId } = route.params;
  const [task, setTask] = useState(null);

  useEffect(() => {
    const unsubscribe = firestore()
      .collection('tasks')
      .doc(taskId)
      .onSnapshot(doc => {
        if (doc.exists) {
          setTask({
            id: doc.id,
            ...doc.data(),
            dueDate: doc.data().dueDate.toDate()
          });
        }
      });

    return () => unsubscribe();
  }, [taskId]);

  const handleToggleSubtask = async (index) => {
    try {
      const updatedSubtasks = [...task.subtasks];
      updatedSubtasks[index].completed = !updatedSubtasks[index].completed;
      
      await firestore()
        .collection('tasks')
        .doc(taskId)
        .update({ subtasks: updatedSubtasks });
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Task',
      'Are you sure you want to delete this task?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await firestore().collection('tasks').doc(taskId).delete();
              navigation.goBack();
            } catch (error) {
              Alert.alert('Error', error.message);
            }
          }
        }
      ]
    );
  };

  if (!task) return null;

  const completedSubtasks = task.subtasks.filter(st => st.completed).length;
  const progress = (completedSubtasks / task.subtasks.length) * 100;

  return (
    <ScrollView className="flex-1 bg-gray-100">
      <View className="p-4">
        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="text-2xl font-bold mb-2">{task.title}</Text>
          <Text className="text-gray-500 mb-2">
            Due: {format(task.dueDate, 'dd/MM/yyyy HH:mm')}
          </Text>
          <View className="flex-row items-center mb-4">
            <Icon 
              name={task.category === 'Work' ? 'briefcase' : 
                    task.category === 'Training' ? 'dumbbell' :
                    task.category === 'Study' ? 'book' : 'dots-horizontal'} 
              size={20} 
              color="#666"
            />
            <Text className="text-gray-600 ml-2">{task.category}</Text>
          </View>

          <View className="mb-4">
            <View className="h-2 bg-gray-200 rounded-full">
              <View 
                className="h-2 bg-blue-500 rounded-full" 
                style={{ width: `${progress}%` }} 
              />
            </View>
            <Text className="text-sm text-gray-500 mt-1">
              {completedSubtasks} of {task.subtasks.length} completed
            </Text>
          </View>

          <Text className="font-semibold mb-2">Subtasks:</Text>
          {task.subtasks.map((subtask, index) => (
            <TouchableOpacity
              key={index}
              className="flex-row items-center p-2 border-b border-gray-200"
              onPress={() => handleToggleSubtask(index)}
            >
              <Icon
                name={subtask.completed ? 'checkbox-marked' : 'checkbox-blank-outline'}
                size={24}
                color={subtask.completed ? '#4CAF50' : '#666'}
              />
              <Text className={`ml-2 ${subtask.completed ? 'line-through text-gray-500' : ''}`}>
                {subtask.title}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <TouchableOpacity
          className="bg-red-500 p-4 rounded-lg"
          onPress={handleDelete}
        >
          <Text className="text-white text-center font-semibold">Delete Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}