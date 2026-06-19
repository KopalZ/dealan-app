import api from '../config/api';

export const validatePromo = async (code) => {
  const response = await api.post('/promo', { code });
  return response.data;
};
