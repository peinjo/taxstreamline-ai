
import React from "react";
import { Database } from "lucide-react";
import { Button } from "@/components/ui/button";
import { UseMutationResult } from "@tanstack/react-query";

interface HeaderProps {
  taxReportsCount: number | undefined;
  createSampleData: UseMutationResult<any, Error, void, unknown>;
}

export const Header: React.FC<HeaderProps> = ({ taxReportsCount, createSampleData }) => {
  return (
    <div className="flex justify-between items-center flex-wrap gap-4">
      <div>
        <h1 className="text-2xl font-semibold">Audit & Reporting</h1>
        <p className="text-muted-foreground">
          View and analyze tax reports, confirmations, and internal controls
        </p>
      </div>
      
      {taxReportsCount === 0 && (
        <Button 
          onClick={() => createSampleData.mutate()} 
          disabled={createSampleData.isPending}
          className="gap-2"
        >
          <Database className="h-4 w-4" />
          {createSampleData.isPending ? "Creating Sample Data..." : "Create Sample Data"}
        </Button>
      )}
    </div>
  );
};
