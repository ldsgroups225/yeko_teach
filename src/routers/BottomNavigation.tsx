import { AntDesign, Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import ChatStack from '@routers/ChatStack'
import ScheduleStack from '@routers/ScheduleStack'
import SchoolStack from '@routers/SchoolStack'
import { useTheme } from '@src/hooks'
import React from 'react'
import { StatusBar } from 'react-native'
import ProfileStack from './ProfileStack'

const Tab = createBottomTabNavigator()

export default function TabNavigator() {
  const theme = useTheme()
  return (
    <>
      <StatusBar backgroundColor={theme.primary} />
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: theme.primary,
          tabBarStyle: { backgroundColor: '#FFF' },
          headerShown: false,
        }}
      >
        <Tab.Screen
          name="Programmes"
          component={ScheduleStack}
          options={{
            tabBarIcon: ({ color }) => (
              <AntDesign name="calendar" size={24} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Ecoles"
          component={SchoolStack}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="school-outline" size={24} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Chats"
          component={ChatStack}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="chatbubbles-outline" size={24} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarIcon: ({ color }) => (
              <Ionicons name="person-outline" color={color} size={24} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  )
}
