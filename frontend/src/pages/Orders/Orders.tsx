import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation, useNavigate } from 'react-router-dom';
import { navigateHeader } from '@tiendanube/nexo';
import { Layout, Page } from '@nimbus-ds/patterns';
import { Box, Pagination, Text, Spinner, Button, Icon } from '@nimbus-ds/components';
import { ArrowLeftIcon } from '@nimbus-ds/icons';

import { Responsive } from '@/components';
import { nexo } from '@/app';
import { ListDesktop, ListMobile } from './components';
import { PAGE_SIZE } from './orders.definitions';
import OrdersDataProvider from './OrdersDataProvider';

const Orders: React.FC = () => {
  const { t } = useTranslation('translations');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);
  const subscriptionId = queryParams.get('subscription');
  
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };

  const handleBackToSubscriptions = () => {
    navigate('/subscriptions');
  };
  
  useEffect(() => {
    // Configura o header com base no contexto
    if (subscriptionId) {
      navigateHeader(nexo, { goTo: "/subscriptions", text: "Voltar para assinaturas" });
    } else {
      navigateHeader(nexo, { goTo: "/", text: "Voltar ao início" });
    }
  }, [subscriptionId]);

  const pageTitle = subscriptionId 
    ? `Pedido da Assinatura #${subscriptionId}` 
    : "Pedidos";

  return (
    <Page
      maxWidth="1200px"
      minHeight={{
        xs: 'calc(100vh - 65px)',
        md: 'calc(100vh - 66px)',
        lg: 'calc(100vh - 66px)',
      }}
    >
      <Page.Header title={pageTitle}>
        {subscriptionId && (
          <Button 
            appearance="default" 
            onClick={handleBackToSubscriptions}
          >
            <Icon source={<ArrowLeftIcon size={16} />} color="currentColor" />
            <Box marginLeft="2">Voltar para assinaturas</Box>
          </Button>
        )}
      </Page.Header>
      <Page.Body px={{ xs: 'none', md: '6' }}>
        <Layout columns="1">
          <Layout.Section>
            <OrdersDataProvider subscriptionId={subscriptionId}>
              {({ orders, isLoading, onReload }) => {
                const total = orders.length;
                const ordersPaginated = orders.slice(
                  currentPage === 1 ? 0 : (currentPage - 1) * PAGE_SIZE,
                  (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
                );

                return (
                  <>
                    {isLoading ? (
                      <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                        <Spinner size="large" />
                      </Box>
                    ) : (
                      <Responsive
                        mobileContent={
                          <ListMobile 
                            orders={orders} 
                            isLoading={isLoading} 
                            onReload={onReload} 
                          />
                        }
                        desktopContent={
                          <>
                            <ListDesktop 
                              orders={ordersPaginated} 
                              isLoading={isLoading} 
                              onReload={onReload} 
                            />
                            {total > 0 && !subscriptionId && (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                marginTop="4"
                              >
                                <Text>
                                  Mostrando <strong>{(currentPage - 1) * PAGE_SIZE + 1}</strong> -{' '}
                                  <strong>{Math.min(currentPage * PAGE_SIZE, total)}</strong> elementos de{' '}
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
                    )}
                  </>
                );
              }}
            </OrdersDataProvider>
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );
};

export default Orders;
