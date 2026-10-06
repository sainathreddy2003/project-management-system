import React from 'react';
import { View, ActivityIndicator } from 'react-native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';
import { useAuth } from '../context/AuthContext.js';
import { colors } from '../theme/colors.js';

import { LoginScreen } from '../screens/LoginScreen.js';
import { RegisterScreen } from '../screens/RegisterScreen.js';
import { DashboardScreen } from '../screens/DashboardScreen.js';
import { ProjectsScreen } from '../screens/ProjectsScreen.js';
import { ProjectDetailScreen } from '../screens/ProjectDetailScreen.js';
import { TasksScreen } from '../screens/TasksScreen.js';
import { CreateTaskScreen } from '../screens/CreateTaskScreen.js';
import { TaskDetailScreen } from '../screens/TaskDetailScreen.js';
import { CreateProjectScreen } from '../screens/CreateProjectScreen.js';
import { ProfileScreen } from '../screens/ProfileScreen.js';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function MainTabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ color, size }) => {
          let iconName = 'grid';
          if (route.name === 'Dashboard') iconName = 'grid';
          else if (route.name === 'Projects') iconName = 'folder';
          else if (route.name === 'Tasks') iconName = 'check-square';
          else if (route.name === 'Profile') iconName = 'user';

          return <Feather name={iconName} size={size - 2} color={color} />;
        },
        tabBarActiveTintColor: colors.accent,
        tabBarInactiveTintColor: colors.textMuted,
        tabBarStyle: {
          backgroundColor: '#FFFFFF',
          borderTopColor: colors.border,
          borderTopWidth: 1,
          height: 60,
          paddingBottom: 8,
          paddingTop: 6,
        },
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: '500',
        },
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
      })}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects" component={ProjectsScreen} />
      <Tab.Screen name="Tasks" component={TasksScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function AppNavigator() {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: colors.background }}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: '#FFFFFF',
        },
        headerTitleStyle: {
          fontSize: 15,
          fontWeight: '600',
          color: colors.textPrimary,
        },
        headerShadowVisible: false,
        headerTintColor: colors.textPrimary,
        contentStyle: {
          backgroundColor: colors.background,
        },
      }}
    >
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} options={{ headerShown: false }} />
        </>
      ) : (
        <>
          <Stack.Screen name="Main" component={MainTabNavigator} options={{ headerShown: false }} />
          <Stack.Screen name="ProjectDetail" component={ProjectDetailScreen} options={{ title: 'Project Details' }} />
          <Stack.Screen name="CreateProject" component={CreateProjectScreen} options={{ title: 'New Project' }} />
          <Stack.Screen name="CreateTask" component={CreateTaskScreen} options={{ title: 'New Task' }} />
          <Stack.Screen name="TaskDetail" component={TaskDetailScreen} options={{ title: 'Task Details' }} />
        </>
      )}
    </Stack.Navigator>
  );
}
