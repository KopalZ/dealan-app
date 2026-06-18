import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { createOrder } from '../services/orderApi';

export default function CreateOrderScreen({ navigation }) {
  const [serviceType, setServiceType] = useState('ride'); // ride, car, send
  const [userId, setUserId] = useState('1'); // Placeholder for User ID
  const [detailPaket, setDetailPaket] = useState('');
  const [loading, setLoading] = useState(false);

  const handleCreateOrder = async () => {
    try {
      setLoading(true);
      const payload = {
        user_id: parseInt(userId),
        status: 'PENDING',
        detail_paket: {
          service_type: serviceType,
          description: serviceType === 'send' ? detailPaket : '',
        }
      };

      const res = await createOrder(payload);
      alert('Pesanan berhasil dibuat');
      navigation.navigate('Negotiation', { order_id: res.data.id });
    } catch (err) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  const ServiceCard = ({ type, title, icon }) => (
    <TouchableOpacity
      style={[styles.cardButton, serviceType === type && styles.cardButtonActive]}
      onPress={() => setServiceType(type)}
    >
      <Text style={[styles.cardIcon, serviceType === type && styles.cardIconActive]}>{icon}</Text>
      <Text style={[styles.cardTitle, serviceType === type && styles.cardTitleActive]}>{title}</Text>
    </TouchableOpacity>
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.headerTitle}>Buat Pesanan Baru</Text>
      <Text style={styles.headerSubtitle}>Pilih layanan yang Anda butuhkan hari ini</Text>

      <View style={styles.serviceContainer}>
        <ServiceCard type="ride" title="Dealan Ride" icon="🏍️" />
        <ServiceCard type="car" title="Dealan Car" icon="🚗" />
        <ServiceCard type="send" title="Dealan Send" icon="📦" />
      </View>

      {serviceType === 'send' && (
        <View style={styles.inputContainer}>
          <Text style={styles.label}>Detail Barang / Paket</Text>
          <TextInput
            style={styles.input}
            placeholder="Contoh: Dokumen penting"
            placeholderTextColor="#999"
            value={detailPaket}
            onChangeText={setDetailPaket}
          />
        </View>
      )}

      {loading ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateOrder}>
          <Text style={styles.primaryButtonText}>Lanjutkan Pesanan</Text>
        </TouchableOpacity>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F4F7FB', padding: 20 },
  headerTitle: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginTop: 10, marginBottom: 5 },
  headerSubtitle: { fontSize: 15, color: '#666', marginBottom: 30 },
  serviceContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  cardButton: { flex: 1, backgroundColor: '#fff', borderRadius: 16, paddingVertical: 20, marginHorizontal: 5, alignItems: 'center', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 2, borderWidth: 2, borderColor: 'transparent' },
  cardButtonActive: { borderColor: '#007AFF', backgroundColor: '#F0F8FF' },
  cardIcon: { fontSize: 32, marginBottom: 8, opacity: 0.5 },
  cardIconActive: { opacity: 1 },
  cardTitle: { fontSize: 14, fontWeight: '600', color: '#666' },
  cardTitleActive: { color: '#007AFF', fontWeight: 'bold' },
  inputContainer: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, borderRadius: 12, fontSize: 16, color: '#333' },
  primaryButton: { backgroundColor: '#007AFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, shadowColor: '#007AFF', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' }
});
