import React from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { Examples, Home, Products, Shoppers, ShopperSubscriptions, Orders } from '@/pages';

const Router: React.FC = () => (
  <Routes>
    <Route path="/" element={<Home />} />
    <Route path="/products" element={<Products />} />
    <Route path="/shoppers" element={<Shoppers />} />
    <Route path="/shoppers/:shopperId/subscriptions" element={<ShopperSubscriptions />} />
    <Route path="/subscriptions" element={<ShopperSubscriptions />} />
    <Route path="/orders" element={<Orders />} />
    <Route path="/examples" element={<Examples />} />
    <Route path="*" element={<Navigate to="/" replace />} />
  </Routes>
);

export default Router;
