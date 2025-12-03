import { createContext, useContext, useState, ReactNode } from 'react';

interface PeriodContextType {
  selectedPeriod: string;
  setSelectedPeriod: (period: string) => void;
  getDaysFromPeriod: (period: string) => number;
}

const PeriodContext = createContext<PeriodContextType | undefined>(undefined);

export function PeriodProvider({ children }: { children: ReactNode }) {
  const [selectedPeriod, setSelectedPeriod] = useState<string>("30 dias");

  const getDaysFromPeriod = (period: string): number => {
    const match = period.match(/(\d+)/);
    return match ? parseInt(match[1], 10) : 30;
  };

  return (
    <PeriodContext.Provider value={{ selectedPeriod, setSelectedPeriod, getDaysFromPeriod }}>
      {children}
    </PeriodContext.Provider>
  );
}

export function usePeriod() {
  const context = useContext(PeriodContext);
  if (context === undefined) {
    throw new Error('usePeriod must be used within a PeriodProvider');
  }
  return context;
}

