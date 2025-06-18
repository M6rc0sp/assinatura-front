import axiosApi from 'axios';
import { getSessionToken } from '@tiendanube/nexo';

import nexo from '../NexoClient';

const axios = axiosApi.create({
  // Usar o proxy local configurado no Vite em vez da URL direta
  baseURL: '/api',
});

// Configurar interceptor para adicionar o token de autorização
axios.interceptors.request.use(
  async (config) => {
    // Verificar se estamos fazendo uma chamada para a API de instalação
    if (config.url && config.url.includes('assinaturas.appns.com.br')) {
      // Não modificar headers para chamadas externas de instalação
      return config;
    }
    
    // Para chamadas à API normal, adicionar token de autorização
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
