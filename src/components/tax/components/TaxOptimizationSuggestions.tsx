
import React, { useState } from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { OptimizationSuggestion } from "@/services/taxOptimization";
import { BookOpen, ChevronDown, ChevronUp, Lightbulb, PiggyBank, SaveIcon, Star } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";

interface TaxOptimizationSuggestionsProps {
  suggestions: OptimizationSuggestion[];
  onSavePlan?: (name: string, suggestions: OptimizationSuggestion[]) => void;
}

export const TaxOptimizationSuggestions = ({
  suggestions,
  onSavePlan,
}: TaxOptimizationSuggestionsProps) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [planName, setPlanName] = useState("");
  const [selectedSuggestions, setSelectedSuggestions] = useState<OptimizationSuggestion[]>([]);

  const handleSavePlan = () => {
    if (planName && onSavePlan) {
      onSavePlan(planName, selectedSuggestions);
      setIsDialogOpen(false);
      setPlanName("");
    }
  };

  const toggleSuggestionSelection = (suggestion: OptimizationSuggestion) => {
    setSelectedSuggestions(prev => {
      const isSelected = prev.some(s => s.id === suggestion.id);
      if (isSelected) {
        return prev.filter(s => s.id !== suggestion.id);
      } else {
        return [...prev, suggestion];
      }
    });
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'deduction':
        return <PiggyBank className="h-4 w-4" />;
      case 'credit':
        return <Star className="h-4 w-4" />;
      case 'exemption':
        return <BookOpen className="h-4 w-4" />;
      default:
        return <Lightbulb className="h-4 w-4" />;
    }
  };

  const getApplicabilityColor = (applicability: string) => {
    switch (applicability) {
      case 'high':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-amber-100 text-amber-800';
      case 'low':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-blue-100 text-blue-800';
    }
  };

  // Group suggestions by category
  const groupedSuggestions = suggestions.reduce((acc, suggestion) => {
    if (!acc[suggestion.category]) {
      acc[suggestion.category] = [];
    }
    acc[suggestion.category].push(suggestion);
    return acc;
  }, {} as Record<string, OptimizationSuggestion[]>);

  const getTotalPotentialSavings = () => {
    return suggestions
      .filter(s => s.potentialSavings !== null)
      .reduce((sum, s) => sum + (s.potentialSavings || 0), 0);
  };

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex justify-between items-center">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="h-5 w-5 text-yellow-500" />
              Tax Optimization Suggestions
            </CardTitle>
            <CardDescription>
              Personalized recommendations to help reduce your tax liability
            </CardDescription>
          </div>
          
          {onSavePlan && (
            <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="gap-2">
                  <SaveIcon className="h-4 w-4" />
                  Save Plan
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Save Tax Optimization Plan</DialogTitle>
                </DialogHeader>
                <div className="py-4">
                  <label className="text-sm font-medium">Plan Name</label>
                  <Input
                    value={planName}
                    onChange={(e) => setPlanName(e.target.value)}
                    placeholder="e.g., 2025 Tax Strategy"
                    className="mt-2"
                  />
                  <div className="mt-4">
                    <p className="text-sm font-medium mb-2">Select Suggestions to Include:</p>
                    <div className="max-h-60 overflow-y-auto border rounded-md p-2">
                      {suggestions.map((suggestion) => (
                        <div key={suggestion.id} className="flex items-center gap-2 py-1">
                          <input
                            type="checkbox"
                            id={`suggestion-${suggestion.id}`}
                            checked={selectedSuggestions.some(s => s.id === suggestion.id)}
                            onChange={() => toggleSuggestionSelection(suggestion)}
                            className="rounded"
                          />
                          <label htmlFor={`suggestion-${suggestion.id}`} className="text-sm">
                            {suggestion.title}
                          </label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleSavePlan} disabled={!planName || selectedSuggestions.length === 0}>
                    Save Plan
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          )}
        </div>
        
        {getTotalPotentialSavings() > 0 && (
          <div className="mt-2 p-3 bg-green-50 border border-green-200 rounded-md">
            <p className="text-sm font-medium text-green-800">
              Potential Savings: ₦{getTotalPotentialSavings().toLocaleString()}
            </p>
            <p className="text-xs text-green-700">
              By implementing applicable suggestions based on your data
            </p>
          </div>
        )}
      </CardHeader>

      <CardContent className="space-y-4">
        {Object.keys(groupedSuggestions).length > 0 ? (
          <Accordion type="single" collapsible className="w-full">
            {Object.entries(groupedSuggestions).map(([category, categorySuggestions], index) => (
              <AccordionItem key={category} value={category}>
                <AccordionTrigger className="capitalize">
                  <div className="flex items-center gap-2">
                    {getCategoryIcon(category)}
                    {category.replace('_', ' ')} Opportunities
                    <Badge className="ml-2" variant="outline">
                      {categorySuggestions.length}
                    </Badge>
                  </div>
                </AccordionTrigger>
                <AccordionContent>
                  <div className="space-y-3 py-1">
                    {categorySuggestions.map((suggestion) => (
                      <div
                        key={suggestion.id}
                        className="border rounded-md p-3 hover:bg-slate-50 transition-colors"
                      >
                        <div className="flex justify-between items-start mb-1">
                          <h4 className="font-medium text-sm">{suggestion.title}</h4>
                          <Badge
                            variant="secondary"
                            className={getApplicabilityColor(suggestion.applicability)}
                          >
                            {suggestion.applicability} impact
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600 mb-2">{suggestion.description}</p>
                        {suggestion.potentialSavings !== null && (
                          <p className="text-sm font-medium text-green-700">
                            Potential savings: ₦{suggestion.potentialSavings.toLocaleString()}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        ) : (
          <div className="py-8 text-center">
            <p className="text-muted-foreground">
              No optimization suggestions available for the current tax data.
              Calculate your taxes first to get personalized recommendations.
            </p>
          </div>
        )}
      </CardContent>

      {onSavePlan && suggestions.length > 0 && (
        <CardFooter className="flex justify-between border-t pt-4">
          <p className="text-xs text-muted-foreground">
            These suggestions are based on your provided data and may not cover all possible
            optimization strategies. Consult a tax professional for comprehensive advice.
          </p>
        </CardFooter>
      )}
    </Card>
  );
};
