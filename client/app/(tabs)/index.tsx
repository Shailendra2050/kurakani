import { View, Text, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Conversation, UserStory } from '@/types'
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/assets/styles/MessagesScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { FlatList, TextInput } from 'react-native-gesture-handler';
import StoriesBar from '@/components/StoriesBar';
import StoryViewer from '@/components/StoryViewer';
import ConvoItem from '@/components/Convoitem'
import { useRouter } from 'expo-router';
import { api, useApp } from '@/context/AppContext';

export default function MessageScreen() {

  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedStory, setSelectedStory] = useState<UserStory | null>(null);
  const {setSelectedConversation, conversations, setConversations, selectedConversation } = useApp()
  const router = useRouter()
  // const fetchConversations = () => {
  //   setLoading(true)
  //    api.get<{success: boolean; conversations: Conversation[]}>("/api/messages/conversations").then(({data})=>{
  //    if(data.success) setConversations (data.conversations);
  //      setLoading(false)
  //    }).catch(()=>{setTimeout(fetchConversations, 1000)
  //   })



  // }

  const fetchConversations = async () => {
    try {
      setLoading(true);

      const { data } = await api.get<{
        success: boolean;
        conversations: Conversation[];
      }>("/api/messages/conversations");

      console.log("CONVERSATIONS RESPONSE:", data);

      if (data.success) {
        setConversations(data.conversations);
      }
    } catch (error) {
      console.error("FETCH CONVERSATIONS ERROR:", error);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    fetchConversations()
  }, [])
  
  const lowerSearch = search.toLocaleLowerCase()
  const filtered = search ? conversations.filter(
    (c) => c.participant?.name.toLowerCase().includes(lowerSearch) || c.participant?.handle.toLocaleLowerCase().includes(lowerSearch)
  ) : conversations;

  const openConvo = (c: Conversation) => {

    setSelectedConversation(c)
    router.push(`/chat/${c._id}`)
  };

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
        <Ionicons name="search" size={16} color={Colors.outlineVariant} />
        <TextInput
          placeholder="Search conversations..."
          placeholderTextColor={Colors.outlineVariant}
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


      {selectedStory && <StoryViewer userStory={selectedStory} onClose={() => setSelectedStory(null)} />}


      {/* Divider */}
      <View style={styles.divider} />

      {/* Conversation list */}

      {loading ? (
        <ActivityIndicator style={{ marginTop: 40 }}
          color={Colors.primary} />
      ) : (
        <FlatList
          data={filtered}

          keyExtractor={(c) => c._id}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => (<ConvoItem convo={item} selected={true}
            onPress={() => openConvo(item)} />)}
          ListEmptyComponent={
            <View style={styles.empty}>
              <Ionicons name='chatbubbles-outline' size={44} color={Colors.outlineVariant} />
              <Text style={styles.emptyTitle} > No conversation yet</Text>
              <Text style={styles.emptySubtitle}> Go to Search to start chatting</Text>
            </View>
          }

        />
      )}



    </SafeAreaView>
  )
}