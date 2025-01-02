import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { calculateTax, TAX_TYPES } from "@/utils/taxCalculations";
import { useParams, useNavigate } from "react-router-dom";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const TaxCalculator = () => {
  const [income, setIncome] = useState<string>("");
  const [calculatedTax, setCalculatedTax] = useState<number | null>(null);
  const { taxType } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();

  useEffect(() => {
    const selectedTaxType = TAX_TYPES.find((tax) => tax.id === taxType);
    if (!selectedTaxType) {
      navigate("/tax-web-app");
    }
  }, [taxType, navigate]);

  const selectedTaxType = TAX_TYPES.find((tax) => tax.id === taxType);

  const handleCalculate = async () => {
    if (!selectedTaxType || !income || !user) return;

    try {
      const taxAmount = calculateTax(parseFloat(income), selectedTaxType.id);
      setCalculatedTax(taxAmount);

      // Store calculation in database
      const { error } = await supabase.from("tax_calculations").insert({
        tax_type: selectedTaxType.id,
        income: parseFloat(income),
        tax_amount: taxAmount,
        user_id: user.id,
      });

      if (error) throw error;
      toast.success("Tax calculation saved successfully");
    } catch (error) {
      console.error("Error calculating tax:", error);
      toast.error("Failed to save tax calculation");
    }
  };

  if (!selectedTaxType) return null;

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">
          {selectedTaxType.name} Calculator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-2">
          <label htmlFor="income" className="text-sm font-medium">
            Income Amount
          </label>
          <Input
            id="income"
            type="number"
            placeholder="Enter income amount"
            value={income}
            onChange={(e) => setIncome(e.target.value)}
            className="w-full"
          />
        </div>

        <Button
          onClick={handleCalculate}
          className="w-full"
          disabled={!income}
        >
          Calculate Tax
        </Button>

        {calculatedTax !== null && (
          <div className="mt-6 p-4 bg-primary/10 rounded-lg">
            <h3 className="text-lg font-semibold mb-2">Calculated Tax:</h3>
            <p className="text-2xl font-bold text-primary">
              ₦{calculatedTax.toLocaleString()}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TaxCalculator;