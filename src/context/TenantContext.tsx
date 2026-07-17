'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface TenantContextProps {
  tenantId: string;
  setTenantId: (id: string) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextProps | undefined>(undefined);

export const TenantProvider = ({ children }: { children: ReactNode }) => {
  // Inicializamos temporalmente con 'ferreos' como mock de sesin autenticada,
  // pero ya preparado para leer de un AuthProvider en el futuro.
  const [tenantId, setTenantId] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    // Simulacin de obtencin de sesin
    const fetchSession = async () => {
      // AQU IRA: const session = await auth.getSession(); setTenantId(session.tenantId);
      setTenantId('ferreos');
      setIsLoading(false);
    };
    fetchSession();
  }, []);

  return (
    <TenantContext.Provider value={{ tenantId, setTenantId, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenant = () => {
  const context = useContext(TenantContext);
  if (!context) {
    throw new Error('useTenant must be used within a TenantProvider');
  }
  return context;
};
