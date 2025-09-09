import { useState, useEffect } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

export interface SellerStatus {
  needsDocuments: boolean;
  status: string;
  message?: string;
  seller_id?: string | number | null;
  has_active_subscription?: boolean;
  store_name?: string | null;
  store_email?: string | null;
  subscription_status?: string | null;
  subscription_id?: string | number | null;
  subscription_external_id?: string | null;
  cpfCnpj?: string | null;
  userData?: {
    cpfCnpj?: string | null;
    mobilePhone?: string | null;
    address?: string | null;
    addressNumber?: string | null;
    province?: string | null;
    postalCode?: string | null;
    birthDate?: string | null;
  } | null;
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
        url: `/app/documents/${sellerId}/status`,
        method: 'GET',
      });

      console.log('📋 Resposta do status do seller:', response);

      // Estrutura esperada da resposta
      const content = response.content as any;
      // Debug: mostrar todos os campos recebidos
      console.log('🟡 Conteúdo recebido:', content);

      // Ajuste para novo formato da API - dados estão em content.data
      const data = content?.data;

      if (data && typeof data === 'object') {
        // Campos do contrato
        const appStatusFromAPI = (data as any).app_status;
        const cpfTop: string | null = (data as any)?.cpfCnpj ?? null;
        const cpfFromUserData: string | null = (data as any)?.userData?.cpfCnpj ?? null;
        const cpfFromNestedUser: string | null = (data as any)?.user?.userData?.cpfCnpj ?? null;
        // Detectar CPF em possíveis caminhos
        const cpfFromData: string = (cpfTop || cpfFromUserData || cpfFromNestedUser || '') as string;

        // needsDocuments: preferir o valor da API, com fallback pela ausência de CPF
        const needsDocumentsFromAPI = typeof (data as any).needsDocuments === 'boolean' ? (data as any).needsDocuments : undefined;
        const computedNeedsDocuments = needsDocumentsFromAPI ?? (!cpfFromData || String(cpfFromData).replace(/\D/g, '').length === 0);

        // Helper de pendência
        const subscriptionStatus = (data as any)?.subscription_status as string | undefined;
        // Determinar app_status com tolerância quando não vier do backend
        let appStatus: string = typeof appStatusFromAPI === 'string' ? appStatusFromAPI : '';
        if (!appStatus) {
          const subStatusNorm = (subscriptionStatus || '').toString().toLowerCase();
          if (subStatusNorm === 'active') {
            appStatus = 'active';
          } else {
            appStatus = computedNeedsDocuments ? 'pending_documents' : 'pending';
          }
        }
        const isPending = !!appStatus && /^pending/.test(appStatus);

        // Montar estado interno consolidado
        const nextStatus = {
          status: appStatus,
          message: (data as any).message || '',
          needsDocuments: computedNeedsDocuments,
          seller_id: (data as any).seller_id ?? null,
          has_active_subscription: !!(data as any).has_active_subscription,
          store_name: (data as any).store_name ?? null,
          store_email: (data as any).store_email ?? null,
          subscription_status: (data as any).subscription_status ?? null,
          subscription_id: (data as any).subscription_id ?? null,
          subscription_external_id: (data as any).subscription_external_id ?? null,
          cpfCnpj: cpfTop,
          userData: (data as any).userData ?? null,
          ...data,
        } as SellerStatus & Record<string, any>;

        setSellerStatus(nextStatus);

        // Debug detalhado
        console.log('✅ Status do seller carregado:', appStatus);
        console.log('ℹ️ needsDocuments (API):', (data as any).needsDocuments, '→ (computado por CPF ausente):', computedNeedsDocuments, 'cpf detectado:', cpfFromData ? 'sim' : 'não');

        // Alerta somente quando o status estiver pendente (não alertamos sobre CPF aqui
        // porque o modal já solicita esses dados ao usuário)
        if (isPending) {
          console.log('⚠️ Seller pendente:', { app_status: appStatus, computedNeedsDocuments });
          addToast({
            type: 'danger',
            text: `Status do seller: ${appStatus}. Finalize a assinatura.`,
            duration: 8000,
            id: 'seller-status-warning',
          });
        } else {
          console.log('✅ Seller ativo ou sem pendências relevantes');
        }
      } else {
        console.error('❌ Resposta de status inválida (sem content.data):', response);
        setError('Formato de resposta inválido');
        addToast({
          type: 'danger',
          text: 'Erro ao verificar status do seller: resposta sem dados',
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
        url: `/app/documents/${sellerId}/complete`,
        method: 'POST',
        data,
      });

      console.log('✅ Resposta de completar documentos:', response);

      addToast({
        type: 'success',
        text: 'Documentos do seller completados com sucesso!'
        ,
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

  // Helpers
  const isPending = !!(sellerStatus?.status) && /^pending/.test(sellerStatus.status);
  // Mostrar cartão quando NÃO precisa de documentos (já tem CPF) e status pendente
  const needsCard = !!(sellerStatus && sellerStatus.needsDocuments === false && isPending);

  return {
    sellerStatus,
    isLoading,
    error,
    checkSellerStatus,
    completeSellerDocuments,
    // Agora reflete apenas ausência de CPF (independente do app_status)
    needsDocuments: !!(sellerStatus && sellerStatus.needsDocuments === true),
    needsCard,
    isPending,
  };
}
