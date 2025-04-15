import React, { useEffect, useState } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { IShopper, IShoppersDataProvider } from './shoppers.types';

const ShoppersDataProvider: React.FC<IShoppersDataProvider> = ({
  children,
}) => {
  const { addToast } = useToast();
  const { request } = useFetch();
  const [shoppers, setShoppers] = useState<IShopper[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => onGetShoppers(), []);

  // Função para verificar se a resposta é HTML
  const isHtmlResponse = (content: any): boolean => {
    if (typeof content === 'string' && 
       (content.trim().startsWith('<!DOCTYPE') || 
        content.trim().startsWith('<html'))) {
      return true;
    }
    return false;
  };

  const onGetShoppers = () => {
    setIsLoading(true);
    request({
      url: `/app/shoppers`, // Corrigido: adicionado o prefixo /app/
      method: 'GET',
    })
      .then((response) => {
        // Verificando se a resposta é HTML em vez de JSON
        if (isHtmlResponse(response.content)) {
          console.error('API retornou HTML em vez de JSON:', response.content.substring(0, 100) + '...');
          setShoppers([]);
          addToast({
            type: 'danger',
            text: 'Erro de comunicação com o servidor. Verifique se a API está ativa.',
            duration: 4000,
            id: 'error-shoppers-html',
          });
          return;
        }
        
        console.log('API Shoppers Response:', response);
        
        // Caso a resposta esteja no formato { success: true, data: [...] }
        if (response.content && response.content.data && Array.isArray(response.content.data)) {
          setShoppers(response.content.data);
        }
        // Caso a resposta seja diretamente o array 
        else if (Array.isArray(response.content)) {
          setShoppers(response.content);
        }
        // Se a resposta não estiver em nenhum formato esperado
        else {
          console.error('Formato de resposta inesperado:', response);
          setShoppers([]);
          addToast({
            type: 'warning',
            text: 'Formato de dados inesperado ao carregar clientes',
            duration: 4000,
            id: 'error-shoppers-format',
          });
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar clientes:', error);
        addToast({
          type: 'danger',
          text: error.message?.description ?? error.message ?? 'Erro ao buscar clientes',
          duration: 4000,
          id: 'error-shoppers',
        });
        setShoppers([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  const onDeleteShopper = (shopperId: number) => {
    request({
      url: `/app/shoppers/${shopperId}`, // Corrigido: adicionado o prefixo /app/
      method: 'DELETE',
    })
      .then(() => {
        onGetShoppers();
        addToast({
          type: 'success',
          text: 'Cliente removido com sucesso',
          duration: 4000,
          id: 'delete-shopper',
        });
      })
      .catch((error) => {
        addToast({
          type: 'danger',
          text: error.message?.description ?? error.message ?? 'Erro ao remover cliente',
          duration: 4000,
          id: 'error-delete-shopper',
        });
      });
  };

  return children({ shoppers, onDeleteShopper, isLoading });
};

export default ShoppersDataProvider;