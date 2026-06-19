import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert, ScrollView } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function DriverDashboardScreen({ navigation }) {
  const [pendingOrders, setPendingOrders] = useState([]);

  useEffect(() => {
    // For demo purposes, we fetch the latest order created from AsyncStorage
    // In a real app, this would be a WebSocket connection or API polling to order-service/driver-service
    const fetchOrders = async () => {
      const orderId = await AsyncStorage.getItem('latestOrderId');
      if (orderId) {
        setPendingOrders([{
          id: orderId,
          pickup: 'Lokasi Jemput (User)',
          destination: 'Tujuan (User)',
          price: 'Sesuai Negosiasi',
          status: 'Menunggu Konfirmasi'
        }]);
      } else {
        setPendingOrders([]);
      }
    };
    fetchOrders();
    const interval = setInterval(fetchOrders, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleAccept = async (orderId) => {
    Alert.alert('Pesanan Diterima', 'Anda berhasil menerima pesanan ini!');
    await AsyncStorage.setItem('driverAcceptedOrder', String(orderId));
    await AsyncStorage.removeItem('latestOrderId'); // Hapus dari antrian masuk
    
    // Simulate notifying the user
    navigation.navigate('Chat', { order_id: orderId, role: 'driver', user_id: 'driver-123' });
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Dashboard Mitra Driver</Text>
        <Text style={styles.headerSubtitle}>Status: Aktif Mencari Penumpang</Text>
      </View>

      <Text style={styles.sectionTitle}>Pesanan Masuk</Text>
      
      {pendingOrders.length === 0 ? (
        <View style={styles.emptyBox}>
          <Text style={styles.emptyText}>Belum ada pesanan masuk...</Text>
        </View>
      ) : (
        pendingOrders.map(order => (
          <View key={order.id} style={styles.orderCard}>
            <View style={styles.orderHeader}>
              <Text style={styles.orderId}>Order #{order.id}</Text>
              <Text style={styles.orderPrice}>{order.price}</Text>
            </View>
            <View style={styles.routeBox}>
              <Text style={styles.routeText}>📍 {order.pickup}</Text>
              <Text style={styles.routeText}>🏁 {order.destination}</Text>
            </View>
            <TouchableOpacity style={styles.acceptButton} onPress={() => handleAccept(order.id)}>
              <Text style={styles.acceptButtonText}>Terima Pesanan</Text>
            </TouchableOpacity>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F4F7FB', padding: 20 },
  header: { backgroundColor: '#10B981', padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#10B981', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 10, elevation: 5 },
  headerTitle: { color: '#fff', fontSize: 24, fontWeight: 'bold' },
  headerSubtitle: { color: '#D1FAE5', fontSize: 14, marginTop: 4 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#333', marginBottom: 15 },
  emptyBox: { backgroundColor: '#fff', padding: 30, borderRadius: 16, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: '#E5E7EB', borderStyle: 'dashed' },
  emptyText: { color: '#9CA3AF', fontSize: 16 },
  orderCard: { backgroundColor: '#fff', borderRadius: 16, padding: 20, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 15 },
  orderId: { fontSize: 16, fontWeight: 'bold', color: '#1F2937' },
  orderPrice: { fontSize: 16, fontWeight: 'bold', color: '#059669' },
  routeBox: { backgroundColor: '#F9FAFC', padding: 15, borderRadius: 12, marginBottom: 15 },
  routeText: { fontSize: 14, color: '#4B5563', marginVertical: 4 },
  acceptButton: { backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  acceptButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold' }
});
