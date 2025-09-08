// src/components/NotFoundComponent/index.tsx

import type { JSX } from 'react'
import { Text, View } from 'react-native'
import { styles } from './style'
import type { NotFoundComponentProps } from './type'

const testID = 'notFoundComponent'
/**
 * Renders a component for displaying a "Not Found" message.
 *
 * @param {object} props - The component props.
 * @param {string} props.title - The title to be displayed.
 * @returns {JSX.Element} The rendered component.
 */
function NotFoundComponent({ title }: NotFoundComponentProps): JSX.Element {
  return (
    <View style={styles.root} testID={`${testID}-container-view`}>
      <Text style={styles.title} testID={`${testID}-title-text`}>
        {title}
      </Text>
    </View>
  )
}

export default NotFoundComponent
