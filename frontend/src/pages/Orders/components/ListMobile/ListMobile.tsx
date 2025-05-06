import React from 'react';
import { Box, Badge, Card, Text } from '@nimbus-ds/components';
import { Order } from '../../orders.types';
import { STATUS_COLORS, STATUS_LABELS, CYCLE_LABELS } from '../../orders.definitions';

interface ListMobileProps {
  orders: Order[];
  isLoading: boolean;
  onReload: () => void;
}

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

const ListMobile: React.FC<ListMobileProps> = ({ orders, isLoading }) => {
  const getStatusLabel = (status: string) => {
    return STATUS_LABELS[status as keyof typeof STATUS_LABELS] || STATUS_LABELS.unknown;
  };

  const getStatusColor = (status: string) => {
    const color = STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.unknown;
    return color === 'success' ? 'success' : 
           color === 'warning' ? 'warning' : 
           color === 'danger' ? 'danger' : 
           color === 'info' ? 'primary' : 'neutral';
  };
  
  const formatCurrency = (value: string) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Box padding="4">
        <Text textAlign="center">Carregando pedidos...</Text>
      </Box>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Box padding="4">
        <Text textAlign="center">Nenhum pedido encontrado</Text>
      </Box>
    );
  }

  return (
    <Box display="flex" flexDirection="column" gap="4" padding="4">
      {orders.map(order => (
        <Card key={order.id} padding="base">
          <Box display="flex" justifyContent="space-between" alignItems="center">
            <Text fontWeight="bold">#{order.id}</Text>
            <Badge
              count=""
              appearance={getStatusColor(order.status)}
            >
              {getStatusLabel(order.status)}
            </Badge>
          </Box>
          
          <div style={{
            borderTop: '1px solid var(--nimbus-color-border-neutral-surface)',
            margin: '12px 0'
          }}></div>
          
          <Box display="flex" flexDirection="column" gap="2">
            <Box display="flex" justifyContent="space-between">
              <Text color="neutral-textLow">ID Externo</Text>
              <Text fontWeight="medium">{order.external_id}</Text>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Text color="neutral-textLow">Ciclo</Text>
              <Text>{getCycleLabel(order.cycle)}</Text>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Text color="neutral-textLow">Valor</Text>
              <Text fontWeight="medium">{formatCurrency(order.value)}</Text>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Text color="neutral-textLow">Próx. Cobrança</Text>
              <Text>{formatDate(order.next_due_date)}</Text>
            </Box>
            
            <Box display="flex" justifyContent="space-between">
              <Text color="neutral-textLow">Data Início</Text>
              <Text>{formatDate(order.start_date)}</Text>
            </Box>
          </Box>
        </Card>
      ))}
    </Box>
  );
};

export default ListMobile;
