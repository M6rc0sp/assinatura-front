import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Page } from '@nimbus-ds/patterns';
import { Card, Text, Button, Box } from '@nimbus-ds/components';

const Home: React.FC = () => {
  const navigate = useNavigate();

  return (
    <Page maxWidth="800px">
      <Page.Header title="App de Assinaturas" />
      <Page.Body>
        <Box marginTop="4">
          <Card>
            <Card.Header title="Navegação" />
            <Card.Body>
              <Text>Utilize os botões abaixo para navegar no aplicativo.</Text>
            </Card.Body>
            <Card.Footer>
              <Button onClick={() => navigate('/products')}>Produtos</Button>
              <Button onClick={() => navigate('/shoppers')}>Clientes</Button>
              <Button onClick={() => navigate('/subscriptions')}>Assinaturas</Button>
              <Button onClick={() => navigate('/orders')}>Pedidos</Button>
              <Button onClick={() => navigate('/payment-methods')}>Métodos de Pagamento</Button>
            </Card.Footer>
          </Card>
        </Box>
      </Page.Body>
    </Page>
  );
};

export default Home;
