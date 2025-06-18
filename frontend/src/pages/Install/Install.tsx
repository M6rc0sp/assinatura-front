import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Text, Spinner, Card } from '@nimbus-ds/components';
// Importar o axios diretamente, não o do app que tem configuração do Nexo
import axiosStandard from 'axios';

const Install: React.FC = () => {
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState<string>('Processando instalação...');
  const location = useLocation();
  const navigate = useNavigate();
  
  useEffect(() => {
    const handleInstall = async () => {
      try {
        // Extrair o código da query string
        const searchParams = new URLSearchParams(location.search);
        const code = searchParams.get('code');
        
        if (code) {
          console.log('Iniciando instalação com código:', code);
          setStatus('loading');
          setMessage('Conectando ao servidor de instalação...');
          
          // Fazer a chamada para o endpoint da API diretamente sem o Nexo
          const response = await axiosStandard.get(`https://assinaturas.appns.com.br/api/ns/install?code=${code}`, {
            headers: {
              'Accept': 'application/json',
              'Content-Type': 'application/json'
            }
          });
          console.log('Instalação finalizada:', response);
          
          setStatus('success');
          setMessage('Instalação concluída com sucesso! Redirecionando...');
          
          // Redirecionar para a página inicial após a instalação
          setTimeout(() => {
            navigate('/');
          }, 3000);
        } else {
          console.error('Código de instalação não encontrado');
          setStatus('error');
          setMessage('Erro: Código de instalação não encontrado');
        }
      } catch (error: any) {
        console.error('Erro durante o processo de instalação:', error);
        setStatus('error');
        setMessage(`Erro durante instalação: ${error.message || 'Falha na conexão'}`);
      }
    };
    
    handleInstall();
  }, [location, navigate]);
  
  return (
    <Box
      height="100vh"
      display="flex"
      justifyContent="center"
      alignItems="center"
      padding="4"
      backgroundColor="neutral-surface"
    >
      <Card style={{ maxWidth: '400px', width: '100%' }}>
        <Card.Header title="Instalação do Aplicativo" />
        <Card.Body>
          <Box
            display="flex"
            flexDirection="column"
            alignItems="center"
            gap="4"
            padding="4"
          >
            {status === 'loading' && <Spinner size="medium" />}
            
            <Text
              textAlign="center"
              fontWeight={status === 'error' ? 'bold' : 'regular'}
              color={
                status === 'error' 
                  ? 'danger-dark' 
                  : status === 'success' 
                    ? 'success-dark' 
                    : 'neutral-dark'
              }
            >
              {message}
            </Text>
          </Box>
        </Card.Body>
        {status === 'error' && (
          <Card.Footer>
            <Text
              onClick={() => navigate('/')}
              color="primary"
              style={{ cursor: 'pointer', textDecoration: 'underline', textAlign: 'center', width: '100%' }}
            >
              Voltar à página inicial
            </Text>
          </Card.Footer>
        )}
      </Card>
    </Box>
  );
};

export default Install;
