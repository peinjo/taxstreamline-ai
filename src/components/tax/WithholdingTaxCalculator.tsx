
import React, { useState } from "react";
import { useToast } from "@/components/ui/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { TaxCalculatorLayout } from "./components/TaxCalculatorLayout";
import { WithholdingTaxForm } from "./components/WithholdingTaxForm";
import { TaxResult } from "./components/TaxResult";
import { TaxChartComponent } from "./components/TaxChartComponent";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { useTaxCalculation, TaxScenario } from "@/hooks/useTaxCalculation";
import { TaxScenarioComparison } from "./components/TaxScenarioComparison";
import { Save, ChartBar } from "lucide-react";

export const WithholdingTaxCalculator = () => {
  const { toast } = useToast();
  const [income, setIncome] = useState("");
  const [type, setType] = useState("dividends");
  const [result, setResult] = useState<number | null>(null);
  const [scenarioName, setScenarioName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  const handleSaveScenario = () => {
    if (!result) {
      toast({
        title: "No Calculation",
        description: "Please calculate tax before saving scenario",
        variant: "destructive",
      });
      return;
    }

    if (!scenarioName.trim()) {
      toast({
        title: "Missing Name",
        description: "Please enter a name for this scenario",
        variant: "destructive",
      });
      return;
    }

    saveScenario(
      scenarioName,
      { income: Number(income), type },
      {
        taxAmount: result,
        effectiveRate: (result / Number(income)) * 100,
        details: { type, rate: (result / Number(income)) * 100 }
      }
    );

    toast({
      title: "Scenario Saved",
      description: `"${scenarioName}" has been saved for comparison`,
    });
    
    setScenarioName("");
    setIsDialogOpen(false);
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
          <div className="flex justify-between mt-4">
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" className="gap-2">
                  <Save className="h-4 w-4" />
                  Save Scenario
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Tax Scenario</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium">Scenario Name</label>
                  <Input
                    value={scenarioName}
                    onChange={(e) => setScenarioName(e.target.value)}
                    placeholder="e.g., Dividend Income 2025"
                    className="mt-2"
                  />
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSaveScenario}>Save</Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            
            {scenarios.length >= 2 && (
              <Button 
                variant="outline"
                className="gap-2"
                onClick={() => setShowComparison(!showComparison)}
              >
                <ChartBar className="h-4 w-4" />
                {showComparison ? "Hide Comparison" : "Compare Scenarios"}
              </Button>
            )}
          </div>
          
          <TaxChartComponent 
            taxAmount={result}
            income={Number(income)}
            taxType="Withholding Tax"
            details={{ type, rate: (result / Number(income)) * 100 }}
          />
        </>
      )}
      
      {scenarios.length > 0 && !showComparison && (
        <div className="mt-4">
          <h3 className="text-lg font-semibold mb-2">Saved Scenarios</h3>
          <div className="border rounded-md">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/50">
                  <th className="px-3 py-2 text-left">
                    <input
                      type="checkbox"
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedScenarios(scenarios.map(s => s.id));
                        } else {
                          setSelectedScenarios([]);
                        }
                      }}
                      className="mr-2"
                    />
                    Name
                  </th>
                  <th className="px-3 py-2 text-right">Income</th>
                  <th className="px-3 py-2 text-right">Tax</th>
                  <th className="px-3 py-2 text-right">Date</th>
                  <th className="px-3 py-2 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {scenarios.map((scenario) => (
                  <tr key={scenario.id} className="border-t">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedScenarios.includes(scenario.id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedScenarios([...selectedScenarios, scenario.id]);
                          } else {
                            setSelectedScenarios(selectedScenarios.filter(id => id !== scenario.id));
                          }
                        }}
                        className="mr-2"
                      />
                      {scenario.name}
                    </td>
                    <td className="px-3 py-2 text-right">₦{scenario.inputs.income?.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">₦{scenario.result.taxAmount.toLocaleString()}</td>
                    <td className="px-3 py-2 text-right">{scenario.date.toLocaleDateString()}</td>
                    <td className="px-3 py-2 text-right">
                      <Button
                        variant="ghost" 
                        size="sm" 
                        onClick={() => deleteScenario(scenario.id)}
                      >
                        Delete
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {selectedScenarios.length >= 2 && (
              <div className="p-3 border-t">
                <Button onClick={handleCompareScenarios} size="sm">
                  Compare Selected ({selectedScenarios.length})
                </Button>
              </div>
            )}
          </div>
        </div>
      )}
    </TaxCalculatorLayout>
  );
};
