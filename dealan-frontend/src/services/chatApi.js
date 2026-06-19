import api from '../config/api';

export const getChatHistory = async (orderId) => {
  const response = await api.get(`/chat/history/${orderId}`);
  return response.data;
};

// WebSocket URL builder
export const getChatWebSocketUrl = (orderId, userId, role) => {
  // Use wss for secure websocket if in production
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const host = window.location.host; // Vercel proxy will forward to /api/chat/ws
  return `${protocol}//${host}/api/chat/ws?order_id=${orderId}&user_id=${userId}&role=${role}`;
};
