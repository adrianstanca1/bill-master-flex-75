import React from 'react';

interface SecurityMiddlewareProps {
  children: React.ReactNode;
}

export function SecurityMiddleware({ children }: SecurityMiddlewareProps) {
  return <>{children}</>;
}