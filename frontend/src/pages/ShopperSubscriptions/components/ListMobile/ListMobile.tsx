import React from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Card, Icon, Badge, Text, Box, Spinner } from '@nimbus-ds/components';
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

const ListMobile: React.FC<Props> = ({ subscriptions, onCancelSubscription, isLoading }) => {
  const { t } = useTranslation('translations');

  if (isLoading) {
    return (
      <Card>
        <Card.Body>
          <Box display="flex" justifyContent="center" alignItems="center" padding="4">
            <Spinner size="medium" />
            <Text marginLeft="2">Carregando assinaturas...</Text>
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
        <Card key={subscription.id} marginBottom="4">
          <Card.Header>
            <Box display="flex" alignItems="center" justifyContent="space-between">
              <Text fontWeight="bold">ID: {subscription.id}</Text>
              <Badge appearance={STATUS_COLORS[subscription.status || 'unknown'] || 'neutral'}>
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
                <Text>{CYCLE_LABELS[subscription.cycle || 'unknown'] || 'Desconhecido'}</Text>
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
                <Text>{BILLING_TYPE_LABELS[subscription.billing_type || 'unknown'] || 'Desconhecido'}</Text>
              </Box>
            </Box>
          </Card.Body>
          <Card.Footer>
            {subscription.status !== 'cancelled' && (
              <Button
                appearance="danger"
                onClick={() => onCancelSubscription(subscription.id)}
                fullWidth
              >
                <Icon source={<TrashIcon size={16} />} color="currentColor" />
                <Box marginLeft="2">Cancelar assinatura</Box>
              </Button>
            )}
            {subscription.status === 'cancelled' && (
              <Text color="neutral-textLow" textAlign="center" width="100%">
                Assinatura cancelada
              </Text>
            )}
          </Card.Footer>
        </Card>
      ))}
    </>
  );
};

export default ListMobile;