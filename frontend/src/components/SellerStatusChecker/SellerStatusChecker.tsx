import React, { useState } from 'react';
import { Box, Text, Modal, Button, Input } from '@nimbus-ds/components';
import { useSellerStatus } from '@/hooks/useSellerStatus';

const SellerStatusChecker: React.FC = () => {
  const { 
    sellerStatus, 
    isLoading, 
    needsDocuments, 
    completeSellerDocuments 
  } = useSellerStatus();
  
  const [showModal, setShowModal] = useState<boolean>(false);
  const [cpfCnpj, setCpfCnpj] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Mostrar o modal automaticamente quando precisar de documentos
  React.useEffect(() => {
    if (needsDocuments && !isLoading) {
      console.log('🔍 Seller precisa completar documentos, mostrando modal');
      setShowModal(true);
    }
  }, [needsDocuments, isLoading]);

  const handleSubmit = async () => {
    if (!cpfCnpj.trim()) {
      console.log('❌ CPF/CNPJ não informado');
      return;
    }

    setSubmitting(true);
    
    console.log('📝 Enviando dados para completar:', { cpfCnpj });
    
    const success = await completeSellerDocuments({ cpfCnpj });
    
    if (success) {
      setShowModal(false);
      setCpfCnpj('');
      console.log('✅ Documentos completados com sucesso');
    }
    
    setSubmitting(false);
  };

  const handleClose = () => {
    setShowModal(false);
    setCpfCnpj('');
  };

  // Debug logs
  React.useEffect(() => {
    console.log('🔍 SellerStatusChecker - Status atual:', {
      sellerStatus,
      isLoading,
      needsDocuments,
      showModal
    });
  }, [sellerStatus, isLoading, needsDocuments, showModal]);

  return (
    <>
      {showModal && (
        <Modal open={showModal} onDismiss={handleClose}>
          <Modal.Header>
            <Text fontWeight="bold">Completar Informações do Seller</Text>
          </Modal.Header>
          <Modal.Body>
            <Box display="flex" flexDirection="column" gap="3">
              <Text>
                {sellerStatus?.message || 
                 'É necessário completar as informações do seller para continuar.'}
              </Text>
              
              <Box display="flex" flexDirection="column" gap="2">
                <Text fontWeight="medium">Status atual:</Text>
                <Box 
                  padding="2" 
                  backgroundColor="neutral-surface" 
                  borderRadius="1"
                >
                  <Text>
                    {sellerStatus?.status || 'Unknown'}
                  </Text>
                </Box>
              </Box>
              
              <Box display="flex" flexDirection="column" gap="2">
                <Text fontWeight="medium">Informe o CPF ou CNPJ:</Text>
                <Input
                  placeholder="Digite o CPF ou CNPJ (somente números)"
                  value={cpfCnpj}
                  onChange={(e) => setCpfCnpj(e.target.value)}
                  disabled={submitting}
                />
                <Text fontSize="caption" color="neutral-textLow">
                  Debug: Este campo será enviado para a API para completar os documentos do seller.
                </Text>
              </Box>
            </Box>
          </Modal.Body>
          <Modal.Footer>
            <Button 
              appearance="primary" 
              onClick={handleSubmit}
              disabled={submitting || !cpfCnpj.trim()}
            >
              {submitting ? 'Enviando...' : 'Completar Documentos'}
            </Button>
            <Button 
              appearance="neutral" 
              onClick={handleClose}
              disabled={submitting}
            >
              Fechar
            </Button>
          </Modal.Footer>
        </Modal>
      )}
      
      {/* Debug info - remover em produção */}
      {process.env.NODE_ENV === 'development' && (
        <Box 
          position="fixed" 
          bottom="0" 
          right="0" 
          backgroundColor="neutral-surface" 
          padding="2"
          borderRadius="1"
          margin="2"
        >
          <Text fontWeight="bold" fontSize="caption">Debug - Seller Status:</Text>
          <Text fontSize="caption">Status: {sellerStatus?.status || 'Loading...'}</Text>
          <Text fontSize="caption">Needs Docs: {needsDocuments ? 'Yes' : 'No'}</Text>
          <Text fontSize="caption">Loading: {isLoading ? 'Yes' : 'No'}</Text>
        </Box>
      )}
    </>
  );
};

export default SellerStatusChecker;
