import React, { useEffect, useState } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { IShopper, IShoppersDataProvider } from './shoppers.types';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

const ShoppersDataProvider: React.FC<IShoppersDataProvider> = ({
  children,
}) => {
  const { addToast } = useToast();
  const { request } = useFetch();
  const [shoppers, setShoppers] = useState<IShopper[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const sellerId = useSellerId();

  useEffect(() => {
    if (sellerId) loadShoppers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  // Função para verificar se a resposta é HTML
  const isHtmlResponse = (content: any): boolean => {
    if (typeof content === 'string' && 
       (content.trim().startsWith('<!DOCTYPE') || 
        content.trim().startsWith('<html'))) {
      return true;
    }
    return false;
  };

  const processApiResponse = (response: any, entityName: string): any => {
    console.log(`API ${entityName} Response:`, response);

    // Verificando se a resposta é HTML em vez de JSON
    if (isHtmlResponse(response.content)) {
      console.error(`API retornou HTML em vez de JSON para ${entityName}:`, 
                    response.content.substring(0, 100) + '...');
      
      addToast({
        type: 'danger',
        text: `Erro de comunicação com o servidor ao carregar ${entityName.toLowerCase()}. Verifique se a API está ativa.`,
        duration: 4000,
        id: `error-${entityName.toLowerCase()}-html`,
      });
      
      return [];
    }
    
    // Caso a resposta esteja no formato { success: true, data: [...] }
    if (response.content && response.content.data) {
      return response.content.data;
    }
    // Caso a resposta seja diretamente o conteúdo
    else if (response.content) {
      return response.content;
    }
    
    // Se a resposta não estiver em nenhum formato esperado
    console.error(`Formato de resposta inesperado para ${entityName}:`, response);
    addToast({
      type: 'danger',
      text: `Formato de dados inesperado ao carregar ${entityName.toLowerCase()}`,
      duration: 4000,
      id: `error-${entityName.toLowerCase()}-format`,
    });
    
    return [];
  };

  const loadShoppers = async () => {
    if (!sellerId) return;
    
    setIsLoading(true);
    try {
      const response = await request({
        url: `/app/seller/${sellerId}/shoppers`, // Nova rota com seller_id (singular)
        method: 'GET',
      });
      
      const data = processApiResponse(response, 'Shoppers');
      if (Array.isArray(data)) {
        setShoppers(data);
      } else {
        setShoppers([]);
      }
    } catch (error: any) {
      console.error('Erro ao carregar shoppers:', error);
      addToast({
        type: 'danger',
        text: error.message?.description ?? error.message ?? 'Erro ao carregar shoppers',
        duration: 4000,
        id: 'error-shoppers',
      });
      setShoppers([]);
    } finally {
      setIsLoading(false);
    }
  };

  return children({
    shoppers,
    isLoading
  });
};

export default ShoppersDataProvider;