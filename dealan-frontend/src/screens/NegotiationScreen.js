import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert } from 'react-native';
import { negotiatePrice } from '../services/pricingApi';
import { validatePromo } from '../services/promoApi';
export default function NegotiationScreen({ route, navigation }) {
  const { order_id, estimatedPrice, distance } = route.params || {};
  const [requestedPrice, setRequestedPrice] = useState('');
  const [promoCode, setPromoCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [loading, setLoading] = useState(false);
  const [checkingPromo, setCheckingPromo] = useState(false);
  const originalPrice = estimatedPrice || 20000; 
  const finalPrice = Math.max(0, originalPrice - discount);

  const vouchers = ['DEALAN10', 'DEALANHEMAT', 'GRATISONGKIR'];

  const handleApplyPromo = async () => {
    if (!promoCode) return;
    try {
      setCheckingPromo(true);
      const res = await validatePromo(promoCode);
      if (res.IsValid || res.is_valid) {
        setDiscount(res.Discount || res.discount || 10000);
        Alert.alert('Sukses', 'Promo berhasil diterapkan!');
      } else {
        Alert.alert('Gagal', 'Kode promo tidak valid atau sudah kadaluarsa');
        setDiscount(0);
      }
    } catch (err) {
      // Global error handling
    } finally {
      setCheckingPromo(false);
    }
  };

  const handleNegotiate = async () => {
    if (!requestedPrice) {
      Alert.alert('Error', 'Masukkan harga tawaran');
      return;
    }
    try {
      setLoading(true);
      const payload = {
        order_id: String(order_id),
        original_price: finalPrice,
        requested_price: parseFloat(requestedPrice)
      };

      const res = await negotiatePrice(payload);
      if (res.status === 'approved' || res.status === 'accepted') {
        alert('Tawaran Diterima!');
        navigation.navigate('Matching', { order_id });
      } else {
        Alert.alert('Ditolak', 'Harga tawaran terlalu rendah, coba naikkan sedikit.');
      }
    } catch (err) {
      // Globally handled
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>🤝</Text>
        <Text style={styles.title}>Tawar Harga</Text>
        <Text style={styles.subtitle}>Negosiasikan harga terbaik Anda dengan Driver</Text>
        
        <View style={styles.infoBox}>
          <Text style={styles.infoLabel}>{discount > 0 ? 'Harga Setelah Diskon' : 'Estimasi Harga Normal'}</Text>
          <Text style={styles.infoPrice}>Rp {finalPrice.toLocaleString('id-ID')}</Text>
          {discount > 0 && (
            <Text style={styles.discountText}>Diskon Promo: -Rp {discount.toLocaleString('id-ID')}</Text>
          )}
        </View>

        <Text style={styles.inputLabel}>Kode Promo atau Voucher (Opsional)</Text>
        <View style={styles.promoContainer}>
          <TextInput
            style={[styles.input, { flex: 1, marginBottom: 0, textAlign: 'left' }]}
            placeholder="Ketik atau pilih voucher"
            placeholderTextColor="#999"
            value={promoCode}
            onChangeText={setPromoCode}
            autoCapitalize="characters"
          />
          <TouchableOpacity style={styles.promoButton} onPress={handleApplyPromo} disabled={checkingPromo}>
            {checkingPromo ? <ActivityIndicator color="#fff" /> : <Text style={styles.promoButtonText}>Gunakan</Text>}
          </TouchableOpacity>
        </View>

        <View style={styles.voucherScroll}>
          {vouchers.map((voucher) => (
            <TouchableOpacity 
              key={voucher} 
              style={[styles.voucherChip, promoCode === voucher && styles.voucherChipActive]} 
              onPress={() => setPromoCode(voucher)}
            >
              <Text style={[styles.voucherText, promoCode === voucher && styles.voucherTextActive]}>🎟️ {voucher}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.inputLabel}>Harga Tawaran Anda</Text>
        <TextInput
          style={styles.input}
          placeholder="Misal: 15000"
          placeholderTextColor="#999"
          keyboardType="numeric"
          value={requestedPrice}
          onChangeText={setRequestedPrice}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#FF9500" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleNegotiate}>
            <Text style={styles.primaryButtonText}>Ajukan Tawaran</Text>
          </TouchableOpacity>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25, textAlign: 'center' },
  infoBox: { backgroundColor: '#FFF5E5', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 25, borderWidth: 1, borderColor: '#FFE0B2' },
  infoLabel: { fontSize: 14, color: '#D97706', fontWeight: '600', marginBottom: 4 },
  infoPrice: { fontSize: 22, fontWeight: '900', color: '#B45309' },
  discountText: { fontSize: 14, color: '#16A34A', fontWeight: 'bold', marginTop: 4 },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 5, marginTop: 10 },
  promoContainer: { flexDirection: 'row', marginBottom: 10 },
  promoButton: { backgroundColor: '#10B981', paddingHorizontal: 15, justifyContent: 'center', borderRadius: 12, marginLeft: 10 },
  promoButtonText: { color: '#fff', fontWeight: 'bold' },
  voucherScroll: { flexDirection: 'row', flexWrap: 'wrap', marginBottom: 20 },
  voucherChip: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20, marginRight: 8, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB' },
  voucherChipActive: { backgroundColor: '#D1FAE5', borderColor: '#10B981' },
  voucherText: { fontSize: 12, color: '#4B5563', fontWeight: 'bold' },
  voucherTextActive: { color: '#065F46' },
  input: { backgroundColor: '#F9FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, marginBottom: 20, borderRadius: 12, fontSize: 18, color: '#333', textAlign: 'center', fontWeight: 'bold' },
  primaryButton: { backgroundColor: '#FF9500', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#FF9500', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loader: { marginVertical: 20 }
});
