import { ResponseType } from 'expo-auth-session'
import * as Facebook from 'expo-auth-session/providers/facebook'
import * as WebBrowser from 'expo-web-browser'
import * as React from 'react'
import { login, getDetail } from './api'
import { Button, Image, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

WebBrowser.maybeCompleteAuthSession()

export default function App() {
  const [accessToken, setAccessToken] = React.useState(null)
  const [uid, setUid] = React.useState(null)
  const [user, setUser] = React.useState(null)

  const [request, _, promptAsync] = Facebook.useAuthRequest({
    clientId: '894225467325880',
    responseType: ResponseType.Token
  })

  React.useEffect(() => {
    getUserInfo()
  })

  const getUserInfo = async () => {
    const accessTokenStorage = JSON.parse(await AsyncStorage.getItem('@accessToken'))

    if (accessTokenStorage && !user) {
      const userInfo = await getDetail(accessTokenStorage)

      if (userInfo) {
        setUser(userInfo)
      } else {
        removeAccessToken()
      }
    }
  }

  const removeAccessToken = async () => {
    await AsyncStorage.setItem('@accessToken', null)
  }

  const handleLoginAction = async () => {
    const result = await promptAsync()

    if (result.type === 'success') {
      const accessToken = result.authentication.accessToken

      const response = await login(accessToken)

      await AsyncStorage.setItem('@accessToken', response.access_token)

      setAccessToken(response.access_token)
    }
  }

  const handleLogoutAction = async () => {
    removeAccessToken()

    setUser(null)
  }

  return (
    <View style={styles.container}>
      {user ? (<Profile user={user} logout={handleLogoutAction} />) : (
        <Button
          disabled={!request}
          title='Login with Facebook'
          onPress={handleLoginAction}
        />
      )}
    </View>
  )
}

function Profile({ user, logout }) {
  return (
    <View style={styles.profile}>
      <Image source={{ uri: user.picture }} style={styles.image} />
      <Text style={styles.name}>{user.name}</Text>
      <Text>ID: {user.id}</Text>
      <Button title='Log out' onPress={logout} />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profile: {
    alignItems: 'center',
  },
  name: {
    fontSize: 20,
  },
  image: {
    borderRadius: 50,
    height: 100,
    width: 100,
  },
})
