import { useMutation, useQuery } from "@tanstack/react-query";
import {
  submitTaxFiling,
  getFilingStatus,
  validateData,
} from "@/integrations/firs";
import { useError } from "@/contexts/ErrorContext";

export const useSubmitTaxFiling = () => {
  const { handleError } = useError();

  return useMutation({
    mutationFn: submitTaxFiling,
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
    onError: (error: Error) => {
      handleError(error, "Filing status check");
    },
  });
};

export const useValidateData = () => {
  const { handleError } = useError();

  return useMutation({
    mutationFn: validateData,
    onError: (error: Error) => {
      handleError(error, "Data validation");
    },
  });
};