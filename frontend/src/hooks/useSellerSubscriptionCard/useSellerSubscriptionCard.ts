import { useState } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

export type Cycle = 'MONTHLY' | 'ANNUAL' | string;

export interface PlanData {
  plan_name: string;
  value: number; // > 0
  cycle: Cycle;
}

export interface CreditCard {
  holderName: string;
  number: string; // somente dígitos
  expiryMonth: string; // MM
  expiryYear: string; // YYYY
  ccv: string; // 3-4 dígitos
}

export interface CreditCardHolderInfo {
  name?: string;
  email?: string;
  cpfCnpj?: string;
  mobilePhone?: string;
  addressNumber?: string;
  postalCode?: string;
  city?: string;
  birthDate?: string;
  incomeValue?: number;
}

export interface BillingInfoBase {
  billingType: 'CREDIT_CARD';
  name: string;
  email: string;
  cpfCnpj: string; // 11 ou 14
  phone: string;
  remoteIp?: string;
  creditCardHolderInfo?: CreditCardHolderInfo;
}

export type BillingInfo =
  | (BillingInfoBase & { creditCard: CreditCard; creditCardToken?: never })
  | (BillingInfoBase & { creditCardToken: string; creditCard?: never });

export interface CreateSellerSubscriptionPayload {
  planData: PlanData;
  billingInfo: BillingInfo;
}

export function useSellerSubscriptionCard() {
  const { addToast } = useToast();
  const { request } = useFetch();
  const sellerId = useSellerId();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');

  const validatePayload = (payload: CreateSellerSubscriptionPayload): string | null => {
    const { planData, billingInfo } = payload;
    if (!planData?.plan_name || !planData?.cycle) return 'planData.plan_name e planData.cycle são obrigatórios';
    if (typeof planData.value !== 'number' || planData.value <= 0) return 'planData.value deve ser > 0';

    if (!billingInfo) return 'billingInfo é obrigatório';
    if (billingInfo.billingType !== 'CREDIT_CARD') return 'billingInfo.billingType deve ser CREDIT_CARD';
    if (!billingInfo.name || !billingInfo.email) return 'billingInfo.name e billingInfo.email são obrigatórios';

    const cpf = onlyDigits(billingInfo.cpfCnpj);
    if (!(cpf.length === 11 || cpf.length === 14)) return 'cpfCnpj deve ter 11 (CPF) ou 14 (CNPJ) dígitos';

    // Para pessoa física (CPF), validar data de nascimento
    if (cpf.length === 11 && !billingInfo.creditCardHolderInfo?.birthDate) {
      return 'Data de nascimento é obrigatória para CPF';
    }

    // Validar valor da renda (obrigatório para subconta Asaas)
    if (!billingInfo.creditCardHolderInfo?.incomeValue ||
      typeof billingInfo.creditCardHolderInfo.incomeValue !== 'number' ||
      billingInfo.creditCardHolderInfo.incomeValue <= 0) {
      return 'Valor da renda mensal deve ser maior que zero';
    }

    const phone = onlyDigits(billingInfo.phone);
    if (phone.length < 8) return 'billingInfo.phone inválido'; if ('creditCard' in billingInfo && billingInfo.creditCard) {
      const { number, expiryMonth, expiryYear, ccv } = billingInfo.creditCard;
      if (!onlyDigits(number)) return 'Número do cartão inválido';
      if (!/^\d{2}$/.test(expiryMonth)) return 'expiryMonth deve ser MM';
      if (!/^\d{4}$/.test(expiryYear)) return 'expiryYear deve ser YYYY';
      if (!/^\d{3,4}$/.test(ccv)) return 'ccv inválido';
    } else if (!('creditCardToken' in billingInfo) || !billingInfo.creditCardToken) {
      return 'Envie creditCard ou creditCardToken';
    }

    return null;
  };

  const createSellerSubscription = async (payload: CreateSellerSubscriptionPayload) => {
    if (!sellerId) {
      addToast({ type: 'danger', text: 'SellerId não encontrado', duration: 4000, id: 'no-seller' });
      return { success: false } as const;
    }

    const validationError = validatePayload(payload);
    if (validationError) {
      addToast({ type: 'danger', text: validationError, duration: 8000, id: 'validation-error' });
      return { success: false } as const;
    }

    setIsSubmitting(true);
    try {
      console.log('💳 Criando assinatura do seller via cartão:', { sellerId, payload });
      const response = await request({
        url: `/app/seller-subscriptions/seller/${sellerId}`,
        method: 'POST',
        data: payload,
      });
      console.log('✅ Resposta criar assinatura seller:', response);

      const content: any = response.content;
      if (content?.success) {
        addToast({ type: 'success', text: 'Assinatura criada com sucesso!', duration: 4000, id: 'seller-sub-created' });
        return { success: true, data: content.data } as const;
      }

      addToast({ type: 'danger', text: content?.message || 'Falha ao criar assinatura', duration: 8000, id: 'seller-sub-fail' });
      return { success: false, error: content } as const;
    } catch (error: any) {
      console.error('❌ Erro ao criar assinatura do seller:', error);
      addToast({ type: 'danger', text: error?.message || 'Erro ao criar assinatura', duration: 8000, id: 'seller-sub-ex' });
      return { success: false, error } as const;
    } finally {
      setIsSubmitting(false);
    }
  };

  return { createSellerSubscription, isSubmitting };
}
