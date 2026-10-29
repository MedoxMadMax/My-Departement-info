import axiosClient from './axiosClient';

export const getFilieres = async () => {
  const response = await axiosClient.get('/api/public/filieres');
  return response.data;
};

export const getFiliereBySlug = async (slug) => {
  const response = await axiosClient.get(`/api/public/filieres/${slug}`);
  return response.data;
};

export const getEnseignants = async () => {
  const response = await axiosClient.get('/api/public/enseignants');
  return response.data;
};

export const getLaboratoires = async () => {
  const response = await axiosClient.get('/api/public/laboratoires');
  return response.data;
};

export const getActualites = async (params = {}) => {
  const response = await axiosClient.get('/api/public/actualites', { params });
  return response.data;
};

export const getActualiteBySlug = async (slug) => {
  const response = await axiosClient.get(`/api/public/actualites/${slug}`);
  return response.data;
};

export const getDepartementInfo = async () => {
  const response = await axiosClient.get('/api/public/departement');
  return response.data;
};
