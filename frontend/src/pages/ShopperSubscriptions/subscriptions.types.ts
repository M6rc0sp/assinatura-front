export interface IProduct {
  id: number;
  name: string;
  price: number;
  description?: string;
}

export interface ISubscription {
  id: number;
  shopper_id: number;
  status: 'active' | 'cancelled' | 'pending' | 'overdue';
  start_date: string;
  end_date?: string;
  billing_type: 'credit_card' | 'boleto' | 'pix';
  next_due_date: string;
  value: number;
  cycle: 'monthly' | 'quarterly' | 'semi_annual' | 'annual';
  products: IProduct[];
  created_at: string;
  updated_at: string;
}

export interface ISubscriptionsDataProvider {
  children: (data: {
    subscriptions: ISubscription[];
    shopper?: {
      id: number;
      name: string;
      email: string;
    };
    isLoading: boolean;
    onCancelSubscription: (subscriptionId: number) => void;
  }) => React.ReactNode;
}