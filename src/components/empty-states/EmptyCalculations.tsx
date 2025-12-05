import React from "react";
import { Calculator, Plus, TrendingUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyCalculationsProps {
  onCalculate?: () => void;
  title?: string;
  description?: string;
}

export function EmptyCalculations({
  onCalculate,
  title = "No calculations yet",
  description = "Calculate your tax liabilities including VAT, Corporate Income Tax, PAYE, and more with detailed breakdowns.",
}: EmptyCalculationsProps) {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-purple-500/10 p-6">
          <Calculator className="h-12 w-12 text-purple-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          {onCalculate && (
            <Button onClick={onCalculate} size="lg" className="bg-purple-500 hover:bg-purple-600">
              <Plus className="h-4 w-4 mr-2" />
              Start Calculation
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
          <TrendingUp className="h-4 w-4" />
          <span>See formula breakdowns and optimize your taxes</span>
        </div>
      </div>
    </Card>
  );
}
