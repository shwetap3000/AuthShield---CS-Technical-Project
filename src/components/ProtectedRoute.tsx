import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.tsx';
import { LoadingState } from './LoadingState.tsx';

export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  if (isLoading) {
    return (
      <div className="py-20 flex justify-center items-center">
        <LoadingState message="Verifying session authenticity & security tokens..." />
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <Navigate
        to="/login"
        replace
        state={{
          from: location.pathname,
          notice: 'Please sign in to access the security console.',
        }}
      />
    );
  }

  return <Outlet />;
};
