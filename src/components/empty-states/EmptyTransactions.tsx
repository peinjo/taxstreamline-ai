import React from "react";
import { Receipt, Plus, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyTransactionsProps {
  onAddTransaction?: () => void;
  onImportCSV?: () => void;
  title?: string;
  description?: string;
}

export function EmptyTransactions({
  onAddTransaction,
  onImportCSV,
  title = "No transactions recorded",
  description = "Track your income and expenses to generate accurate tax calculations and filing packs.",
}: EmptyTransactionsProps) {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-orange-500/10 p-6">
          <Receipt className="h-12 w-12 text-orange-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          {onAddTransaction && (
            <Button onClick={onAddTransaction} size="lg" className="bg-orange-500 hover:bg-orange-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Transaction
            </Button>
          )}
          {onImportCSV && (
            <Button onClick={onImportCSV} variant="outline" size="lg">
              <ArrowUpDown className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
          )}
        </div>
      </div>
    </Card>
  );
}
