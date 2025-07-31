import { useState, useEffect } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

export interface SellerStatus {
  status: string;
  message?: string;
  // Adicione outros campos conforme necessário
}

export interface SellerDocumentsData {
  cpfCnpj: string;
}

export function useSellerStatus() {
  const [sellerStatus, setSellerStatus] = useState<SellerStatus | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const { addToast } = useToast();
  const { request } = useFetch();
  const sellerId = useSellerId();

  // Função para verificar o status do seller
  const checkSellerStatus = async () => {
    if (!sellerId) return;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('🔍 Verificando status do seller:', sellerId);
      
      const response = await request({
        url: `/app/seller/documents/${sellerId}/status`,
        method: 'GET',
      });
      
      console.log('📋 Resposta do status do seller:', response);
      
      // Estrutura esperada da resposta
      const content = response.content as any;
      
      if (content && content.status) {
        setSellerStatus(content);
        
        // Debug log
        console.log('✅ Status do seller carregado:', content.status);
        
        // Se o status não for 'active', mostrar alerta
        if (content.status !== 'active') {
          console.log('⚠️ Status do seller não é "active":', content.status);
          addToast({
            type: 'danger',
            text: `Status do seller: ${content.status}. Pode ser necessário completar documentos.`,
            duration: 8000,
            id: 'seller-status-warning',
          });
        } else {
          console.log('✅ Status do seller está ativo');
        }
      } else {
        console.error('❌ Resposta de status inválida:', response);
        setError('Formato de resposta inválido');
        addToast({
          type: 'danger',
          text: 'Erro ao verificar status do seller: formato de resposta inválido',
          duration: 4000,
          id: 'error-seller-status-format',
        });
      }
    } catch (error: any) {
      console.error('❌ Erro ao verificar status do seller:', error);
      setError(error.message || 'Erro desconhecido');
      addToast({
        type: 'danger',
        text: error.message?.description ?? error.message ?? 'Erro ao verificar status do seller',
        duration: 4000,
        id: 'error-seller-status',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Função para completar documentos do seller
  const completeSellerDocuments = async (data: SellerDocumentsData) => {
    if (!sellerId) return false;
    
    setIsLoading(true);
    setError(null);
    
    try {
      console.log('📝 Completando documentos do seller:', sellerId, data);
      
      const response = await request({
        url: `/seller/documents/${sellerId}/complete`,
        method: 'POST',
        data,
      });
      
      console.log('✅ Resposta de completar documentos:', response);
      
      addToast({
        type: 'success',
        text: 'Documentos do seller completados com sucesso!',
        duration: 4000,
        id: 'seller-documents-completed',
      });
      
      // Recarregar o status após completar
      await checkSellerStatus();
      
      return true;
    } catch (error: any) {
      console.error('❌ Erro ao completar documentos do seller:', error);
      setError(error.message || 'Erro desconhecido');
      addToast({
        type: 'danger',
        text: error.message?.description ?? error.message ?? 'Erro ao completar documentos do seller',
        duration: 4000,
        id: 'error-seller-documents',
      });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Verificar status automaticamente quando sellerId estiver disponível
  useEffect(() => {
    if (sellerId) {
      checkSellerStatus();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  return {
    sellerStatus,
    isLoading,
    error,
    checkSellerStatus,
    completeSellerDocuments,
    needsDocuments: sellerStatus ? sellerStatus.status !== 'active' : false,
  };
}
