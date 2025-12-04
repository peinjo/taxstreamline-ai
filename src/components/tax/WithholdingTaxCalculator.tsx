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
import { Alert, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";

export const WithholdingTaxCalculator = () => {
  const { toast } = useToast();
  const [income, setIncome] = useState("");
  const [type, setType] = useState("dividends");
  const [result, setResult] = useState<number | null>(null);
  const [showComparison, setShowComparison] = useState(false);
  const [selectedScenarios, setSelectedScenarios] = useState<string[]>([]);
  const [showFormula, setShowFormula] = useState(false);
  
  const { 
    scenarios, 
    saveScenario, 
    compareScenarios, 
    deleteScenario 
  } = useTaxCalculation();

  const getRateForType = (type: string) => {
    switch (type) {
      case "dividends": return 10;
      case "rent": return 10;
      case "royalties": return 5;
      case "professional_fees": return 10;
      case "directors_fees": return 10;
      case "contracts": return 5;
      default: return 10;
    }
  };

  const currentRate = getRateForType(type);

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
    const taxRate = currentRate / 100;
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
      {/* Formula Transparency Section */}
      <Collapsible open={showFormula} onOpenChange={setShowFormula}>
        <CollapsibleTrigger asChild>
          <Alert className="cursor-pointer hover:bg-muted/50 transition-colors mb-4">
            <Info className="h-4 w-4" />
            <AlertTitle className="flex items-center justify-between">
              Formula & Rates
              <span className="text-xs text-muted-foreground">
                {showFormula ? "Click to hide" : "Click to expand"}
              </span>
            </AlertTitle>
          </Alert>
        </CollapsibleTrigger>
        <CollapsibleContent className="mb-4">
          <div className="p-4 bg-muted/30 rounded-lg space-y-3 text-sm">
            <div>
              <h4 className="font-semibold text-foreground">Formula:</h4>
              <code className="block mt-1 p-2 bg-background rounded text-xs">
                WHT = Payment Amount × Rate%
              </code>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Rates by Payment Type:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Dividends: 10%</li>
                <li>Rent: 10%</li>
                <li>Royalties: 5%</li>
                <li>Professional Fees: 10%</li>
                <li>Directors' Fees: 10%</li>
                <li>Contracts/Supplies: 5%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Non-Resident Rates:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>Dividends: 10%</li>
                <li>Interest: 10%</li>
                <li>Royalties: 10%</li>
                <li>Management/Technical Fees: 10%</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Key Notes:</h4>
              <ul className="list-disc list-inside text-muted-foreground space-y-1">
                <li>WHT is advance payment against final tax</li>
                <li>Payer deducts and remits to FIRS</li>
                <li>WHT credit can offset final tax liability</li>
                <li>Exemptions may apply per tax treaties</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-foreground">Current Selection:</h4>
              <p className="text-muted-foreground">
                {type.replace("_", " ").charAt(0).toUpperCase() + type.replace("_", " ").slice(1)}: {currentRate}%
              </p>
            </div>
            <div className="pt-2 border-t border-border">
              <p className="text-xs text-muted-foreground">
                Source: <a href="https://www.firs.gov.ng" target="_blank" rel="noopener noreferrer" className="underline">FIRS - Withholding Tax Regulations</a>
              </p>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>

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
          <div className="p-3 bg-muted/30 rounded-lg text-sm text-muted-foreground">
            <p><strong>Calculation:</strong></p>
            <p>₦{Number(income).toLocaleString()} × {currentRate}% = ₦{result.toFixed(2)}</p>
          </div>
          
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
            details={{ type, rate: currentRate }}
          />

          <TaxOptimizationFeature
            taxType="withholding"
            inputs={{ income: Number(income), type }}
            result={result ? {
              taxAmount: result,
              effectiveRate: currentRate,
              details: { type, rate: currentRate }
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
