import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Icon, Badge, Text, Box, Table } from '@nimbus-ds/components';
import { TrashIcon } from '@nimbus-ds/icons';
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

const ListDesktop: React.FC<Props> = ({ subscriptions, onCancelSubscription, isLoading }) => {
  const { t } = useTranslation('translations');
  
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
            <Table.Cell>
              <Box display="flex" justifyContent="center" alignItems="center" padding="4">
                <Text>Carregando assinaturas...</Text>
              </Box>
            </Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
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
            <Table.Cell>
              <Box display="flex" justifyContent="center" alignItems="center" padding="4">
                <Text>{t('subscriptions.no-content')}</Text>
              </Box>
            </Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
            <Table.Cell></Table.Cell>
          </Table.Row>
        )}
        {subscriptions.map((subscription) => (
          <Table.Row key={subscription.id}>
            <Table.Cell>{subscription.id}</Table.Cell>
            <Table.Cell>
              <Badge appearance={STATUS_COLORS[subscription.status || 'unknown']}>
                {STATUS_LABELS[subscription.status || 'unknown'] || 'Desconhecido'}
              </Badge>
            </Table.Cell>
            <Table.Cell>{formatCurrency(subscription.value || 0)}</Table.Cell>
            <Table.Cell>{CYCLE_LABELS[subscription.cycle || 'unknown'] || 'Desconhecido'}</Table.Cell>
            <Table.Cell>{formatDate(subscription.start_date)}</Table.Cell>
            <Table.Cell>{formatDate(subscription.next_due_date)}</Table.Cell>
            <Table.Cell>{BILLING_TYPE_LABELS[subscription.billing_type || 'unknown'] || 'Desconhecido'}</Table.Cell>
            <Table.Cell>
              {subscription.status !== 'cancelled' && (
                <Button
                  appearance="danger"
                  onClick={() => onCancelSubscription(subscription.id)}
                >
                  <Icon source={<TrashIcon size={16} />} color="currentColor" />
                  <Box marginLeft="2">Cancelar</Box>
                </Button>
              )}
              {subscription.status === 'cancelled' && (
                <Text color="neutral-textLow">Cancelada</Text>
              )}
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ListDesktop;