import React from "react";
import { Box, IconButton, Text, Thumbnail } from "@nimbus-ds/components";
import { TrashIcon } from "@nimbus-ds/icons";

import { IProduct } from "../../products.types";
import { DataList } from "@nimbus-ds/patterns";

type Props = {
  products: IProduct[];
  onDeleteProduct: (productId: number) => void;
  isLoading?: boolean;
};

const ListMobile: React.FC<Props> = ({ products, onDeleteProduct, isLoading }) => {
  // Função auxiliar para extrair o nome do produto, independente do formato
  const getProductName = (product: IProduct): string => {
    if (!product.name) return 'Produto sem nome';
    
    if (typeof product.name === 'string') {
      return product.name;
    }
    
    return product.name.pt || product.name.es || 'Produto sem nome';
  };

  if (isLoading) {
    return <Text textAlign="center" margin="4">Carregando produtos...</Text>;
  }

  if (!products || products.length === 0) {
    return <Text textAlign="center" margin="4">Nenhum produto encontrado</Text>;
  }

  return (
    <DataList>
      {products.map((product) => (
        <DataList.Row key={product.id} flexDirection="row" width="100%" gap="2">
          <Box display="flex" gap="2" flex="1 1 auto">
            {product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]?.src ? (
              <Thumbnail
                key={product.images[0].id}
                src={product.images[0].src}
                width="54px"
                alt={getProductName(product)}
              />
            ) : (
              <Box width="54px" height="54px" backgroundColor="neutral-background" />
            )}

            <Box
              display="flex"
              flexDirection="column"
              alignItems="center"
              justifyContent="center"
            >
              <Text>
                {getProductName(product)}
              </Text>
            </Box>
          </Box>
          <Box display="flex" gap="2" alignItems="center" justifyContent="center">
            <IconButton
              onClick={() => onDeleteProduct(product.id)}
              source={<TrashIcon />}
              size="2rem"
            />
          </Box>
        </DataList.Row>
      ))}
    </DataList>
  );
};

export default ListMobile;
