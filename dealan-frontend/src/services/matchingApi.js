import api from '../config/api';

export const findDriver = async (payload) => {
  const response = await api.post('/matching/match', payload);
  return response.data;
};
