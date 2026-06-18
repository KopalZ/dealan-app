import axios from 'axios';
// Menggunakan IP Wi-Fi Laptop agar bisa diakses dari HP fisik, Web, dan Emulator
const BASE_URL = 'http://20.187.180.177';

import AsyncStorage from '@react-native-async-storage/async-storage';
import { Alert } from 'react-native';

const api = axios.create({
  baseURL: BASE_URL,
  timeout: 10000,
  headers: {
    'Bypass-Tunnel-Reminder': 'true'
  }
});

// Interceptor to attach JWT token
api.interceptors.request.use(
  async (config) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error('Error fetching token from AsyncStorage:', error);
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor to handle errors globally
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const message = error.response.data?.error || 'Terjadi kesalahan pada server';
      Alert.alert('Error', message);
    } else {
      Alert.alert('Error', 'Tidak dapat terhubung ke server');
    }
    return Promise.reject(error);
  }
);

export default api;
