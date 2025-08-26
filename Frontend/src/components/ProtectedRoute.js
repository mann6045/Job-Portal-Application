import React from 'react';
import { Navigate } from 'react-router-dom';

export default function ProtectedRoute({ children, user, roles }) {
  if (!user) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user.role)) return <Navigate to="/" replace />;
  return children;
}
