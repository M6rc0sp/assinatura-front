import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigateHeader } from '@tiendanube/nexo';
import { Box, Pagination, Text, Button, Modal, Input } from '@nimbus-ds/components';
import { Layout, Page } from '@nimbus-ds/patterns';

import { Responsive } from '@/components';
import { nexo } from '@/app';
import { ListDesktop, ListMobile } from './components';
import { PAGE_SIZE } from './products.definitions';
import ProductsDataProvider from './ProductsDataProvider';

const Products: React.FC = () => {
  const { t } = useTranslation('translations');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };
  useEffect(() => {
    navigateHeader(nexo, { goTo: '/', text: 'Voltar ao inicio' });
  }, []);

  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    subscription_price: '',
    cycle: 'MONTHLY',
    sku: '',
    barcode: '',
    weight: '',
    stock: '',
    status: 'active',
    images: [] as File[]  // Array de arquivos de imagem
  });

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setForm({
      name: '',
      price: '',
      description: '',
      subscription_price: '',
      cycle: 'MONTHLY',
      sku: '',
      barcode: '',
      weight: '',
      stock: '',
      status: 'active',
      images: []
    });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  return (
    <Page
      maxWidth="1200px"
      minHeight={{
        xs: 'calc(100vh - 65px)',
        md: 'calc(100vh - 66px)',
        lg: 'calc(100vh - 66px)',
      }}
    >
      <Page.Header title={t('products.title')} />
      <Page.Body px={{ xs: 'none', md: '6' }}>
        <Layout columns="1">
          <Layout.Section>
            <Box display="flex" justifyContent="flex-end" mb="4">
              <Button appearance="primary" onClick={openModal}>
                {t('home.second-card.create-products', 'Adicionar produto')}
              </Button>
            </Box>
            <ProductsDataProvider>
              {({ products, onDeleteProduct, onSyncProduct, onCreateProduct, onEditProduct, isLoading }) => {
                const total = products.length;
                const productsPaginated = products.slice(
                  currentPage === 1 ? 0 : (currentPage - 1) * PAGE_SIZE,
                  (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
                );

                const handleSubmit = async (e: React.FormEvent) => {
                  e.preventDefault();

                  // Converter imagens para base64 se houver
                  let productImages = undefined;
                  if (form.images.length > 0) {
                    try {
                      productImages = await Promise.all(
                        form.images.map(async (file, index) => {
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
                      return; // Para a execução se houve erro no processamento
                    }
                  }

                  await onCreateProduct({
                    name: form.name,
                    price: Number(form.price),
                    description: form.description,
                    cycle: form.cycle as any,
                    subscription_price: form.subscription_price ? Number(form.subscription_price) : undefined,
                    sku: form.sku || undefined,
                    barcode: form.barcode || undefined,
                    weight: form.weight ? Number(form.weight) : undefined,
                    stock: form.stock ? Number(form.stock) : undefined,
                    status: form.status,
                    images: productImages
                  });
                  setCurrentPage(1);
                  closeModal();
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
                    setForm(prev => ({ ...prev, images: [...prev.images, ...fileArray] }));
                  }
                };

                // Remover imagem específica
                const removeImage = (index: number) => {
                  setForm(prev => ({
                    ...prev,
                    images: prev.images.filter((_, i) => i !== index)
                  }));
                };

                return (
                  <>
                    <Modal open={showModal} onDismiss={closeModal}>
                      <Modal.Header>
                        <Text fontWeight="bold">Adicionar Produto</Text>
                      </Modal.Header>
                      <form onSubmit={handleSubmit}>
                        <Modal.Body>
                          <Box display="flex" flexDirection="column" gap="4">
                            <Box>
                              <Text fontWeight="medium">Nome</Text>
                              <Input
                                name="name"
                                value={form.name}
                                onChange={handleFormChange}
                                required
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Preço</Text>
                              <Input
                                name="price"
                                value={form.price}
                                onChange={handleFormChange}
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                                required
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Ciclo de cobrança</Text>
                              <select
                                name="cycle"
                                value={form.cycle}
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                              >
                                <option value="WEEKLY">Semanal</option>
                                <option value="BIWEEKLY">Quinzenal</option>
                                <option value="MONTHLY">Mensal</option>
                                <option value="BIMONTHLY">Bimestral</option>
                                <option value="QUARTERLY">Trimestral</option>
                                <option value="SEMIANNUALLY">Semestral</option>
                                <option value="YEARLY">Anual</option>
                              </select>
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Preço de Assinatura</Text>
                              <Input
                                name="subscription_price"
                                value={form.subscription_price}
                                onChange={handleFormChange}
                                type="number"
                                min="0"
                                step="0.01"
                                inputMode="decimal"
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">SKU</Text>
                              <Input
                                name="sku"
                                value={form.sku}
                                onChange={handleFormChange}
                                placeholder="SKU do produto"
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Código de Barras</Text>
                              <Input
                                name="barcode"
                                value={form.barcode}
                                onChange={handleFormChange}
                                placeholder="Código de barras"
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Peso (em gramas)</Text>
                              <Input
                                name="weight"
                                value={form.weight}
                                onChange={handleFormChange}
                                type="number"
                                min="0"
                                placeholder="Peso em gramas"
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Estoque</Text>
                              <Input
                                name="stock"
                                value={form.stock}
                                onChange={handleFormChange}
                                type="number"
                                min="0"
                                placeholder="Quantidade em estoque"
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Status</Text>
                              <select
                                name="status"
                                value={form.status}
                                onChange={handleFormChange}
                                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
                              >
                                <option value="active">Ativo</option>
                                <option value="inactive">Inativo</option>
                                <option value="draft">Rascunho</option>
                              </select>
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Descrição</Text>
                              <textarea
                                name="description"
                                value={form.description}
                                onChange={handleFormChange}
                                rows={3}
                                style={{ width: '100%', padding: 8, borderRadius: 4, border: '1px solid #ccc', resize: 'vertical' }}
                              />
                            </Box>

                            <Box>
                              <Text fontWeight="medium">Imagens do Produto</Text>
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
                              {form.images.length > 0 && (
                                <Box marginTop="2">
                                  <Box marginBottom="1">
                                    <Text fontSize="caption" fontWeight="medium">
                                      Imagens selecionadas ({form.images.length}):
                                    </Text>
                                  </Box>
                                  {form.images.map((file, index) => (
                                    <Box
                                      key={index}
                                      display="flex"
                                      justifyContent="space-between"
                                      alignItems="center"
                                      padding="2"
                                      backgroundColor="neutral-surface"
                                      borderRadius="4"
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
                        </Modal.Body>
                        <Modal.Footer>
                          <Button appearance="primary" type="submit" disabled={isLoading}>
                            {isLoading ? 'Salvando...' : 'Salvar'}
                          </Button>
                          <Button appearance="neutral" onClick={closeModal} type="button">
                            Cancelar
                          </Button>
                        </Modal.Footer>
                      </form>
                    </Modal>
                    <Responsive
                      mobileContent={
                        <ListMobile
                          products={products}
                          onDeleteProduct={onDeleteProduct}
                          onSyncProduct={onSyncProduct}
                          onEditProduct={onEditProduct}
                          isLoading={isLoading}
                        />
                      }
                      desktopContent={
                        <>
                          <ListDesktop
                            products={productsPaginated}
                            onDeleteProduct={onDeleteProduct}
                            onSyncProduct={onSyncProduct}
                            onEditProduct={onEditProduct}
                            isLoading={isLoading}
                          />
                          {!isLoading && (
                            <Box
                              display="flex"
                              alignItems="center"
                              justifyContent="space-between"
                            >
                              <Text>
                                Mostrando <strong>1</strong> -{' '}
                                <strong>{Math.min(PAGE_SIZE, total)}</strong> elementos de{' '}
                                <strong>{total}</strong>
                              </Text>
                              <Pagination
                                activePage={currentPage}
                                onPageChange={handlePageChange}
                                pageCount={Math.max(1, Math.ceil(total / PAGE_SIZE))}
                              />
                            </Box>
                          )}
                        </>
                      }
                    />
                  </>
                );
              }}
            </ProductsDataProvider>
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );
};

export default Products;
