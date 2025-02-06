import React from "react";
import { Card } from "@/components/ui/card";

interface TaxCalculatorLayoutProps {
  title: string;
  children: React.ReactNode;
}

export const TaxCalculatorLayout = ({ title, children }: TaxCalculatorLayoutProps) => {
  return (
    <div className="mt-6">
      <Card className="p-6">
        <h2 className="text-2xl font-semibold mb-6">{title}</h2>
        {children}
      </Card>
    </div>
  );
};