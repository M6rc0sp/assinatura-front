import React, { useEffect, useState } from 'react';
import { useToast } from '@nimbus-ds/components';
import { useFetch } from '@/hooks';
import { IProduct, IProductsDataProvider } from './products.types';
import { useSellerId } from '@/hooks/useSellerId/useSellerId';

const ProductsDataProvider: React.FC<IProductsDataProvider> = ({
  children,
}) => {
  const { addToast } = useToast();
  const { request } = useFetch();
  const [products, setProduts] = useState<IProduct[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const sellerId = useSellerId();

  // Função para verificar se a resposta é HTML
  const isHtmlResponse = (content: any): boolean => {
    if (typeof content === 'string' && 
       (content.trim().startsWith('<!DOCTYPE') || 
        content.trim().startsWith('<html'))) {
      return true;
    }
    return false;
  };

  const onGetProducts = () => {
    if (!sellerId) return;
    
    setIsLoading(true);
    request({
      url: `/app/seller/${sellerId}/products`, // Nova rota com seller_id (singular)
      method: 'GET',
    })
      .then((response: any) => {
        // Verificando se a resposta é HTML em vez de JSON
        if (isHtmlResponse(response.content)) {
          console.error('API retornou HTML em vez de JSON:', (response.content as string).substring(0, 100) + '...');
          setProduts([]);
          addToast({
            type: 'danger',
            text: 'Erro de comunicação com o servidor. Verifique se a API está ativa.',
            duration: 4000,
            id: 'error-products-html',
          });
          return;
        }
        
        // Verificando o formato da resposta e extraindo o array de produtos
        console.log('API Response:', response);
        
        // Caso a resposta esteja no formato { success: true, data: [...] }
        if (response.content && response.content.data && Array.isArray(response.content.data)) {
          setProduts(response.content.data);
        }
        // Caso a resposta seja diretamente o array 
        else if (Array.isArray(response.content)) {
          setProduts(response.content);
        }
        // Se a resposta não estiver em nenhum formato esperado
        else {
          console.error('Formato de resposta inesperado:', response);
          setProduts([]);
          addToast({
            type: 'danger',
            text: 'Formato de dados inesperado ao carregar produtos',
            duration: 4000,
            id: 'error-products-format',
          });
        }
      })
      .catch((error) => {
        console.error('Erro ao buscar produtos:', error);
        addToast({
          type: 'danger',
          text: error.message?.description ?? error.message ?? 'Erro ao buscar produtos',
          duration: 4000,
          id: 'error-products',
        });
        setProduts([]);
      })
      .finally(() => {
        setIsLoading(false);
      });
  };

  useEffect(() => {
    if (sellerId) onGetProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sellerId]);

  const onDeleteProduct = (productId: number) => {
    request({
      url: `/app/seller/${sellerId}/products/${productId}`,
      method: 'DELETE',
    })
      .then(() => {
        onGetProducts();
        addToast({
          type: 'success',
          text: 'Produto deletado com sucesso',
          duration: 4000,
          id: 'delete-product',
        });
      })
      .catch((error) => {
        addToast({
          type: 'danger',
          text: error.message?.description ?? error.message ?? 'Erro ao excluir produto',
          duration: 4000,
          id: 'error-delete-product',
        });
      });
  };

  return children({ products, onDeleteProduct, isLoading });
};

export default ProductsDataProvider;
