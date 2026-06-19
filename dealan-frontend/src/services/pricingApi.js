import api from '../config/api';

export const calculateEstimate = async (payload) => {
  const response = await api.post('/pricing/estimate', payload);
  return response.data;
};

export const negotiatePrice = async (payload) => {
  const response = await api.post('/pricing/negotiate', payload);
  return response.data;
};
