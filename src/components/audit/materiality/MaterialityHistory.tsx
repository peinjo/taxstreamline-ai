
import React from "react";
import { Button } from "@/components/ui/button";
import { Check, X, AlertTriangle } from "lucide-react";
import type { MaterialityCalculation } from "@/types";

interface MaterialityHistoryProps {
  calculations: MaterialityCalculation[] | undefined;
  isLoading: boolean;
  onLoadCalculation: (calc: MaterialityCalculation) => void;
  onClose: () => void;
}

export function MaterialityHistory({
  calculations,
  isLoading,
  onLoadCalculation,
  onClose,
}: MaterialityHistoryProps) {
  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium">Previous Calculations</h3>
        <Button variant="ghost" size="sm" onClick={onClose}>
          <X className="h-4 w-4 mr-1" /> Close History
        </Button>
      </div>
      
      {isLoading ? (
        <p className="text-center py-4 text-muted-foreground">Loading previous calculations...</p>
      ) : calculations?.length ? (
        <div className="max-h-[300px] overflow-y-auto border rounded-md">
          <div className="divide-y">
            {calculations.map((calc) => (
              <div key={calc.id} className="p-3 hover:bg-muted">
                <div className="flex justify-between">
                  <div>
                    <p className="font-medium">₦{calc.pre_tax_income.toLocaleString()} ({calc.year})</p>
                    <p className="text-sm text-muted-foreground">
                      Materiality: ₦{calc.materiality_threshold.toLocaleString()} ({calc.materiality_percentage}%)
                    </p>
                    {calc.industry && (
                      <p className="text-xs text-muted-foreground">{calc.industry}</p>
                    )}
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onLoadCalculation(calc)}>
                    <Check className="h-4 w-4 mr-1" /> Use
                  </Button>
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  {new Date(calc.created_at!).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-6 text-muted-foreground border rounded-md">
          <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
          <p>No previous calculations found</p>
        </div>
      )}
    </div>
  );
}
