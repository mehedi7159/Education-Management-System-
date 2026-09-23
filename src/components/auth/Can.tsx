import React from 'react';
import { PermissionCode } from '../../types';
import { useAuth } from '../../context/AuthContext';
import { AuthService } from '../../services/authService';

interface CanProps {
  do: PermissionCode | PermissionCode[];
  not?: boolean;
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

/**
 * Reusable Frontend Granular Permission Wrapper Component
 * Usage:
 *  <Can do="student.create">
 *    <Button>নতুন শিক্ষার্থী ভর্তি</Button>
 *  </Can>
 */
export const Can: React.FC<CanProps> = ({ do: permission, not = false, children, fallback = null }) => {
  const { user } = useAuth();

  const permissions = Array.isArray(permission) ? permission : [permission];
  const hasAccess = permissions.some((p) => AuthService.hasPermission(user.role, p));

  const shouldRender = not ? !hasAccess : hasAccess;

  if (!shouldRender) {
    return <>{fallback}</>;
  }

  return <>{children}</>;
};

/**
 * Reusable React Hook for granular permission evaluation
 */
export const useCan = (permission: PermissionCode | PermissionCode[]): boolean => {
  const { user } = useAuth();
  const permissions = Array.isArray(permission) ? permission : [permission];
  return permissions.some((p) => AuthService.hasPermission(user.role, p));
};
