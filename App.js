import { ResponseType } from 'expo-auth-session'
import * as Facebook from 'expo-auth-session/providers/facebook'
import * as WebBrowser from 'expo-web-browser'
import * as React from 'react'
import { login, getDetail } from './api'
import { Button, Image, StyleSheet, Text, View } from 'react-native'
import AsyncStorage from '@react-native-async-storage/async-storage'

WebBrowser.maybeCompleteAuthSession()

export default function App() {
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
    const uidStorage = JSON.parse(await AsyncStorage.getItem('@uid'))

    if (uidStorage && !user) {
      const userInfo = await getDetail(uidStorage)

      if (userInfo) {
        setUser(userInfo)
      } else {
        await AsyncStorage.setItem('@uid', null)
      }
    }
  }

  const handleLoginAction = async () => {
    const result = await promptAsync()

    if (result.type === 'success') {
      const accessToken = result.authentication.accessToken

      const userInfoResponse = await fetch(
        `https://graph.facebook.com/me?access_token=${accessToken}&fields=id,name,picture.type(large)`
      )

      const userInfo = await userInfoResponse.json()
      const loginStatus = await login(userInfo, accessToken)

      await AsyncStorage.setItem('@uid', userInfo.id)

      setUid(userInfo.id)

      return
    }
  }

  const handleLogoutAction = async () => {
    await AsyncStorage.setItem('@uid', null)

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
      <Image source={{ uri: user.picture.data ? user.picture.data.url : user.picture }} style={styles.image} />
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
    width: 100,
    height: 100,
    borderRadius: 50,
  },
})
