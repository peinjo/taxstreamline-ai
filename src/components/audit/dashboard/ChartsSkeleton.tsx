
import React from "react";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export const ChartsSkeleton: React.FC = () => {
  return (
    <div className="grid gap-6 md:grid-cols-2">
      {[...Array(2)].map((_, i) => (
        <Card key={i} className="min-h-[350px] flex items-center justify-center">
          <Skeleton className="h-[300px] w-[400px]" />
        </Card>
      ))}
    </div>
  );
};
