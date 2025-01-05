import { useMutation, useQuery } from "@tanstack/react-query";
import { initiatePayment, verifyPayment } from "@/integrations/paymentGateway";
import { useError } from "@/contexts/ErrorContext";

export const useInitiatePayment = () => {
  const { handleError } = useError();

  return useMutation({
    mutationFn: initiatePayment,
    onError: (error: Error) => {
      handleError(error, "Payment initiation");
    },
  });
};

export const usePaymentStatus = (reference: string) => {
  const { handleError } = useError();

  return useQuery({
    queryKey: ["payment", reference],
    queryFn: () => verifyPayment(reference),
    enabled: !!reference,
    meta: {
      onError: (error: Error) => {
        handleError(error, "Payment verification");
      },
    },
  });
};