import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Button, Table, Icon, Text, Box, Modal } from '@nimbus-ds/components';
import { TrashIcon, EyeIcon, InfoCircleIcon } from '@nimbus-ds/icons';
import { IShopper } from '../../shoppers.types';

type Props = {
  shoppers: IShopper[];
  onDeleteShopper: (shopperId: number) => void;
  isLoading?: boolean;
};

const ListDesktop: React.FC<Props> = ({ shoppers, onDeleteShopper, isLoading }) => {
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
                <Button
                  appearance="neutral"
                  onClick={() => handleViewDetails(shopper)}
                >
                  <Icon source={<InfoCircleIcon size={16} />} color="currentColor" />
                </Button>
              </Box>
            </Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
      <div style={{ position: 'relative', zIndex: 1000 }}>
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
      </div>
    </Table>
  );
};

export default ListDesktop;