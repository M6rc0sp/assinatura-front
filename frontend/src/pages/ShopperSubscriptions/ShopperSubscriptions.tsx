import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { navigateHeader } from '@tiendanube/nexo';
import { Layout, Page } from '@nimbus-ds/patterns';
import { Box, Pagination, Text, Spinner } from '@nimbus-ds/components';

import { Responsive } from '@/components';
import { nexo } from '@/app';
import { ListDesktop, ListMobile } from './components';
import { PAGE_SIZE } from './subscriptions.definitions';
import SubscriptionsDataProvider from './SubscriptionsDataProvider';

const ShopperSubscriptions: React.FC = () => {
  const { shopperId } = useParams();
  const [currentPage, setCurrentPage] = useState<number>(1);
  
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };
  
  useEffect(() => {
    // Se estamos visualizando assinaturas de um cliente específico
    if (shopperId) {
      navigateHeader(nexo, { goTo: '/shoppers', text: 'Voltar para clientes' });
    } else {
      // Caso contrário, estamos vendo todas as assinaturas
      navigateHeader(nexo, { goTo: '/', text: 'Voltar ao início' });
    }
  }, [shopperId]);

  return (
    <Page
      maxWidth="1200px"
      minHeight={{
        xs: 'calc(100vh - 65px)',
        md: 'calc(100vh - 66px)',
        lg: 'calc(100vh - 66px)',
      }}
    >
      <SubscriptionsDataProvider>
        {({ subscriptions, shopper, isLoading, onCancelSubscription }) => {
          const title = shopper ? `Assinaturas de ${shopper.name}` : 'Todas as Assinaturas';
          const total = subscriptions.length;
          const subscriptionsPaginated = subscriptions.slice(
            currentPage === 1 ? 0 : (currentPage - 1) * PAGE_SIZE,
            (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
          );

          return (
            <>
              <Page.Header title={title} />
              <Page.Body px={{ xs: 'none', md: '6' }}>
                {isLoading ? (
                  <Box display="flex" justifyContent="center" alignItems="center" height="200px">
                    <Spinner size="large" />
                  </Box>
                ) : (
                  <Layout columns="1">
                    <Layout.Section>
                      <Responsive
                        mobileContent={
                          <ListMobile
                            subscriptions={subscriptions}
                            onCancelSubscription={onCancelSubscription}
                          />
                        }
                        desktopContent={
                          <>
                            <ListDesktop
                              subscriptions={subscriptionsPaginated}
                              onCancelSubscription={onCancelSubscription}
                            />
                            {total > 0 && (
                              <Box
                                display="flex"
                                alignItems="center"
                                justifyContent="space-between"
                                marginTop="4"
                              >
                                <Text>
                                  Mostrando <strong>1</strong> -{' '}
                                  <strong>{Math.min(PAGE_SIZE, total)}</strong> elementos de{' '}
                                  <strong>{total}</strong>
                                </Text>
                                <Pagination
                                  activePage={currentPage}
                                  onPageChange={handlePageChange}
                                  pageCount={Math.ceil(total / PAGE_SIZE)}
                                />
                              </Box>
                            )}
                          </>
                        }
                      />
                    </Layout.Section>
                  </Layout>
                )}
              </Page.Body>
            </>
          );
        }}
      </SubscriptionsDataProvider>
    </Page>
  );
};

export default ShopperSubscriptions;