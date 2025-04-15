import axiosApi from 'axios';
import { getSessionToken } from '@tiendanube/nexo';

import nexo from '../NexoClient';

const axios = axiosApi.create({
  // Usar o proxy local configurado no Vite em vez da URL direta
  baseURL: '/api',
});

axios.interceptors.request.use(
  async (config) => {
    if (config.headers) {
      const token = await getSessionToken(nexo);
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    Promise.reject(error);
  },
);

export default axios;
