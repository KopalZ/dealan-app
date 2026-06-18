import api from '../config/api';

export const submitRating = async (payload) => {
  const response = await api.post('/ratings/submit', payload);
  return response.data;
};
