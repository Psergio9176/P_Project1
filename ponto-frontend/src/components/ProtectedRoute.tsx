import React, { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Perfil } from '../types';

interface ProtectedRouteProps {
  children: ReactNode;
  perfis?: Perfil[];
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children, perfis }) => {
  const { isAuthenticated, isLoading, usuario } = useAuth();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-gray-500">Carregando...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (perfis && usuario && !perfis.includes(usuario.perfil)) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};
