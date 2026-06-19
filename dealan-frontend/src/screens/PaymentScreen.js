import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { processPayment } from '../services/paymentApi';

export default function PaymentScreen({ route, navigation }) {
  const { order_id, driver_id, nominal } = route.params || {};
  const [method, setMethod] = useState('cash'); // cash, qris, bank
  const [loading, setLoading] = useState(false);

  const handlePayment = async () => {
    try {
      setLoading(true);
      const payload = {
        order_id: String(order_id),
        nominal: parseFloat(nominal),
        metode_pembayaran: method,
        user_id: '11111111-1111-1111-1111-111111111111', // Mock user id
        driver_id: String(driver_id)
      };

      const res = await processPayment(payload);
      
      // Clear data so driver dashboard resets
      await AsyncStorage.removeItem('latestOrderId');
      await AsyncStorage.removeItem('driverAcceptedOrder');

      alert('Pembayaran Berhasil / Terproses');
      navigation.navigate('Rating', { order_id: order_id, driver_id: driver_id });
    } catch (err) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const MethodCard = ({ type, title, icon }) => (
    <TouchableOpacity
      style={[styles.methodCard, method === type && styles.methodCardActive]}
      onPress={() => setMethod(type)}
    >
      <Text style={[styles.methodIcon, method === type && styles.methodIconActive]}>{icon}</Text>
      <Text style={[styles.methodTitle, method === type && styles.methodTitleActive]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.title}>Pembayaran</Text>
        <Text style={styles.subtitle}>Selesaikan transaksi Anda</Text>

        <View style={styles.billBox}>
          <Text style={styles.billLabel}>Total Tagihan</Text>
          <Text style={styles.billAmount}>Rp {Number(nominal).toLocaleString('id-ID')}</Text>
        </View>
        
        <Text style={styles.sectionLabel}>Pilih Metode Pembayaran</Text>
        <View style={styles.methodContainer}>
          <MethodCard type="cash" title="Tunai" icon="💵" />
          <MethodCard type="qris" title="QRIS" icon="📱" />
          <MethodCard type="bank" title="Transfer" icon="💳" />
        </View>

        {loading ? (
          <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handlePayment}>
            <Text style={styles.primaryButtonText}>Bayar Sekarang</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25, textAlign: 'center' },
  billBox: { backgroundColor: '#E0F2FE', padding: 20, borderRadius: 16, alignItems: 'center', marginBottom: 25 },
  billLabel: { fontSize: 14, color: '#0284C7', fontWeight: '600', marginBottom: 5 },
  billAmount: { fontSize: 32, fontWeight: '900', color: '#0369A1' },
  sectionLabel: { fontSize: 16, fontWeight: '700', color: '#333', marginBottom: 15 },
  methodContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  methodCard: { flex: 1, backgroundColor: '#F9FAFC', borderRadius: 12, paddingVertical: 15, marginHorizontal: 5, alignItems: 'center', borderWidth: 2, borderColor: 'transparent' },
  methodCardActive: { borderColor: '#007AFF', backgroundColor: '#F0F8FF' },
  methodIcon: { fontSize: 24, marginBottom: 8, opacity: 0.5 },
  methodIconActive: { opacity: 1 },
  methodTitle: { fontSize: 13, fontWeight: '600', color: '#666' },
  methodTitleActive: { color: '#007AFF', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loader: { marginVertical: 20 }
});
