// src/modules/school/components/SchoolItem.tsx

import CsText from '@components/CsText'
import { Ionicons } from '@expo/vector-icons'
import type { ISchoolDTO } from '@modules/app/types/ILoginDTO'
import { useNavigation } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type { SchoolStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import type React from 'react'
import { useCallback } from 'react'
import {
  Dimensions,
  Image,
  StyleSheet,
  TouchableOpacity,
  View
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring
} from 'react-native-reanimated'

const AnimatedTouchableOpacity =
  Animated.createAnimatedComponent(TouchableOpacity)

const $black = '#000'
const $black30 = '#00000030'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const COLUMN_WIDTH = SCREEN_WIDTH / 2 - spacing.md * 1.5

interface SchoolItemProps {
  item: ISchoolDTO
  index: number
  totalItems: number
  theme: ITheme
}

export const SchoolItem: React.FC<SchoolItemProps> = ({ item, theme }) => {
  const navigation = useNavigation<StackNavigationProp<SchoolStackParams>>()

  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
    opacity: opacity.value
  }))

  const onPressIn = () => {
    scale.value = withSpring(0.95)
    opacity.value = withSpring(0.8)
  }

  const onPressOut = () => {
    scale.value = withSpring(1)
    opacity.value = withSpring(1)
  }

  const goToSchoolDetails = useCallback(
    (school: ISchoolDTO) => navigation.navigate(Routes.SchoolDetails, school),
    [navigation]
  )

  return (
    <AnimatedTouchableOpacity
      style={[styles(theme).schoolItem, animatedStyle]}
      onPress={() => goToSchoolDetails(item)}
      onPressIn={onPressIn}
      onPressOut={onPressOut}
      activeOpacity={1}
      accessibilityRole='button'
      accessibilityLabel={`View details for ${item.name}`}
    >
      <View style={styles(theme).imageContainer}>
        <Image
          source={{ uri: item.imageUrl }}
          style={styles(theme).schoolImage}
          resizeMode='cover'
        />
        <View style={styles(theme).overlay} />
        <Ionicons
          name='school'
          size={24}
          color={theme.background}
          style={styles(theme).schoolIcon}
        />
      </View>
      <View style={styles(theme).schoolInfo}>
        <CsText
          variant='h3'
          style={styles(theme).schoolName}
          numberOfLines={2}
          ellipsizeMode='tail'
        >
          {item.name}
        </CsText>
        <View style={styles(theme).codeContainer}>
          <CsText variant='caption' style={styles(theme).schoolCode}>
            {item.code}
          </CsText>
        </View>
      </View>
    </AnimatedTouchableOpacity>
  )
}

function styles(theme: ITheme) {
  return StyleSheet.create({
    schoolItem: {
      width: COLUMN_WIDTH,
      margin: spacing.xs,
      borderRadius: 16,
      overflow: 'hidden',
      backgroundColor: theme.card,
      elevation: 4,
      shadowColor: $black,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.1,
      shadowRadius: 4
    },
    imageContainer: {
      position: 'relative',
      height: 150
    },
    schoolImage: {
      width: '100%',
      height: '100%'
    },
    overlay: {
      ...StyleSheet.absoluteFillObject,
      backgroundColor: $black30
    },
    schoolIcon: {
      position: 'absolute',
      top: spacing.sm,
      right: spacing.sm
    },
    schoolInfo: {
      padding: spacing.sm
    },
    schoolName: {
      color: theme.text,
      marginBottom: spacing.xs,
      fontWeight: 'bold'
    },
    codeContainer: {
      backgroundColor: theme.primary,
      borderRadius: 8,
      paddingHorizontal: spacing.xs,
      paddingVertical: 2,
      alignSelf: 'flex-start'
    },
    schoolCode: {
      color: theme.background,
      fontWeight: 'bold'
    }
  })
}
