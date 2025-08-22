import React, { useState } from 'react';
import { Box, Text, Modal, Button, Input } from '@nimbus-ds/components';
import { useSellerStatus } from '@/hooks/useSellerStatus';
import { useSellerSubscriptionCard } from '@/hooks';

const SellerStatusChecker: React.FC = () => {
  const { sellerStatus, isLoading } = useSellerStatus();
  const { createSellerSubscription, isSubmitting } = useSellerSubscriptionCard();
  
  const [showModal, setShowModal] = useState<boolean>(false);

  // Campos de cartão
  const [card, setCard] = useState({
    holderName: '',
    number: '',
    expiryMonth: '',
    expiryYear: '',
    ccv: '',
  });
  const [billing, setBilling] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
  phone: '',
  postalCode: '',
  });

  // Mostrar o modal automaticamente quando o status não for 'active'
  const needsAll = !isLoading && (sellerStatus?.status !== 'active');
  React.useEffect(() => {
    if (needsAll) {
      console.log('🔍 Seller não está ativo, pedindo todos os dados (cobrança + cartão).');
      setShowModal(true);
    }
  }, [needsAll]);

  // Prefill automático dos dados do seller quando disponível (sem pedir ID manual)
  React.useEffect(() => {
    if (!sellerStatus) return;
    // Tenta extrair nome/email/cpf de diferentes caminhos
    const data: any = sellerStatus;
    const storeName = data.store_name || data.name || '';
    const storeEmail = data.store_email || data.email || '';
    const cpf = (data.cpfCnpj
      || data.userData?.cpfCnpj
      || data.user?.userData?.cpfCnpj
      || '').toString();

    setBilling((prev) => ({
      ...prev,
      name: prev.name || storeName,
      email: prev.email || storeEmail,
      cpfCnpj: prev.cpfCnpj || cpf,
    }));
  }, [sellerStatus]);

  // Tela única: não há mais envio separado de CPF

  const handleSubmitCard = async () => {
  const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');
    // Montar payload conforme especificação
    const payload = {
      planData: {
        plan_name: 'Plano Pro',
        value: 29.9,
        cycle: 'MONTHLY',
      },
      billingInfo: {
        billingType: 'CREDIT_CARD' as const,
        name: billing.name,
        email: billing.email,
        cpfCnpj: billing.cpfCnpj,
        phone: billing.phone,
        creditCard: {
          holderName: card.holderName,
          number: card.number,
          expiryMonth: card.expiryMonth,
          expiryYear: card.expiryYear,
          ccv: card.ccv,
        },
        // Envia Holder Info recomendado para antifraude
        creditCardHolderInfo: {
          name: billing.name || card.holderName,
          email: billing.email,
          cpfCnpj: billing.cpfCnpj,
          mobilePhone: billing.phone,
          addressNumber: '0',
          postalCode: onlyDigits(billing.postalCode) || undefined,
        },
      },
    };

    const res = await createSellerSubscription(payload);
    if (res.success) {
      // Fecha modal apenas quando assinatura concluída com sucesso
      setShowModal(false);
    }
  };

  // Bloqueia fechar enquanto status não for 'active'
  const canDismiss = !needsAll;

  return (
    <>
      {showModal && (
        <Modal open={showModal} onDismiss={canDismiss ? () => setShowModal(false) : undefined}>
          <Modal.Header>
            <Text fontWeight="bold">Finalizar assinatura do Seller</Text>
          </Modal.Header>
          <Modal.Body>
            <Box display="flex" flexDirection="column" gap="4">
              <Box>
                <Text fontWeight="medium">Status atual:</Text>
                <Box padding="2" backgroundColor="neutral-surface" borderRadius="1">
                  <Text>{sellerStatus?.status || 'Unknown'}</Text>
                </Box>
              </Box>
              {needsAll && (
                <Box display="flex" flexDirection="column" gap="2">
                  <Text fontWeight="medium">Dados de cobrança</Text>
                  <Input placeholder="Nome" value={billing.name} onChange={(e) => setBilling({ ...billing, name: e.target.value })} />
                  <Input placeholder="Email" value={billing.email} onChange={(e) => setBilling({ ...billing, email: e.target.value })} />
                  <Input placeholder="CPF/CNPJ" value={billing.cpfCnpj} onChange={(e) => setBilling({ ...billing, cpfCnpj: e.target.value })} />
                  <Input placeholder="Telefone" value={billing.phone} onChange={(e) => setBilling({ ...billing, phone: e.target.value })} />
                  <Input placeholder="CEP" value={billing.postalCode} onChange={(e) => setBilling({ ...billing, postalCode: e.target.value })} />
                  {/* IP remoto não deve ser coletado no front. O backend deve inferir do request. */}

                  <Text fontWeight="medium">Cartão</Text>
                  <Input placeholder="Titular" value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value })} />
                  <Input placeholder="Número" value={card.number} onChange={(e) => setCard({ ...card, number: e.target.value })} />
                  <Box display="flex" gap="2">
                    <Input placeholder="MM" value={card.expiryMonth} onChange={(e) => setCard({ ...card, expiryMonth: e.target.value })} />
                    <Input placeholder="YYYY" value={card.expiryYear} onChange={(e) => setCard({ ...card, expiryYear: e.target.value })} />
                    <Input placeholder="CVV" value={card.ccv} onChange={(e) => setCard({ ...card, ccv: e.target.value })} />
                  </Box>

                  <Button appearance="primary" onClick={handleSubmitCard} disabled={isSubmitting}>
                    {isSubmitting ? 'Enviando...' : 'Pagar e ativar assinatura'}
                  </Button>
                </Box>
              )}
            </Box>
          </Modal.Body>
          {!canDismiss && (
            <Modal.Footer>
              <Text color="danger-textLow">Finalize para continuar. O fechamento está bloqueado.</Text>
            </Modal.Footer>
          )}
        </Modal>
      )}

      {import.meta.env.DEV && (
        <Box position="fixed" bottom="0" right="0" backgroundColor="neutral-surface" padding="2" borderRadius="1" margin="2">
          <Text fontWeight="bold" fontSize="caption">Debug - Seller Status:</Text>
          <Text fontSize="caption">Status: {sellerStatus?.status || 'Loading...'}</Text>
          <Text fontSize="caption">Needs All: {needsAll ? 'Yes' : 'No'}</Text>
          <Text fontSize="caption">Loading: {isLoading ? 'Yes' : 'No'}</Text>
        </Box>
      )}
    </>
  );
};

export default SellerStatusChecker;
