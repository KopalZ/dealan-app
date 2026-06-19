import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function HistoryScreen({ navigation }) {
  const [userEmail, setUserEmail] = useState('');
  const [history, setHistory] = useState([
    { id: '1001', service: 'Dealan Ride', date: '2023-10-01', status: 'Selesai', price: 'Rp 15.000' },
    { id: '1002', service: 'Dealan Send', date: '2023-10-05', status: 'Selesai', price: 'Rp 25.000' }
  ]);

  useEffect(() => {
    const fetchLatest = async () => {
      const email = await AsyncStorage.getItem('userEmail');
      if (email) setUserEmail(email);

      const orderId = await AsyncStorage.getItem('latestOrderId');
      if (orderId) {
        setHistory(prev => [
          { id: orderId, service: 'Dealan Service', date: new Date().toISOString().split('T')[0], status: 'Sedang Proses', price: 'N/A' },
          ...prev
        ]);
      }
    };
    fetchLatest();
  }, []);

  const renderItem = ({ item }) => (
    <View style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.serviceTitle}>{item.service}</Text>
        <Text style={styles.date}>{item.date}</Text>
      </View>
      <Text style={styles.orderId}>Order #{item.id}</Text>
      <View style={styles.cardFooter}>
        <Text style={styles.price}>{item.price}</Text>
        <Text style={[styles.status, item.status === 'Selesai' ? styles.statusSelesai : styles.statusProses]}>
          {item.status}
        </Text>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>Riwayat Transaksi</Text>
      {userEmail ? <Text style={styles.userSubtitle}>Menampilkan riwayat untuk: {userEmail}</Text> : null}
      <FlatList
        data={history}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', padding: 20 },
  headerTitle: { fontSize: 24, fontWeight: 'bold', color: '#1F2937', marginBottom: 5 },
  userSubtitle: { fontSize: 14, color: '#6B7280', marginBottom: 20 },
  card: { backgroundColor: '#fff', borderRadius: 12, padding: 15, marginBottom: 15, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 10, elevation: 3 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8 },
  serviceTitle: { fontSize: 16, fontWeight: 'bold', color: '#0369A1' },
  date: { fontSize: 12, color: '#6B7280' },
  orderId: { fontSize: 14, color: '#374151', marginBottom: 10 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  price: { fontSize: 16, fontWeight: 'bold', color: '#10B981' },
  status: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, fontSize: 12, fontWeight: 'bold', overflow: 'hidden' },
  statusSelesai: { backgroundColor: '#D1FAE5', color: '#065F46' },
  statusProses: { backgroundColor: '#FEF3C7', color: '#92400E' }
});
