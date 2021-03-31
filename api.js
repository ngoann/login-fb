const axios = require('axios')
const API_URL = 'http://localhost:3000/api/v1'

export async function login(accessToken) {
  try {
    const params = { access_token: accessToken }

    const response = await axios.post(`${API_URL}/auth/login`, params)

    return response.data
  } catch (error) {
    return false
  }
}

export async function getDetail(uid) {
  try {
    const response = await axios.get(`${API_URL}/user`)

    return response.data
  } catch (error) {
    return false
  }
}
