import { View, Text, TouchableOpacity } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Conversation, UserStory } from '@/types'
import { useRoute } from '@react-navigation/native';
import { dummyConversationData } from '@/assets/assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/assets/styles/MessagesScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { TextInput} from 'react-native-gesture-handler';
import StoriesBar from '@/components/StoriesBar';
import StoryViewer from '@/components/StoryViewer';

export default function MessageScreen() {
  const [conversations, setConversations] = useState<Conversation[]>([])
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);

  const router = useRoute()
  const fetchConversations = () => {
    setLoading(true)
    setTimeout(() => {
      setConversations(dummyConversationData as any)
      setLoading(false)
    }, 1000)
  }
  useEffect(() => {
    fetchConversations()
  }, [])

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}

      <View style={styles.header}>
        <Text style={styles.title}>Conversations</Text>
        <View style={styles.headerRight}>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>
              {conversations.length}
            </Text>
          </View>
        </View>
      </View>

      {/* search */}
      <View style={styles.searchRow}>
        <Ionicons name="search" size={25} color= {Colors.outlineVariant} />
        <TextInput
          placeholder="Search conversations..."
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
        {search.length > 0 && (
          <TouchableOpacity>
            <Ionicons name="close-circle" size={25} color={Colors.outlineVariant} 
            onPress={() => setSearch('')} />

          </TouchableOpacity>
        )}
      </View>
      {/* Stories Bar */}
      <StoriesBar onViewStory={(us) => setSelectedStory(us)} />


        {selectedStory && <StoryViewer userStory={selectedStory} onClose={() => setSelectedStory(null)}/>}


      {/* Divider */}
          <View style = {styles.divider}/>

      {/* Conversation list */}


    </SafeAreaView>
  )
}