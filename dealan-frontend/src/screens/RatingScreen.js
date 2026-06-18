import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, ActivityIndicator, Alert, ScrollView } from 'react-native';
import { submitRating } from '../services/ratingApi';

export default function RatingScreen({ route, navigation }) {
  const { order_id, driver_id } = route.params || {};
  const [score, setScore] = useState(5);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRating = async () => {
    try {
      setLoading(true);
      const payload = {
        order_id: String(order_id),
        reviewer_id: '11111111-1111-1111-1111-111111111111', // Mock
        reviewer_role: 'user',
        target_id: String(driver_id),
        target_role: 'driver',
        rating_score: score,
        comment
      };

      await submitRating(payload);
      alert('Rating telah dikirimkan');
      navigation.navigate('CreateOrder');
    } catch (err) {
      // Handled globally
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.card}>
        <Text style={styles.icon}>⭐</Text>
        <Text style={styles.title}>Beri Penilaian</Text>
        <Text style={styles.subtitle}>Bagaimana pengalaman perjalanan Anda?</Text>
        
        <View style={styles.scoreContainer}>
          {[1, 2, 3, 4, 5].map((val) => (
            <TouchableOpacity 
              key={val} 
              style={[styles.scoreButton, score === val && styles.scoreButtonActive]}
              onPress={() => setScore(val)}
            >
              <Text style={[styles.scoreText, score === val && styles.scoreTextActive]}>{val}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.label}>Komentar (Opsional)</Text>
        <TextInput
          style={styles.input}
          multiline
          numberOfLines={4}
          placeholder="Tuliskan pengalaman luar biasa Anda..."
          placeholderTextColor="#999"
          value={comment}
          onChangeText={setComment}
        />

        {loading ? (
          <ActivityIndicator size="large" color="#10B981" style={styles.loader} />
        ) : (
          <TouchableOpacity style={styles.primaryButton} onPress={handleRating}>
            <Text style={styles.primaryButtonText}>Kirim Ulasan</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#F4F7FB', justifyContent: 'center', padding: 20 },
  card: { backgroundColor: '#fff', borderRadius: 20, padding: 30, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 5 },
  icon: { fontSize: 48, textAlign: 'center', marginBottom: 10 },
  title: { fontSize: 26, fontWeight: '800', color: '#1A1A1A', marginBottom: 5, textAlign: 'center' },
  subtitle: { fontSize: 14, color: '#666', marginBottom: 25, textAlign: 'center' },
  scoreContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 30 },
  scoreButton: { width: 45, height: 45, borderRadius: 22.5, backgroundColor: '#F3F4F6', justifyContent: 'center', alignItems: 'center' },
  scoreButtonActive: { backgroundColor: '#F59E0B', shadowColor: '#F59E0B', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 5, elevation: 3 },
  scoreText: { fontSize: 18, fontWeight: 'bold', color: '#666' },
  scoreTextActive: { color: '#fff' },
  label: { fontSize: 14, fontWeight: '600', color: '#333', marginBottom: 8, marginLeft: 5 },
  input: { backgroundColor: '#F9FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 15, marginBottom: 25, borderRadius: 12, fontSize: 16, color: '#333', textAlignVertical: 'top', height: 100 },
  primaryButton: { backgroundColor: '#10B981', paddingVertical: 16, borderRadius: 12, alignItems: 'center', shadowColor: '#10B981', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.3, shadowRadius: 15, elevation: 5 },
  primaryButtonText: { color: '#fff', fontSize: 18, fontWeight: 'bold' },
  loader: { marginVertical: 20 }
});
