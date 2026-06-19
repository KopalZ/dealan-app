import api from '../config/api';

export const getChatHistory = async (orderId) => {
  const response = await api.get(`/chat/history/${orderId}`);
  return response.data;
};

// WebSocket URL builder
export const getChatWebSocketUrl = (orderId, userId, role) => {
  // Vercel Serverless does NOT support WebSockets.
  // We must connect directly to the Azure Ingress IP.
  return `ws://20.187.180.177/chat/ws?order_id=${orderId}&user_id=${userId}&role=${role}`;
};
