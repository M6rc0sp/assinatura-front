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
  isLoading?: boolean;
};

const ListMobile: React.FC<Props> = ({ products, onDeleteProduct, onSyncProduct, onEditProduct, isLoading }) => {
  const [selectedProduct, setSelectedProduct] = useState<IProduct | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<{ 
    name: string; 
    price: string; 
    description: string;
    subscription_price: string;
    sku: string;
    barcode: string;
    weight: string;
    stock: string;
    status: string;
  }>({ 
    name: '', 
    price: '', 
    description: '',
    subscription_price: '',
    sku: '',
    barcode: '',
    weight: '',
    stock: '',
    status: 'active'
  });
  const [editLoading, setEditLoading] = useState(false);

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
      subscription_price: product.subscription_price ? String(product.subscription_price) : '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      weight: product.weight ? String(product.weight) : '',
      stock: product.stock ? String(product.stock) : '',
      status: product.status || 'active'
    });
  };

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    setEditLoading(true);
    await onEditProduct(selectedProduct.id, {
      name: editForm.name,
      price: Number(editForm.price),
      description: editForm.description,
      subscription_price: editForm.subscription_price ? Number(editForm.subscription_price) : undefined,
      sku: editForm.sku || undefined,
      barcode: editForm.barcode || undefined,
      weight: editForm.weight ? Number(editForm.weight) : undefined,
      stock: editForm.stock ? Number(editForm.stock) : undefined,
      status: editForm.status || 'active'
    });
    setEditLoading(false);
    setIsEditing(false);
    setSelectedProduct(null);
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
                
                {isEditing ? (
                  <Box display="flex" flexDirection="column" gap="2">
                    <Text fontWeight="bold">Editar Produto</Text>
                    <Box>
                      <Text fontSize="caption">Nome:</Text>
                      <input
                        name="name"
                        value={editForm.name}
                        onChange={handleEditChange}
                        placeholder="Nome"
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">Preço:</Text>
                      <input
                        name="price"
                        value={editForm.price}
                        onChange={handleEditChange}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="Preço"
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">Preço de Assinatura:</Text>
                      <input
                        name="subscription_price"
                        value={editForm.subscription_price}
                        onChange={handleEditChange}
                        type="number"
                        min="0"
                        step="0.01"
                        inputMode="decimal"
                        placeholder="Preço de Assinatura"
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">SKU:</Text>
                      <input
                        name="sku"
                        value={editForm.sku}
                        onChange={handleEditChange}
                        placeholder="SKU"
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">Código de Barras:</Text>
                      <input
                        name="barcode"
                        value={editForm.barcode}
                        onChange={handleEditChange}
                        placeholder="Código de Barras"
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">Peso (g):</Text>
                      <input
                        name="weight"
                        value={editForm.weight}
                        onChange={handleEditChange}
                        type="number"
                        min="0"
                        placeholder="Peso em gramas"
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">Estoque:</Text>
                      <input
                        name="stock"
                        value={editForm.stock}
                        onChange={handleEditChange}
                        type="number"
                        min="0"
                        placeholder="Quantidade em Estoque"
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      />
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">Status:</Text>
                      <select
                        name="status"
                        value={editForm.status}
                        onChange={handleEditChange as any}
                        style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc', width: '100%' }}
                      >
                        <option value="active">Ativo</option>
                        <option value="inactive">Inativo</option>
                        <option value="draft">Rascunho</option>
                      </select>
                    </Box>
                    
                    <Box>
                      <Text fontSize="caption">Descrição:</Text>
                      <textarea
                        name="description"
                        value={editForm.description}
                        onChange={handleEditChange}
                        rows={3}
                        placeholder="Descrição"
                        style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
                      />
                    </Box>
                  </Box>
                ) : (
                  <>
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
                    
                    {selectedProduct.subscription_price && (
                      <Box>
                        <Text fontWeight="medium">Preço de Assinatura:</Text>
                        <Text>{Number(selectedProduct.subscription_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.sku && (
                      <Box>
                        <Text fontWeight="medium">SKU:</Text>
                        <Text>{selectedProduct.sku}</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.barcode && (
                      <Box>
                        <Text fontWeight="medium">Código de Barras:</Text>
                        <Text>{selectedProduct.barcode}</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.weight && (
                      <Box>
                        <Text fontWeight="medium">Peso:</Text>
                        <Text>{selectedProduct.weight}g</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.stock !== undefined && selectedProduct.stock !== null && (
                      <Box>
                        <Text fontWeight="medium">Estoque:</Text>
                        <Text>{selectedProduct.stock} unidades</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.status && (
                      <Box>
                        <Text fontWeight="medium">Status:</Text>
                        <Text>{
                          selectedProduct.status === 'active' ? 'Ativo' : 
                          selectedProduct.status === 'inactive' ? 'Inativo' : 
                          selectedProduct.status === 'draft' ? 'Rascunho' : 
                          selectedProduct.status
                        }</Text>
                      </Box>
                    )}
                  </>
                )}
              </Box>
            </Modal.Body>
            <Modal.Footer>
              {isEditing ? (
                <>
                  <Button appearance="primary" onClick={handleEditProduct} disabled={editLoading}>
                    {editLoading ? 'Salvando...' : 'Salvar'}
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
    </DataList>
  );
};

export default ListMobile;
