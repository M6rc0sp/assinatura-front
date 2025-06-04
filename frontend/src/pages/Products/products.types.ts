interface IInventoryLevel {
  id: number;
  variant_id: number;
  location_id: string;
  stock: number;
}

interface IVariant {
  id: number;
  image_id: number;
  product_id: number;
  position: number;
  price: string;
  compare_at_price: string;
  promotional_price: null | string;
  stock_management: boolean;
  stock: number;
  weight: string;
  width: string;
  height: string;
  depth: string;
  sku: null | string;
  values: any[];
  barcode: null | string;
  mpn: null | string;
  age_group: null | string;
  gender: null | string;
  created_at: string;
  updated_at: string;
  inventory_levels: IInventoryLevel[];
}

interface IImage {
  id: number;
  product_id: number;
  src: string;
  position: number;
  alt: any[];
  created_at: string;
  updated_at: string;
}

export interface IProduct {
  external_id: any;
  id: number;
  // Suporte para ambos formatos de nome (objeto ou string)
  name: string | {
    pt?: string;
    es?: string;
  };
  // Campos adicionais conforme retornado pela API atual
  seller_id?: number;          // ID do vendedor (obrigatório)
  price?: number;              // Preço unitário normal (obrigatório)
  subscription_price?: number; // Preço para assinatura (pode ser diferente do unitário)
  stock?: number;              // Quantidade em estoque
  sku?: string;                // Código SKU
  barcode?: string;            // Código de barras
  weight?: number;             // Peso (em gramas)
  description?: string | {     // Descrição do produto
    pt?: string;
    es?: string;
  };
  status?: string;             // Status: 'active', 'inactive', 'draft'
  categories?: string;
  variants?: IVariant[];
  images?: IImage[] | null;    // URLs das imagens
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductsDataProvider {
  children: (data: {
    products: IProduct[];
    onDeleteProduct: (productId: number) => void;
    onSyncProduct: (productId: number) => void;
    onCreateProduct: (data: { 
      name: string; 
      price: number; 
      description: string;
      subscription_price?: number;
      sku?: string;
      barcode?: string;
      weight?: number;
      stock?: number;
      status?: string;
    }) => Promise<void>;
    onEditProduct: (productId: number, data: { 
      name: string; 
      price: number; 
      description: string;
      subscription_price?: number;
      sku?: string;
      barcode?: string;
      weight?: number;
      stock?: number;
      status?: string; 
    }) => Promise<void>;
    isLoading: boolean;
  }) => React.ReactNode;
}
