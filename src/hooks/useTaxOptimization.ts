
import { useState, useCallback } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getTaxOptimizationSuggestions, OptimizationSuggestion } from "@/services/taxOptimization";
import { TaxCalculationResult } from "@/types/tax";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";

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
  const { user } = useAuth();
  const queryClient = useQueryClient();
  
  const getSuggestions = useCallback(() => {
    if (!result) return [];
    return getTaxOptimizationSuggestions(taxType, inputs, result);
  }, [taxType, inputs, result]);
  
  // Fetch saved plans from DB
  const { data: savedPlans = [], isLoading: plansLoading } = useQuery({
    queryKey: ["tax-optimization-plans", taxType],
    queryFn: async (): Promise<SavedOptimizationPlan[]> => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('tax_optimization_plans')
        .select('*')
        .eq('user_id', user.id)
        .eq('tax_type', taxType)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return (data as any[] || []).map(row => ({
        id: row.id,
        name: row.name,
        suggestions: row.suggestions || [],
        date: new Date(row.created_at),
      }));
    },
    enabled: !!user,
  });

  // Fetch historical suggestions from past calculations
  const { data: historicalSuggestions, isLoading } = useQuery({
    queryKey: ["tax-optimization-history", taxType],
    queryFn: async () => {
      try {
        const { data: calculations, error } = await supabase
          .from("tax_calculations")
          .select("*")
          .eq("tax_type", taxType)
          .order("created_at", { ascending: false })
          .limit(5);
          
        if (error) throw error;
        
        if (!calculations || calculations.length === 0) return [];
        
        const suggestions: OptimizationSuggestion[] = calculations.map(calc => ({
          id: `historical-${calc.id}`,
          title: "Based on Your Tax History",
          description: `Your recent ${taxType} calculations show potential for optimization. Review your tax strategy for this category.`,
          potentialSavings: null,
          applicability: 'medium' as const,
          category: 'other' as const
        }));
        
        return suggestions;
      } catch (error) {
        console.error("Error fetching tax history:", error);
        return [];
      }
    },
    enabled: !!taxType,
  });
  
  // Save plan mutation
  const savePlanMutation = useMutation({
    mutationFn: async ({ name, suggestions }: { name: string; suggestions: OptimizationSuggestion[] }) => {
      if (!user) throw new Error("Not authenticated");
      const { data, error } = await supabase
        .from('tax_optimization_plans')
        .insert({
          user_id: user.id,
          name,
          tax_type: taxType,
          suggestions: suggestions as any,
        } as any)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["tax-optimization-plans", taxType] });
      toast.success("Tax optimization plan saved");
    },
    onError: () => {
      toast.error("Failed to save optimization plan");
    },
  });

  const savePlan = useCallback((name: string, suggestions: OptimizationSuggestion[]) => {
    savePlanMutation.mutate({ name, suggestions });
    // Return an optimistic plan for immediate UI feedback
    return {
      id: Date.now().toString(),
      name,
      suggestions,
      date: new Date()
    };
  }, [savePlanMutation]);
  
  const calculatePotentialSavings = useCallback((suggestions: OptimizationSuggestion[]) => {
    return suggestions.reduce((total, suggestion) => {
      return total + (suggestion.potentialSavings || 0);
    }, 0);
  }, []);
  
  return {
    suggestions: getSuggestions(),
    historicalSuggestions: historicalSuggestions || [],
    isLoading: isLoading || plansLoading,
    savePlan,
    savedPlans,
    calculatePotentialSavings
  };
};
