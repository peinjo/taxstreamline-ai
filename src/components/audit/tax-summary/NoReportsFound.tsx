
import React from "react";
import { Button } from "@/components/ui/button";

interface NoReportsFoundProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
}

export const NoReportsFound: React.FC<NoReportsFoundProps> = ({
  searchTerm,
  setSearchTerm
}) => {
  return (
    <div className="py-8 text-center">
      <p className="text-muted-foreground">No tax reports found for the current filters.</p>
      {searchTerm && (
        <Button 
          variant="ghost" 
          className="mt-2" 
          onClick={() => setSearchTerm("")}
        >
          Clear search
        </Button>
      )}
    </div>
  );
};
