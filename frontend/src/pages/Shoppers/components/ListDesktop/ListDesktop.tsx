import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Table, Icon, Text, Box } from '@nimbus-ds/components';
import { TrashIcon, EyeIcon } from '@nimbus-ds/icons';
import { IShopper } from '../../shoppers.types';

type Props = {
  shoppers: IShopper[];
  onDeleteShopper: (shopperId: number) => void;
  isLoading?: boolean;
};

const ListDesktop: React.FC<Props> = ({ shoppers, onDeleteShopper, isLoading }) => {
  const { t } = useTranslation('translations');
  const navigate = useNavigate();

  const handleViewSubscriptions = (shopperId: number) => {
    navigate(`/shoppers/${shopperId}/subscriptions`);
  };

  if (isLoading) {
    return (
      <Table>
        <Table.Head>
          <Table.Row>
            <Table.Cell>{t('shoppers.name')}</Table.Cell>
            <Table.Cell>{t('shoppers.email')}</Table.Cell>
            <Table.Cell>{t('shoppers.document')}</Table.Cell>
            <Table.Cell>Ações</Table.Cell>
          </Table.Row>
        </Table.Head>
        <Table.Body>
          <Table.Row>
            <Table.Cell>
              <Text textAlign="center">Carregando...</Text>
            </Table.Cell>
            <Table.Cell>
              <></>
            </Table.Cell>
            <Table.Cell>
              <></>
            </Table.Cell>
            <Table.Cell>
              <></>
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
          <Table.Cell>{t('shoppers.name')}</Table.Cell>
          <Table.Cell>{t('shoppers.email')}</Table.Cell>
          <Table.Cell>{t('shoppers.document')}</Table.Cell>
          <Table.Cell>Ações</Table.Cell>
        </Table.Row>
      </Table.Head>
      <Table.Body>
        {(!shoppers || shoppers.length === 0) && (
          <Table.Row>
            <Table.Cell>
              <div
                style={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                  padding: '1rem',
                }}
              >
                {t('shoppers.no-content')}
              </div>
            </Table.Cell>
            <Table.Cell>
              <></>
            </Table.Cell>
            <Table.Cell>
              <></>
            </Table.Cell>
            <Table.Cell>
              <></>
            </Table.Cell>
          </Table.Row>
        )}
        {shoppers && shoppers.length > 0 && shoppers.map((shopper) => (
          <Table.Row key={shopper.id}>
            <Table.Cell>{shopper.name || 'Sem nome'}</Table.Cell>
            <Table.Cell>{shopper.email || 'Sem email'}</Table.Cell>
            <Table.Cell>{(shopper as any).document || shopper.nuvemshop_id || 'Não disponível'}</Table.Cell>
            <Table.Cell>
              <Box display="flex" gap="2">
                <Button
                  appearance="primary"
                  onClick={() => handleViewSubscriptions(shopper.id)}
                >
                  <Icon source={<EyeIcon size={16} />} color="currentColor" />
                </Button>
                <Button
                  appearance="danger"
                  onClick={() => onDeleteShopper(shopper.id)}
                >
                  <Icon source={<TrashIcon size={16} />} color="currentColor" />
                </Button>
              </Box>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table>
  );
};

export default ListDesktop;