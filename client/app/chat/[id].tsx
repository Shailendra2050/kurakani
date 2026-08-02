import { View, Text, TouchableOpacity, KeyboardAvoidingView, Platform, ActivityIndicator, Image, TextInput, FlatList, Alert } from 'react-native'
import React, { useEffect, useRef, useState } from 'react'
import { useRouter } from 'expo-router';
import { dummyConversationData, dummyMessages, dummyUserProfile, dummyUsers } from '@/assets/assets';
import { SafeAreaView } from 'react-native-safe-area-context';
import { styles } from '@/assets/styles/ChatScreen.styles';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from '@/constants/Colors';
import { formatTime } from '@/utils/formatTime';
import Avatar from '@/components/Avatar';
import * as ImagePicker from 'expo-image-picker';
import Bubble from '@/components/Bubble';
import { LinearGradient } from 'expo-linear-gradient';




export default function Chatscreen() {
  const router = useRouter()
  let { auth, message, user, selectedConversation, typingUsers } = {
    auth: { user: dummyUserProfile },
    message: dummyMessages,
    user: dummyUserProfile,
    selectedConversation: dummyConversationData[0],
    typingUsers: {
      [dummyUsers[0]._id]: true,
    },
  }

  const [text, setText] = useState('')
  const [sending, setSending] = useState(false)
  const [loading, setLoading] = useState(false)
  const [mediaUri, setMediaUri] = useState<string | null>(null)

  const flatListRef = useRef<FlatList>(null);
  // Scroll to the bottom of the FlatList when a new message is added
  useEffect(() => {
    if (message.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [message]);

  const partner = selectedConversation?.participant;
  const deleteChat = () => { 

  }
  const pickMedia =  async() => {
     const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    
        if (status !== 'granted') {
          Alert.alert("Permission needed", "Allow photo access to send media.");
          return;
    
        }
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ["images", "videos"],
          quality: 0.8,
          
        });
        if (!result.canceled && result.assets[0]) {
          const asset = result.assets[0];
          setMediaUri(asset.uri);
        }

   }

   const handleTyping = (inputText: string) => {
    setText(inputText);
    // Here you can also send typing status to the server if needed
  }

  // typing indicator
  // const typingEntries = Object.entries(typingUsers).filter((uid, isTyping) => {
  //   if (!isTyping || uid === auth.user?._id) return false;
  //   return partner?._id === uid;
  // });
        
    
   const typingEntries = Object.entries(typingUsers).filter(
       ([uid, isTyping]) => {
       if (!isTyping || uid === auth.user?._id) return false;
    return partner?._id === uid;
      }
       );
         
       const send = async () => {
    if (!text.trim() && !mediaUri || !selectedConversation) return;
    setSending(true);
    // Simulate sending message
    setTimeout(() => {
      setText('');
      setMediaUri(null);
      setSending(false);
         }, 500);
           }
       

  if (!selectedConversation) {
    return (
      <SafeAreaView style={styles.safe}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <View style={styles.emptyState}>
          <Ionicons name="chatbubbles-outline" size={52} color={Colors.outlineVariant} />
          <Text style={styles.emptyText}>Conversation not found</Text>
        </View>
      </SafeAreaView>

    )
  }
  const headerName = partner!.name;
  const headerAvatar = partner!.avatar;;
  const headerSub = partner!.isOnline ? 'Online' : partner!.lastSeen ? `Last seen ${formatTime(partner.lastSeen)}` : 'Offline';


  return (
    <SafeAreaView style={styles.safe} edges={['top']}>

      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color={Colors.onSurface} />
        </TouchableOpacity>
        <Avatar name={headerName} src={headerAvatar} size={38} online={partner?.isOnline} />
        <View style={styles.headerInfo}>

          <Text style={styles.headerName} numberOfLines={1}>
            {headerName}

            <Text style={styles.headerSub}>@{partner?.handle}</Text>
          </Text>

          <Text style={[styles.headerSub, partner?.isOnline && { color: Colors.online }]}>{headerSub}</Text>

        </View>

        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="call-outline" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn}>
            <Ionicons name="videocam-outline" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
          <TouchableOpacity style={styles.backBtn} onPress={deleteChat}>
            <Ionicons name="trash-outline" size={24} color={Colors.onSurfaceVariant} />
          </TouchableOpacity>
        </View>
      </View>


      {/* main */}
      <KeyboardAvoidingView style={styles.kav} behavior={Platform.OS === 'ios' ? 'padding' : "height"} keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0} />


      {/* Messages */}
      {loading ? (
        <ActivityIndicator size="large" color={Colors.primary} style={{ flex: 1 }} />
      ) : (
        <FlatList data={message}
          ref={flatListRef}
          keyExtractor={(m) => m._id}
          contentContainerStyle={styles.messageList}

          renderItem={({ item: msg, index }) => {
            const isMine = msg.sender === auth.user?._id;
            const prev = message[index - 1];
            const showGap = !prev || prev.sender !== msg.sender;
            return (
              <View style={showGap && index > 0 ? { marginTop: 10 } : {}}>

                <Bubble msg={msg} isMine={isMine} />
              </View>
            )

          }}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />

      )}



      {/* typing indicator */}

      {typingEntries.length > 0 && (
        <View style={styles.typingRow}>
          {typingEntries.map(([uid]) => {
            const u = dummyUsers.find((x) => x._id === uid) || partner;
            return (
              <Text key={uid} style={styles.typingText}>
                {u?.name || "Someone"} is typing...
              </Text>
            )
          })}
        </View>
      )}


      {/* Input bar */}
      <View style={styles.inputBar}>


        {/* Medi preview */}
        {mediaUri && (
          <View style={styles.mediaPreview}>
            <Image source={{ uri: mediaUri }} style={styles.mediaThumb} /> 
            <TouchableOpacity onPress={() => setMediaUri(null)} style={styles.mediaRemove}>
              <Ionicons name="close-circle" size={24} color='#fff' />

            </TouchableOpacity>
          </View>
          
        )} 
        <View style={styles.inputRow}>
          <TouchableOpacity onPress={pickMedia } style={styles.attachBtn}>
              <Ionicons name="image-outline" size={24} color={Colors.onSurfaceVariant} />

            </TouchableOpacity>
            <TextInput style={styles.textInput}
            value={text}
            onChangeText={handleTyping}
            placeholder="message....."
            
            placeholderTextColor={Colors.onSurfaceVariant}
            multiline
            maxLength={2000}/>

            <TouchableOpacity disabled={!text.trim() && !mediaUri || sending} activeOpacity={0.7} onPress={send}>
              <LinearGradient colors={[Colors.primary, Colors.primaryContainer]}style={[styles.sendBtn,!text.trim() && !mediaUri && styles.sendBtnDisabled]}>
                {sending ? (
                  <ActivityIndicator color="#fff" size="small" />
                ) : (
                  <Ionicons name="send" size={24} color={Colors.onSurfaceVariant} />
                )}
              
            
          
      
      
              </LinearGradient>
            </TouchableOpacity>

            

          

        </View>


      </View>



    </SafeAreaView>
  )
}