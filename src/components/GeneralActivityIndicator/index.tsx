// src/components/GeneralActivityIndicator/index.tsx

import translate from '@helpers/localization'
import { useTheme, useThemedStyles } from '@src/hooks'
import type { JSX } from 'react'
import React, { memo } from 'react'
import { ActivityIndicator, Modal, Text, View } from 'react-native'
import { styles } from './style'
import type { GeneralActivityIndicatorProps } from './type'

const testID = 'generalActivityIndicator'

function GeneralActivityIndicator({
  text,
  size = 'large',
  color,
  containerStyle,
  indicatorStyle,
  textStyle,
  useModal = false,
  isVisible = true,
  accessibilityLabel
}: GeneralActivityIndicatorProps): JSX.Element {
  const theme = useTheme()
  const themedStyles = useThemedStyles<typeof styles>(styles)

  const translatedText = text || translate('generalActivityIndicatorText')
  const indicatorColor = color ?? theme.primary
  const a11yLabel =
    accessibilityLabel ||
    (translatedText ? `${translatedText} loading` : 'Loading')

  const Content = (
    <View
      style={[
        useModal ? themedStyles.modalContainer : themedStyles.activityIndicator,
        containerStyle
      ]}
      testID={`${testID}-container-view`}
      accessible
    >
      <ActivityIndicator
        testID={`${testID}-activity-indicator`}
        animating={isVisible}
        size={size}
        color={indicatorColor}
        style={indicatorStyle}
        accessibilityRole='progressbar'
        accessibilityLabel={a11yLabel}
      />
      {translatedText && (
        <Text
          style={[themedStyles.activityIndicatorText, textStyle]}
          testID={`${testID}-text`}
        >
          {translatedText}
        </Text>
      )}
    </View>
  )

  return useModal ? (
    <Modal
      transparent
      visible={isVisible}
      statusBarTranslucent
      testID={`${testID}-modal`}
    >
      {Content}
    </Modal>
  ) : (
    Content
  )
}

export default memo(GeneralActivityIndicator)
