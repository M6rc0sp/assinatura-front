export const PAGE_SIZE = 10;

export const STATUS_COLORS = {
  active: 'success',
  pending: 'warning',
  processing: 'info',
  completed: 'success',
  cancelled: 'danger',
  refunded: 'neutral',
  overdue: 'danger',
  unknown: 'neutral'
} as const;

export const STATUS_LABELS = {
  active: 'Ativa',
  pending: 'Pendente',
  processing: 'Em processamento',
  completed: 'Concluído',
  cancelled: 'Cancelado',
  refunded: 'Reembolsado',
  overdue: 'Atrasada',
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
