import React, { useState } from 'react';
import { View, TextInput, TouchableOpacity, Text, ScrollView, Alert } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

export default function NewTaskScreen({ navigation }) {
  const [title, setTitle] = useState('');
  const [dueDate, setDueDate] = useState(new Date());
  const [category, setCategory] = useState('Work');
  const [subtasks, setSubtasks] = useState([{ title: '', completed: false }]);
  const [showDatePicker, setShowDatePicker] = useState(false);

  const categories = ['Work', 'Training', 'Study', 'Other'];

  const handleAddSubtask = () => {
    setSubtasks([...subtasks, { title: '', completed: false }]);
  };

  const handleSubtaskChange = (text, index) => {
    const newSubtasks = [...subtasks];
    newSubtasks[index].title = text;
    setSubtasks(newSubtasks);
  };

  const handleRemoveSubtask = (index) => {
    const newSubtasks = subtasks.filter((_, i) => i !== index);
    setSubtasks(newSubtasks);
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert('Error', 'Please enter a task title');
      return;
    }

    const validSubtasks = subtasks.filter(st => st.title.trim());
    if (validSubtasks.length === 0) {
      Alert.alert('Error', 'Please add at least one subtask');
      return;
    }

    try {
      const userId = auth().currentUser?.uid;
      await firestore().collection('tasks').add({
        userId,
        title: title.trim(),
        dueDate: firestore.Timestamp.fromDate(dueDate),
        category,
        subtasks: validSubtasks,
        createdAt: firestore.FieldValue.serverTimestamp(),
      });
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
          placeholder="Task Title"
          value={title}
          onChangeText={setTitle}
        />

        <TouchableOpacity
          className="bg-white p-4 rounded-lg mb-4 flex-row justify-between items-center"
          onPress={() => setShowDatePicker(true)}
        >
          <Text>Due Date: {dueDate.toLocaleString()}</Text>
          <Icon name="calendar" size={24} color="#666" />
        </TouchableOpacity>

        {showDatePicker && (
          <DateTimePicker
            value={dueDate}
            mode="datetime"
            onChange={(event, selectedDate) => {
              setShowDatePicker(false);
              if (selectedDate) setDueDate(selectedDate);
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

        <View className="bg-white p-4 rounded-lg mb-4">
          <Text className="mb-2 font-semibold">Subtasks</Text>
          {subtasks.map((subtask, index) => (
            <View key={index} className="flex-row items-center mb-2">
              <TextInput
                className="flex-1 bg-gray-100 p-2 rounded mr-2"
                placeholder={`Subtask ${index + 1}`}
                value={subtask.title}
                onChangeText={(text) => handleSubtaskChange(text, index)}
              />
              <TouchableOpacity
                className="p-2"
                onPress={() => handleRemoveSubtask(index)}
              >
                <Icon name="close" size={24} color="red" />
              </TouchableOpacity>
            </View>
          ))}
          <TouchableOpacity
            className="bg-gray-200 p-2 rounded mt-2"
            onPress={handleAddSubtask}
          >
            <Text className="text-center">Add Subtask</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity
          className="bg-blue-500 p-4 rounded-lg"
          onPress={handleSave}
        >
          <Text className="text-white text-center font-semibold">Save Task</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}