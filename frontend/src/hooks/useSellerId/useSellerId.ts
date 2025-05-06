import { useState, useEffect } from 'react';
import { getSessionToken } from '@tiendanube/nexo';
import nexo from '@/app/NexoClient';
import useFetch from '@/hooks/useFetch/useFetch';

function parseJwt(token: string): any {
  try {
    const base64Url = token.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    return JSON.parse(decodeURIComponent(window.atob(base64)));
  } catch {
    return {};
  }
}

export interface SellerResponse {
  seller_id: string;
  [key: string]: any;
}

export function useSellerId(): string | undefined {
  const [sellerId, setSellerId] = useState<string>();
  const { request } = useFetch();

  useEffect(() => {
    async function fetchSellerId() {
      try {
        const token = await getSessionToken(nexo);
        const payload = parseJwt(token);
        const storeId = payload.storeId || payload.store_id || payload.iss;
        console.log('Payload:', payload);
        console.log('Store ID:', storeId);
        if (storeId) {
          const response = await request<SellerResponse>({
            url: `/app/seller/store/${storeId}`,
            method: 'GET',
          });
          const content = response.content as SellerResponse;
          const data = (content as any).data;
          if (data && data.id) {
            setSellerId(data.id.toString());
          } else {
            setSellerId(undefined); // Não encontrou seller_id
          }
        } else {
          setSellerId(undefined);
          console.error('Store ID not found in payload:', payload);
        }
      } catch {
        setSellerId(undefined);
        console.error('Error fetching seller ID');
      }
    }
    fetchSellerId();
  }, []);

  return sellerId;
}
