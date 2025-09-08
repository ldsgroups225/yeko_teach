import CsText from '@components/CsText'
import { CsCard } from '@components/index'
import { formatDate } from '@modules/app/utils'
import { useTheme } from '@src/hooks'
import { shadows } from '@styles/shadows'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type React from 'react'
import { useEffect, useRef } from 'react'
import { Animated, StyleSheet, View } from 'react-native'
import type { Conversation } from '../types/chat'

export const ConversationItem: React.FC<{
  conversation: Conversation
  onPress: () => void
}> = ({ conversation, onPress }) => {
  const theme = useTheme()
  const themedStyles = useStyles(theme)
  const opacity = useRef(new Animated.Value(0)).current

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: 1,
      duration: 500,
      useNativeDriver: true
    }).start()
  }, [])

  const animatedStyle = {
    opacity,
    transform: [
      {
        translateY: opacity.interpolate({
          inputRange: [0, 1],
          outputRange: [50, 0]
        })
      }
    ]
  }

  return (
    <Animated.View style={[themedStyles.conversationItem, animatedStyle]}>
      <CsCard style={themedStyles.conversationCard} onPress={onPress}>
        <View style={themedStyles.conversationHeader}>
          <CsText variant='h3' style={themedStyles.conversationTopic}>
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
          variant='body'
          numberOfLines={2}
          style={themedStyles.lastMessage}
        >
          {conversation.lastMessage}
        </CsText>
        <View style={themedStyles.conversationFooter}>
          <CsText variant='caption' style={themedStyles.participantText}>
            {conversation.participants[1]}{' '}
            {/* Assuming index 1 is the other participant */}
          </CsText>
          <CsText variant='caption' style={themedStyles.dateText}>
            {formatDate(conversation.lastMessageDate, 'd MMM yyyy')}
          </CsText>
        </View>
      </CsCard>
    </Animated.View>
  )
}

function useStyles(theme: ITheme) {
  return StyleSheet.create({
    conversationItem: {
      marginBottom: spacing.md
    },
    conversationCard: {
      padding: spacing.md,
      ...shadows.small
    },
    conversationHeader: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'center',
      marginBottom: spacing.xs
    },
    conversationTopic: {
      flex: 1
    },
    unreadBadge: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingHorizontal: 8,
      paddingVertical: 4
    },
    unreadBadgeText: {
      color: theme.background,
      fontSize: 12,
      fontWeight: 'bold'
    },
    lastMessage: {
      color: theme.textLight,
      marginBottom: spacing.xs
    },
    conversationFooter: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      alignItems: 'flex-start'
    },
    participantText: {
      color: theme.textLight,
      width: '70%'
    },
    dateText: {
      color: theme.textLight
    }
  })
}
