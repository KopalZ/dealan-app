import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HomeScreen({ navigation }) {
  const handleLogout = async () => {
    await AsyncStorage.removeItem('userToken');
    navigation.replace('Login');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Selamat Datang di Dealan</Text>
      
      <View style={styles.menuContainer}>
        <TouchableOpacity style={styles.primaryButton} onPress={() => navigation.navigate('CreateOrder')}>
          <Text style={styles.buttonText}>🚗 Buat Pesanan (Ride/Car/Send)</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.secondaryButton} onPress={() => navigation.navigate('History')}>
          <Text style={styles.buttonTextSecondary}>📜 Riwayat Transaksi</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
        <Text style={styles.logoutText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, justifyContent: 'center', alignItems: 'center', backgroundColor: '#F4F7FB' },
  title: { fontSize: 28, fontWeight: '800', marginBottom: 40, color: '#1A1A1A' },
  menuContainer: { marginBottom: 30, width: '100%', gap: 15 },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 18, borderRadius: 16, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  buttonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#fff', paddingVertical: 18, borderRadius: 16, alignItems: 'center', borderWidth: 1, borderColor: '#D1D5DB' },
  buttonTextSecondary: { color: '#374151', fontSize: 18, fontWeight: 'bold' },
  logoutButton: { marginTop: 20 },
  logoutText: { color: '#EF4444', fontSize: 16, fontWeight: 'bold' }
});
