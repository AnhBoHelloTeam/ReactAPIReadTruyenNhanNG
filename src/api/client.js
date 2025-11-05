import axios from 'axios';

export const API_BASE_URL = 'https://otruyenapi.com/v1/api';
export const IMG_CDN_BASE_URL = 'https://img.otruyenapi.com';

export const apiClient = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
});

apiClient.interceptors.response.use(
  (response) => response,
  (error) => {
    const message = error?.response?.data?.message || error?.message || 'Network error';
    return Promise.reject(new Error(message));
  }
);

export const buildImageUrl = (relativePath) => {
  if (!relativePath) return '';
  return `${IMG_CDN_BASE_URL}/${relativePath}`;
};


