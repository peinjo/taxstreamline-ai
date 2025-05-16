
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calculator, Save, History } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MaterialityCalculation } from "@/types";
import { toast } from "@/components/ui/use-toast";

// Import local components and utilities
import { MaterialityForm } from "./MaterialityForm";
import { MaterialityHistory } from "./MaterialityHistory";
import { calculateMateriality, prepareCalculationForSave } from "./utils";
import { MaterialityFormData } from "./types";

export const MaterialityCalculator = () => {
  const [formData, setFormData] = useState<MaterialityFormData>({
    preTaxIncome: 0,
    materialityPercentage: 1,
    performanceMaterialityPercentage: 75,
    year: new Date().getFullYear(),
    industry: "",
    notes: ""
  });
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  
  const queryClient = useQueryClient();
  
  // Calculate results based on form data
  const results = calculateMateriality(formData);

  // Update form field handler
  const handleFormChange = (field: keyof MaterialityFormData, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  // Fetch previous calculations
  const { data: previousCalculations, isLoading } = useQuery({
    queryKey: ['materiality-calculations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiality_calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading previous calculations",
          description: error.message,
        });
        throw error;
      }
      return data as MaterialityCalculation[];
    }
  });

  // Save calculation to database
  const saveMutation = useMutation({
    mutationFn: async (calculation: MaterialityCalculation) => {
      const { data, error } = await supabase
        .from('materiality_calculations')
        .insert(calculation);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Calculation saved",
        description: "Your materiality calculation has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['materiality-calculations'] });
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Error saving calculation",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const handleSave = () => {
    if (formData.preTaxIncome <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Pre-tax income must be greater than zero.",
      });
      return;
    }

    const calculation = prepareCalculationForSave(formData, results);
    saveMutation.mutate(calculation);
  };

  const loadCalculation = (calc: MaterialityCalculation) => {
    setFormData({
      preTaxIncome: calc.pre_tax_income,
      materialityPercentage: calc.materiality_percentage,
      performanceMaterialityPercentage: calc.performance_materiality_percentage,
      year: calc.year,
      industry: calc.industry || "",
      notes: calc.notes || ""
    });
    setIsHistoryOpen(false);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Materiality Calculator
        </CardTitle>
        <CardDescription>
          Calculate materiality threshold based on pre-tax net income
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isHistoryOpen ? (
          <MaterialityHistory
            calculations={previousCalculations}
            isLoading={isLoading}
            onLoadCalculation={loadCalculation}
            onClose={() => setIsHistoryOpen(false)}
          />
        ) : (
          <MaterialityForm 
            formData={formData}
            results={results}
            onChange={handleFormChange}
          />
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <History className="h-4 w-4 mr-2" />
          {isHistoryOpen ? "Calculator" : "History"}
        </Button>
        {!isHistoryOpen && (
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending || formData.preTaxIncome <= 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Calculation"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
