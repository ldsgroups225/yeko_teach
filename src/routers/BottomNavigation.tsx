// src/routers/BottomNavigation.tsx

import { AntDesign, Ionicons } from '@expo/vector-icons'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { getFocusedRouteNameFromRoute } from '@react-navigation/native'
import ChatStack from '@routers/ChatStack'
import ScheduleStack from '@routers/ScheduleStack'
import SchoolStack from '@routers/SchoolStack'
import { useTheme } from '@src/hooks'
import { LightTheme } from '@styles/theme'
import Routes from '@utils/Routes'
import React from 'react'
import { Platform, StatusBar } from 'react-native'
import ProfileStack from './ProfileStack'

const Tab = createBottomTabNavigator()

function isTabBarVisible(route: any): boolean {
  const routeName = getFocusedRouteNameFromRoute(route)
  const initialRoutes = [
    Routes.Schedule,
    Routes.School,
    Routes.Chat,
    Routes.User,
    undefined,
  ]
  return initialRoutes.includes(routeName as Routes | undefined)
}

export default function TabNavigator() {
  const theme = useTheme()
  const barStyle = theme === LightTheme ? 'dark-content' : 'light-content'

  return (
    <>
      <StatusBar backgroundColor={theme.primary} barStyle={barStyle} />
      <Tab.Navigator
        screenOptions={({ route }) => ({
          tabBarActiveTintColor: theme.primary,
          tabBarStyle: {
            backgroundColor: theme.card,
            borderTopColor: theme.border,
            display: isTabBarVisible(route) ? 'flex' : 'none',
            // Optional platform-specific height adjustments:
            // height: Platform.OS === 'ios' ? 90 : 60,
            // paddingBottom: Platform.OS === 'ios' ? 30 : 0,
          },
          tabBarInactiveTintColor: theme.textLight,
          tabBarLabelStyle: {
            fontSize: 10,
            paddingBottom: Platform.OS === 'ios' ? 0 : 5,
          },
          tabBarIconStyle: {
            marginTop: Platform.OS === 'ios' ? 5 : 0,
          },
          headerShown: false,
        })}
      >
        <Tab.Screen
          name="Programmes"
          component={ScheduleStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <AntDesign name="calendar" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Ecoles"
          component={SchoolStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="school-outline" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Chats"
          component={ChatStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="chatbubbles-outline" size={size} color={color} />
            ),
          }}
        />

        <Tab.Screen
          name="Profile"
          component={ProfileStack}
          options={{
            tabBarIcon: ({ color, size }) => (
              <Ionicons name="person-outline" color={color} size={size} />
            ),
          }}
        />
      </Tab.Navigator>
    </>
  )
}
