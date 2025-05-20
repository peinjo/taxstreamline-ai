
import { useState } from "react";
import { TaxCalculationResult } from "@/types/tax";

export interface TaxScenario {
  id: string;
  name: string;
  inputs: Record<string, any>;
  result: TaxCalculationResult;
  date: Date;
}

export const useTaxCalculation = () => {
  const [scenarios, setScenarios] = useState<TaxScenario[]>([]);
  const [currentScenario, setCurrentScenario] = useState<TaxScenario | null>(null);

  const saveScenario = (name: string, inputs: Record<string, any>, result: TaxCalculationResult) => {
    const newScenario: TaxScenario = {
      id: Date.now().toString(),
      name,
      inputs,
      result,
      date: new Date(),
    };
    
    setScenarios((prev) => [...prev, newScenario]);
    setCurrentScenario(newScenario);
    return newScenario;
  };

  const compareScenarios = (scenarioIds: string[]) => {
    return scenarios.filter((scenario) => scenarioIds.includes(scenario.id));
  };

  const deleteScenario = (id: string) => {
    setScenarios((prev) => prev.filter((scenario) => scenario.id !== id));
    if (currentScenario?.id === id) {
      setCurrentScenario(null);
    }
  };

  return {
    scenarios,
    currentScenario,
    saveScenario,
    compareScenarios,
    deleteScenario,
    setCurrentScenario,
  };
};
