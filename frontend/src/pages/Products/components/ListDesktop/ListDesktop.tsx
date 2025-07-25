import React, { useState } from "react";
import { Box, IconButton, Table, Text, Thumbnail, Modal, Button } from "@nimbus-ds/components";
import { TrashIcon, InfoCircleIcon, UploadIcon } from "@nimbus-ds/icons";

import { Translator } from "@/app/I18n";
import { IProduct, IProductImage } from "../../products.types";

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
    images?: IProductImage[];
  }) => Promise<void>;
  isLoading?: boolean;
};

const ListDesktop: React.FC<Props> = ({ products, onDeleteProduct, onSyncProduct, onEditProduct, isLoading }) => {
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
    images: File[];
  }>({ 
    name: '', 
    price: '', 
    description: '',
    subscription_price: '',
    sku: '',
    barcode: '',
    weight: '',
    stock: '',
    status: 'active',
    images: []
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

  // Função auxiliar para extrair a descrição do produto, independente do formato
  const getProductDescription = (product: IProduct): string => {
    if (!product.description) return '';
    if (typeof product.description === 'string') {
      return product.description;
    }
    return product.description.pt || product.description.es || '';
  };

  const handleViewProductDetails = (product: IProduct) => {
    setSelectedProduct(product);
    setIsEditing(false);
    setEditForm({
      name: getProductName(product),
      price: product.price ? String(product.price) : '',
      description: getProductDescription(product),
      subscription_price: product.subscription_price ? String(product.subscription_price) : '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      weight: product.weight ? String(product.weight) : '',
      stock: product.stock ? String(product.stock) : '',
      status: product.status || 'active',
      images: []
    });
  };

  const handleEditChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };

  const handleEditProduct = async () => {
    if (!selectedProduct) return;
    setEditLoading(true);
    
    // Converter imagens para base64 se houver
    let productImages = undefined;
    if (editForm.images.length > 0) {
      try {
        productImages = await Promise.all(
          editForm.images.map(async (file, index) => {
            const base64 = await fileToBase64(file);
            return {
              attachment: base64,
              filename: file.name,
              position: index + 1
            };
          })
        );
      } catch (error) {
        console.error('Erro ao processar imagens:', error);
        setEditLoading(false);
        return;
      }
    }

    await onEditProduct(selectedProduct.id, {
      name: editForm.name,
      price: Number(editForm.price),
      description: editForm.description,
      subscription_price: editForm.subscription_price ? Number(editForm.subscription_price) : undefined,
      sku: editForm.sku,
      barcode: editForm.barcode,
      weight: editForm.weight ? Number(editForm.weight) : undefined,
      stock: editForm.stock ? Number(editForm.stock) : undefined,
      status: editForm.status,
      images: productImages
    });
    setEditLoading(false);
    setIsEditing(false);
    setSelectedProduct(null);
  };

  // Função para converter arquivo para base64
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => {
        const result = reader.result as string;
        // Remove o prefixo data:image/...;base64,
        const base64 = result.split(',')[1];
        resolve(base64);
      };
      reader.onerror = error => reject(error);
    });
  };

  // Handler para mudança de imagens
  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (files) {
      const fileArray = Array.from(files);
      setEditForm(prev => ({ ...prev, images: [...prev.images, ...fileArray] }));
    }
  };

  // Remover imagem específica
  const removeImage = (index: number) => {
    setEditForm(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
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
                  {(() => {
                    // Debug: vamos ver o que tem nas imagens
                    console.log('Produto:', product.id, 'Images:', product.images);
                    
                    if (product.images && Array.isArray(product.images) && product.images.length > 0 && product.images[0]?.src) {
                      console.log('Mostrando imagem:', product.images[0].src);
                      return (
                        <Thumbnail
                          src={product.images[0].src}
                          width="36px"
                          alt={getProductName(product)}
                        />
                      );
                    } else {
                      console.log('Sem imagem para produto:', product.id);
                      return (
                        <Box width="36px" height="36px" backgroundColor="neutral-background" />
                      );
                    }
                  })()}
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
                    <input
                      name="subscription_price"
                      value={editForm.subscription_price}
                      onChange={handleEditChange}
                      type="number"
                      min="0"
                      step="0.01"
                      inputMode="decimal"
                      placeholder="Preço de Assinatura"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <input
                      name="sku"
                      value={editForm.sku}
                      onChange={handleEditChange}
                      placeholder="SKU"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <input
                      name="barcode"
                      value={editForm.barcode}
                      onChange={handleEditChange}
                      placeholder="Código de Barras"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <input
                      name="weight"
                      value={editForm.weight}
                      onChange={handleEditChange}
                      type="number"
                      min="0"
                      placeholder="Peso (em gramas)"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <input
                      name="stock"
                      value={editForm.stock}
                      onChange={handleEditChange}
                      type="number"
                      min="0"
                      placeholder="Estoque"
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    />
                    <select
                      name="status"
                      value={editForm.status}
                      onChange={handleEditChange}
                      style={{ padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                    >
                      <option value="active">Ativo</option>
                      <option value="inactive">Inativo</option>
                      <option value="draft">Rascunho</option>
                    </select>
                    <textarea
                      name="description"
                      value={editForm.description}
                      onChange={handleEditChange}
                      rows={3}
                      placeholder="Descrição"
                      style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
                    />
                    
                    {/* Campo para upload de novas imagens */}
                    <Box>
                      <Box marginBottom="2">
                        <Text fontWeight="medium">Adicionar Novas Imagens</Text>
                      </Box>
                      <Box marginBottom="2">
                        <Text fontSize="caption" color="neutral-textLow">
                          Formatos aceitos: .gif, .jpg, .png, .webp (máx. 10MB cada)
                        </Text>
                      </Box>
                      <input
                        type="file"
                        accept=".gif,.jpg,.jpeg,.png,.webp"
                        multiple
                        onChange={handleImageChange}
                        style={{ 
                          width: '100%', 
                          padding: 8, 
                          borderRadius: 4, 
                          border: '1px solid #ccc',
                          marginBottom: 8
                        }}
                      />
                      {editForm.images.length > 0 && (
                        <Box marginTop="2">
                          <Box marginBottom="1">
                            <Text fontSize="caption" fontWeight="medium">
                              Novas imagens selecionadas ({editForm.images.length}):
                            </Text>
                          </Box>
                          {editForm.images.map((file, index) => (
                            <Box 
                              key={index} 
                              display="flex" 
                              justifyContent="space-between" 
                              alignItems="center"
                              padding="2"
                              backgroundColor="neutral-surface"
                              borderRadius="1"
                              marginBottom="1"
                            >
                              <Text fontSize="caption">
                                {file.name} ({(file.size / 1024 / 1024).toFixed(2)}MB)
                              </Text>
                              <Button
                                appearance="danger"
                                onClick={() => removeImage(index)}
                              >
                                Remover
                              </Button>
                            </Box>
                          ))}
                        </Box>
                      )}
                    </Box>
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
                    
                    {selectedProduct.subscription_price && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">Preço de Assinatura:</Text>
                        <Text>{Number(selectedProduct.subscription_price).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</Text>
                      </Box>
                    )}

                    {selectedProduct.sku && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">SKU:</Text>
                        <Text>{selectedProduct.sku}</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.barcode && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">Código de Barras:</Text>
                        <Text>{selectedProduct.barcode}</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.weight && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">Peso:</Text>
                        <Text>{selectedProduct.weight} g</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.stock !== undefined && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">Estoque:</Text>
                        <Text>{selectedProduct.stock} unidades</Text>
                      </Box>
                    )}
                    
                    {selectedProduct.status && (
                      <Box display="flex" flexDirection="column" gap="1">
                        <Text fontWeight="bold">Status:</Text>
                        <Text>
                          {selectedProduct.status === 'active' ? 'Ativo' : 
                           selectedProduct.status === 'inactive' ? 'Inativo' : 
                           selectedProduct.status === 'draft' ? 'Rascunho' : 
                           selectedProduct.status}
                        </Text>
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
    </Table>
  );
};

export default ListDesktop;
