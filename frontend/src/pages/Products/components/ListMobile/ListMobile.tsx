import React, { useState } from "react";
import { Box, IconButton, Text, Thumbnail, Button, Modal } from "@nimbus-ds/components";
import { TrashIcon, InfoCircleIcon } from "@nimbus-ds/icons";
import { Translator } from "@/app/I18n";

import { IProduct } from "../../products.types";
import { DataList } from "@nimbus-ds/patterns";

type Props = {
  products: IProduct[];
  onDeleteProduct: (productId: number) => void;
  onSyncProduct: (productId: number) => void;
  isLoading?: boolean;
};

const ListMobile: React.FC<Props> = ({ products, onDeleteProduct, onSyncProduct, isLoading }) => {
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);

  // Função auxiliar para extrair o nome do produto, independente do formato
  const getProductName = (product: IProduct): string => {
    if (!product.name) return 'Produto sem nome';
    
    if (typeof product.name === 'string') {
      return product.name;
    }
    
    return product.name.pt || product.name.es || 'Produto sem nome';
  };

  const handleViewProductDetails = (product: IProduct) => {
    setSelectedProduct(product);
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
  };

  if (isLoading) {
    return (
      <Box padding="4">
        <Text textAlign="center">Carregando produtos...</Text>
      </Box>
    );
  }

  if (!products || products.length === 0) {
    return (
      <Box padding="4">
        <Text textAlign="center">Nenhum produto encontrado</Text>
      </Box>
    );
  }

  return (
    <DataList>
      <DataList.Row flexDirection="row" width="100%" gap="2" style={{ fontWeight: 'bold', background: 'var(--nimbus-color-background-surfaceHighlight)' }}>
        <Box flex="1 1 auto">
          <Text fontWeight="bold">
            <Translator path="products.name" />
          </Text>
        </Box>
        <Box width="110px" display="flex" alignItems="center" justifyContent="center">
          <Text fontWeight="bold">
            <Translator path="products.actions" />
          </Text>
        </Box>
      </DataList.Row>
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
              justifyContent="center"
            >
              <Text fontWeight="medium">
                {getProductName(product)}
              </Text>
              <Text>
                ID: {product.id}
              </Text>
            </Box>
          </Box>
          <Box display="flex" gap="2" alignItems="center" justifyContent="center">
            <IconButton
              onClick={() => handleViewProductDetails(product)}
              source={<InfoCircleIcon />}
              size="2rem"
            />
            <IconButton
              onClick={() => onDeleteProduct(product.id)}
              source={<TrashIcon />}
              size="2rem"
            />
            <IconButton
              onClick={() => onSyncProduct(product.id)}
              source={<InfoCircleIcon />} // Troque para um ícone de sync se disponível
              size="2rem"
            />
          </Box>
        </DataList.Row>
      ))}
      
      <div style={{ position: 'relative', zIndex: 1000 }}>
        {selectedProduct && (
          <Modal open={!!selectedProduct} onDismiss={handleCloseModal}>
            <Modal.Header>
              <Text fontWeight="bold">Detalhes do Produto</Text>
            </Modal.Header>
            <Modal.Body>
              <Box display="flex" flexDirection="column" gap="3">
                <Box display="flex" alignItems="center" gap="3">
                  {selectedProduct.images && Array.isArray(selectedProduct.images) && selectedProduct.images.length > 0 && selectedProduct.images[0]?.src ? (
                    <Thumbnail
                      src={selectedProduct.images[0].src}
                      width="100px"
                      alt={getProductName(selectedProduct)}
                    />
                  ) : (
                    <Box width="100px" height="100px" backgroundColor="neutral-background" />
                  )}
                  
                  <Box display="flex" flexDirection="column" gap="1">
                    <Text fontWeight="bold">{getProductName(selectedProduct)}</Text>
                    <Text fontSize="caption" color="neutral-textLow">ID: {selectedProduct.id}</Text>
                    {selectedProduct.external_id && (
                      <Text fontSize="caption">ID Externo: {selectedProduct.external_id}</Text>
                    )}
                  </Box>
                </Box>
                
                {selectedProduct.description && (
                  <Box>
                    <Text fontWeight="medium">Descrição:</Text>
                    <Text>
                      {typeof selectedProduct.description === 'string'
                        ? selectedProduct.description
                        : (selectedProduct.description &&
                            typeof selectedProduct.description === 'object' &&
                            'pt' in selectedProduct.description
                            ? (selectedProduct.description as { pt?: string; es?: string }).pt ||
                              (selectedProduct.description as { pt?: string; es?: string }).es ||
                              ''
                            : ''
                          )
                      }
                    </Text>
                  </Box>
                )}
                
                {selectedProduct.price && (
                  <Box>
                    <Text fontWeight="medium">Preço:</Text>
                    <Text>{Number(selectedProduct.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                  </Box>
                )}
                
                {selectedProduct.sku && (
                  <Box>
                    <Text fontWeight="medium">SKU:</Text>
                    <Text>{selectedProduct.sku}</Text>
                  </Box>
                )}
              </Box>
            </Modal.Body>
            <Modal.Footer>
              <Button appearance="neutral" onClick={handleCloseModal}>
                Fechar
              </Button>
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </DataList>
  );
};

export default ListMobile;
