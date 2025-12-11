import { createContext, useContext, useState, ReactNode } from 'react';

interface PricingContextType {
  selectedGameId: string | null;
  setSelectedGameId: (id: string | null) => void;
}

const PricingContext = createContext<PricingContextType | undefined>(undefined);

export const PricingProvider = ({ children }: { children: ReactNode }) => {
  const [selectedGameId, setSelectedGameId] = useState<string | null>(null);

  return (
    <PricingContext.Provider value={{ selectedGameId, setSelectedGameId }}>
      {children}
    </PricingContext.Provider>
  );
};

export const usePricingContext = () => {
  const context = useContext(PricingContext);
  if (!context) {
    throw new Error('usePricingContext must be used within PricingProvider');
  }
  return context;
};
