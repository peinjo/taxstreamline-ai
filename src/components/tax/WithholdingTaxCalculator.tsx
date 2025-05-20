
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaxCalculatorLayout } from "./components/TaxCalculatorLayout";
import { WithholdingTaxForm } from "./components/WithholdingTaxForm";
import { TaxResult } from "./components/TaxResult";
import { TaxChartComponent } from "./components/TaxChartComponent";
import { useTaxCalculation } from "@/hooks/useTaxCalculation";
import { TaxScenarioComparison } from "./components/TaxScenarioComparison";
import { TaxOptimizationFeature } from "./components/TaxOptimizationFeature";
import { ScenarioManager } from "./withholding/ScenarioManager";
import { ScenariosTable } from "./withholding/ScenariosTable";

export const WithholdingTaxCalculator = () => {
  const { toast } = useToast();
  const [income, setIncome] = useState("");
  const [type, setType] = useState("dividends");
  const [result, setResult] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  
  const { 
    scenarios, 
    saveScenario, 
    compareScenarios, 
    deleteScenario 
  } = useTaxCalculation();

  const calculateTax = async () => {
    if (!income || isNaN(Number(income))) {
      toast({
        title: "Invalid Input",
        description: "Please enter a valid income amount",
        variant: "destructive",
      });
      return;
    }

    const incomeAmount = Number(income);
    let taxRate = 0;

    switch (type) {
      case "dividends":
        taxRate = 0.10;
        break;
      case "rent":
        taxRate = 0.10;
        break;
      case "royalties":
        taxRate = 0.05;
        break;
      case "professional_fees":
        taxRate = 0.10;
        break;
      default:
        taxRate = 0.10;
    }

    const taxAmount = incomeAmount * taxRate;

    try {
      const { error } = await supabase.from("tax_calculations").insert({
        tax_type: "withholding",
        income: incomeAmount,
        tax_amount: taxAmount,
        input_data: { type },
        calculation_details: { tax_rate: taxRate },
      });

      if (error) throw error;

      setResult(taxAmount);

      toast({
        title: "Tax Calculated",
        description: `Withholding Tax Amount: ₦${taxAmount.toFixed(2)}`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save calculation",
        variant: "destructive",
      });
    }
  };

  const handleCompareScenarios = () => {
    if (selectedScenarios.length < 2) {
      toast({
        title: "Select Scenarios",
        description: "Please select at least 2 scenarios to compare",
        variant: "destructive",
      });
      return;
    }
    
    setShowComparison(true);
  };

  const scenariosToCompare = compareScenarios(selectedScenarios);

  return (
    <TaxCalculatorLayout title="Withholding Tax Calculator">
      {showComparison && scenariosToCompare.length >= 2 ? (
        <TaxScenarioComparison 
          scenarios={scenariosToCompare}
          onClose={() => {
            setShowComparison(false);
            setSelectedScenarios([]);
          }}
        />
      ) : null}

      <WithholdingTaxForm
        income={income}
        type={type}
        onIncomeChange={setIncome}
        onTypeChange={setType}
        onCalculate={calculateTax}
      />
      
      <TaxResult amount={result} label="Withholding Tax" />
      
      {result !== null && (
        <>
          <ScenarioManager
            result={result}
            income={income}
            type={type}
            scenarios={scenarios}
            saveScenario={saveScenario}
            deleteScenario={deleteScenario}
            onCompareScenarios={handleCompareScenarios}
            selectedScenarios={selectedScenarios}
            setSelectedScenarios={setSelectedScenarios}
            showComparison={showComparison}
            setShowComparison={setShowComparison}
          />
          
          <TaxChartComponent 
            taxAmount={result}
            income={Number(income)}
            taxType="Withholding Tax"
            details={{ type, rate: (result / Number(income)) * 100 }}
          />

          <TaxOptimizationFeature
            taxType="withholding"
            inputs={{ income: Number(income), type }}
            result={result ? {
              taxAmount: result,
              effectiveRate: (result / Number(income)) * 100,
              details: { type, rate: (result / Number(income)) * 100 }
            } : undefined}
          />
        </>
      )}
      
      {scenarios.length > 0 && !showComparison && (
        <ScenariosTable
          scenarios={scenarios}
          selectedScenarios={selectedScenarios}
          setSelectedScenarios={setSelectedScenarios}
          deleteScenario={deleteScenario}
          onCompareScenarios={handleCompareScenarios}
        />
      )}
    </TaxCalculatorLayout>
  );
};
