import React, { createContext, useContext, useState } from "react";
import { logError, showUserFriendlyMessage } from "@/lib/errorHandler";

interface ErrorContextType {
  handleError: (error: Error, context?: string) => void;
  clearError: () => void;
  error: Error | null;
}

const ErrorContext = createContext<ErrorContextType | undefined>(undefined);

export const ErrorProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [error, setError] = useState<Error | null>(null);

  const handleError = (error: Error, context?: string) => {
    logError(error, context);
    showUserFriendlyMessage(error);
    setError(error);
  };

  const clearError = () => {
    setError(null);
  };

  return (
    <ErrorContext.Provider value={{ handleError, clearError, error }}>
      {children}
    </ErrorContext.Provider>
  );
};

export const useError = () => {
  const context = useContext(ErrorContext);
  if (context === undefined) {
    throw new Error("useError must be used within an ErrorProvider");
  }
  return context;
};