import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { ISubscription, ISubscriptionsDataProvider } from './subscriptions.types';

const SubscriptionsDataProvider: React.FC<ISubscriptionsDataProvider> = ({
  children,
}) => {
  const { shopperId } = useParams();
  const { addToast } = useToast();
  const { request } = useFetch();
  const [subscriptions, setSubscriptions] = useState<ISubscription[]>([]);
  const [shopper, setShopper] = useState<{ id: number; name: string; email: string } | undefined>(undefined);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    loadData();
  }, []);

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
      
      return Array.isArray(response) ? [] : null;
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
    
    return Array.isArray(response) ? [] : null;
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      // Se temos um ID de shopper na URL, buscamos as assinaturas desse shopper específico
      if (shopperId) {
        const [shopperResponse, subscriptionsResponse] = await Promise.all([
          request({
            url: `/app/shoppers/${shopperId}`, 
            method: 'GET',
          }),
          request({
            url: `/app/shopper-subscriptions/shopper/${shopperId}`, // URL corrigida para usar o formato da API
            method: 'GET',
          }),
        ]);
        
        const shopperData = processApiResponse(shopperResponse, 'Shopper');
        const subscriptionsData = processApiResponse(subscriptionsResponse, 'Subscriptions');
        
        if (shopperData) {
          setShopper(shopperData);
        }
        
        if (Array.isArray(subscriptionsData)) {
          setSubscriptions(subscriptionsData);
        } else {
          setSubscriptions([]);
        }
      } else {
        // Caso contrário, buscamos todas as assinaturas
        const response = await request({
          url: `/app/shopper-subscriptions`, // Corrigido: adicionado o prefixo /app/ e nome da rota correto
          method: 'GET',
        });
        
        const subscriptionsData = processApiResponse(response, 'Subscriptions');
        if (Array.isArray(subscriptionsData)) {
          setSubscriptions(subscriptionsData);
        } else {
          setSubscriptions([]);
        }
      }
    } catch (error: any) {
      console.error('Erro ao carregar dados de assinaturas:', error);
      addToast({
        type: 'danger',
        text: error.message?.description ?? error.message ?? 'Erro ao carregar assinaturas',
        duration: 4000,
        id: 'error-subscriptions',
      });
      setSubscriptions([]);
    } finally {
      setIsLoading(false);
    }
  };

  const onCancelSubscription = (subscriptionId: number) => {
    request({
      url: `/app/shopper-subscriptions/${subscriptionId}`, // Usando a rota padrão de exclusão
      method: 'DELETE', // Método correto para cancelar assinatura conforme a API
    })
      .then((response) => {
        // Verificar se a resposta é HTML
        if (isHtmlResponse(response.content)) {
          console.error('API retornou HTML em vez de JSON ao cancelar assinatura:', 
                        (response.content as string).substring(0, 100) + '...');
          addToast({
            type: 'danger',
            text: 'Erro de comunicação com o servidor ao cancelar assinatura.',
            duration: 4000,
            id: 'error-cancel-subscription-html',
          });
          return;
        }
        
        loadData();
        addToast({
          type: 'success',
          text: 'Assinatura cancelada com sucesso',
          duration: 4000,
          id: 'cancel-subscription',
        });
      })
      .catch((error) => {
        console.error('Erro ao cancelar assinatura:', error);
        // Tratamento específico para erro 404
        if (error.statusCode === 404) {
          addToast({
            type: 'danger',
            text: 'Assinatura não encontrada ou não pertence à sua loja',
            duration: 4000,
            id: 'error-cancel-subscription-404',
          });
        } else {
          addToast({
            type: 'danger',
            text: error.message?.description ?? error.message ?? 'Erro ao cancelar assinatura',
            duration: 4000,
            id: 'error-cancel-subscription',
          });
        }
      });
  };

  return children({ 
    subscriptions, 
    shopper, 
    isLoading, 
    onCancelSubscription 
  });
};

export default SubscriptionsDataProvider;