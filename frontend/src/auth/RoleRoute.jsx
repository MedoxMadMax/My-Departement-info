import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const RoleRoute = ({ allowedRoles }) => {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  const hasAccess = allowedRoles.some(role => user.roles.includes(role));

  return hasAccess ? <Outlet /> : <Navigate to="/dashboard" replace />; // Redirect to a safe authenticated page
};

export default RoleRoute;
