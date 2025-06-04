import React, { useEffect, useState } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { IPaymentMethod, IPaymentMethodsDataProvider } from './payment-methods.types';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

const PaymentMethodsDataProvider: React.FC<IPaymentMethodsDataProvider> = ({
  children,
}) => {
  const { addToast } = useToast();
  const { request } = useFetch();
  const [paymentMethods, setPaymentMethods] = useState<IPaymentMethod[]>([
    { method: 'credit_card', enabled: false },
    { method: 'pix', enabled: false },
    { method: 'boleto', enabled: false }
  ]);
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
      
      return null;
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
    
    return null;
  };

  const fetchPaymentMethods = async () => {
    if (!sellerId) return;
    
    setIsLoading(true);
    try {
      const response = await request({
        url: `/app/seller/${sellerId}/payment-methods`,
        method: 'GET',
      });
      
      const data = processApiResponse(response, 'PaymentMethods');
      
      // Se a API retornar os métodos de pagamento, usamos eles
      // Caso contrário, mantemos os valores padrão
      if (Array.isArray(data)) {
        setPaymentMethods(data);
      } else {
        // Se a API não retornar dados, manter os valores padrão
        console.warn("API não retornou dados de métodos de pagamento, usando valores padrão");
      }
    } catch (error: any) {
      console.error('Erro ao carregar métodos de pagamento:', error);
      addToast({
        type: 'danger',
        text: error.message?.description ?? error.message ?? 'Erro ao carregar métodos de pagamento',
        duration: 4000,
        id: 'error-payment-methods',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const onTogglePaymentMethod = async (method: string, enabled: boolean) => {
    if (!sellerId) return;
    
    setIsLoading(true);
    try {
      await request({
        url: `/app/seller/${sellerId}/payment-methods/${method}`,
        method: 'PUT',
        data: { enabled },
      });
      
      // Atualiza o estado localmente
      setPaymentMethods(prevMethods => 
        prevMethods.map(pm => 
          pm.method === method ? { ...pm, enabled } : pm
        )
      );
      
      addToast({
        type: 'success',
        text: `Método de pagamento ${enabled ? 'ativado' : 'desativado'} com sucesso!`,
        duration: 4000,
        id: `update-payment-method-${method}`,
      });
      
      return Promise.resolve();
    } catch (error: any) {
      console.error('Erro ao atualizar método de pagamento:', error);
      addToast({
        type: 'danger',
        text: error.message?.description ?? error.message ?? 'Erro ao atualizar método de pagamento',
        duration: 4000,
        id: 'error-update-payment-method',
      });
      
      return Promise.reject(error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (sellerId) fetchPaymentMethods();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  return children({ paymentMethods, isLoading, onTogglePaymentMethod });
};

export default PaymentMethodsDataProvider;
