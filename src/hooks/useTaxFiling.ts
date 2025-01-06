import { useMutation, useQuery } from "@tanstack/react-query";
import { submitFiling, getFilingStatus } from "@/integrations/firs";
import { useError } from "@/contexts/ErrorContext";
import { toast } from "sonner";

export const useSubmitFiling = () => {
  const { handleError } = useError();

  return useMutation({
    mutationFn: submitFiling,
    onSuccess: () => {
      toast.success("Tax filing submitted successfully");
    },
    onError: (error: Error) => {
      handleError(error, "Tax filing submission");
    },
  });
};

export const useFilingStatus = (reference: string) => {
  const { handleError } = useError();

  return useQuery({
    queryKey: ["filing", reference],
    queryFn: () => getFilingStatus(reference),
    enabled: !!reference,
    meta: {
      onError: (error: Error) => {
        handleError(error, "Filing status check");
      },
    },
  });
};