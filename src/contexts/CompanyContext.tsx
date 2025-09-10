import React, { createContext, useContext, useEffect, useState } from 'react';
import { useCompanies } from '@/hooks/useCompanies';

interface CompanyContextType {
  selectedCompanyId: string | null;
  setSelectedCompanyId: (id: string) => void;
  selectedCompany: any | null;
}

const CompanyContext = createContext<CompanyContextType | undefined>(undefined);

export const useCompanyContext = () => {
  const context = useContext(CompanyContext);
  if (context === undefined) {
    throw new Error('useCompanyContext deve ser usado dentro de um CompanyProvider');
  }
  return context;
};

interface CompanyProviderProps {
  children: React.ReactNode;
}

export const CompanyProvider: React.FC<CompanyProviderProps> = ({ children }) => {
  const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);
  const { companies, loading } = useCompanies();

  // Auto-selecionar primeira empresa quando carregar
  useEffect(() => {
    if (companies.length > 0 && !selectedCompanyId) {
      setSelectedCompanyId(companies[0].id);
    }
  }, [companies, selectedCompanyId]);

  const selectedCompany = companies.find(c => c.id === selectedCompanyId) || null;

  const value = {
    selectedCompanyId,
    setSelectedCompanyId,
    selectedCompany,
  };

  return (
    <CompanyContext.Provider value={value}>
      {children}
    </CompanyContext.Provider>
  );
};