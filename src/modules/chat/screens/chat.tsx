// src/modules/chat/screens/chat.tsx

import type { ITheme } from '@styles/theme'
import CsText from '@components/CsText'
import { useTheme } from '@src/hooks'
import { useAppSelector } from '@store/index'
import { spacing } from '@styles/spacing'
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import { Animated, FlatList, StyleSheet, TouchableOpacity, View } from 'react-native'
import { useChat } from '../hooks/useChat'
import useDataFetching from '@hooks/useDataFetching'
import { Conversation } from '../types/chat'
import { supabase } from '@src/lib/supabase'
import { LoadingScreen, SummaryCard } from '@modules/app/components'
import { shadows } from '@styles/shadows'
import { CsCard } from '@components/index'
import { formatDate } from '@modules/app/utils'
import { navigationRef } from "@helpers/router";
import Routes, { ChatStackParams } from '@utils/Routes'
import { useNavigation } from '@react-navigation/native'
import { StackNavigationProp } from '@react-navigation/stack'

const ChatScreen: React.FC = () => {
  const theme = useTheme()
  const styles = useStyles(theme)
  const navigation = useNavigation<StackNavigationProp<ChatStackParams>>()

  const user = useAppSelector(s => s?.AppReducer?.user)
  const { getConversations } = useChat()

  const [selectedFilter, setSelectedFilter] = useState("all");
  const [conversations, setConversations] = useState<Conversation[]>([])
  const fetchConversations = useCallback(async () => await getConversations(user!.id).then(r => setConversations(r)), []);

  const {
      loading,
      refreshing,
      refetch: refetchData,
    } = useDataFetching(fetchConversations);

  useEffect(() => {
      const channel = supabase
        .channel('chats')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'chats',
          filter: `parent_id=eq.${user?.id}`
        }, () => refetchData())
        .subscribe();

      // if is insert eve

      return () => {
        channel.unsubscribe();
      };
    }, [user?.id]);


  const summary = useMemo(() => {
      if (!conversations) return { totalConversations: 0, unreadMessages: 0 };
      return {
        totalConversations: conversations.length,
        unreadMessages: conversations.reduce(
          (sum, converse) => sum + converse.unreadCount,
          0
        ),
      };
    }, [conversations?.length]);

  const summaryItems = [
      {
        label: "Conversations",
        value: summary.totalConversations,
        icon: "chatbubbles-outline" as const,
        color: styles.primary.color,
      },
      {
        label: "Messages non lus",
        value: summary.unreadMessages,
        icon: "mail-unread-outline" as const,
        color: styles.warning.color,
      },
    ];

  const renderHeader = () => (
      <View style={styles.header}>
        <CsText style={styles.headerTitle}>Discussions</CsText>
        <View style={styles.filterContainer}>
          {["all", "unread"].map((filter) => (
            <TouchableOpacity
              key={filter}
              style={[
                styles.filterButton,
                selectedFilter === filter && styles.selectedFilterButton,
              ]}
              onPress={() => setSelectedFilter(filter)}
            >
              <CsText
                style={StyleSheet.flatten([
                  styles.filterButtonText,
                  selectedFilter === filter &&
                    styles.selectedFilterButtonText,
                ])}
              >
                {filter === "unread"
                  ? "Non lus"
                  : "Tout"}
              </CsText>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    );

  const handleConversationPress = (chatId: string) => {
    navigation.navigate(Routes.ChatDetails, { chatId })
  }

  if (loading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      {renderHeader()}
      <FlatList
        style={styles.conversationList}
        data={conversations}
        renderItem={({ item }) => (
          <ConversationItem
            conversation={item}
            onPress={() => handleConversationPress(item.id)}
          />
        )}
        keyExtractor={(item) => item.id}
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
      />
    </View>
  )
}

const ConversationItem: React.FC<{ conversation: Conversation; onPress: () => void }> = ({
  conversation,
  onPress,
}) => {
  const theme = useTheme()
  const themedStyles = useStyles(theme)
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true,
    }).start();
  }, []);

  const animatedStyle = {
    opacity,
    transform: [
      {
        translateY: opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0],
        }),
      },
    ],
  };

  return (
    <Animated.View style={[themedStyles.conversationItem, animatedStyle]}>
      <CsCard style={themedStyles.conversationCard} onPress={onPress}>
        <View style={themedStyles.conversationHeader}>
          <CsText variant="h3" style={themedStyles.conversationTopic}>
            {conversation.topic}
          </CsText>
          {conversation.unreadCount > 0 && (
            <View style={themedStyles.unreadBadge}>
              <CsText style={themedStyles.unreadBadgeText}>
                {conversation.unreadCount}
              </CsText>
            </View>
          )}
        </View>
        <CsText
          variant="body"
          numberOfLines={2}
          style={themedStyles.lastMessage}
        >
          {conversation.lastMessage}
        </CsText>
        <View style={themedStyles.conversationFooter}>
          <CsText variant="caption" style={themedStyles.participantText}>
            {conversation.participants[1]}
          </CsText>
          <CsText variant="caption" style={themedStyles.dateText}>
            {formatDate(conversation.lastMessageDate, "d MMM yyyy")}
          </CsText>
        </View>
      </CsCard>
    </Animated.View>
  );
};

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    header: {
      backgroundColor: theme.primary,
      padding: spacing.md,
      paddingTop: spacing.xl,
    },
    headerTitle: {
      color: theme.background,
      fontSize: 24,
      fontWeight: "bold",
      marginBottom: spacing.sm,
    },
    filterContainer: {
      flexDirection: "row",
      justifyContent: "space-between",
      backgroundColor: theme.card,
      borderRadius: 8,
      padding: spacing.xs,
    },
    filterButton: {
      alignItems: "center",
      paddingVertical: spacing.xs,
      paddingHorizontal: spacing.xl,
    },
    selectedFilterButton: {
      backgroundColor: theme.primary,
      borderRadius: 8,
    },
    filterButtonText: {
      color: theme.text,
      fontSize: 12,
    },
    selectedFilterButtonText: {
      color: theme.background,
    },
    conversationList: {
      flex: 1,
      padding: spacing.md,
    },
    conversationItem: {
      marginBottom: spacing.md,
    },
    conversationCard: {
      padding: spacing.md,
      ...shadows.small,
    },
    conversationHeader: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
      marginBottom: spacing.xs,
    },
    conversationTopic: {
      flex: 1,
    },
    unreadBadge: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4,
    },
    unreadBadgeText: {
      color: theme.background,
      fontSize: 12,
      fontWeight: "bold",
    },
    lastMessage: {
      color: theme.textLight,
      marginBottom: spacing.xs,
    },
    conversationFooter: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "flex-start",
    },
    participantText: {
      color: theme.textLight,
      width: "80%",
    },
    dateText: {
      color: theme.textLight,
    },
    newConversationButton: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: theme.primary,
      padding: spacing.sm,
      borderRadius: 8,
      margin: spacing.md,
    },
    buttonText: {
      color: theme.background,
      marginLeft: spacing.xs,
      fontWeight: "bold",
    },
    modalBackground: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: "black",
    },
    primary: {
      color: theme.primary,
    },
    success: { color: "#4CAF50" },
    warning: { color: "#FFA500" },
  })
}

export default ChatScreen
