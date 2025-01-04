import React, { useState } from "react";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { TaxTemplates } from "./TaxTemplates";
import { TaxGuides } from "./TaxGuides";

export function TemplatesAndGuides() {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="space-y-6">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search templates and guides..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="grid gap-6 md:grid-cols-2">
        <TaxTemplates searchQuery={searchQuery} />
        <TaxGuides searchQuery={searchQuery} />
      </div>
    </div>
  );
}