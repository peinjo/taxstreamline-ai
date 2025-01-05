import { toast } from "sonner";

interface ErrorLog {
  message: string;
  code?: string;
  timestamp: string;
  stack?: string;
}

export const logError = (error: Error, context?: string) => {
  const errorLog: ErrorLog = {
    message: error.message,
    timestamp: new Date().toISOString(),
    stack: error.stack,
  };

  console.error(`Error in ${context}:`, errorLog);
  // Here you could send the error to a logging service
};

export const showUserFriendlyMessage = (error: Error) => {
  const friendlyMessage = getFriendlyErrorMessage(error);
  toast.error(friendlyMessage);
};

export const retryAction = async <T>(
  action: () => Promise<T>,
  maxRetries = 3,
  delay = 1000
): Promise<T> => {
  let lastError: Error;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await action();
    } catch (error) {
      lastError = error as Error;
      if (i < maxRetries - 1) {
        await new Promise(resolve => setTimeout(resolve, delay * (i + 1)));
      }
    }
  }
  
  throw lastError!;
};

const getFriendlyErrorMessage = (error: Error): string => {
  // Add more error types and messages as needed
  const errorMessages: Record<string, string> = {
    "auth/invalid-credentials": "Invalid email or password",
    "payment/insufficient-funds": "Insufficient funds for this transaction",
    "filing/validation-failed": "Please check your tax filing information",
  };

  return errorMessages[error.message] || "An unexpected error occurred. Please try again.";
};