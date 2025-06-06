import React from 'react';
import { useTranslation } from 'react-i18next';
import { navigateHeader } from '@tiendanube/nexo';
import { Box, Card, Text, Tag, Spinner, Button } from '@nimbus-ds/components';
import { Layout, Page } from '@nimbus-ds/patterns';
import { nexo } from '@/app';

import { Responsive } from '@/components';
import PaymentMethodsDataProvider from './PaymentMethodsDataProvider';
import { PAYMENT_METHOD_LABELS } from './payment-methods.definitions';
import { IPaymentMethod } from './payment-methods.types';

const PaymentMethods: React.FC = () => {
  const { t } = useTranslation('translations');

  React.useEffect(() => {
    navigateHeader(nexo, { goTo: '/', text: 'Voltar ao início' });
  }, []);

  const getPaymentMethodLabel = (method: string): string => {
    switch (method) {
      case 'credit_card':
        return PAYMENT_METHOD_LABELS.CREDIT_CARD;
      case 'pix':
        return PAYMENT_METHOD_LABELS.PIX;
      case 'boleto':
        return PAYMENT_METHOD_LABELS.BOLETO;
      default:
        return PAYMENT_METHOD_LABELS.unknown;
    }
  };

  const renderPaymentMethodCard = (
    paymentMethod: IPaymentMethod,
    isLoading: boolean,
    onToggle: (method: string, enabled: boolean) => Promise<void>
  ) => (
    <Card padding="base" key={paymentMethod.method}>
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Box>
          <Box marginBottom="2">
            <Text fontWeight="bold">
              {getPaymentMethodLabel(paymentMethod.method)}
            </Text>
          </Box>
          <Text color="neutral-textLow" fontSize="caption">
            {t(`payment_methods.${paymentMethod.method}_description`)}
          </Text>
        </Box>
        <Box display="flex" flexDirection="column" alignItems="flex-end" gap="2">
          <Tag 
            appearance={paymentMethod.enabled ? "success" : "neutral"}
          >
            {paymentMethod.enabled 
              ? t('payment_methods.enabled') 
              : t('payment_methods.disabled')}
          </Tag>
          <Button
            appearance={paymentMethod.enabled ? "danger" : "primary"}
            disabled={isLoading}
            onClick={() => onToggle(paymentMethod.method, !paymentMethod.enabled)}
          >
            {paymentMethod.enabled 
              ? t('payment_methods.disable') 
              : t('payment_methods.enable')}
          </Button>
        </Box>
      </Box>
    </Card>
  );

  const renderDesktopView = () => (
    <Page maxWidth="1200px">
      <Page.Header title={t('payment_methods.title')} />
      <Page.Body>
        <Layout columns="1">
          <Layout.Section>
            <Box marginBottom="5">
              <Text color="neutral-textLow">
                {t('payment_methods.subtitle')}
              </Text>
            </Box>

            <PaymentMethodsDataProvider>
              {({ paymentMethods, isLoading, onTogglePaymentMethod }) => (
                isLoading && paymentMethods.length === 0 ? (
                  <Box display="flex" justifyContent="center" marginY="6">
                    <Spinner size="medium" />
                  </Box>
                ) : (
                  <Box display="flex" flexDirection="column" gap="4">
                    {paymentMethods.map((method) => (
                      renderPaymentMethodCard(method, isLoading, onTogglePaymentMethod)
                    ))}
                  </Box>
                )
              )}
            </PaymentMethodsDataProvider>
          </Layout.Section>
        </Layout>
      </Page.Body>
    </Page>
  );

  const renderMobileView = () => (
    <Page>
      <Page.Header title={t('payment_methods.title')} />
      <Page.Body px="4">
        <Box marginBottom="4">
          <Text color="neutral-textLow">
            {t('payment_methods.subtitle')}
          </Text>
        </Box>

        <PaymentMethodsDataProvider>
          {({ paymentMethods, isLoading, onTogglePaymentMethod }) => (
            isLoading && paymentMethods.length === 0 ? (
              <Box display="flex" justifyContent="center" marginY="6">
                <Spinner size="medium" />
              </Box>
            ) : (
              <Box display="flex" flexDirection="column" gap="3">
                {paymentMethods.map((method) => (
                  renderPaymentMethodCard(method, isLoading, onTogglePaymentMethod)
                ))}
              </Box>
            )
          )}
        </PaymentMethodsDataProvider>
      </Page.Body>
    </Page>
  );

  return (
    <Responsive
      mobileContent={renderMobileView()}
      desktopContent={renderDesktopView()}
    />
  );
};

export default PaymentMethods;
