import React from "react";
import { Box, IconButton, Table, Text, Thumbnail } from "@nimbus-ds/components";
import { TrashIcon } from "@nimbus-ds/icons";

import { Translator } from "@/app/I18n";
import { IProduct } from "../../products.types";

type Props = {
  products: IProduct[];
  onDeleteProduct: (productId: number) => void;
  isLoading?: boolean;
};

const ListDesktop: React.FC<Props> = ({ products, onDeleteProduct, isLoading }) => {
  // Função auxiliar para extrair o nome do produto, independente do formato
  const getProductName = (product: IProduct): string => {
    if (!product.name) return 'Produto sem nome';
    
    if (typeof product.name === 'string') {
      return product.name;
    }
    
    return product.name.pt || product.name.es || 'Produto sem nome';
  };

  // Renderização durante carregamento
  if (isLoading) {
    return (
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>
              <Translator path="products.name" />
            </Table.Cell>
            <Table.Cell>
              <Box display="flex" gap="2" alignItems="center" width="100%" justifyContent="center">
                <Text>
                  <Translator path="products.remove" />
                </Text>
              </Box>
            </Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell colSpan={2}>
              <Text textAlign="center">Carregando produtos...</Text>
            </Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table>
    );
  }

  return (
    <Table>
      <Table.Head>
        <Table.Row>
          <Table.Cell>
            <Translator path="products.name" />
          </Table.Cell>
          <Table.Cell>
            <Box
              display="flex"
              gap="2"
              alignItems="center"
              width="100%"
              justifyContent="center"
            >
              <Text>
                <Translator path="products.remove" />
              </Text>
            </Box>
          </Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {products && products.length > 0 ? (
          products.map((product) => (
            <Table.Row key={product.id}>
              <Table.Cell>
                <Box display="flex" gap="2" alignItems="center">
                  {product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]?.src ? (
                    <Thumbnail
                      src={product.images[0].src}
                      width="36px"
                      alt={getProductName(product)}
                    />
                  ) : (
                    <Box width="36px" height="36px" backgroundColor="neutral-background" />
                  )}
                  {getProductName(product)}
                </Box>
              </Table.Cell>
              <Table.Cell>
                <Box
                  display="flex"
                  gap="2"
                  alignItems="center"
                  justifyContent="center"
                >
                  <IconButton
                    onClick={() => onDeleteProduct(product.id)}
                    source={<TrashIcon />}
                    size="2rem"
                  />
                </Box>
              </Table.Cell>
            </Table.Row>
          ))
        ) : (
          <Table.Row>
            <Table.Cell colSpan={2}>
              <Text textAlign="center">Nenhum produto encontrado</Text>
            </Table.Cell>
          </Table.Row>
        )}
      </Table.Body>
    </Table>
  );
};

export default ListDesktop;
