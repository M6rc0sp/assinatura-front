import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Card, Icon, Text, Modal, Box } from '@nimbus-ds/components';
import { TrashIcon, EyeIcon, InfoCircleIcon } from '@nimbus-ds/icons';
import { IShopper } from '../../shoppers.types';

type Props = {
  shoppers: IShopper[];
  onDeleteShopper: (shopperId: number) => void;
};

const ListMobile: React.FC<Props> = ({ shoppers, onDeleteShopper }) => {
  const { t } = useTranslation('translations');
  const navigate = useNavigate();
  const [selectedShopper, setSelectedShopper] = useState<IShopper | null>(null);

  const handleViewSubscriptions = (shopperId: number) => {
    navigate(`/shoppers/${shopperId}/subscriptions`);
  };
  
  const handleViewDetails = (shopper: IShopper) => {
    setSelectedShopper(shopper);
  };
  
  const handleCloseModal = () => {
    setSelectedShopper(null);
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
        <Card key={shopper.id} style={{marginBottom: "16px"}}>
          <Card.Header>
            <Text fontWeight="bold">{shopper.name}</Text>
          </Card.Header>
          <Card.Body>
            <Text>{shopper.email}</Text>
            <Text>{shopper.document}</Text>
          </Card.Body>
          <Card.Footer>
            <div style={{display: "flex", gap: "8px"}}>
              <Button 
                appearance="neutral"
                onClick={() => handleViewSubscriptions(shopper.id)}
              >
                <Icon source={<EyeIcon size={16} />} color="primary-interactive" />
                Assinaturas
              </Button>
              <Button
                appearance="neutral"
                onClick={() => handleViewDetails(shopper)}
              >
                <Icon source={<InfoCircleIcon size={16} />} color="primary-interactive" />
                Detalhes
              </Button>
              <Button
                appearance="danger"
                onClick={() => onDeleteShopper(shopper.id)}
              >
                <Icon source={<TrashIcon size={16} />} color="danger-interactive" />
                {t('shoppers.remove')}
              </Button>
            </div>
          </Card.Footer>
        </Card>
      ))}
      {selectedShopper && (
        <Modal open={!!selectedShopper} onDismiss={handleCloseModal}>
          <Modal.Header>
            <Text fontWeight="bold">Detalhes do Cliente</Text>
          </Modal.Header>
          <Modal.Body>
            <Box display="flex" flexDirection="column" gap="3">
              <Box display="flex" flexDirection="column" gap="1" padding="2" backgroundColor="neutral-background" borderRadius="4">
                <Text fontWeight="bold" fontSize="highlight">Dados Pessoais</Text>
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">Nome Completo:</Text>
                  <Text>{selectedShopper.name || 'Não informado'}</Text>
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">Email:</Text>
                  <Text>{selectedShopper.email || 'Não informado'}</Text>
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">CPF/CNPJ:</Text>
                  <Text>{(selectedShopper as any)?.user?.userData?.cpfCnpj || 'Não informado'}</Text>
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">Data de Nascimento:</Text>
                  <Text>{(selectedShopper as any)?.user?.userData?.birthDate ? new Date((selectedShopper as any).user.userData.birthDate).toLocaleDateString('pt-BR') : 'Não informado'}</Text>
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">Telefone:</Text>
                  <Text>{(selectedShopper as any)?.user?.userData?.mobilePhone || 'Não informado'}</Text>
                </Box>
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1" padding="2" backgroundColor="neutral-background" borderRadius="4">
                <Text fontWeight="bold" fontSize="highlight">Endereço</Text>
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">Logradouro:</Text>
                  <Text>{(selectedShopper as any)?.user?.userData?.address || 'Não informado'}</Text>
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">Número:</Text>
                  <Text>{(selectedShopper as any)?.user?.userData?.addressNumber || 'Não informado'}</Text>
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">CEP:</Text>
                  <Text>{(selectedShopper as any)?.user?.userData?.postalCode || 'Não informado'}</Text>
                </Box>
                
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">Região/Bairro:</Text>
                  <Text>{(selectedShopper as any)?.user?.userData?.province || 'Não informado'}</Text>
                </Box>
              </Box>
              
              <Box display="flex" flexDirection="column" gap="1" padding="2" backgroundColor="neutral-background" borderRadius="4">
                <Text fontWeight="bold" fontSize="highlight">Informações do Sistema</Text>
                <Box display="flex" flexDirection="column" gap="1">
                  <Text fontWeight="bold">ID no Sistema:</Text>
                  <Text>{selectedShopper.id}</Text>
                </Box>
                
                {selectedShopper.nuvemshop_id && (
                  <Box display="flex" flexDirection="column" gap="1">
                    <Text fontWeight="bold">ID na Nuvemshop:</Text>
                    <Text>{selectedShopper.nuvemshop_id}</Text>
                  </Box>
                )}
                
                {(selectedShopper as any).payments_customer_id && (
                  <Box display="flex" flexDirection="column" gap="1">
                    <Text fontWeight="bold">ID de Pagamento:</Text>
                    <Text>{(selectedShopper as any).payments_customer_id}</Text>
                  </Box>
                )}
                
                {(selectedShopper as any).payments_status && (
                  <Box display="flex" flexDirection="column" gap="1">
                    <Text fontWeight="bold">Status de Pagamento:</Text>
                    <Text>{(selectedShopper as any).payments_status}</Text>
                  </Box>
                )}
              </Box>
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button appearance="neutral" onClick={handleCloseModal}>
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
    </>
  );
};

export default ListMobile;