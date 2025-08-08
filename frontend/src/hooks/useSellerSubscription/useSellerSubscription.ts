import { useState } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

// Tipos do payload conforme especificação
export type Cycle = 'MONTHLY' | 'ANNUAL' | string;

export interface PlanData {
  plan_name: string;
  value: number; // > 0
  cycle: Cycle;
}

export interface CreditCard {
  holderName: string;
  number: string;
  expiryMonth: string; // 'MM'
  expiryYear: string;  // 'YYYY'
  ccv: string;
}

export interface CreditCardHolderInfo {
  name: string;
  email: string;
  cpfCnpj: string; // 11 ou 14 dígitos
  mobilePhone: string;
  addressNumber: string;
  province: string; // UF
  postalCode: string; // 8 dígitos
}

export interface BillingInfoBase {
  billingType: 'CREDIT_CARD';
  name: string;
  email: string;
  cpfCnpj: string; // 11 ou 14 dígitos
  phone: string;
  remoteIp?: string;
  creditCardHolderInfo?: CreditCardHolderInfo;
}

export type BillingInfo =
  | (BillingInfoBase & { creditCard: CreditCard; creditCardToken?: never })
  | (BillingInfoBase & { creditCard?: never; creditCardToken: string });

export interface SellerSubscriptionPayload {
  planData: PlanData;
  billingInfo: BillingInfo;
}

export function useSellerSubscription() {
  const { addToast } = useToast();
  const { request } = useFetch();
  const sellerId = useSellerId();
  const [isLoading, setIsLoading] = useState(false);

  const validateCpfCnpj = (doc: string) => /^\d{11}$|^\d{14}$/.test(doc);
  const validateValue = (v: number) => typeof v === 'number' && v > 0;
  const validateExpiry = (m?: string, y?: string) => {
    if (!m || !y) return true; // quando usar token
    return /^\d{2}$/.test(m) && /^\d{4}$/.test(y);
  };

  const createSellerSubscription = async (payload: SellerSubscriptionPayload) => {
    if (!sellerId) {
      addToast({ type: 'danger', text: 'SellerId indisponível', duration: 4000, id: 'no-seller-id' });
      return false;
    }

    // Debug inicial
    console.log('🧾 Criando assinatura do seller (cartão):', { sellerId, payload });

    // Validações mínimas
    if (!payload?.planData?.plan_name || !validateValue(payload.planData.value)) {
      addToast({ type: 'danger', text: 'Plano inválido (nome/valor)', duration: 4000, id: 'plan-invalid' });
      return false;
    }

    const b = payload.billingInfo;
    if (b.billingType !== 'CREDIT_CARD') {
      addToast({ type: 'danger', text: 'billingType deve ser CREDIT_CARD', duration: 4000, id: 'billing-type' });
      return false;
    }
    if (!b.name || !b.email || !validateCpfCnpj(b.cpfCnpj) || !b.phone) {
      addToast({ type: 'danger', text: 'Dados de cobrança inválidos', duration: 4000, id: 'billing-invalid' });
      return false;
    }
    if ('creditCard' in b) {
      const cc = b.creditCard;
      if (!cc || !cc.holderName || !cc.number || !validateExpiry(cc.expiryMonth, cc.expiryYear) || !cc.ccv) {
        addToast({ type: 'danger', text: 'Cartão inválido', duration: 4000, id: 'cc-invalid' });
        return false;
      }
    } else if (!('creditCardToken' in b) || !b.creditCardToken) {
      addToast({ type: 'danger', text: 'Informe cartão ou token', duration: 4000, id: 'cc-or-token' });
      return false;
    }

    setIsLoading(true);
    try {
      const response = await request({
        url: `/app/seller-subscriptions/seller/${sellerId}`,
        method: 'POST',
        data: payload,
      });

      console.log('✅ Assinatura do seller criada (API):', response);
      const content: any = response?.content;
      const ok = content?.success !== false; // considerar sucesso padrão

      if (ok) {
        addToast({ type: 'success', text: 'Assinatura criada com sucesso!', duration: 4000, id: 'seller-sub-created' });
        return content;
      } else {
        const message = content?.message || 'Falha ao criar assinatura';
        addToast({ type: 'danger', text: message, duration: 8000, id: 'seller-sub-fail' });
        return false;
      }
    } catch (error: any) {
      console.error('❌ Erro ao criar assinatura do seller:', error);
      addToast({ type: 'danger', text: error?.message ?? 'Erro ao criar assinatura', duration: 8000, id: 'seller-sub-error' });
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  return { createSellerSubscription, isLoading };
}
