
import { AIAction } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";

export const taxActions: AIAction[] = [
  {
    name: "create_tax_calculation",
    description: "Create a new tax calculation",
    parameters: {
      type: "object",
      properties: {
        tax_type: { 
          type: "string", 
          enum: ["income", "vat", "corporate", "capital_gains", "withholding"],
          description: "Type of tax calculation" 
        },
        income: { type: "number", description: "Income or base amount" },
        additional_data: { type: "object", description: "Additional calculation data (optional)" }
      },
      required: ["tax_type", "income"]
    },
    handler: async (params, context) => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .insert([{
          tax_type: params.tax_type,
          income: params.income,
          input_data: params.additional_data || {},
          user_id: context.user?.id,
          tax_amount: 0
        }])
        .select()
        .single();

      if (error) throw error;

      return {
        success: true,
        message: `Tax calculation for ${params.tax_type} has been created.`,
        data
      };
    }
  }
];
