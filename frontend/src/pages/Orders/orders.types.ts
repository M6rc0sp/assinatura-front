// Tipos para Order
export interface Order {
  id: number;
  seller_id: string;
  shopper_id: string;
  external_id: string;
  products: number[];
  customer_info: string;
  nuvemshop: string;
  value: string;
  status: string;
  cycle: string;
  next_due_date: string;
  start_date: string;
  end_date: string | null;
  payment_method: string | null;
  billing_type: string | null;
  metadata: any | null;
  createdAt: string;
  updatedAt: string;
  // Campos opcionais para relacionamentos que podem ser carregados
  shopper?: {
    id: number;
    name: string;
    email: string;
  };
  product?: {
    id: number;
    name: string;
  };
}

export interface OrdersDataProviderProps {
  children: (data: {
    orders: Order[];
    isLoading: boolean;
    onReload: () => void;
  }) => React.ReactNode;
  subscriptionId?: string | number;
}
