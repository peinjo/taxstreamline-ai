
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { TaxOptimizationSuggestions } from "./components/TaxOptimizationSuggestions";
import { SavedOptimizationPlans } from "./components/SavedOptimizationPlans";
import { useTaxCalculation } from "@/hooks/useTaxCalculation";
import { useTaxOptimization } from "@/hooks/useTaxOptimization";
import { 
  getGeneralSuggestions, 
  getSectorIncentives, 
  OptimizationSuggestion 
} from "@/services/taxOptimization";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { PiggyBank, Lightbulb, TrendingUp } from "lucide-react";

export const TaxPlanner = () => {
  const [selectedIndustry, setSelectedIndustry] = useState("general");
  const { scenarios, saveScenario } = useTaxCalculation();
  
  const { data: recentCalculations, isLoading } = useQuery({
    queryKey: ["taxPlannerData"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_calculations")
        .select("*")
        .order("created_at", { ascending: false })
        .limit(10);
      
      if (error) throw error;
      return data || [];
    },
  });
  
  // Get specific suggestions based on selected industry
  const industrySuggestions = getSectorIncentives(selectedIndustry);
  
  // Get general tax planning suggestions
  const generalSuggestions = getGeneralSuggestions();
  
  // Get optimization opportunities from recent calculations
  const optimizationOpportunities = React.useMemo(() => {
    if (!recentCalculations) return [];
    
    const suggestions: OptimizationSuggestion[] = [];
    
    // Find the highest tax amount by type
    const taxTypeMap = new Map<string, number>();
    recentCalculations.forEach(calc => {
      const current = taxTypeMap.get(calc.tax_type) || 0;
      if (calc.tax_amount > current) {
        taxTypeMap.set(calc.tax_type, calc.tax_amount);
      }
    });
    
    // Create suggestions for each tax type
    taxTypeMap.forEach((amount, type) => {
      suggestions.push({
        id: `opportunity-${type}`,
        title: `${type.replace(/_/g, ' ')} Optimization Opportunity`,
        description: `You've paid ₦${amount.toLocaleString()} in ${type.replace(/_/g, ' ')} taxes. Review specific strategies to potentially reduce this tax burden.`,
        potentialSavings: amount * 0.1, // Estimate 10% potential savings
        applicability: 'high',
        category: 'other'
      });
    });
    
    return suggestions;
  }, [recentCalculations]);
  
  const industries = [
    { value: "general", label: "General Business" },
    { value: "agriculture", label: "Agriculture" },
    { value: "manufacturing", label: "Manufacturing" },
    { value: "technology", label: "Technology" },
    { value: "oil_and_gas", label: "Oil & Gas" },
    { value: "financial_services", label: "Financial Services" },
    { value: "real_estate", label: "Real Estate" }
  ];
  
  return (
    <div className="space-y-6">
      <Card className="border shadow-sm">
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5 text-primary" />
                Tax Planning & Optimization
              </CardTitle>
              <CardDescription>
                Optimize your tax position with personalized recommendations
              </CardDescription>
            </div>
            
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">Industry:</span>
              <Select value={selectedIndustry} onValueChange={setSelectedIndustry}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select Industry" />
                </SelectTrigger>
                <SelectContent>
                  {industries.map(industry => (
                    <SelectItem key={industry.value} value={industry.value}>
                      {industry.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        
        <CardContent>
          <Tabs defaultValue="opportunities">
            <TabsList className="mb-4">
              <TabsTrigger value="opportunities">
                <Lightbulb className="h-4 w-4 mr-2" />
                Optimization Opportunities
              </TabsTrigger>
              <TabsTrigger value="incentives">
                <PiggyBank className="h-4 w-4 mr-2" />
                Industry Incentives
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="opportunities">
              <div className="space-y-6">
                <TaxOptimizationSuggestions suggestions={optimizationOpportunities} />
                <TaxOptimizationSuggestions suggestions={generalSuggestions} />
              </div>
            </TabsContent>
            
            <TabsContent value="incentives">
              <TaxOptimizationSuggestions suggestions={industrySuggestions} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {scenarios.length > 0 && (
        <SavedOptimizationPlans
          plans={scenarios.map(scenario => ({
            id: scenario.id,
            name: scenario.name,
            suggestions: [
              {
                id: `scenario-${scenario.id}`,
                title: "Tax Scenario",
                description: `This is a saved tax scenario with ${Object.keys(scenario.inputs).length} inputs and calculated tax of ₦${scenario.result.taxAmount.toLocaleString()}.`,
                potentialSavings: null,
                applicability: 'medium',
                category: 'other'
              }
            ],
            date: scenario.date
          }))}
        />
      )}
    </div>
  );
};
