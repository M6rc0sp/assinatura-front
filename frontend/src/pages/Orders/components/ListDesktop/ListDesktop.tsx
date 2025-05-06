import React from 'react';
import { Box, Badge, Table, Text } from '@nimbus-ds/components';
import { Order } from '../../orders.types';
import { STATUS_COLORS, STATUS_LABELS, CYCLE_LABELS } from '../../orders.definitions';

interface ListDesktopProps {
  orders: Order[];
  isLoading: boolean;
  onReload: () => void;
}

const ListDesktop: React.FC<ListDesktopProps> = ({ orders, isLoading, onReload }) => {
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
  
  const getCycleLabel = (cycle: string) => {
    return CYCLE_LABELS[cycle as keyof typeof CYCLE_LABELS] || CYCLE_LABELS.unknown;
  };

  const formatCurrency = (value: string) => {
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('pt-BR');
  };

  if (isLoading) {
    return (
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>ID</Table.Cell>
            <Table.Cell>ID Externo</Table.Cell>
            <Table.Cell>Status</Table.Cell>
            <Table.Cell>Ciclo</Table.Cell>
            <Table.Cell>Valor</Table.Cell>
            <Table.Cell>Próx. Cobrança</Table.Cell>
            <Table.Cell>Data Início</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={7}>
              <Text textAlign="center">Carregando pedidos...</Text>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  if (!orders || orders.length === 0) {
    return (
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>ID</Table.Cell>
            <Table.Cell>ID Externo</Table.Cell>
            <Table.Cell>Status</Table.Cell>
            <Table.Cell>Ciclo</Table.Cell>
            <Table.Cell>Valor</Table.Cell>
            <Table.Cell>Próx. Cobrança</Table.Cell>
            <Table.Cell>Data Início</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={7}>
              <Text textAlign="center">Nenhum pedido encontrado</Text>
            </Table.Cell>
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
          <Table.Cell>ID Externo</Table.Cell>
          <Table.Cell>Status</Table.Cell>
          <Table.Cell>Ciclo</Table.Cell>
          <Table.Cell>Valor</Table.Cell>
          <Table.Cell>Próx. Cobrança</Table.Cell>
          <Table.Cell>Data Início</Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {orders.map(order => (
          <Table.Row key={order.id}>
            <Table.Cell>{order.id}</Table.Cell>
            <Table.Cell>
              <Text fontWeight="bold">{order.external_id}</Text>
            </Table.Cell>
            <Table.Cell>
              <Badge
                appearance="default"
                colorScheme={getStatusColor(order.status)}
              >
                {getStatusLabel(order.status)}
              </Badge>
            </Table.Cell>
            <Table.Cell>{getCycleLabel(order.cycle)}</Table.Cell>
            <Table.Cell>
              <Text fontWeight="medium">
                {formatCurrency(order.value)}
              </Text>
            </Table.Cell>
            <Table.Cell>{formatDate(order.next_due_date)}</Table.Cell>
            <Table.Cell>{formatDate(order.start_date)}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ListDesktop;
