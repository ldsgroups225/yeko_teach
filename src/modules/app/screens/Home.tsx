import CsText from '@components/CsText'
import { loggedOut } from '@modules/app/redux/appSlice'
import { useAppSelector } from '@src/store'
/**
 * @author Ali Burhan Keskin <alikeskin@milvasoft.com>
 */
import React from 'react'
import { View } from 'react-native'
import { useDispatch } from 'react-redux'

const Home: React.FC = () => {
  // Hooks and Redux
  const user = useAppSelector(s => s?.AppReducer?.user)
  const dispatch = useDispatch()

  // If user is not logged in, redirect to login
  if (!user) {
    dispatch(loggedOut())
    return null
  }

  // Main Render
  return (
    <View>
      <CsText>Hello World</CsText>
      <CsText>{JSON.stringify(user)}</CsText>
    </View>
  )
}

export default Home
