import CsButton from '@components/CsButton'
import CsText from '@components/CsText'
import { useThemedStyles } from '@hooks/index'
import { useNavigation, useRoute } from '@react-navigation/native'
import type { StackNavigationProp } from '@react-navigation/stack'
import { spacing } from '@styles/spacing'
import type { ITheme } from '@styles/theme'
import type { RootStackParams } from '@utils/Routes'
import Routes from '@utils/Routes'
import type React from 'react'
import { StyleSheet, View } from 'react-native'

type EmailConfirmationProps = Record<string, never>

function styles(theme: ITheme) {
  return StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      padding: spacing.xl,
      backgroundColor: theme.background
    },
    title: {
      fontSize: 24,
      fontWeight: 'bold',
      textAlign: 'center',
      marginBottom: spacing.xl,
      color: theme.text
    },
    message: {
      fontSize: 16,
      textAlign: 'center',
      marginBottom: spacing.xl * 1.5,
      color: theme.textLight,
      lineHeight: 24
    },
    email: {
      fontWeight: 'bold',
      color: theme.text
    },
    button: {
      width: '100%'
    }
  })
}

type EmailConfirmationNavigationProp = StackNavigationProp<RootStackParams>

const EmailConfirmation: React.FC<EmailConfirmationProps> = () => {
  const navigation = useNavigation<EmailConfirmationNavigationProp>()
  const route = useRoute()
  const { email } = route.params as { email: string }
  const themedStyles = useThemedStyles<typeof styles>(styles)

  return (
    <View style={themedStyles.container}>
      <CsText style={themedStyles.title}>Vérifiez votre e-mail</CsText>
      <CsText style={themedStyles.message}>
        Un e-mail de confirmation a été envoyé à{' '}
        <CsText style={themedStyles.email}>{email}</CsText>. Veuillez cliquer
        sur le lien dans l'e-mail pour activer votre compte.
      </CsText>
      <CsButton
        title='Retour à la connexion'
        onPress={() => navigation.navigate(Routes.Login)}
        style={themedStyles.button}
      />
    </View>
  )
}

export default EmailConfirmation
