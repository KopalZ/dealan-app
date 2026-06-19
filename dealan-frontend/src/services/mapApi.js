import api from '../config/api';

export const getRoute = async (origin, destination) => {
  const response = await api.get('/map/route', {
    params: { origin, destination }
  });
  return response.data;
};
