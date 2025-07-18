import React from 'react';
import { Navigate } from 'react-router-dom';
import { decryptToken } from '@/utils/crypto';

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const encrypted = localStorage.getItem('googleAccessToken');
  const googleToken = encrypted ? decryptToken(encrypted) : null;
  if (!googleToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{element}</>;
};

export default PrivateRoute;
