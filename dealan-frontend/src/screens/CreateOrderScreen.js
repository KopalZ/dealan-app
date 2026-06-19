import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView, Linking } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createOrder } from '../services/orderApi';
import { getRoute } from '../services/mapApi';
import { calculateEstimate } from '../services/pricingApi';
import { createShipment } from '../services/shipmentApi';
export default function CreateOrderScreen({ navigation }) {
  const [serviceType, setServiceType] = useState('ride'); // ride, car, send
  const [userId, setUserId] = useState('1'); // Placeholder for User ID
  const [detailPaket, setDetailPaket] = useState('');
  const [origin, setOrigin] = useState('');
  const [destinations, setDestinations] = useState(['']); // Array for multiple destinations
  const [routeInfo, setRouteInfo] = useState(null);
  const [estimatedPrice, setEstimatedPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [estimating, setEstimating] = useState(false);

  const handleAddDestination = () => {
    setDestinations([...destinations, '']);
  };

  const handleDestinationChange = (text, index) => {
    const newDest = [...destinations];
    newDest[index] = text;
    setDestinations(newDest);
  };

  const getHaversineDistance = (lat1, lon1, lat2, lon2) => {
    const R = 6371; 
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLon/2) * Math.sin(dLon/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
  };

  const geocode = async (query) => {
    const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}`);
    const data = await res.json();
    if (data && data.length > 0) return { lat: parseFloat(data[0].lat), lon: parseFloat(data[0].lon) };
    return null;
  };

  const getOSRMRoute = async (lon1, lat1, lon2, lat2) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${lon1},${lat1};${lon2},${lat2}?overview=false`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.code === 'Ok' && data.routes.length > 0) {
        return {
          distance: data.routes[0].distance / 1000, // km
          duration: data.routes[0].duration // seconds
        };
      }
    } catch (e) {}
    return null;
  };

  const handleCheckEstimate = async () => {
    if (!origin || !destinations[0]) {
      alert('Harap isi titik jemput dan minimal 1 tujuan');
      return;
    }
    try {
      setEstimating(true);
      
      let mapRes;
      try {
        mapRes = await getRoute(origin, destinations[destinations.length - 1]);
      } catch (mapErr) {
        // Fallback: Use direct OSM Nominatim and OSRM
        try {
          const coord1 = await geocode(origin);
          const coord2 = await geocode(destinations[destinations.length - 1]);
          if (coord1 && coord2) {
             const osrm = await getOSRMRoute(coord1.lon, coord1.lat, coord2.lon, coord2.lat);
             if (osrm) {
               const roadDist = Math.max(1, Math.round(osrm.distance * 10) / 10);
               mapRes = { distance: roadDist, duration: osrm.duration };
             } else {
               const dist = getHaversineDistance(coord1.lat, coord1.lon, coord2.lat, coord2.lon);
               const roadDist = Math.max(1, Math.round((dist * 1.3) * 10) / 10);
               mapRes = { distance: roadDist, duration: (roadDist / 30) * 3600 };
             }
          } else {
             throw new Error('Fallback failed');
          }
        } catch(e) {
          mapRes = { distance: 12.5, duration: 1500 }; 
        }
      }

      // If multi-stop, we mock additional distance
      const totalDistance = mapRes.distance + (destinations.length - 1) * 3; 

      setRouteInfo({ ...mapRes, distance: totalDistance });

      // 2. Calculate Pricing based on total distance
      const priceRes = await calculateEstimate({
        service_type: serviceType,
        distance: totalDistance,
        weight: serviceType === 'send' ? 2.5 : 0 // dummy weight
      });
      setEstimatedPrice(priceRes.estimated_price);
    } catch (err) {
      alert('Gagal! Terjadi kesalahan pada server saat menghitung harga. Coba lagi.');
    } finally {
      setEstimating(false);
    }
  };

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
      const orderId = res.data.id;

      if (serviceType === 'send') {
        // Create Shipment for multi-stop
        await createShipment({
          order_id: String(orderId),
          kategori_barang: 'Umum',
          berat_barang: 2.5,
          nama_penerima: 'Penerima',
          nomor_penerima: '08123456789',
          catatan_pickup: detailPaket,
          manifest: {
            is_multi_stop: destinations.length > 1,
            destinations: destinations
          }
        });
      }

      await AsyncStorage.setItem('latestOrderId', String(orderId));

      alert('Pesanan berhasil dibuat');
      // Pass the estimated price and coords to NegotiationScreen
      navigation.navigate('Negotiation', { 
        order_id: orderId,
        estimatedPrice,
        distance: routeInfo?.distance
      });
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

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Titik Jemput</Text>
        <TextInput
          style={styles.input}
          placeholder="Misal: Stasiun Bandung"
          placeholderTextColor="#999"
          value={origin}
          onChangeText={setOrigin}
        />
      </View>

      {destinations.map((dest, index) => (
        <View key={index} style={styles.inputContainer}>
          <Text style={styles.label}>Titik Tujuan {destinations.length > 1 ? index + 1 : ''}</Text>
          <TextInput
            style={styles.input}
            placeholder="Misal: Alun-alun Bandung"
            placeholderTextColor="#999"
            value={dest}
            onChangeText={(text) => handleDestinationChange(text, index)}
          />
        </View>
      ))}

      {serviceType === 'send' && (
        <TouchableOpacity style={styles.addStopButton} onPress={handleAddDestination}>
          <Text style={styles.addStopText}>+ Tambah Tujuan Lain</Text>
        </TouchableOpacity>
      )}

      {routeInfo && (
        <View style={styles.mapMock}>
          <Text style={styles.mapIcon}>🗺️</Text>
          <View style={{ flex: 1 }}>
            <Text style={styles.mapText}>Rute Optimal Ditemukan!</Text>
            <Text style={styles.mapDetail}>Jarak: {routeInfo.distance} km • Waktu: {Math.round(routeInfo.duration/60)} menit</Text>
            <TouchableOpacity 
              style={{ marginTop: 8 }}
              onPress={() => {
                const url = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destinations[destinations.length - 1])}`;
                Linking.openURL(url);
              }}
            >
              <Text style={{ color: '#007AFF', fontWeight: 'bold' }}>Lihat Rute di Google Maps ↗</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {estimatedPrice && (
        <View style={styles.priceContainer}>
          <Text style={styles.priceLabel}>Estimasi Harga Dasar:</Text>
          <Text style={styles.priceValue}>Rp {estimatedPrice.toLocaleString('id-ID')}</Text>
        </View>
      )}

      {loading || estimating ? (
        <ActivityIndicator size="large" color="#007AFF" style={{ marginTop: 20 }} />
      ) : !estimatedPrice ? (
        <TouchableOpacity style={styles.secondaryButton} onPress={handleCheckEstimate}>
          <Text style={styles.secondaryButtonText}>Cek Estimasi Harga</Text>
        </TouchableOpacity>
      ) : (
        <TouchableOpacity style={styles.primaryButton} onPress={handleCreateOrder}>
          <Text style={styles.primaryButtonText}>Buat Pesanan & Lanjut Tawar</Text>
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
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  secondaryButton: { backgroundColor: '#FFF', paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 10, borderWidth: 2, borderColor: '#007AFF' },
  secondaryButtonText: { color: '#007AFF', fontSize: 18, fontWeight: 'bold' },
  addStopButton: { marginBottom: 20, alignSelf: 'flex-start', padding: 10, backgroundColor: '#E0E7FF', borderRadius: 8 },
  addStopText: { color: '#4F46E5', fontWeight: 'bold' },
  mapMock: { backgroundColor: '#E0F2FE', padding: 15, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#BAE6FD' },
  mapIcon: { fontSize: 32, marginRight: 15 },
  mapText: { fontSize: 16, fontWeight: 'bold', color: '#0369A1' },
  mapDetail: { fontSize: 14, color: '#0284C7', marginTop: 4 },
  priceContainer: { backgroundColor: '#F0FDF4', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20, borderWidth: 1, borderColor: '#BBF7D0' },
  priceLabel: { fontSize: 14, color: '#166534', fontWeight: 'bold' },
  priceValue: { fontSize: 24, fontWeight: '900', color: '#15803D', marginTop: 5 }
});
