import React from 'react';
import { Navigate } from 'react-router-dom';

interface PrivateRouteProps {
  element: React.ReactNode;
}

const PrivateRoute: React.FC<PrivateRouteProps> = ({ element }) => {
  const googleToken = localStorage.getItem('googleAccessToken');
  if (!googleToken) {
    return <Navigate to="/login" replace />;
  }
  return <>{element}</>;
};

export default PrivateRoute;
