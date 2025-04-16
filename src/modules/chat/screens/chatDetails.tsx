// src/modules/chat/screens/chatDetails.tsx

import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { ITheme } from '@styles/theme'
import type { ChatStackParams } from '@utils/Routes'
import type Routes from '@utils/Routes'
import { CsCard, CsText } from '@components/index'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@helpers/toast/showToast'
import { useNavigation, useRoute } from '@react-navigation/native'
import { useTheme } from '@src/hooks'
import { supabase } from '@src/lib/supabase'
import { useAppSelector } from '@store/index'
import { shadows, spacing } from '@styles/index'
import { useEffect, useRef, useState } from 'react'
import { Alert, Animated, FlatList, KeyboardAvoidingView, Platform, StyleSheet, TextInput, TouchableOpacity, View } from 'react-native'
import { useChat } from '../hooks/useChat'

// Message Interface
interface Message {
  id: string
  text: string
  sender: 'user' | 'other'
  timestamp: Date
}

const ChatDetailScreen: React.FC = () => {
  // Hooks and Navigation
  const theme = useTheme()
  const styles = useStyles(theme)

  const navigation = useNavigation<StackNavigationProp<ChatStackParams>>()
  const route = useRoute<RouteProp<ChatStackParams, Routes.ChatDetails>>()
  const chatId = route.params.chatId

  const user = useAppSelector(s => s?.AppReducer?.user)

  const { getMessages, createMessage } = useChat()

  // States
  const [messages, setMessages] = useState<Message[]>([])
  const [chat, setChat] = useState<{ messageCount: number, title: string, status: 'active' | 'ended' | 'archived' } | null>(null)
  const [inputText, setInputText] = useState('')

  // Refs
  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  // Effects
  useEffect(() => {
    if (user === null)
      return

    const loadMessages = async () => {
      try {
        const result = await getMessages({ userId: user!.id, chatId })

        setChat({ messageCount: result.messageCount, title: result.title, status: result.status })
        setMessages(result.messages)
      }
      catch (error) {
        showToast((error as Error).message)
      }
    }

    loadMessages()
  }, [chatId])

  useEffect(() => {
    // Scroll to end and fade in new message when messages array updates
    if (messages.length > 0) {
      flatListRef.current?.scrollToEnd({ animated: true })
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 500,
        useNativeDriver: true,
      }).start()
    }
  }, [messages, fadeAnim])

  // Callbacks
  const sendMessage = async () => {
    if (!inputText.trim())
      return

    try {
      // Check message limit
      if (chat!.messageCount >= 10) {
        Alert.alert('Vous avez atteint le nombre maximum de messages par chat. (10 max)')
        return
      }
      await createMessage({
        chatId,
        senderId: user!.id,
        content: inputText.trim(),
      })

      setInputText('')
      setMessages(prev => [
        ...prev,
        {
          id: Date.now().toString(),
          sender: 'user',
          text: inputText.trim(),
          timestamp: new Date(),
        },
      ])
    }
    catch (error) {
      console.error('Error sending message:', error)
    }
  }

  // Add real-time listener
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `chat_id=eq.${chatId}`,
      }, (payload) => {
        const newMessage = payload.new
        if (newMessage.sender !== user!.id) {
          setMessages(
            prev => [
              ...prev,
              {
                id: newMessage.id,
                sender: newMessage.sender_id === user!.id ? 'user' : 'other',
                text: newMessage.content,
                timestamp: newMessage.created_at,
              },
            ],
          )
        }
      })
      .subscribe()

    // const updateChannel = supabase
    //   .channel('messages')
    //   .on('postgres_changes', {
    //     event: 'UPDATE',
    //     schema: 'public',
    //     table: 'messages',
    //     filter: `chat_id=eq.${chatId}`
    //   }, (payload) => {
    //     const updatedMessage = payload.new;
    //     console.log('Message updated:', JSON.stringify(updatedMessage, null, 2));

    //     if (updatedMessage.sender !== user!.id) {
    //       setMessages(
    //         prev => prev.map(
    //           msg => msg.id === updatedMessage.id
    //           ? {
    //               id: updatedMessage.id,
    //               text: updatedMessage.content,
    //               sender: updatedMessage.sender_id === user!.id ? 'user' : 'other',
    //               timestamp: new Date(updatedMessage.created_at),
    //             }
    //           : msg
    //         )
    //       );
    //     }
    //   })
    //   .subscribe();

    return () => {
      channel.unsubscribe()
      // updateChannel.unsubscribe()
    }
  }, [chatId, user])

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isLastMessage = index === messages.length - 1
    return (
      <Animated.View
        style={[
          styles.messageContainer,
          item.sender === 'user'
            ? styles.userMessage
            : styles.otherMessage,
          isLastMessage && { opacity: fadeAnim },
        ]}
      >
        <CsCard style={styles.messageCard}>
          <CsText style={styles.messageText}>{item.text}</CsText>
          <CsText style={styles.timestamp}>
            {item.timestamp.toLocaleTimeString([], {
              hour: '2-digit',
              minute: '2-digit',
            })}
          </CsText>
        </CsCard>
      </Animated.View>
    )
  }

  // Main Render
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 64 : 0}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons
            name="arrow-back"
            size={24}
            color={styles.headerText.color}
          />
        </TouchableOpacity>
        <CsText style={styles.headerText}>
          {10 - (chat?.messageCount ?? 0)}
          {' '}
          messages restants
        </CsText>
        <CsText style={styles.recipientText}>
          {/* {cha === "teacher" ? "Professeur" : "Administration"} */}
        </CsText>
      </View>
      <FlatList
        ref={flatListRef}
        data={messages}
        renderItem={renderMessage}
        ListFooterComponent={() => {
          if (chat?.status === 'ended') {
            return (
              <CsCard style={styles.endedChat}>
                <CsText>
                  Vous avez atteint le nombre maximum de messages par chat. (10 max)
                </CsText>
              </CsCard>
            )
          }
          else {
            return null
          }
        }}
        keyExtractor={item => item.id}
        contentContainerStyle={styles.messageList}
        showsVerticalScrollIndicator={false}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Tapez votre message..."
          placeholderTextColor={styles.inputPlaceholder.color}
          readOnly={chat?.status !== 'active'}
        />
        <TouchableOpacity onPress={sendMessage} disabled={chat?.status !== 'active'} style={styles.sendButton}>
          <Ionicons
            name="send"
            size={24}
            color={styles.sendButtonText.color}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// Styles
