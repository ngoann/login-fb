const axios = require('axios')
const API_URL = 'http://localhost:3000/api/v1'

export async function login(user) {
  try {
    const params = { uid: user.id, name: user.name, picture: user.picture.data.url }

    const response = await axios.post(`${API_URL}/auth/login`, params)

    return response.data
  } catch (error) {
    return false
  }
}

export async function getDetail(uid) {
  try {
    const response = await axios.get(`${API_URL}/users/${uid}`)

    return response.data
  } catch (error) {
    return false
  }
}
