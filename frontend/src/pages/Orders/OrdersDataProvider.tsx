import React, { useEffect, useState } from 'react';
import { useToast } from '@nimbus-ds/components';
import { OrdersDataProviderProps, Order } from './orders.types';
import { useFetch } from '@/hooks';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

const OrdersDataProvider: React.FC<OrdersDataProviderProps> = ({ children, subscriptionId }) => {
  const { addToast } = useToast();
  const { request } = useFetch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const sellerId = useSellerId();

  // Função para verificar se a resposta é HTML
  const isHtmlResponse = (content: any): boolean => {
    if (typeof content === 'string' && 
       (content.trim().startsWith('<!DOCTYPE') || 
        content.trim().startsWith('<html'))) {
      return true;
    }
    return false;
  };

  const fetchOrders = () => {
    if (!sellerId && !subscriptionId) return;
    
    setIsLoading(true);
    
    let url = '';
    // Se temos uma assinatura específica, buscamos apenas o pedido dessa assinatura
    if (subscriptionId) {
      url = `/app/subscription/${subscriptionId}/order`;
    } 
    // Caso contrário, buscamos todos os pedidos do vendedor
    else if (sellerId) {
      url = `/app/seller/${sellerId}/orders`;
    }

    request({
      url,
      method: 'GET',
    })
      .then((response: any) => {
        // Verificando se a resposta é HTML em vez de JSON
        if (isHtmlResponse(response.content)) {
          console.error('API retornou HTML em vez de JSON:', (response.content as string).substring(0, 100) + '...');
          setOrders([]);
          addToast({
            type: 'danger',
            text: 'Erro de comunicação com o servidor. Verifique se a API está ativa.',
            duration: 4000,
            id: 'error-orders-html',
          });
          return;
        }
        
        // Verificando o formato da resposta e extraindo o array de pedidos
        console.log('API Orders Response:', response);
        
        // Caso a resposta esteja no formato { success: true, data: [...] } ou { data: [...] }
        if (response.content && response.content.data) {
          const responseData = response.content.data;
          
          // Se é um array, usamos como está
          if (Array.isArray(responseData)) {
            setOrders(responseData as Order[]);
          } 
          // Se é um objeto único (caso de um pedido específico), transformamos em array
          else if (responseData && typeof responseData === 'object') {
            setOrders([responseData as Order]);
          }
          else {
            setOrders([]);
            // Sem toast para caso vazio, apenas log
            console.log('Nenhum pedido encontrado para carregar.');
          }
        }
        // Caso a resposta seja diretamente o array 
        else if (Array.isArray(response.content)) {
          setOrders(response.content);
        }
        // Se a resposta não estiver em nenhum formato esperado
        else {
          console.error('Formato de resposta inesperado para orders:', response);
          setOrders([]);
          addToast({
            type: 'danger',
            text: 'Formato de dados inesperado ao carregar pedidos',
            duration: 4000,
            id: 'error-orders-format',
          });
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar pedidos:', error);
        addToast({
          type: 'danger',
          text: error.message?.description ?? error.message ?? 'Erro ao buscar pedidos',
          duration: 4000,
          id: 'error-orders',
        });
        setOrders([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    // Só faz a busca quando tivermos sellerId disponível ou subscriptionId
    if (sellerId || subscriptionId) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, subscriptionId]);

  return children({ orders, isLoading, onReload: fetchOrders });
};

export default OrdersDataProvider;
