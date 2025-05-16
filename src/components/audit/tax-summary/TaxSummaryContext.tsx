
import React, { createContext, useState, ReactNode } from "react";
import { TaxReport } from "@/types";

interface TaxSummaryContextType {
  selectedReport: TaxReport | null;
  setSelectedReport: (report: TaxReport | null) => void;
}

export const TaxSummaryContext = createContext<TaxSummaryContextType>({
  selectedReport: null,
  setSelectedReport: () => {},
});

interface TaxSummaryProviderProps {
  children: ReactNode;
}

export const TaxSummaryProvider: React.FC<TaxSummaryProviderProps> = ({ children }) => {
  const [selectedReport, setSelectedReport] = useState<TaxReport | null>(null);

  return (
    <TaxSummaryContext.Provider value={{ selectedReport, setSelectedReport }}>
      {children}
    </TaxSummaryContext.Provider>
  );
};
