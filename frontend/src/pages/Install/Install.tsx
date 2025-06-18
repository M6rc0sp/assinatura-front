import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Box, Text, Spinner } from '@nimbus-ds/components';
import axios from '@/app/Axios';

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
          
          // Fazer a chamada para o endpoint da API
          const response = await axios.get(`https://assinaturas.appns.com.br/api/ns/install?code=${code}`);
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
      flexDirection="column"
      justifyContent="center"
      alignItems="center"
      gap="4"
    >
      {status === 'loading' && <Spinner size="medium" />}
      <Text
        fontWeight={status === 'error' ? 'bold' : 'regular'}
        color={status === 'error' ? 'danger-dark' : status === 'success' ? 'success-dark' : 'neutral-dark'}
      >
        {message}
      </Text>
      {status === 'error' && (
        <Box marginTop="4">
          <Text 
            onClick={() => navigate('/')}
            color="primary"
            style={{ cursor: 'pointer', textDecoration: 'underline' }}
          >
            Voltar à página inicial
          </Text>
        </Box>
      )}
    </Box>
  );
};

export default Install;
