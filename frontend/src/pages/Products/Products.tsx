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
  const [form, setForm] = useState({ name: '', price: '', description: '' });

  const openModal = () => setShowModal(true);
  const closeModal = () => {
    setShowModal(false);
    setForm({ name: '', price: '', description: '' });
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
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
              {({ products, onDeleteProduct, onSyncProduct, onCreateProduct, isLoading }) => {
                const total = products.length;
                const productsPaginated = products.slice(
                  currentPage === 1 ? 0 : (currentPage - 1) * PAGE_SIZE,
                  (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
                );

                const handleSubmit = async (e: React.FormEvent) => {
                  e.preventDefault();
                  await onCreateProduct({
                    name: form.name,
                    price: Number(form.price),
                    description: form.description,
                  });
                  setCurrentPage(1);
                  closeModal();
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
                                required
                              />
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
                          isLoading={isLoading}
                        />
                      }
                      desktopContent={
                        <>
                          <ListDesktop
                            products={productsPaginated}
                            onDeleteProduct={onDeleteProduct}
                            onSyncProduct={onSyncProduct}
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
