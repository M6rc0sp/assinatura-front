import React, { useEffect, useState } from 'react';
import { Box, Spinner, Text } from '@nimbus-ds/components';
import { OrdersDataProviderProps, Order } from './orders.types';
import { useFetch } from '@/hooks';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

const OrdersDataProvider: React.FC<OrdersDataProviderProps> = ({ children, subscriptionId }) => {
  const { request } = useFetch();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const sellerId = useSellerId();

  const fetchOrders = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      let url = '';
      
      // Se temos uma assinatura específica, buscamos apenas o pedido dessa assinatura
      if (subscriptionId) {
        url = `/app/subscription/${subscriptionId}/order`;
      } 
      // Caso contrário, buscamos todos os pedidos do vendedor
      else if (sellerId) {
        url = `/app/seller/${sellerId}/orders`;
      } else {
        // Se não temos sellerId mas estamos carregando, não mostra erro
        setIsLoading(false);
        return;
      }
      
      const response = await request({
        url,
        method: 'GET',
      });
      
      if (response.content && typeof response.content === 'object') {
        // Handling both individual order and array of orders
        if ('data' in response.content) {
          const responseData = response.content.data;
          
          // Se é um array, usamos como está
          if (Array.isArray(responseData)) {
            setOrders(responseData as Order[]);
            if (responseData.length === 0) {
              setError('Nenhum pedido encontrado.');
            }
          } 
          // Se é um objeto único (caso de um pedido específico), transformamos em array
          else if (responseData && typeof responseData === 'object') {
            setOrders([responseData as Order]);
          }
          else {
            setOrders([]);
            setError('Nenhum pedido encontrado.');
          }
        } else {
          setOrders([]);
          setError('Resposta da API inesperada.');
        }
      } else {
        setOrders([]);
        setError('Resposta da API inesperada.');
      }
    } catch (error) {
      setOrders([]);
      setError('Erro ao buscar pedidos.');
      console.error('Erro ao buscar pedidos:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Só faz a busca quando tivermos sellerId disponível ou subscriptionId
    if (sellerId || subscriptionId) {
      fetchOrders();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId, subscriptionId]);

  // Renderização de mensagens de erro (não em vermelho)
  if (error && !isLoading) {
    return (
      <Box padding="4" display="flex" justifyContent="center" alignItems="center">
        <Text color="neutral-textHigh">{error}</Text>
      </Box>
    );
  }

  // Tela de carregamento
  if (isLoading && (!sellerId && !subscriptionId)) {
    return (
      <Box padding="4" display="flex" justifyContent="center" alignItems="center">
        <Spinner size="medium" />
        <Box marginLeft="2">
          <Text>Carregando dados...</Text>
        </Box>
      </Box>
    );
  }

  return children({ orders, isLoading, onReload: fetchOrders });
};

export default OrdersDataProvider;
