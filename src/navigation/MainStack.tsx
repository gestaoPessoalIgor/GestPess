import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

import TasksScreen from '../screens/tasks/TasksScreen';
import NewTaskScreen from '../screens/tasks/NewTaskScreen';
import TaskDetailScreen from '../screens/tasks/TaskDetailScreen';
import ExpensesScreen from '../screens/expenses/ExpensesScreen';
import NewExpenseScreen from '../screens/expenses/NewExpenseScreen';
import ExpenseDetailScreen from '../screens/expenses/ExpenseDetailScreen';
import ReportsScreen from '../screens/reports/ReportsScreen';

const Tab = createBottomTabNavigator();
const TaskStack = createNativeStackNavigator();
const ExpenseStack = createNativeStackNavigator();

function TasksStackScreen() {
  return (
    <TaskStack.Navigator>
      <TaskStack.Screen name="TasksList" component={TasksScreen} options={{ title: 'Tasks' }} />
      <TaskStack.Screen name="NewTask" component={NewTaskScreen} options={{ title: 'New Task' }} />
      <TaskStack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
    </TaskStack.Navigator>
  );
}

function ExpensesStackScreen() {
  return (
    <ExpenseStack.Navigator>
      <ExpenseStack.Screen name="ExpensesList" component={ExpensesScreen} options={{ title: 'Expenses' }} />
      <ExpenseStack.Screen name="NewExpense" component={NewExpenseScreen} options={{ title: 'New Expense' }} />
      <ExpenseStack.Screen name="ExpenseDetail" component={ExpenseDetailScreen} options={{ title: 'Expense Details' }} />
    </ExpenseStack.Navigator>
  );
}

export function MainStack() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Tasks') {
            iconName = focused ? 'checkbox-marked' : 'checkbox-blank-outline';
          } else if (route.name === 'Expenses') {
            iconName = focused ? 'cash' : 'cash-outline';
          } else if (route.name === 'Reports') {
            iconName = focused ? 'chart-box' : 'chart-box-outline';
          }

          return <Icon name={iconName} size={size} color={color} />;
        },
      })}
    >
      <Tab.Screen 
        name="Tasks" 
        component={TasksStackScreen} 
        options={{ headerShown: false }}
      />
      <Tab.Screen 
        name="Expenses" 
        component={ExpensesStackScreen}
        options={{ headerShown: false }}
      />
      <Tab.Screen name="Reports" component={ReportsScreen} />
    </Tab.Navigator>
  );
}