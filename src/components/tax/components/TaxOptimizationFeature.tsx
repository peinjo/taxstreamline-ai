
import React, { useState } from "react";
import { OptimizationSuggestion } from "@/services/taxOptimization";
import { useTaxOptimization } from "@/hooks/useTaxOptimization";
import { TaxOptimizationSuggestions } from "./TaxOptimizationSuggestions";
import { SavedOptimizationPlans } from "./SavedOptimizationPlans";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { TaxCalculationResult } from "@/types/tax";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";

interface TaxOptimizationFeatureProps {
  taxType: string;
  inputs: Record<string, any>;
  result?: TaxCalculationResult;
}

export const TaxOptimizationFeature = ({
  taxType,
  inputs,
  result
}: TaxOptimizationFeatureProps) => {
  const [selectedPlan, setSelectedPlan] = useState<{
    id: string;
    name: string;
    suggestions: OptimizationSuggestion[];
    date: Date;
  } | null>(null);
  const [isViewingPlan, setIsViewingPlan] = useState(false);

  const {
    suggestions,
    historicalSuggestions,
    isLoading,
    savePlan,
    savedPlans,
    calculatePotentialSavings
  } = useTaxOptimization({
    taxType,
    inputs,
    result
  });

  const handleSavePlan = (name: string, selectedSuggestions: OptimizationSuggestion[]) => {
    return savePlan(name, selectedSuggestions);
  };

  const handleDeletePlan = (planId: string) => {
    // This would connect to backend in a real implementation
    // For now we just filter the local state
  };

  const handleViewPlan = (plan: {
    id: string;
    name: string;
    suggestions: OptimizationSuggestion[];
    date: Date;
  }) => {
    setSelectedPlan(plan);
    setIsViewingPlan(true);
  };

  // Don't show anything if no result
  if (!result) {
    return null;
  }

  // All suggestions, including both current and historical
  const allSuggestions = [...suggestions, ...historicalSuggestions];

  return (
    <div className="space-y-4">
      <Tabs defaultValue="current">
        <TabsList className="mb-2">
          <TabsTrigger value="current">Current Suggestions</TabsTrigger>
          <TabsTrigger value="saved">Saved Plans ({savedPlans.length})</TabsTrigger>
        </TabsList>
        
        <TabsContent value="current">
          <TaxOptimizationSuggestions
            suggestions={allSuggestions}
            onSavePlan={handleSavePlan}
          />
        </TabsContent>
        
        <TabsContent value="saved">
          <SavedOptimizationPlans
            plans={savedPlans}
            onDeletePlan={handleDeletePlan}
            onViewPlan={handleViewPlan}
          />
        </TabsContent>
      </Tabs>

      <Dialog open={isViewingPlan} onOpenChange={setIsViewingPlan}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>{selectedPlan?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedPlan && (
            <TaxOptimizationSuggestions
              suggestions={selectedPlan.suggestions}
            />
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};
