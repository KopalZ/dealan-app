import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/authApi';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert('Error', 'Email dan password harus diisi');
      return;
    }
    try {
      setLoading(true);
      const res = await login(email, password);
      if (res.token) {
        await AsyncStorage.setItem('userToken', res.token);
        alert('Login berhasil');
        navigation.replace('CreateOrder');
      }
    } catch (err) {
      // Error handled by global interceptor in api.js
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Login ke Dealan</Text>
        <Text style={styles.subtitle}>Selamat datang kembali!</Text>

        <TextInput
          style={styles.input}
          placeholder="Email Address"
          placeholderTextColor="#999"
          value={email}
          onChangeText={setEmail}
          autoCapitalize="none"
          keyboardType="email-address"
        />
        <TextInput
          style={styles.input}
          placeholder="Password"
          placeholderTextColor="#999"
          value={password}
          onChangeText={setPassword}
          secureTextEntry
        />
        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleLogin}>
            <Text style={styles.primaryButtonText}>Sign In</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('Register')}>
          <Text style={styles.secondaryButtonText}>Belum punya akun? Daftar</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.secondaryButton, { marginTop: 15 }]} onPress={() => navigation.navigate('DriverDashboard')}>
          <Text style={styles.driverButtonText}>🚗 Login sebagai Mitra Driver</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  title: { fontSize: 28, fontWeight: '800', color: '#1A1A1A', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 16, color: '#666', marginBottom: 30, textAlign: 'center' },
  input: { backgroundColor: '#F9FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, marginBottom: 15, borderRadius: 12, fontSize: 16, color: '#333' },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 15, borderRadius: 12, alignItems: 'center', marginTop: 10 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { paddingVertical: 15, alignItems: 'center', marginTop: 5 },
  secondaryButtonText: { color: '#007AFF', fontSize: 16, fontWeight: '600' },
  driverButtonText: { color: '#10B981', fontSize: 16, fontWeight: 'bold' },
  loader: { marginVertical: 20 }
});
