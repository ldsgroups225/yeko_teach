// src/modules/chat/screens/chatDetails.tsx

import type { RouteProp } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import type { Database } from '@src/lib/supabase/types'
import type { ITheme } from '@styles/theme'
import type { ChatStackParams } from '@utils/Routes'
import type Routes from '@utils/Routes'
import { CsCard, CsText } from '@components/index'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@helpers/toast/showToast'
import { useHeaderHeight } from '@react-navigation/elements'
import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native'
import { useTheme } from '@src/hooks'
import { supabase } from '@src/lib/supabase'
import { useAppSelector } from '@store/index'
import { shadows, spacing } from '@styles/index'
import React, {
  useCallback,
  useEffect,
  useRef,
  useState,
} from 'react'
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native'
import { useChat } from '../hooks/useChat'
import { chat as chatService } from '../services/chatService'

// Message Interface
interface Message {
  id: string
  text: string
  sender: 'user' | 'other'
  timestamp: Date
}

const ChatDetailScreen: React.FC = () => {
  const theme = useTheme()
  const styles = useStyles(theme)

  const navigation = useNavigation<StackNavigationProp<ChatStackParams>>()
  const route = useRoute<RouteProp<ChatStackParams, Routes.ChatDetails>>()
  const chatId = route.params.chatId

  const user = useAppSelector(s => s?.AppReducer?.user)

  const { getMessages, createMessage } = useChat()

  const [messages, setMessages] = useState<Message[]>([])
  const [chat, setChat] = useState<{ messageCount: number, title: string, status: 'active' | 'ended' | 'archived' } | null>(null)
  const [inputText, setInputText] = useState('')

  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  const headerHeight = useHeaderHeight()
  // Calculate offset dynamically based on header height
  const keyboardVerticalOffset = headerHeight + (Platform.OS === 'ios' ? 10 : 0) // Add small extra padding for iOS

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Add a small delay to ensure layout calculation is complete
        setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 50)
      },
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Optional: Handle keyboard hide event if needed
      },
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  useEffect(() => {
    if (user === null || !chatId)
      return

    let isMounted = true // Flag to prevent state update on unmounted component

    const loadMessages = async () => {
      try {
        const result = await getMessages({ userId: user!.id, chatId })
        if (isMounted) {
          setChat({ messageCount: result.messageCount, title: result.title, status: result.status })
          setMessages(result.messages)
        }
      }
      catch (error) {
        if (isMounted) {
          showToast((error as Error).message, ToastColorEnum.Error)
        }
      }
    }

    loadMessages()

    return () => {
      isMounted = false
    }
  }, [chatId, user?.id, getMessages]) // getMessages is likely stable from useChat hook

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start()
    }
  }, [messages, fadeAnim])

  useFocusEffect(
    useCallback(() => {
      let isActive = true
      const markRead = async () => {
        if (user && chatId && isActive) {
          try {
            await chatService.markMessagesAsRead(chatId, user.id)
          }
          catch (err) {
            // Keep essential error logging
            console.error('Failed to mark messages as read:', err)
          }
        }
      }
      const timeoutId = setTimeout(markRead, 500)
      return () => {
        isActive = false
        clearTimeout(timeoutId)
      }
    }, [chatId, user?.id]),
  )

  const sendMessage = async () => {
    const trimmedInput = inputText.trim()
    if (!trimmedInput)
      return

    if (!chat) {
      // Keep essential error logging
      console.error('Chat details not loaded yet, cannot send message.')
      showToast('Erreur: Impossible d\'envoyer le message.', ToastColorEnum.Error)
      return
    }

    if (chat.messageCount >= 10) {
      Alert.alert('Limite Atteinte', 'Vous avez atteint le nombre maximum de messages par chat (10 max).')
      return
    }

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date(),
    }
    setMessages(prev => [...prev, optimisticMessage])
    setInputText('')

    try {
      await createMessage({
        chatId,
        senderId: user!.id,
        content: trimmedInput,
      })
    }
    catch (error) {
      // Keep essential error logging
      console.error('Error sending message:', error)
      showToast('Erreur d\'envoi du message.', ToastColorEnum.Error)
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      setInputText(trimmedInput)
    }
  }

  useEffect(() => {
    if (!user || !chatId) {
      return
    }

    const channel = supabase
      .channel(`messages_for_chat_${chatId}`)
      .on<Database['public']['Tables']['messages']['Row']>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`,
        },
        (payload) => {
          const rawNewMessage = payload.new
          if (rawNewMessage.sender_id !== user.id) {
            const formattedMessage: Message = {
              id: rawNewMessage.id,
              text: rawNewMessage.content,
              sender: 'other',
              timestamp: rawNewMessage.created_at ? new Date(rawNewMessage.created_at) : new Date(),
            }
            setMessages(prevMessages => [...prevMessages, formattedMessage])
          }
          else {
            setMessages(prevMessages => prevMessages.map(msg =>
              msg.id.startsWith('temp-') && msg.text === rawNewMessage.content
                ? { ...msg, id: rawNewMessage.id, timestamp: rawNewMessage.created_at ? new Date(rawNewMessage.created_at) : new Date() }
                : msg,
            ))
          }
        },
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // Keep essential error logging
          console.error(`Subscription error for chat ${chatId}:`, status, err)
        }
      })

    return () => {
      supabase.removeChannel(channel).catch(err => console.error('Error removing channel:', err)) // Keep error log
    }
  }, [chatId, supabase, user?.id]) // supabase is stable, user?.id is the key dependency

  const renderMessage = ({ item, index }: { item: Message, index: number }) => {
    const isLastMessage = index === messages.length - 1
    const timestampString = item.timestamp instanceof Date && !Number.isNaN(item.timestamp.getTime())
      ? item.timestamp.toLocaleTimeString([], {
          hour: '2-digit',
          minute: '2-digit',
        })
      : '--:--'

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
        <CsCard style={StyleSheet.flatten([
          styles.messageCard,
          item.sender === 'user' ? styles.userMessageCard : styles.otherMessageCard,
        ])}
        >
          <CsText style={StyleSheet.flatten([
            styles.messageText,
            item.sender === 'user' ? styles.userMessageText : styles.otherMessageText,
          ])}
          >
            {item.text}
          </CsText>
          <CsText style={StyleSheet.flatten([
            styles.timestamp,
            item.sender === 'user' ? styles.userTimestamp : styles.otherTimestamp,
          ])}
          >
            {timestampString}
          </CsText>
        </CsCard>
      </Animated.View>
    )
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset}
    >
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <Ionicons
            name="arrow-back"
            size={24}
            color={styles.headerText.color}
          />
        </TouchableOpacity>
        <CsText style={styles.headerText}>
          {chat ? `${10 - chat.messageCount} messages restants` : 'Chargement...'}
        </CsText>
        <View style={styles.recipientPlaceholder} />
      </View>

      <View style={styles.messageListContainer}>
        <FlatList
          ref={flatListRef}
          data={messages}
          renderItem={renderMessage}
          keyExtractor={item => item.id}
          contentContainerStyle={styles.messageListContent}
          showsVerticalScrollIndicator={false}
          ListFooterComponent={() => {
            if (chat?.status === 'ended') {
              return (
                <CsCard style={styles.endedChat}>
                  <CsText style={styles.endedChatText}>
                    Vous avez atteint le nombre maximum de messages par chat (10 max).
                  </CsText>
                </CsCard>
              )
            }
            return null
          }}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={21}
        />
      </View>

      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Tapez votre message..."
          placeholderTextColor={theme.textLight}
          editable={chat?.status === 'active'}
          multiline
          blurOnSubmit={false}
          returnKeyType="send"
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={chat?.status !== 'active' || !inputText.trim()}
          style={[styles.sendButton, (chat?.status !== 'active' || !inputText.trim()) && styles.sendButtonDisabled]}
          accessibilityLabel="Send message"
        >
          <Ionicons
            name="send"
            size={20}
            color={theme.background}
          />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// Styles (no changes needed here from previous version)
function useStyles(theme: ITheme) {
  return StyleSheet.create({
    flex1: {
      flex: 1,
    },
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.md,
      backgroundColor: theme.primary,
      ...shadows.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.primaryDark,
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.background,
      marginHorizontal: spacing.md,
    },
    recipientPlaceholder: {
      width: 24,
    },
    messageListContainer: {
      flex: 1,
    },
    messageListContent: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexGrow: 1, // Ensure content pushes input down
    },
    messageContainer: {
      maxWidth: '80%',
      marginVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'flex-end',
    },
    userMessage: {
      alignSelf: 'flex-end',
      justifyContent: 'flex-end',
    },
    otherMessage: {
      alignSelf: 'flex-start',
      justifyContent: 'flex-start',
    },
    messageCard: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 18,
      marginHorizontal: spacing.xs,
      minWidth: 60,
    },
    userMessageCard: {
      backgroundColor: theme.primary,
    },
    otherMessageCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border,
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22,
    },
    userMessageText: {
      color: theme.background,
    },
    otherMessageText: {
      color: theme.text,
    },
    timestamp: {
      fontSize: 11,
      marginTop: spacing.xs / 2,
      marginLeft: spacing.sm,
    },
    userTimestamp: {
      color: theme.gray200,
      alignSelf: 'flex-end',
    },
    otherTimestamp: {
      color: theme.textLight,
      alignSelf: 'flex-end',
    },
    inputContainer: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
      alignItems: 'center',
    },
    input: {
      flex: 1,
      backgroundColor: theme.background,
      borderRadius: 20,
      paddingHorizontal: spacing.md,
      paddingVertical: Platform.OS === 'ios' ? spacing.sm : spacing.xs,
      marginRight: spacing.sm,
      color: theme.text,
      fontSize: 16,
      maxHeight: 100,
    },
    sendButton: {
      backgroundColor: theme.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.xs,
    },
    sendButtonDisabled: {
      backgroundColor: theme.gray400,
      opacity: 0.7,
    },
    endedChat: {
      backgroundColor: theme.surfaceVariant,
      marginVertical: spacing.md,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center',
    },
    endedChatText: {
      color: theme.onSurfaceVariant,
      fontSize: 14,
      textAlign: 'center',
    },
  })
}

export default ChatDetailScreen
