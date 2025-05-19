import { useMutation, useQuery } from "@tanstack/react-query";
import { initiatePayment, verifyPayment } from "@/integrations/paymentGateway";
import { useError } from "@/contexts/ErrorContext";
import { toast } from "sonner";
import { PaymentTransaction } from "@/types/payment";

export const useInitiatePayment = () => {
  const { handleError } = useError();

  return useMutation({
    mutationFn: initiatePayment,
    onError: (error: Error) => {
      console.error("Payment initiation error:", error);
      handleError(error, "Payment initiation");
      toast.error(`Payment failed: ${error.message || "Unknown error"}`);
    },
  });
};

export const usePaymentStatus = (reference: string) => {
  const { handleError } = useError();

  return useQuery({
    queryKey: ["payment", reference],
    queryFn: () => verifyPayment(reference),
    enabled: !!reference,
    refetchInterval: (queryResult) => {
      // Keep checking status every 5 seconds until it's no longer pending
      const paymentData = queryResult.data as PaymentTransaction | undefined;
      return paymentData && paymentData.status === "pending" ? 5000 : false;
    },
    meta: {
      onError: (error: Error) => {
        handleError(error, "Payment verification");
      },
    },
  });
};

export const useVerifyPayment = () => {
  const { handleError } = useError();

  return useMutation({
    mutationFn: verifyPayment,
    onSuccess: (data) => {
      if (data.status === "success" || data.status === "successful") {
        toast.success("Payment verified successfully!");
      } else if (data.status === "pending") {
        toast.info("Payment is still being processed");
      } else {
        toast.warning("Payment verification failed");
      }
      return data;
    },
    onError: (error: Error) => {
      handleError(error, "Payment verification");
    },
  });
};
