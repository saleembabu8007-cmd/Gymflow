import React, { createContext, useContext, useMemo } from 'react';
import { IServiceContainer } from './interfaces';
import { defaultServices } from './index';

const ServiceContext = createContext<IServiceContainer | null>(null);

export interface ServiceProviderProps {
  children: React.ReactNode;
  services?: IServiceContainer;
}

export const ServiceProvider: React.FC<ServiceProviderProps> = ({
  children,
  services = defaultServices,
}) => {
  const value = useMemo(() => services, [services]);

  return <ServiceContext.Provider value={value}>{children}</ServiceContext.Provider>;
};

export function useServices(): IServiceContainer {
  const context = useContext(ServiceContext);
  if (!context) {
    throw new Error('useServices must be used within a ServiceProvider');
  }
  return context;
}
