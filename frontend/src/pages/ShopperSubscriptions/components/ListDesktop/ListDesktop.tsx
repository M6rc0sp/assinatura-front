import React from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { Button, Icon, Badge, Text, Box, Table, Tooltip } from '@nimbus-ds/components';
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
  }).format(value);
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

const ListDesktop: React.FC<Props> = ({ subscriptions, onCancelSubscription, isLoading }) => {
  const { t } = useTranslation('translations');
  const navigate = useNavigate();
  
  const handleViewOrder = (subscriptionId: number) => {
    navigate(`/orders?subscription=${subscriptionId}`);
  };

  if (isLoading) {
    return (
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>ID</Table.Cell>
            <Table.Cell>Status</Table.Cell>
            <Table.Cell>Valor</Table.Cell>
            <Table.Cell>Ciclo</Table.Cell>
            <Table.Cell>Data de início</Table.Cell>
            <Table.Cell>Próximo vencimento</Table.Cell>
            <Table.Cell>Meio de pagamento</Table.Cell>
            <Table.Cell>Ações</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <td colSpan={8} style={{padding: '16px', textAlign: 'center'}}>
              <Box display="flex" justifyContent="center" alignItems="center" padding="4">
                <Text>Carregando assinaturas...</Text>
              </Box>
            </td>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Cell>ID</Table.Cell>
          <Table.Cell>Status</Table.Cell>
          <Table.Cell>Valor</Table.Cell>
          <Table.Cell>Ciclo</Table.Cell>
          <Table.Cell>Data de início</Table.Cell>
          <Table.Cell>Próximo vencimento</Table.Cell>
          <Table.Cell>Meio de pagamento</Table.Cell>
          <Table.Cell>Ações</Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {subscriptions.length === 0 && (
          <Table.Row>
            <td colSpan={8} style={{padding: '16px', textAlign: 'center'}}>
              <Box display="flex" justifyContent="center" alignItems="center" padding="4">
                <Text>{t('subscriptions.no-content')}</Text>
              </Box>
            </td>
          </Table.Row>
        )}
        {subscriptions.map((subscription) => (
          <Table.Row key={subscription.id}>
            <Table.Cell>{subscription.id}</Table.Cell>
            <Table.Cell>
              <Badge 
                count=""
                appearance={STATUS_COLORS[subscription.status || 'unknown']}
              >
                {STATUS_LABELS[subscription.status || 'unknown'] || 'Desconhecido'}
              </Badge>
            </Table.Cell>
            <Table.Cell>{formatCurrency(subscription.value || 0)}</Table.Cell>
            <Table.Cell>{getCycleLabel(subscription.cycle)}</Table.Cell>
            <Table.Cell>{formatDate(subscription.start_date)}</Table.Cell>
            <Table.Cell>{formatDate(subscription.next_due_date)}</Table.Cell>
            <Table.Cell>{getBillingTypeLabel(subscription.billing_type)}</Table.Cell>
            <Table.Cell>
              <Box display="flex" gap="2">
                <Tooltip content="Ver pedidos desta assinatura">
                  <Button
                    appearance="primary"
                    onClick={() => handleViewOrder(subscription.id)}
                  >
                    <Icon source={<EyeIcon size={16} />} color="currentColor" />
                  </Button>
                </Tooltip>
                
                {subscription.status !== 'cancelled' && (
                  <Tooltip content="Cancelar assinatura">
                    <Button
                      appearance="danger"
                      onClick={() => onCancelSubscription(subscription.id)}
                    >
                      <Icon source={<TrashIcon size={16} />} color="currentColor" />
                    </Button>
                  </Tooltip>
                )}
                {subscription.status === 'cancelled' && (
                  <Text color="neutral-textLow">Cancelada</Text>
                )}
              </Box>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ListDesktop;