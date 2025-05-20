
import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OptimizationSuggestion } from "@/services/taxOptimization";
import { FileClock, Trash2 } from "lucide-react";

interface SavedPlan {
  id: string;
  name: string;
  suggestions: OptimizationSuggestion[];
  date: Date;
}

interface SavedOptimizationPlansProps {
  plans: SavedPlan[];
  onDeletePlan?: (planId: string) => void;
  onViewPlan?: (plan: SavedPlan) => void;
}

export const SavedOptimizationPlans = ({
  plans,
  onDeletePlan,
  onViewPlan
}: SavedOptimizationPlansProps) => {
  if (plans.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <FileClock className="h-5 w-5" />
          Saved Optimization Plans
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {plans.map(plan => (
            <div
              key={plan.id}
              className="flex items-center justify-between p-3 border rounded-md hover:bg-slate-50"
            >
              <div>
                <h4 className="font-medium">{plan.name}</h4>
                <p className="text-sm text-muted-foreground">
                  {plan.date.toLocaleDateString()} • {plan.suggestions.length} suggestions
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onViewPlan?.(plan)}
                >
                  View
                </Button>
                {onDeletePlan && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDeletePlan(plan.id)}
                    className="text-red-500"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
};
