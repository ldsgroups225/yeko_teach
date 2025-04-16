import React from 'react'
import { StyleSheet, Text, View } from 'react-native'

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignSelf: 'center',
  },
  text: {

  },
})

function ErrorBoundaryPage() {
  return (
    <View style={styles.container}>
      <Text style={styles.text}>Erreur!</Text>
    </View>
  )
}

export default ErrorBoundaryPage
