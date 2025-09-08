// src/modules/chat/screens/chatDetails.tsx

import { CsCard, CsText } from '@components/index'
import { ToastColorEnum } from '@components/ToastMessage/ToastColorEnum'
import { Ionicons } from '@expo/vector-icons'
import { showToast } from '@helpers/toast/showToast'
import type { RouteProp } from '@react-navigation/native'
import {
  useFocusEffect,
  useNavigation,
  useRoute
} from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import { supabase } from '@src/lib/supabase'
import type { Database } from '@src/lib/supabase/types'
import { useAppSelector } from '@store/index'
import { shadows, spacing } from '@styles/index'
import type { ITheme } from '@styles/theme'
import type Routes from '@utils/Routes'
import type { ChatStackParams } from '@utils/Routes'
import type React from 'react'
import { useCallback, useEffect, useRef, useState } from 'react'
import {
  Alert,
  Animated,
  FlatList,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StatusBar,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { useChat } from '../hooks/useChat'
import { chat as chatService } from '../services/chatService'

// Message Interface
interface Message {
  id: string
  text: string
  sender: 'user' | 'other'
  timestamp: Date
}

// Default Header Height (adjust if your header is significantly different)
const DEFAULT_HEADER_HEIGHT = Platform.OS === 'ios' ? 64 : 0

const ChatDetailScreen: React.FC = () => {
  const theme = useTheme()
  const styles = useStyles(theme)
  const insets = useSafeAreaInsets() // Get safe area insets

  const navigation = useNavigation<StackNavigationProp<ChatStackParams>>()
  const route = useRoute<RouteProp<ChatStackParams, Routes.ChatDetails>>()
  const chatId = route.params.chatId

  const user = useAppSelector(s => s?.AppReducer?.user)

  const { getMessages, createMessage } = useChat()

  const [messages, setMessages] = useState<Message[]>([])
  const [chat, setChat] = useState<{
    messageCount: number
    title: string
    status: 'active' | 'ended' | 'archived'
  } | null>(null)
  const [inputText, setInputText] = useState('')

  const flatListRef = useRef<FlatList>(null)
  const fadeAnim = useRef(new Animated.Value(0)).current

  // --- Keyboard Offset Calculation ---
  // Use a base header height and add status bar height for Android,
  // and potentially top inset for iOS if header is translucent/drawn under status bar.
  const statusBarHeight = StatusBar.currentHeight ?? 0
  const keyboardVerticalOffset =
    Platform.OS === 'ios'
      ? DEFAULT_HEADER_HEIGHT + insets.bottom // Use inset for iOS if header is under status bar
      : DEFAULT_HEADER_HEIGHT + statusBarHeight // Use status bar height for Android with 'height' behavior

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        // Using timeout helps ensure layout is complete before scrolling
        setTimeout(
          () => flatListRef.current?.scrollToEnd({ animated: true }),
          100
        )
      }
    )
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Optional: Handle keyboard hide event if needed
      }
    )

    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])

  // --- Data Loading and Effects (largely unchanged) ---
  useEffect(() => {
    if (user === null || !chatId) return

    let isMounted = true
    const loadMessages = async () => {
      try {
        const result = await getMessages({ userId: user!.id, chatId })
        if (isMounted) {
          setChat({
            messageCount: result.messageCount,
            title: result.title,
            status: result.status
          })
          setMessages(result.messages)
        }
      } catch (error) {
        if (isMounted) {
          showToast((error as Error).message, ToastColorEnum.Error)
        }
      }
    }
    loadMessages()
    return () => {
      isMounted = false
    }
  }, [chatId, user?.id, getMessages])

  useEffect(() => {
    if (messages.length > 0) {
      setTimeout(
        () => flatListRef.current?.scrollToEnd({ animated: true }),
        150
      ) // Slightly longer timeout
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true
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
          } catch (err) {
            console.error('Failed to mark messages as read:', err)
          }
        }
      }
      const timeoutId = setTimeout(markRead, 500)
      return () => {
        isActive = false
        clearTimeout(timeoutId)
      }
    }, [chatId, user?.id])
  )

  // --- Send Message Logic (unchanged) ---
  const sendMessage = async () => {
    const trimmedInput = inputText.trim()
    if (!trimmedInput || !chat) return

    if (chat.messageCount >= 10) {
      Alert.alert(
        'Limite Atteinte',
        'Vous avez atteint le nombre maximum de messages par chat (10 max).'
      )
      return
    }

    const optimisticMessage: Message = {
      id: `temp-${Date.now()}`,
      sender: 'user',
      text: trimmedInput,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, optimisticMessage])
    setInputText('')

    try {
      await createMessage({ chatId, senderId: user!.id, content: trimmedInput })
    } catch (error) {
      console.error('Error sending message:', error)
      showToast("Erreur d'envoi du message.", ToastColorEnum.Error)
      setMessages(prev => prev.filter(msg => msg.id !== optimisticMessage.id))
      setInputText(trimmedInput)
    }
  }

  // --- Real-time Listener (unchanged) ---
  useEffect(() => {
    if (!user || !chatId) return

    const channel = supabase
      .channel(`messages_for_chat_${chatId}`)
      .on<Database['public']['Tables']['messages']['Row']>(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'messages',
          filter: `chat_id=eq.${chatId}`
        },
        payload => {
          const rawNewMessage = payload.new
          if (rawNewMessage.sender_id !== user.id) {
            const formattedMessage: Message = {
              id: rawNewMessage.id,
              text: rawNewMessage.content,
              sender: 'other',
              timestamp: rawNewMessage.created_at
                ? new Date(rawNewMessage.created_at)
                : new Date()
            }
            setMessages(prevMessages => [...prevMessages, formattedMessage])
          } else {
            setMessages(prevMessages =>
              prevMessages.map(msg =>
                msg.id.startsWith('temp-') && msg.text === rawNewMessage.content
                  ? {
                      ...msg,
                      id: rawNewMessage.id,
                      timestamp: rawNewMessage.created_at
                        ? new Date(rawNewMessage.created_at)
                        : new Date()
                    }
                  : msg
              )
            )
          }
        }
      )
      .subscribe((status, err) => {
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          console.error(`Subscription error for chat ${chatId}:`, status, err)
        }
      })

    return () => {
      supabase
        .removeChannel(channel)
        .catch(err => console.error('Error removing channel:', err))
    }
  }, [chatId, supabase, user?.id])

  // --- Render Message Item (unchanged) ---
  const renderMessage = ({ item, index }: { item: Message; index: number }) => {
    const isLastMessage = index === messages.length - 1
    const timestampString =
      item.timestamp instanceof Date && !Number.isNaN(item.timestamp.getTime())
        ? item.timestamp.toLocaleTimeString([], {
            hour: '2-digit',
            minute: '2-digit'
          })
        : '--:--'

    return (
      <Animated.View
        style={[
          styles.messageContainer,
          item.sender === 'user' ? styles.userMessage : styles.otherMessage,
          isLastMessage && { opacity: fadeAnim }
        ]}
      >
        <CsCard
          style={StyleSheet.flatten([
            styles.messageCard,
            item.sender === 'user'
              ? styles.userMessageCard
              : styles.otherMessageCard
          ])}
        >
          <CsText
            style={StyleSheet.flatten([
              styles.messageText,
              item.sender === 'user'
                ? styles.userMessageText
                : styles.otherMessageText
            ])}
          >
            {item.text}
          </CsText>
          <CsText
            style={StyleSheet.flatten([
              styles.timestamp,
              item.sender === 'user'
                ? styles.userTimestamp
                : styles.otherTimestamp
            ])}
          >
            {timestampString}
          </CsText>
        </CsCard>
      </Animated.View>
    )
  }

  // --- Main Render ---
  return (
    // Use KeyboardAvoidingView as the outermost container for the screen content
    // that needs to adjust for the keyboard.
    <KeyboardAvoidingView
      style={styles.container} // Ensure KAV takes full flex
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={keyboardVerticalOffset} // Apply calculated offset
    >
      {/* Header remains outside the main adjustable area */}
      <View style={styles.header}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          accessibilityLabel='Go back'
        >
          <Ionicons
            name='arrow-back'
            size={24}
            color={styles.headerText.color}
          />
        </TouchableOpacity>
        <CsText style={styles.headerText}>
          {chat
            ? `${10 - chat.messageCount} messages restants`
            : 'Chargement...'}
        </CsText>
        <View style={styles.recipientPlaceholder} />
      </View>

      {/* This View acts as the main content area that KAV will adjust */}
      {/* For behavior='height', KAV adjusts the height of this View */}
      {/* For behavior='padding', KAV adds padding to the bottom of this View */}
      <View style={styles.contentArea}>
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
                    Vous avez atteint le nombre maximum de messages par chat (10
                    max).
                  </CsText>
                </CsCard>
              )
            }
            return null
          }}
          initialNumToRender={15}
          maxToRenderPerBatch={10}
          windowSize={21}
          // Ensure list scrolls when content size changes due to keyboard
          onContentSizeChange={() =>
            flatListRef.current?.scrollToEnd({ animated: false })
          }
          onLayout={() => flatListRef.current?.scrollToEnd({ animated: false })}
        />
      </View>

      {/* Input container remains visually at the bottom, KAV adjusts the space above it */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder='Tapez votre message...'
          placeholderTextColor={theme.textLight}
          editable={chat?.status === 'active'}
          multiline
          blurOnSubmit={false}
          returnKeyType='send'
          onSubmitEditing={sendMessage}
        />
        <TouchableOpacity
          onPress={sendMessage}
          disabled={chat?.status !== 'active' || !inputText.trim()}
          style={[
            styles.sendButton,
            (chat?.status !== 'active' || !inputText.trim()) &&
              styles.sendButtonDisabled
          ]}
          accessibilityLabel='Send message'
        >
          <Ionicons name='send' size={20} color={theme.background} />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  )
}

