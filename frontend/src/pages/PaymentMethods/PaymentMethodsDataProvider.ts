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

  const fetchPaymentMethods = async () => {
    if (!sellerId) return;
    
    setIsLoading(true);
    try {
      const response = await request({
        url: `/app/seller/${sellerId}/payment-methods`,
        method: 'GET',
      });
      
      console.log('API PaymentMethods Response:', response);
      
      // Verificar se a resposta tem a estrutura esperada
      const content = response.content as any;
      if (content && content.data && content.data.payment_methods) {
        const enabledMethods = content.data.payment_methods; // Array de strings: ["credit_card", "pix", "boleto"]
        
        // Mapear para a estrutura IPaymentMethod[]
        const allMethods: IPaymentMethod[] = [
          { method: 'credit_card', enabled: enabledMethods.includes('credit_card') },
          { method: 'pix', enabled: enabledMethods.includes('pix') },
          { method: 'boleto', enabled: enabledMethods.includes('boleto') }
        ];
        
        setPaymentMethods(allMethods);
      } else {
        // Se a API não retornar dados na estrutura esperada, manter os valores padrão
        console.warn("API não retornou dados de métodos de pagamento na estrutura esperada, usando valores padrão");
        setPaymentMethods([
          { method: 'credit_card', enabled: false },
          { method: 'pix', enabled: false },
          { method: 'boleto', enabled: false }
        ]);
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
      if (enabled) {
        // Adicionar método de pagamento
        await request({
          url: `/app/seller/${sellerId}/payment-methods`,
          method: 'POST',
          data: { payment_method: method },
        });
      } else {
        // Remover método de pagamento
        await request({
          url: `/app/seller/${sellerId}/payment-methods`,
          method: 'DELETE',
          data: { payment_method: method },
        });
      }
      
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
      
      // Recarregar dados da API para garantir sincronização
      await fetchPaymentMethods();
      
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
