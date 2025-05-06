export interface IShopper {
  id: number;
  name: string;
  email: string;
  document?: string; // Campo opcional agora
  nuvemshop_id?: string; // Adicionado campo que existe no modelo do backend
  nuvemshop_info?: any; // Adicionado campo que existe no modelo do backend
  payments_customer_id?: string; // Adicionado campo que existe no modelo do backend
  payments_status?: string; // Adicionado campo que existe no modelo do backend
  phone?: string;
  user_id?: number; // Adicionado campo que existe no modelo do backend
  createdAt?: string; // Alterado para o formato que vem do backend
  updatedAt?: string; // Alterado para o formato que vem do backend
}

export interface IShoppersDataProvider {
  children: (data: {
    shoppers: IShopper[];
    isLoading: boolean; // Adicionado isLoading como parte da interface
  }) => React.ReactNode;
}