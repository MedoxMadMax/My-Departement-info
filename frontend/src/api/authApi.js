import axiosClient from './axiosClient';

export const login = async (email, password) => {
  const response = await axiosClient.post('/api/login', { email, password });
  return response.data; // { token: "..." }
};

export const getMe = async () => {
  const response = await axiosClient.get('/api/me');
  return response.data;
};
