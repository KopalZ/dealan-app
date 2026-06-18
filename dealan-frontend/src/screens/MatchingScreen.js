import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Alert, TouchableOpacity } from 'react-native';
import { findDriver } from '../services/matchingApi';

export default function MatchingScreen({ route, navigation }) {
  const { order_id } = route.params || {};
  const [status, setStatus] = useState('Mencari driver terbaik di sekitarmu...');
  const [isFailed, setIsFailed] = useState(false);
  const [driverId, setDriverId] = useState(null);

  useEffect(() => {
    const matchDriver = async () => {
      try {
        const payload = {
          order_id: parseInt(order_id, 10),
          lat: -6.2088,
          lng: 106.8456,
          radius: 5000,
          service_type: 'ride'
        };
        const res = await findDriver(payload);
        setStatus(`Yeay! Driver Ditemukan`);
        setDriverId(res.driver_id || '22222222-2222-2222-2222-222222222222');
        
        setTimeout(() => {
          navigation.navigate('Payment', { order_id, driver_id: res.driver_id || '22222222-2222-2222-2222-222222222222', nominal: 20000 });
        }, 2000);
      } catch (err) {
        setStatus('Oops, gagal mencari driver. Coba lagi nanti.');
        setIsFailed(true);
      }
    };

    matchDriver();
  }, []);

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <View style={styles.iconContainer}>
          {isFailed ? <Text style={styles.icon}>⚠️</Text> : <Text style={styles.icon}>📡</Text>}
        </View>
        <Text style={styles.title}>{isFailed ? 'Pencarian Gagal' : 'Mencari Driver'}</Text>
        <Text style={styles.status}>{status}</Text>
        
        {!isFailed && !driverId && (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        )}
        
        {isFailed && (
          <TouchableOpacity 
            style={styles.primaryButton} 
            onPress={() => navigation.navigate('Payment', { order_id, driver_id: '22222222-2222-2222-2222-222222222222', nominal: 20000 })}
          >
            <Text style={styles.primaryButtonText}>Lanjutkan ke Pembayaran (Demo)</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 30, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  iconContainer: { width: 80, height: 80, borderRadius: 40, backgroundColor: '#E0F2FE', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  icon: { fontSize: 40 },
  title: { fontSize: 24, fontWeight: '800', color: '#1A1A1A', marginBottom: 10, textAlign: 'center' },
  status: { fontSize: 16, textAlign: 'center', color: '#666', marginBottom: 20 },
  loader: { marginVertical: 20, transform: [{ scale: 1.5 }] },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 15, paddingHorizontal: 20, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center' }
});
