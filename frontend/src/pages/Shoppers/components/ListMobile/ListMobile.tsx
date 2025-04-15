import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Icon, Text } from '@nimbus-ds/components';
import { TrashIcon, EyeIcon } from '@nimbus-ds/icons';
import { IShopper } from '../../shoppers.types';

type Props = {
  shoppers: IShopper[];
  onDeleteShopper: (shopperId: number) => void;
};

const ListMobile: React.FC<Props> = ({ shoppers, onDeleteShopper }) => {
  const { t } = useTranslation('translations');
  const navigate = useNavigate();

  const handleViewSubscriptions = (shopperId: number) => {
    navigate(`/shoppers/${shopperId}/subscriptions`);
  };

  if (shoppers.length === 0) {
    return (
      <Card>
        <Card.Body>
          <Text>{t('shoppers.no-content')}</Text>
        </Card.Body>
      </Card>
    );
  }

  return (
    <>
      {shoppers.map((shopper) => (
        <Card key={shopper.id} marginBottom="4">
          <Card.Header>
            <Text fontWeight="bold">{shopper.name}</Text>
          </Card.Header>
          <Card.Body>
            <Text>{shopper.email}</Text>
            <Text>{shopper.document}</Text>
          </Card.Body>
          <Card.Footer>
            <Button.Group>
              <Button 
                appearance="default"
                size="small"
                onClick={() => handleViewSubscriptions(shopper.id)}
              >
                <Icon source={<EyeIcon size={16} />} color="primary" />
                Assinaturas
              </Button>
              <Button
                appearance="danger"
                size="small"
                onClick={() => onDeleteShopper(shopper.id)}
              >
                <Icon source={<TrashIcon size={16} />} color="danger" />
                {t('shoppers.remove')}
              </Button>
            </Button.Group>
          </Card.Footer>
        </Card>
      ))}
    </>
  );
};

export default ListMobile;