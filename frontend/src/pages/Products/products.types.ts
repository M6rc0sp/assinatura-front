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
  id: number;
  // Suporte para ambos formatos de nome (objeto ou string)
  name: string | {
    pt?: string;
    es?: string;
  };
  // Campos adicionais conforme retornado pela API atual
  seller_id?: string;
  price?: number;
  stock?: number;
  sku?: string;
  description?: string;
  categories?: string;
  variants?: IVariant[];
  images?: IImage[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface IProductsDataProvider {
  children: (data: {
    products: IProduct[];
    onDeleteProduct: (productId: number) => void;
    isLoading: boolean; // Adicionando propriedade isLoading
  }) => React.ReactNode;
}
