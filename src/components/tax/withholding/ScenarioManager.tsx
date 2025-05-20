
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Save, ChartBar } from "lucide-react";
import { useToast } from "@/components/ui/use-toast";
import { TaxScenario } from "@/hooks/useTaxCalculation";

interface ScenarioManagerProps {
  result: number | null;
  income: string;
  type: string;
  scenarios: TaxScenario[];
  saveScenario: (name: string, inputs: Record<string, any>, result: any) => void;
  deleteScenario: (id: string) => void;
  onCompareScenarios: () => void;
  selectedScenarios: string[];
  setSelectedScenarios: (scenarios: string[]) => void;
  showComparison: boolean;
  setShowComparison: (show: boolean) => void;
}

export const ScenarioManager = ({
  result,
  income,
  type,
  scenarios,
  saveScenario,
  deleteScenario,
  onCompareScenarios,
  selectedScenarios,
  setSelectedScenarios,
  showComparison,
  setShowComparison
}: ScenarioManagerProps) => {
  const { toast } = useToast();
  const [scenarioName, setScenarioName] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);

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

  if (!result) return null;

  return (
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
    </>
  );
};
