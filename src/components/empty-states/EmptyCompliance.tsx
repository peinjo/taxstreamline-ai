import React from "react";
import { ClipboardCheck, Plus, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface EmptyComplianceProps {
  onCreateItem?: () => void;
  title?: string;
  description?: string;
}

export function EmptyCompliance({
  onCreateItem,
  title = "No compliance items tracked",
  description = "Track your regulatory requirements, tax filings, and compliance deadlines to stay audit-ready.",
}: EmptyComplianceProps) {
  return (
    <Card className="p-12 text-center border-dashed">
      <div className="flex flex-col items-center space-y-4">
        <div className="rounded-full bg-green-500/10 p-6">
          <ClipboardCheck className="h-12 w-12 text-green-500" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold">{title}</h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {description}
          </p>
        </div>
        <div className="flex gap-3 pt-2">
          {onCreateItem && (
            <Button onClick={onCreateItem} size="lg" className="bg-green-500 hover:bg-green-600">
              <Plus className="h-4 w-4 mr-2" />
              Add Compliance Item
            </Button>
          )}
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground mt-4">
          <Shield className="h-4 w-4" />
          <span>Never miss a regulatory deadline</span>
        </div>
      </div>
    </Card>
  );
}
