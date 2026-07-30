import { View, Text } from 'react-native'
import React from 'react'
import { Stack, Tabs } from 'expo-router'
import { Colors } from '@/constants/Colors'
import { Ionicons } from '@expo/vector-icons'

export default function Tabs_layout() {
  return (
    <Tabs screenOptions={{
      headerShown: false,
      tabBarActiveTintColor: Colors.primary,
      tabBarInactiveTintColor: Colors.onSurfaceVariant,
      tabBarStyle: {
       backgroundColor: Colors.surfaceLowest,
       borderTopColor: Colors.surfaceHigh,
       borderTopWidth: 1,
       height: 88,
       paddingBottom: 12,
       paddingTop: 8,
       
    },
    tabBarLabelStyle: { 
      fontSize: 14,
      fontWeight: '600',

    }
  }}
        >  

      <Tabs.Screen name="index" options={{
         title: 'Messages',
         tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'chatbubbles' : 'chatbubbles-outline'}
           size={24} color={color} />
         )

       }} />
       <Tabs.Screen name="search" options={{
         title: 'Search',
         tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'search' : 'search-outline'}
           size={24} color={color} />
         )

       }} />
       <Tabs.Screen name="profile" options={{
         title: 'Profile',
         tabBarIcon: ({ color, focused }) => (
          <Ionicons name={focused ? 'person' : 'person-outline'}
           size={24} color={color} />
         )
         }} />

    </Tabs>
  )
}