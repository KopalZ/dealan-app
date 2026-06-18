import api from '../config/api';

export const processPayment = async (payload) => {
  const response = await api.post('/payments/create', payload);
  return response.data;
};
