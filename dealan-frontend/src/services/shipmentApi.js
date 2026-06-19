import api from '../config/api';

export const createShipment = async (payload) => {
  const response = await api.post('/shipments', payload);
  return response.data;
};

export const getShipment = async (id) => {
  const response = await api.get(`/shipments/${id}`);
  return response.data;
};
