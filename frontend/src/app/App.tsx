import React, { useEffect, useState } from 'react';
import { BrowserRouter, useLocation } from 'react-router-dom';
import { Box, Text, ToastProvider } from '@nimbus-ds/components';
import { ErrorBoundary, connect, iAmReady } from '@tiendanube/nexo';
import Router from '@/app/Router';

import nexo from './NexoClient';
import NexoSyncRoute from './NexoSyncRoute';
import { DarkModeProvider } from './DarkModeProvider';
import { Install } from '@/pages';
import './I18n';

// Componente para verificar se estamos na rota de instalação
const AppContent: React.FC = () => {
  const [isConnect, setIsConnect] = useState(false);
  const location = useLocation();

  // Verificar se estamos na rota de instalação
  const isInstallRoute = location.pathname === '/ns/install';

  useEffect(() => {
    // Só conectar ao Nexo se não estivermos na rota de instalação
    if (!isConnect && !isInstallRoute) {
      connect(nexo)
        .then(async () => {
          setIsConnect(true);
          iAmReady(nexo);
        })
        .catch(() => {
          setIsConnect(false);
        });
    }
  }, [isConnect, isInstallRoute]);

  // Se estivermos na rota de instalação, renderizar diretamente o componente Install
  if (isInstallRoute) {
    return <Install />;
  }

  // Aguardar conexão com o Nexo para rotas normais
  if (!isConnect)
    return (
      <Box
        height="100vh"
        display="flex"
        justifyContent="center"
        alignItems="center"
      >
        <Text>Conectando...</Text>
      </Box>
    );

  return (
    <ErrorBoundary nexo={nexo}>
      <NexoSyncRoute>
        <Router />
      </NexoSyncRoute>
    </ErrorBoundary>
  );
};

const App: React.FC = () => {
  return (
    <DarkModeProvider>
      <ToastProvider>
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </ToastProvider>
    </DarkModeProvider>
  );
};

export default App;
