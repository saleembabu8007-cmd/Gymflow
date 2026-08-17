import React from 'react';
import { ServiceProvider } from '../services/provider';
import { ToastProvider } from '../components/ui/Toast';

export interface RootLayoutProps {
  children: React.ReactNode;
}

export const RootLayout: React.FC<RootLayoutProps> = ({ children }) => {
  return (
    <ServiceProvider>
      <ToastProvider>{children}</ToastProvider>
    </ServiceProvider>
  );
};
