import CsText from '@components/CsText'
import { useThemedStyles } from '@hooks/index'
import { spacing } from '@styles/spacing'
import type React from 'react'
import { StyleSheet } from 'react-native'

interface SectionHeaderProps {
  title: string
}

const SectionHeader: React.FC<SectionHeaderProps> = ({ title }) => {
  const themedStyles = useThemedStyles<typeof styles>(styles)

  return (
    <CsText variant='h2' style={themedStyles.sectionTitle}>
      {title}
    </CsText>
  )
}

function styles() {
  return StyleSheet.create({
    sectionTitle: {
      marginTop: spacing.md,
      marginBottom: spacing.sm,
      paddingHorizontal: spacing.md
    }
  })
}

export default SectionHeader
