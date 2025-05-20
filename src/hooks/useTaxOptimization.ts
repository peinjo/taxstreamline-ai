
import { useState, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTaxOptimizationSuggestions, OptimizationSuggestion } from "@/services/taxOptimization";
import { TaxCalculationResult } from "@/types/tax";
import { toast } from "sonner";

interface UseTaxOptimizationProps {
  taxType: string;
  inputs?: Record<string, any>;
  result?: TaxCalculationResult;
}

interface SavedOptimizationPlan {
  id: string;
  name: string;
  suggestions: OptimizationSuggestion[];
  date: Date;
}

export const useTaxOptimization = ({ taxType, inputs = {}, result }: UseTaxOptimizationProps) => {
  const [savedPlans, setSavedPlans] = useState<SavedOptimizationPlan[]>([]);
  
  // Generate suggestions based on the provided tax data
  const getSuggestions = useCallback(() => {
    if (!result) return [];
    return getTaxOptimizationSuggestions(taxType, inputs, result);
  }, [taxType, inputs, result]);
  
  // Fetch saved optimization suggestions from past calculations
  const { data: historicalSuggestions, isLoading } = useQuery({
    queryKey: ["tax-optimization-history"],
    queryFn: async () => {
      try {
        const { data: calculations, error } = await supabase
          .from("tax_calculations")
          .select("*")
          .eq("tax_type", taxType)
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        if (!calculations || calculations.length === 0) {
          return [];
        }
        
        // Process historical data to extract learning
        // This is a simplified version - in a real implementation, this would
        // analyze patterns across calculations to provide more personalized suggestions
        const suggestions = calculations.map(calc => {
          return {
            id: `historical-${calc.id}`,
            title: "Based on Your Tax History",
            description: `Your recent ${taxType} calculations show potential for optimization. Review your tax strategy for this category.`,
            potentialSavings: null,
            applicability: 'medium',
            category: 'other' as const
          };
        });
        
        return suggestions;
      } catch (error) {
        console.error("Error fetching tax history:", error);
        return [];
      }
    },
    enabled: !!taxType,
  });
  
  // Save an optimization plan with selected suggestions
  const savePlan = useCallback((name: string, suggestions: OptimizationSuggestion[]) => {
    const newPlan = {
      id: Date.now().toString(),
      name,
      suggestions,
      date: new Date()
    };
    
    setSavedPlans(prev => [...prev, newPlan]);
    toast.success("Tax optimization plan saved");
    
    return newPlan;
  }, []);
  
  // Calculate potential savings from all applicable suggestions
  const calculatePotentialSavings = useCallback((suggestions: OptimizationSuggestion[]) => {
    return suggestions.reduce((total, suggestion) => {
      return total + (suggestion.potentialSavings || 0);
    }, 0);
  }, []);
  
  return {
    suggestions: getSuggestions(),
    historicalSuggestions: historicalSuggestions || [],
    isLoading,
    savePlan,
    savedPlans,
    calculatePotentialSavings
  };
};