// --- Styles ---
function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1, // KAV needs flex: 1 to manage its children's layout
      backgroundColor: theme.background
    },
    header: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      paddingTop: Platform.OS === 'ios' ? spacing.xl : spacing.md, // Adjust as needed
      backgroundColor: theme.primary,
      ...shadows.medium,
      borderBottomWidth: 1,
      borderBottomColor: theme.primaryDark
    },
    headerText: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.background,
      marginHorizontal: spacing.md
    },
    recipientPlaceholder: {
      width: 24
    },
    // This view holds the FlatList and will be adjusted by KAV
    contentArea: {
      flex: 1 // Make this area flexible so it can shrink/have padding added
    },
    messageListContent: {
      paddingHorizontal: spacing.md,
      paddingVertical: spacing.sm,
      flexGrow: 1 // Important: Allows list to grow and push input down
    },
    messageContainer: {
      maxWidth: '80%',
      marginVertical: spacing.xs,
      flexDirection: 'row',
      alignItems: 'flex-end'
    },
    userMessage: {
      alignSelf: 'flex-end',
      justifyContent: 'flex-end'
    },
    otherMessage: {
      alignSelf: 'flex-start',
      justifyContent: 'flex-start'
    },
    messageCard: {
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      borderRadius: 18,
      marginHorizontal: spacing.xs,
      minWidth: 60
    },
    userMessageCard: {
      backgroundColor: theme.primary
    },
    otherMessageCard: {
      backgroundColor: theme.card,
      borderWidth: 1,
      borderColor: theme.border
    },
    messageText: {
      fontSize: 16,
      lineHeight: 22
    },
    userMessageText: {
      color: theme.background
    },
    otherMessageText: {
      color: theme.text
    },
    timestamp: {
      fontSize: 11,
      marginTop: spacing.xs / 2,
      marginLeft: spacing.sm
    },
    userTimestamp: {
      color: theme.gray200,
      alignSelf: 'flex-end'
    },
    otherTimestamp: {
      color: theme.textLight,
      alignSelf: 'flex-end'
    },
    inputContainer: {
      flexDirection: 'row',
      paddingVertical: spacing.sm,
      paddingHorizontal: spacing.md,
      backgroundColor: theme.card,
      borderTopWidth: StyleSheet.hairlineWidth,
      borderTopColor: theme.border,
      alignItems: 'center'
      // Add paddingBottom to account for safe area on iOS if needed,
      // KAV with 'padding' behavior usually handles this, but sometimes needed.
      // paddingBottom: insets.bottom,
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
      maxHeight: 100
    },
    sendButton: {
      backgroundColor: theme.primary,
      borderRadius: 20,
      width: 40,
      height: 40,
      justifyContent: 'center',
      alignItems: 'center',
      marginLeft: spacing.xs
    },
    sendButtonDisabled: {
      backgroundColor: theme.gray400,
      opacity: 0.7
    },
    endedChat: {
      backgroundColor: theme.surfaceVariant,
      marginVertical: spacing.md,
      padding: spacing.md,
      borderRadius: 8,
      alignItems: 'center'
    },
    endedChatText: {
      color: theme.onSurfaceVariant,
      fontSize: 14,
      textAlign: 'center'
    }
  })
}

export default ChatDetailScreen
