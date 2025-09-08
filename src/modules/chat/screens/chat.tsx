// src/modules/chat/screens/chat.tsx

import CsText from '@components/CsText'
import EmptyListComponent from '@components/EmptyListComponent'
import useDataFetching from '@hooks/useDataFetching'
import { LoadingScreen, SummaryCard } from '@modules/app/components'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { useTheme } from '@src/hooks'
import { supabase } from '@src/lib/supabase'
import { useAppSelector } from '@store/index'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type { ChatStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import type React from 'react'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { ConversationItem } from '../components/ConversationItem'
import { useChat } from '../hooks/useChat'
import type { Conversation } from '../types/chat'

const ChatScreen: React.FC = () => {
  // Hooks and Navigation
  const theme = useTheme()
  const styles = useStyles(theme)
  const navigation = useNavigation<StackNavigationProp<ChatStackParams>>()

  const user = useAppSelector(s => s?.AppReducer?.user)
  const { getConversations } = useChat()

  // State for filter
  const [selectedFilter, setSelectedFilter] = useState('all')
  const initialFetchDone = useRef(false) // Ref to track initial fetch

  const fetchConversationsFunction = useCallback(async () => {
    if (!user?.id) {
      return [] as Conversation[]
    }
    try {
      const convos = await getConversations(user.id)
      return convos
    } catch {
      return []
    }
  }, [user?.id])

  const {
    data: conversations,
    loading,
    refreshing,
    refetch: refetchData
  } = useDataFetching<Conversation[]>(fetchConversationsFunction, [], {
    lazy: true
  })

  useEffect(() => {
    if (user?.id && !initialFetchDone.current) {
      refetchData()
      initialFetchDone.current = true
    } else if (!user?.id) {
      // console.log('ChatScreen: User not logged in, skipping initial fetch')
    }
  }, [user?.id, refetchData])

  useEffect(() => {
    if (!user?.id) {
      return
    }

    const channel = supabase
      .channel('chats_listener_teacher')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `teacher_id=eq.${user.id}`
        },
        () => {}
      )
      .subscribe(status => {
        if (status === 'SUBSCRIBED') {
          // console.log('ChatScreen: Subscribed to chats listener channel') // Removed
        }
        if (status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
          // console.error('ChatScreen: Subscription error:', status, err) // Removed
        }
        if (status === 'CLOSED') {
          // console.log('ChatScreen: Supabase channel closed.') // Removed
        }
      })

    return () => {
      if (channel) {
        supabase
          .removeChannel(channel)

          .catch(err =>
            console.error('ChatScreen: Error removing channel:', err)
          )
      }
    }
  }, [user?.id])

  const filteredConversations = useMemo(() => {
    const currentConversations = conversations || []
    if (selectedFilter === 'unread') {
      return currentConversations.filter(conv => conv.unreadCount > 0)
    }
    return currentConversations
  }, [conversations, selectedFilter])

  const summary = useMemo(() => {
    const currentConversations = conversations || []
    return {
      totalConversations: currentConversations.length,
      unreadMessages: currentConversations.reduce(
        (sum, converse) => sum + converse.unreadCount,
        0
      )
    }
  }, [conversations])

  const summaryItems = useMemo(
    () => [
      {
        label: 'Conversations',
        value: summary.totalConversations,
        icon: 'chatbubbles-outline' as const,
        color: styles.primary.color
      },
      {
        label: 'Messages non lus',
        value: summary.unreadMessages,
        icon: 'mail-unread-outline' as const,
        color: styles.warning.color
      }
    ],
    [summary, styles.primary.color, styles.warning.color]
  )

  const renderHeader = () => (
    <View style={styles.header}>
      <CsText style={styles.headerTitle}>Discussions</CsText>
      <View style={styles.filterContainer}>
        {['all', 'unread'].map(filter => (
          <TouchableOpacity
            key={filter}
            style={[
              styles.filterButton,
              selectedFilter === filter && styles.selectedFilterButton
            ]}
            onPress={() => setSelectedFilter(filter)}
            disabled={loading || refreshing}
          >
            <CsText
              style={StyleSheet.flatten([
                styles.filterButtonText,
                selectedFilter === filter && styles.selectedFilterButtonText
              ])}
            >
              {filter === 'unread' ? 'Non lus' : 'Tout'}
            </CsText>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  )

  const handleConversationPress = (chatId: string) => {
    navigation.navigate(Routes.ChatDetails, { chatId })
  }

  if (loading && !initialFetchDone.current) {
    return <LoadingScreen />
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        style={styles.conversationList}
        data={filteredConversations}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
        keyExtractor={item => item.id}
        ListHeaderComponent={
          <SummaryCard
            items={summaryItems}
            primaryColor={styles.primary.color}
            successColor={styles.success.color}
            warningColor={styles.warning.color}
          />
        }
        onRefresh={refetchData}
        refreshing={refreshing}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          !loading && !refreshing && filteredConversations.length === 0 ? (
            <EmptyListComponent
              message={
                selectedFilter === 'unread'
                  ? 'Aucun message non lu'
                  : 'Aucune conversation trouvée'
              }
            />
          ) : null
        }
        initialNumToRender={10}
        maxToRenderPerBatch={10}
        windowSize={21}
      />
    </View>
  )
}

// Styles definition (remains the same)
function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background
    },
    header: {
      backgroundColor: theme.primary,
      padding: spacing.md,
      paddingTop: spacing.xl
    },
    headerTitle: {
      color: theme.background,
      fontSize: 24,
      fontWeight: 'bold',
      marginBottom: spacing.sm
    },
    filterContainer: {
      flexDirection: 'row',
      justifyContent: 'space-around',
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: spacing.xs
    },
    filterButton: {
      alignItems: 'center',
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.lg,
      flex: 1,
      marginHorizontal: spacing.xs
    },
    selectedFilterButton: {
      backgroundColor: theme.primary,
      borderRadius: 8
    },
    filterButtonText: {
      color: theme.text,
      fontSize: 12,
      fontWeight: '500'
    },
    selectedFilterButtonText: {
      color: theme.background,
      fontWeight: 'bold'
    },
    conversationList: {
      flex: 1,
      padding: spacing.md
    },
    newConversationButton: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: theme.primary,
      padding: spacing.sm,
      borderRadius: 8,
      margin: spacing.md
    },
    buttonText: {
      color: theme.background,
      marginLeft: spacing.xs,
      fontWeight: 'bold'
    },
    primary: {
      color: theme.primary
    },
    success: { color: theme.success },
    warning: { color: theme.warning }
  })
}

export default ChatScreen
