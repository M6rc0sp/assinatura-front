export const PAGE_SIZE = 10;

export const STATUS_COLORS = {
  active: 'success',
  cancelled: 'danger',
  pending: 'warning',
  overdue: 'danger',
  unknown: 'neutral'
} as const;

export const STATUS_LABELS = {
  active: 'Ativa',
  cancelled: 'Cancelada',
  pending: 'Pendente',
  overdue: 'Atrasada',
  unknown: 'Desconhecido'
} as const;

export const BILLING_TYPE_LABELS = {
  BOLETO: 'Boleto',
  CREDIT_CARD: 'Cartão de Crédito',
  PIX: 'PIX',
  DEBIT_CARD: 'Cartão de Débito',
  TRANSFER: 'Transferência',
  DEPOSIT: 'Depósito',
  unknown: 'Desconhecido'
} as const;

export const CYCLE_LABELS = {
  MONTHLY: 'Mensal',
  QUARTERLY: 'Trimestral', 
  SEMIANNUAL: 'Semestral',
  YEARLY: 'Anual',
  WEEKLY: 'Semanal',
  BIWEEKLY: 'Quinzenal',
  unknown: 'Desconhecido'
} as const;