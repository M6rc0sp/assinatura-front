import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { navigateHeader } from '@tiendanube/nexo';
import { Layout, Page } from '@nimbus-ds/patterns';
import { Box, Pagination, Text } from '@nimbus-ds/components';

import { Responsive } from '@/components';
import { nexo } from '@/app';
import { ListDesktop, ListMobile } from './components';
import { PAGE_SIZE } from './shoppers.definitions';
import ShoppersDataProvider from './ShoppersDataProvider';

const Shoppers: React.FC = () => {
  const { t } = useTranslation('translations');
  const [currentPage, setCurrentPage] = useState<number>(1);
  const handlePageChange = (page: number): void => {
    setCurrentPage(page);
  };
  useEffect(() => {
    navigateHeader(nexo, { goTo: '/', text: 'Voltar ao início' });
  }, []);

  return (
    <Page
      maxWidth="1200px"
      minHeight={{
        xs: 'calc(100vh - 65px)',
        md: 'calc(100vh - 66px)',
        lg: 'calc(100vh - 66px)',
      }}
    >
      <Page.Header title={t('shoppers.title')} />
      <Page.Body px={{ xs: 'none', md: '6' }}>
        <Layout columns="1">
          <Layout.Section>
            <ShoppersDataProvider>
              {({ shoppers, onDeleteShopper }) => {
                const total = shoppers.length;
                const shoppersPaginated = shoppers.slice(
                  currentPage === 1 ? 0 : (currentPage - 1) * PAGE_SIZE,
                  (currentPage - 1) * PAGE_SIZE + PAGE_SIZE,
                );

                return (
                  <Responsive
                    mobileContent={
                      <ListMobile
                        shoppers={shoppers}
                        onDeleteShopper={onDeleteShopper}
                      />
                    }
                    desktopContent={
                      <>
                        <ListDesktop
                          shoppers={shoppersPaginated}
                          onDeleteShopper={onDeleteShopper}
                        />
                        <Box
                          display="flex"
                          alignItems="center"
                          justifyContent="space-between"
                        >
                          <Text>
                            Mostrando <strong>1</strong> -{' '}
                            <strong>{PAGE_SIZE}</strong> elementos de{' '}
                            <strong>{total}</strong>
                          </Text>
                          <Pagination
                            activePage={currentPage}
                            onPageChange={handlePageChange}
                            pageCount={Math.ceil(total / PAGE_SIZE)}
                          />
                        </Box>
                      </>
                    }
                  />
                );
              }}
            </ShoppersDataProvider>
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );
};

export default Shoppers;