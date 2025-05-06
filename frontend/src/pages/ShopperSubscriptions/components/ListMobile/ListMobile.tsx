import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Card, Icon, Badge, Text, Box, Spinner } from '@nimbus-ds/components';
import { TrashIcon, EyeIcon } from '@nimbus-ds/icons';
import { ISubscription } from '../../subscriptions.types';
import { STATUS_COLORS, STATUS_LABELS, CYCLE_LABELS, BILLING_TYPE_LABELS } from '../../subscriptions.definitions';

type Props = {
  subscriptions: ISubscription[];
  onCancelSubscription: (subscriptionId: number) => void;
  isLoading?: boolean;
};

const formatCurrency = (value: number): string => {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value || 0);
};

const formatDate = (dateString: string): string => {
  if (!dateString) return '-';
  try {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('pt-BR').format(date);
  } catch (error) {
    return '-';
  }
};

// Função auxiliar para normalizar o ciclo e buscar o label correto
const getCycleLabel = (cycle: string | undefined): string => {
  if (!cycle) return CYCLE_LABELS.unknown;
  
  // Normaliza para caixa alta
  const normalizedCycle = cycle.toUpperCase();
  
  // Verifica se é uma chave válida do objeto CYCLE_LABELS
  if (normalizedCycle in CYCLE_LABELS) {
    return CYCLE_LABELS[normalizedCycle as keyof typeof CYCLE_LABELS];
  }
  
  return CYCLE_LABELS.unknown;
};

// Função auxiliar para normalizar o tipo de pagamento e buscar o label correto
const getBillingTypeLabel = (billingType: string | undefined): string => {
  if (!billingType) return BILLING_TYPE_LABELS.unknown;
  
  // Normaliza para caixa alta
  const normalizedBillingType = billingType.toUpperCase();
  
  // Verifica se é uma chave válida do objeto BILLING_TYPE_LABELS
  if (normalizedBillingType in BILLING_TYPE_LABELS) {
    return BILLING_TYPE_LABELS[normalizedBillingType as keyof typeof BILLING_TYPE_LABELS];
  }
  
  return BILLING_TYPE_LABELS.unknown;
};

const ListMobile: React.FC<Props> = ({ subscriptions, onCancelSubscription, isLoading }) => {
  const { t } = useTranslation('translations');
  const navigate = useNavigate();
  
  const handleViewOrder = (subscriptionId: number) => {
    navigate(`/orders?subscription=${subscriptionId}`);
  };

  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <Box display="flex" justifyContent="center" alignItems="center" padding="4">
            <Spinner size="medium" />
            <Box marginLeft="2">
              <Text>Carregando assinaturas...</Text>
            </Box>
          </Box>
        </Card.Body>
      </Card>
    );
  }

  if (!subscriptions || subscriptions.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Text>{t('subscriptions.no-content')}</Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {subscriptions.map((subscription) => (
        <Card key={subscription.id} style={{marginBottom: "16px"}}>
          <Card.Header>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Text fontWeight="medium">ID: {subscription.id}</Text>
              <Badge 
                count=""
                appearance={STATUS_COLORS[subscription.status || 'unknown'] || 'neutral'}
              >
                {STATUS_LABELS[subscription.status || 'unknown'] || 'Desconhecido'}
              </Badge>
            </Box>
          </Card.Header>
          <Card.Body>
            <Box display="flex" flexDirection="column" gap="2">
              <Box display="flex" justifyContent="space-between">
                <Text>Valor:</Text>
                <Text fontWeight="bold">{formatCurrency(subscription.value)}</Text>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text>Ciclo:</Text>
                <Text>{getCycleLabel(subscription.cycle)}</Text>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text>Data de início:</Text>
                <Text>{formatDate(subscription.start_date)}</Text>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text>Próximo vencimento:</Text>
                <Text>{formatDate(subscription.next_due_date)}</Text>
              </Box>
              <Box display="flex" justifyContent="space-between">
                <Text>Meio de pagamento:</Text>
                <Text>{getBillingTypeLabel(subscription.billing_type)}</Text>
              </Box>
            </Box>
          </Card.Body>
          <Card.Footer>
            <Box display="flex" flexDirection="column" gap="2" width="100%">
              <Button
                appearance="primary"
                onClick={() => handleViewOrder(subscription.id)}
                style={{width: "100%"}}
              >
                <Icon source={<EyeIcon size={16} />} color="currentColor" />
                <Box marginLeft="2">Ver pedidos desta assinatura</Box>
              </Button>
              
              {subscription.status !== 'cancelled' && (
                <Button
                  appearance="danger"
                  onClick={() => onCancelSubscription(subscription.id)}
                  style={{width: "100%"}}
                >
                  <Icon source={<TrashIcon size={16} />} color="currentColor" />
                </Button>
              )}
              {subscription.status === 'cancelled' && (
                <Text color="neutral-textLow" textAlign="center">
                  Assinatura cancelada
                </Text>
              )}
            </Box>
          </Card.Footer>
        </Card>
      ))}
    </>
  );
};

export default ListMobile;