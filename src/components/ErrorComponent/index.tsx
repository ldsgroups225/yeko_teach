// src/components/ErrorComponent/index.tsx

import { MaterialIcons } from '@expo/vector-icons'
import translate from '@helpers/localization'
import useTheme from '@hooks/useTheme'
import { Text, TouchableOpacity, View } from 'react-native'
import { styles } from './style'
import type { ErrorComponentProps } from './type'

const testID = 'errorcomponent'
function ErrorComponent({ errorMessage, onRetry }: ErrorComponentProps) {
  const theme = useTheme()
  return (
    <View style={styles.container} testID={`${testID}-container`}>
      <MaterialIcons name='error' size={50} color={theme.primary} />

      <Text style={styles.message}>{errorMessage}</Text>

      <TouchableOpacity onPress={onRetry} style={styles.retryButton}>
        <Text style={styles.buttonText}>{translate('retry')}</Text>
      </TouchableOpacity>
    </View>
  )
}

export default ErrorComponent
