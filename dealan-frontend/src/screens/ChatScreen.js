import React, { useState, useEffect, useRef } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, FlatList, Alert } from 'react-native';
import { getChatHistory, getChatWebSocketUrl } from '../services/chatApi';

export default function ChatScreen({ route }) {
  const { order_id, role, user_id } = route.params || {};
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const ws = useRef(null);

  useEffect(() => {
    if (!order_id) return;

    // Load history
    const loadHistory = async () => {
      try {
        const history = await getChatHistory(order_id);
        if (Array.isArray(history)) {
          setMessages(history);
        } else if (history && Array.isArray(history.messages)) {
          setMessages(history.messages);
        } else {
          setMessages([]);
        }
      } catch (err) {
        console.log('Error loading history', err);
      }
    };
    loadHistory();

    let wsInstance = null;
    let fallbackInterval = null;

    try {
      // Connect WebSocket
      const url = getChatWebSocketUrl(order_id, user_id, role);
      ws.current = new WebSocket(url);
      wsInstance = ws.current;

      wsInstance.onopen = () => console.log('WS Connected');
      wsInstance.onmessage = (event) => {
        try {
          const msg = JSON.parse(event.data);
          setMessages((prev) => [...prev, msg]);
        } catch (e) {
          console.error('Invalid message format', e);
        }
      };
      wsInstance.onerror = (e) => {
        console.log('WS Error, falling back to local sync');
        startLocalFallback();
      };
    } catch (err) {
      console.log('WS Blocked (Mixed Content), falling back to local sync');
      startLocalFallback();
    }

    function startLocalFallback() {
      fallbackInterval = setInterval(async () => {
        let localChat = null;
        if (typeof window !== 'undefined' && window.localStorage) {
          localChat = window.localStorage.getItem(`chat_${order_id}`);
        } else {
          localChat = await AsyncStorage.getItem(`chat_${order_id}`);
        }
        
        if (localChat) {
          setMessages(JSON.parse(localChat));
        }
      }, 1000);
    }

    return () => {
      if (wsInstance) wsInstance.close();
      if (fallbackInterval) clearInterval(fallbackInterval);
    };
  }, [order_id]);

  const sendMessage = async () => {
    if (!inputText.trim()) return;
    const messagePayload = {
      order_id: parseInt(order_id, 10) || order_id,
      sender_id: String(user_id),
      role: role,
      content: inputText
    };

    if (ws.current && ws.current.readyState === WebSocket.OPEN) {
      ws.current.send(JSON.stringify(messagePayload));
      setMessages((prev) => [...prev, messagePayload]);
    } else {
      // Local sync fallback: prevent overwriting other tab's messages
      let localChat = null;
      if (typeof window !== 'undefined' && window.localStorage) {
        localChat = window.localStorage.getItem(`chat_${order_id}`);
      } else {
        localChat = await AsyncStorage.getItem(`chat_${order_id}`);
      }
      
      const currentMsgs = localChat ? JSON.parse(localChat) : messages;
      const newMsgs = [...currentMsgs, messagePayload];
      setMessages(newMsgs);
      
      if (typeof window !== 'undefined' && window.localStorage) {
        window.localStorage.setItem(`chat_${order_id}`, JSON.stringify(newMsgs));
      } else {
        await AsyncStorage.setItem(`chat_${order_id}`, JSON.stringify(newMsgs));
      }
    }
    setInputText('');
  };

  const renderItem = ({ item }) => {
    const isMe = item.role === role;
    return (
      <View style={[styles.bubble, isMe ? styles.myBubble : styles.theirBubble]}>
        <Text style={[styles.messageText, isMe ? styles.myMessageText : styles.theirMessageText]}>
          {item.content}
        </Text>
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <FlatList
        data={messages}
        keyExtractor={(item, index) => index.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ padding: 15 }}
      />
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          value={inputText}
          onChangeText={setInputText}
          placeholder="Ketik pesan..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={sendMessage}>
          <Text style={styles.sendButtonText}>Kirim</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F4F7FB' },
  bubble: { maxWidth: '80%', padding: 12, borderRadius: 16, marginBottom: 10 },
  myBubble: { backgroundColor: '#007AFF', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  theirBubble: { backgroundColor: '#E5E7EB', alignSelf: 'flex-start', borderBottomLeftRadius: 4 },
  messageText: { fontSize: 16 },
  myMessageText: { color: '#fff' },
  theirMessageText: { color: '#1F2937' },
  inputContainer: { flexDirection: 'row', padding: 10, backgroundColor: '#fff', borderTopWidth: 1, borderColor: '#E2E8F0' },
  input: { flex: 1, backgroundColor: '#F9FAFC', borderWidth: 1, borderColor: '#E2E8F0', padding: 12, borderRadius: 20, fontSize: 16, marginRight: 10 },
  sendButton: { backgroundColor: '#007AFF', paddingHorizontal: 20, justifyContent: 'center', borderRadius: 20 },
  sendButtonText: { color: '#fff', fontWeight: 'bold' }
});
