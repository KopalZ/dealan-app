import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { login } from '../services/authApi';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [role, setRole] = useState('user'); // 'user' | 'driver'
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
        await AsyncStorage.setItem('userEmail', email); // For history screen mock
        alert(`Login berhasil sebagai ${role === 'driver' ? 'Driver' : 'Penumpang'}`);
        if (role === 'driver') {
          navigation.replace('DriverDashboard');
        } else {
          navigation.replace('CreateOrder');
        }
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
        <View style={styles.roleContainer}>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'user' && styles.roleButtonActive]} 
            onPress={() => setRole('user')}
          >
            <Text style={[styles.roleText, role === 'user' && styles.roleTextActive]}>👤 Penumpang</Text>
          </TouchableOpacity>
          <TouchableOpacity 
            style={[styles.roleButton, role === 'driver' && styles.roleButtonActive]} 
            onPress={() => setRole('driver')}
          >
            <Text style={[styles.roleText, role === 'driver' && styles.roleTextActive]}>🚗 Mitra Driver</Text>
          </TouchableOpacity>
        </View>

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
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20 },
  roleButton: { flex: 1, paddingVertical: 12, borderWidth: 1, borderColor: '#E2E8F0', borderRadius: 10, alignItems: 'center', marginHorizontal: 5 },
  roleButtonActive: { backgroundColor: '#E0F2FE', borderColor: '#0284C7' },
  roleText: { color: '#64748B', fontWeight: 'bold' },
  roleTextActive: { color: '#0284C7' },
  loader: { marginVertical: 20 }
});
