import React, { useState, useEffect } from 'react';
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
    expiry: '', // formato MM/AA
    ccv: '',
  });
  const [cardErrors, setCardErrors] = useState<{ number?: string; expiry?: string; ccv?: string; holderName?: string }>({});
  // Helpers: apenas dígitos
  const onlyDigits = (v: string) => (v || '').replace(/\D/g, '');

  // Formatadores / máscaras
  const formatCardNumber = (value: string) => {
    const digits = onlyDigits(value).slice(0, 16); // limitar a 16
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };

  const formatExpiry = (value: string) => {
    const digits = onlyDigits(value).slice(0, 4); // MMAA
    if (digits.length <= 2) return digits;
    return digits.slice(0, 2) + '/' + digits.slice(2);
  };

  const formatCpfCnpj = (value: string) => {
    const digits = onlyDigits(value);
    if (digits.length <= 11) {
      // CPF: 000.000.000-00
      return digits
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    }
    // CNPJ: 00.000.000/0000-00
    return digits
      .replace(/(\d{2})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1.$2')
      .replace(/(\d{3})(\d)/, '$1/$2')
      .replace(/(\d{4})(\d{1,2})$/, '$1-$2');
  };

  // Util Luhn para validar número do cartão
  const luhnCheck = (num: string) => {
    if (!num) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = num.length - 1; i >= 0; i--) {
      let digit = parseInt(num.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };
  const [isCardValid, setIsCardValid] = useState(false);
  const [cardTouched, setCardTouched] = useState<{ number?: boolean; expiry?: boolean; ccv?: boolean; holderName?: boolean }>({});
  const [billing, setBilling] = useState({
    name: '',
    email: '',
    cpfCnpj: '',
    phone: '',
    postalCode: '',
    city: '',
    birthDate: '',
    incomeValue: '',
  });

  // Formatadores adicionais
  const formatPhone = (value: string) => {
    const d = onlyDigits(value).slice(0, 11);
    if (d.length === 0) return '';
    if (d.length <= 2) return `(${d}`;
    if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
    if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
    return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  };

  const formatPostalCode = (value: string) => {
    const d = onlyDigits(value).slice(0, 8);
    if (d.length <= 5) return d;
    return `${d.slice(0, 5)}-${d.slice(5)}`;
  };

  // Formatador para data de nascimento (DD/MM/AAAA)
  const formatBirthDate = (value: string) => {
    const digits = onlyDigits(value).slice(0, 8); // DDMMAAAA
    if (digits.length <= 2) return digits; // Apenas dia
    if (digits.length <= 4) return `${digits.slice(0, 2)}/${digits.slice(2)}`; // Dia e mês
    return `${digits.slice(0, 2)}/${digits.slice(2, 4)}/${digits.slice(4)}`; // Data completa
  };

  // Formatador para valores monetários
  const formatCurrency = (value: string) => {
    // Remove qualquer caractere que não seja dígito
    const digits = onlyDigits(value);

    // Se não houver dígitos, retorna string vazia
    if (digits.length === 0) return '';

    // Converte para número (inteiro em centavos)
    const cents = parseInt(digits, 10);

    // Formata para reais (R$)
    return (cents / 100).toLocaleString('pt-BR', { minimumFractionDigits: 2 });
  };

  // Converte data de formato DD/MM/AAAA para AAAA-MM-DD (ISO)
  const formatDateToISO = (dateStr: string) => {
    if (!dateStr || !/^\d{2}\/\d{2}\/\d{4}$/.test(dateStr)) return undefined;

    const parts = dateStr.split('/');
    const day = parts[0];
    const month = parts[1];
    const year = parts[2];

    return `${year}-${month}-${day}`;
  };

  // Mostrar o modal automaticamente apenas quando o status começar com 'pending'
  const isPendingStatus = (s?: string) => !!s && /^pending/.test(s);
  const needsAll = !isLoading && isPendingStatus(sellerStatus?.status);
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

    // Obter data de nascimento caso exista
    let birthDate = '';
    if (data.userData?.birthDate) {
      // Converter para formato DD/MM/AAAA se estiver em outro formato
      const dateObj = new Date(data.userData.birthDate);
      if (!isNaN(dateObj.getTime())) {
        const day = String(dateObj.getDate()).padStart(2, '0');
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const year = dateObj.getFullYear();
        birthDate = `${day}/${month}/${year}`;
      }
    }

    // Obter valor de renda caso exista
    const incomeValue = data.userData?.income_value || data.incomeValue || '';

    setBilling((prev) => ({
      ...prev,
      name: prev.name || storeName,
      email: prev.email || storeEmail,
      cpfCnpj: prev.cpfCnpj || cpf,
      birthDate: prev.birthDate || birthDate,
      incomeValue: prev.incomeValue || (incomeValue ? formatCurrency(incomeValue.toString()) : ''),
    }));
  }, [sellerStatus]);

  // Validação dos dados de cobrança (incluindo novos campos)
  const [billingErrors, setBillingErrors] = useState<{
    cpfCnpj?: string;
    city?: string;
    birthDate?: string;
    incomeValue?: string;
  }>({});

  useEffect(() => {
    const errors: {
      cpfCnpj?: string;
      city?: string;
      birthDate?: string;
      incomeValue?: string;
    } = {};

    // Validar CPF/CNPJ
    const cpfDigits = onlyDigits(billing.cpfCnpj);
    if (cpfDigits && cpfDigits.length !== 11 && cpfDigits.length !== 14) {
      errors.cpfCnpj = 'CPF/CNPJ inválido';
    }

    // Validar cidade (obrigatória)
    if (!billing.city || billing.city.trim().length < 2) {
      errors.city = 'Cidade é obrigatória';
    }

    // Validar data de nascimento (obrigatória para CPF)
    if (cpfDigits && cpfDigits.length === 11) {
      if (!billing.birthDate || !/^\d{2}\/\d{2}\/\d{4}$/.test(billing.birthDate)) {
        errors.birthDate = 'Data de nascimento obrigatória para CPF';
      }
    }

    // Validar valor de renda (obrigatório)
    if (!billing.incomeValue) {
      errors.incomeValue = 'Renda mensal é obrigatória';
    } else {
      // Remover formatação e verificar se é um valor numérico positivo
      const valueNumber = parseFloat(billing.incomeValue.replace(/\D/g, '')) / 100;
      if (isNaN(valueNumber) || valueNumber <= 0) {
        errors.incomeValue = 'Valor deve ser maior que zero';
      }
    }

    setBillingErrors(errors);
  }, [billing]);

  // Tela única: não há mais envio separado de CPF
  // Validação reativa dos campos do cartão
  useEffect(() => {
    const errors: any = {};
    const numberDigits = onlyDigits(card.number);
    // número: só mostra obrigatório se o usuário já tocou no campo ou se já digitou algo
    if (!numberDigits) {
      if (cardTouched.number) errors.number = 'Número do cartão obrigatório';
    } else if (numberDigits.length !== 16) errors.number = 'Número deve ter 16 dígitos';
    else if (!luhnCheck(numberDigits)) errors.number = 'Número inválido';

    // Expiry (formato MM/AA) — validação só após interação ou se houver valor
    const expRaw = card.expiry || '';
    const exp = expRaw.replace(/\s/g, '');
    if (expRaw || cardTouched.expiry) {
      if (!/^\d{2}\/\d{2}$/.test(exp)) {
        errors.expiry = 'Validade inválida (MM/AA)';
      } else {
        const mm = parseInt(exp.slice(0, 2), 10);
        const yy = parseInt(exp.slice(3), 10);
        if (isNaN(mm) || mm < 1 || mm > 12) errors.expiry = 'Mês inválido';
        else {
          const fullYear = 2000 + yy;
          const now = new Date();
          const expDate = new Date(fullYear, mm - 1, 1);
          expDate.setMonth(expDate.getMonth() + 1);
          if (expDate <= now) errors.expiry = 'Cartão vencido';
        }
      }
    }

    // CVV — só valida após interação
    if (cardTouched.ccv || card.ccv) {
      if (!/^[0-9]{3,4}$/.test(card.ccv)) errors.ccv = 'CVV deve ter 3 ou 4 dígitos (4 recomendado)';
    }

    if (cardTouched.holderName || card.holderName) {
      if (!card.holderName || card.holderName.trim().length < 2) errors.holderName = 'Nome do titular inválido';
    }

    setCardErrors(errors);
    setIsCardValid(Object.keys(errors).length === 0 && !!onlyDigits(card.number));
  }, [card, cardTouched]);

  const handleSubmitCard = async () => {
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
        cpfCnpj: onlyDigits(billing.cpfCnpj),
        phone: billing.phone,
        creditCard: {
          holderName: card.holderName,
          number: onlyDigits(card.number),
          expiryMonth: (() => {
            const exp = card.expiry || '';
            if (!/\d{2}\/\d{2}/.test(exp)) return '';
            return exp.slice(0, 2);
          })(),
          expiryYear: (() => {
            const exp = card.expiry || '';
            if (!/\d{2}\/\d{2}/.test(exp)) return '';
            const yy = parseInt(exp.slice(3), 10);
            if (Number.isNaN(yy)) return '';
            return String(2000 + yy);
          })(),
          ccv: onlyDigits(card.ccv),
        },
        // Envia Holder Info recomendado para antifraude
        creditCardHolderInfo: {
          name: billing.name || card.holderName,
          email: billing.email,
          cpfCnpj: onlyDigits(billing.cpfCnpj),
          mobilePhone: billing.phone,
          addressNumber: '0',
          postalCode: onlyDigits(billing.postalCode) || undefined,
          city: billing.city || undefined,
          birthDate: billing.birthDate ? formatDateToISO(billing.birthDate) : undefined, // Converte DD/MM/AAAA para ISO (AAAA-MM-DD)
          incomeValue: billing.incomeValue ? parseFloat(billing.incomeValue.replace(/\D/g, '')) / 100 : undefined, // Converte string R$ para número
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
          <Modal.Body style={{ maxHeight: '70vh', overflowY: 'auto' }}>
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
                  <Input
                    placeholder="CPF/CNPJ"
                    value={billing.cpfCnpj}
                    onChange={(e) => setBilling({ ...billing, cpfCnpj: formatCpfCnpj(e.target.value) })}
                  />
                  {billingErrors.cpfCnpj && <Text color="danger-textHigh" fontSize="caption">{billingErrors.cpfCnpj}</Text>}
                  <Input
                    placeholder="Telefone"
                    value={billing.phone}
                    onChange={(e) => setBilling({ ...billing, phone: formatPhone(e.target.value) })}
                  />
                  <Input
                    placeholder="CEP"
                    value={billing.postalCode}
                    onChange={(e) => setBilling({ ...billing, postalCode: formatPostalCode(e.target.value) })}
                  />
                  <Input
                    placeholder="Cidade"
                    value={billing.city}
                    onChange={(e) => setBilling({ ...billing, city: e.target.value })}
                  />
                  {billingErrors.city && <Text color="danger-textHigh" fontSize="caption">{billingErrors.city}</Text>}
                  <Input
                    placeholder="Data de Nascimento (DD/MM/AAAA) - Obrigatório para CPF"
                    value={billing.birthDate || ''}
                    onChange={(e) => setBilling({ ...billing, birthDate: formatBirthDate(e.target.value) })}
                  />
                  {billingErrors.birthDate && <Text color="danger-textHigh" fontSize="caption">{billingErrors.birthDate}</Text>}
                  <Input
                    placeholder="Renda Mensal (R$) - Obrigatório"
                    value={billing.incomeValue || ''}
                    onChange={(e) => setBilling({ ...billing, incomeValue: formatCurrency(e.target.value) })}
                  />
                  {billingErrors.incomeValue && <Text color="danger-textHigh" fontSize="caption">{billingErrors.incomeValue}</Text>}
                  {/* IP remoto não deve ser coletado no front. O backend deve inferir do request. */}

                  <Text fontWeight="medium">Cartão</Text>
                  <Input placeholder="Titular" value={card.holderName} onChange={(e) => setCard({ ...card, holderName: e.target.value })} />
                  {cardErrors.holderName && <Text color="danger-textHigh" fontSize="caption">{cardErrors.holderName}</Text>}
                  <Input
                    placeholder="Número"
                    value={card.number}
                    onChange={(e) => setCard({ ...card, number: formatCardNumber(e.target.value) })}
                    onBlur={() => setCardTouched({ ...cardTouched, number: true })}
                  />
                  {cardErrors.number && <Text color="danger-textHigh" fontSize="caption">{cardErrors.number}</Text>}
                  <Box display="flex" gap="2">
                    <Input
                      placeholder="MM/AA"
                      value={card.expiry}
                      onChange={(e) => setCard({ ...card, expiry: formatExpiry(e.target.value) })}
                      onBlur={() => setCardTouched({ ...cardTouched, expiry: true })}
                    />
                    <Input
                      placeholder="CVV"
                      value={card.ccv}
                      onChange={(e) => setCard({ ...card, ccv: onlyDigits(e.target.value).slice(0, 4) })}
                      onBlur={() => setCardTouched({ ...cardTouched, ccv: true })}
                    />
                  </Box>
                  {cardErrors.expiry && <Text color="danger-textHigh" fontSize="caption">{cardErrors.expiry}</Text>}
                  {cardErrors.ccv && <Text color="danger-textHigh" fontSize="caption">{cardErrors.ccv}</Text>}

                  <Button
                    appearance="primary"
                    onClick={handleSubmitCard}
                    disabled={isSubmitting || !isCardValid || Object.keys(billingErrors).length > 0}
                  >
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
