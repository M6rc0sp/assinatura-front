import React, { useState } from "react";
import { Box, IconButton, Table, Text, Thumbnail, Modal, Button } from "@nimbus-ds/components";
import { TrashIcon, InfoCircleIcon, UploadIcon } from "@nimbus-ds/icons";

import { Translator } from "@/app/I18n";
import { IProduct } from "../../products.types";

type Props = {
  products: IProduct[];
  onDeleteProduct: (productId: number) => void;
  onSyncProduct: (productId: number) => void;
  isLoading?: boolean;
};

const ListDesktop: React.FC<Props> = ({ products, onDeleteProduct, onSyncProduct, isLoading }) => {
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ name: string; price: string; description: string }>({ name: '', price: '', description: '' });

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
    setIsEditing(false);
    setEditForm({
      name: getProductName(product),
      price: product.price ? String(product.price) : '',
      description: product.description ? String(product.description) : '',
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    // Chamar endpoint de edição (PUT/PATCH) via fetch ou provider
    // Exemplo simples usando fetch (ajuste para provider se necessário)
    await fetch(`/app/seller/${selectedProduct.seller_id}/products/${selectedProduct.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: editForm.name,
        price: Number(editForm.price),
        description: editForm.description,
      }),
    });
    setIsEditing(false);
    setSelectedProduct(null);
    // Ideal: disparar um refresh na lista (pode ser via provider)
    window.location.reload(); // simples, mas pode ser melhorado
  };

  const handleCloseModal = () => {
    setSelectedProduct(null);
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
                  Ações
                </Text>
              </Box>
            </Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <td colSpan={2} style={{padding: '16px', textAlign: 'center'}}>
              <Text textAlign="center">Carregando produtos...</Text>
            </td>
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
                <Translator path="products.actions" />
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
                    source={<UploadIcon />}
                    size="2rem"
                  />
                </Box>
              </Table.Cell>
            </Table.Row>
          ))
        ) : (
          <Table.Row>
            <td colSpan={2} style={{padding: '16px', textAlign: 'center'}}>
              <Text textAlign="center">Nenhum produto encontrado</Text>
            </td>
          </Table.Row>
        )}
      </Table.Body>
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
                    <Text>ID: {selectedProduct.id}</Text>
                    {selectedProduct.external_id && (
                      <Text>ID Externo: {selectedProduct.external_id}</Text>
                    )}
                  </Box>
                </Box>
                
                {isEditing ? (
                  <Box display="flex" flexDirection="column" gap="2">
                    <Text fontWeight="bold">Editar Produto</Text>
                    <input
                      name="name"
                      value={editForm.name}
                      onChange={handleEditChange}
                      placeholder="Nome"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <input
                      name="price"
                      value={editForm.price}
                      onChange={handleEditChange}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="Preço"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={3}
                      placeholder="Descrição"
                      style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
                    />
                  </Box>
                ) : (
                  <>
                    {selectedProduct.description && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">Descrição:</Text>
                        <Text>{typeof selectedProduct.description === 'string'
                          ? selectedProduct.description
                          : (selectedProduct.description as { pt?: string; es?: string })?.pt ||
                            (selectedProduct.description as { pt?: string; es?: string })?.es ||
                            ''}
                        </Text>
                      </Box>
                    )}
                    
                    {selectedProduct.price && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">Preço:</Text>
                        <Text>{Number(selectedProduct.price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.sku && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">SKU:</Text>
                        <Text>{selectedProduct.sku}</Text>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Modal.Body>
            <Modal.Footer>
              {isEditing ? (
                <>
                  <Button appearance="primary" onClick={handleEditProduct}>
                    Salvar
                  </Button>
                  <Button appearance="neutral" onClick={() => setIsEditing(false)}>
                    Cancelar
                  </Button>
                </>
              ) : (
                <>
                  <Button appearance="primary" onClick={() => setIsEditing(true)}>
                    Editar
                  </Button>
                  <Button appearance="neutral" onClick={handleCloseModal}>
                    Fechar
                  </Button>
                </>
              )}
            </Modal.Footer>
          </Modal>
        )}
      </div>
    </Table>
  );
};

export default ListDesktop;
