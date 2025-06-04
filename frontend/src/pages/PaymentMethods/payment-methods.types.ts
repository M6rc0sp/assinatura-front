export interface IPaymentMethod {
  method: 'credit_card' | 'pix' | 'boleto';
  enabled: boolean;
}

export interface IPaymentMethodsDataProvider {
  children: (data: {
    paymentMethods: IPaymentMethod[];
    isLoading: boolean;
    onTogglePaymentMethod: (method: string, enabled: boolean) => Promise<void>;
  }) => React.ReactNode;
}
