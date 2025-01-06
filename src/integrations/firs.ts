import { supabase } from "./supabase/client";

interface TaxFiling {
  type: string;
  data: Record<string, any>;
}

export const submitFiling = async (filingData: TaxFiling) => {
  try {
    // Simulate FIRS API call
    const data = {
      reference: `FIRS-${Date.now()}`,
      status: "success",
    };

    // Store filing data in Supabase
    const { data: filing, error } = await supabase
      .from("tax_filings")
      .insert({
        filing_type: filingData.type,
        filing_data: JSON.stringify(filingData.data),
        status: "pending",
        firs_reference: data.reference,
      })
      .select()
      .single();

    if (error) throw error;
    return filing;
  } catch (error) {
    throw new Error("Failed to submit tax filing. Please try again later.");
  }
};

export const getFilingStatus = async (reference: string) => {
  try {
    const { data, error } = await supabase
      .from("tax_filings")
      .select("*")
      .eq("firs_reference", reference)
      .single();

    if (error) throw error;
    return data;
  } catch (error) {
    throw new Error("Failed to fetch filing status. Please try again later.");
  }
};