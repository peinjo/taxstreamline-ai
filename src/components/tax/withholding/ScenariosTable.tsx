
import React from "react";
import { Button } from "@/components/ui/button";
import { TaxScenario } from "@/hooks/useTaxCalculation";

interface ScenariosTableProps {
  scenarios: TaxScenario[];
  selectedScenarios: string[];
  setSelectedScenarios: (scenarios: string[]) => void;
  deleteScenario: (id: string) => void;
  onCompareScenarios: () => void;
}

export const ScenariosTable = ({
  scenarios,
  selectedScenarios,
  setSelectedScenarios,
  deleteScenario,
  onCompareScenarios
}: ScenariosTableProps) => {
  if (scenarios.length === 0) return null;
  
  return (
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
            <Button onClick={onCompareScenarios} size="sm">
              Compare Selected ({selectedScenarios.length})
            </Button>
          </div>
        )}
      </div>
    </div>
  );
};
