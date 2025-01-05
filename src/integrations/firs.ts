import { supabase } from "./supabase/client";
import type { TaxFiling } from "@/types/tax";

const FIRS_API_BASE_URL = "https://api.firs.gov.ng"; // Replace with actual FIRS API URL

export const submitTaxFiling = async (filingData: TaxFiling) => {
  try {
    // Submit to FIRS API
    const response = await fetch(`${FIRS_API_BASE_URL}/submit-filing`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add FIRS API authentication headers here
      },
      body: JSON.stringify(filingData),
    });

    const data = await response.json();

    // Store filing in Supabase
    const { data: filing, error } = await supabase
      .from("tax_filings")
      .insert({
        filing_type: filingData.type,
        filing_data: JSON.stringify(filingData),
        firs_reference: data.reference,
        status: "submitted",
      })
      .select()
      .single();

    if (error) throw error;
    return filing;
  } catch (error) {
    console.error("Error submitting tax filing:", error);
    throw error;
  }
};

export const getFilingStatus = async (reference: string) => {
  try {
    const response = await fetch(
      `${FIRS_API_BASE_URL}/filing-status/${reference}`,
      {
        headers: {
          // Add FIRS API authentication headers here
        },
      }
    );
    return await response.json();
  } catch (error) {
    console.error("Error getting filing status:", error);
    throw error;
  }
};

export const validateData = async (data: any) => {
  try {
    const response = await fetch(`${FIRS_API_BASE_URL}/validate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        // Add FIRS API authentication headers here
      },
      body: JSON.stringify(data),
    });
    return await response.json();
  } catch (error) {
    console.error("Error validating data:", error);
    throw error;
  }
};