function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: spacing.md,
      paddingTop: spacing.xl,
      backgroundColor: theme.primary,
      ...shadows.medium,
    },
    headerText: {
      fontSize: 16,
      fontWeight: 'semibold',
      color: theme.background,
      flex: 1,
      textAlign: 'right',
    },
    recipientText: {
      fontSize: 14,
      color: theme.background,
    },
    messageList: {
      paddingHorizontal: spacing.sm,
      paddingBottom: spacing.md,
    },
    messageContainer: {
      maxWidth: '80%',
      marginVertical: spacing.xs,
    },
    userMessage: {
      alignSelf: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
    },
    messageCard: {
      padding: spacing.sm,
      borderRadius: 12,
    },
    messageText: {
      fontSize: 16,
    },
    timestamp: {
      fontSize: 12,
      color: theme.textLight,
      alignSelf: 'flex-end',
      marginTop: spacing.xs,
    },
    inputContainer: {
      flexDirection: 'row',
      padding: spacing.sm,
      backgroundColor: theme.card,
      ...shadows.small,
    },
    input: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 20,
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      marginRight: spacing.sm,
      color: theme.text,
    },
    inputPlaceholder: {
      color: theme.textLight,
    },
    sendButton: {
      backgroundColor: theme.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
    },
    sendButtonText: {
      color: theme.background,
    },
    endedChat: {
      backgroundColor: theme.warning,
      marginVertical: spacing.sm,
    },
  })
}

export default ChatDetailScreen
