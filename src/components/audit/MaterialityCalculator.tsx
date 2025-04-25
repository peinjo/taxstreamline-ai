
import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Calculator } from "lucide-react";

export const MaterialityCalculator = () => {
  const [preTaxIncome, setPreTaxIncome] = useState<number>(0);
  const [materialityPercentage, setMaterialityPercentage] = useState<number>(1);
  const [performanceMaterialityPercentage, setPerformanceMaterialityPercentage] = useState<number>(75);

  const materialityThreshold = (preTaxIncome * materialityPercentage) / 100;
  const performanceMateriality = (materialityThreshold * performanceMaterialityPercentage) / 100;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calculator className="h-5 w-5" />
          Materiality Calculator
        </CardTitle>
        <CardDescription>
          Calculate materiality threshold based on pre-tax net income
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid gap-2">
            <Label htmlFor="preTaxIncome">Pre-Tax Net Income (₦)</Label>
            <Input
              id="preTaxIncome"
              type="number"
              value={preTaxIncome}
              onChange={(e) => setPreTaxIncome(parseFloat(e.target.value) || 0)}
              placeholder="Enter pre-tax net income"
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="materialityPercentage">Materiality Percentage (%)</Label>
              <Input
                id="materialityPercentage"
                type="number"
                value={materialityPercentage}
                onChange={(e) => setMaterialityPercentage(parseFloat(e.target.value) || 1)}
                placeholder="Default: 1%"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="performanceMateriality">Performance Materiality (%)</Label>
              <Input
                id="performanceMateriality"
                type="number" 
                value={performanceMaterialityPercentage}
                onChange={(e) => setPerformanceMaterialityPercentage(parseFloat(e.target.value) || 75)}
                placeholder="Default: 75%"
              />
            </div>
          </div>
          
          <div className="mt-6 space-y-4 rounded-md bg-muted p-4">
            <div className="flex justify-between">
              <span className="font-medium">Materiality Threshold:</span>
              <span className="font-bold">₦{materialityThreshold.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Performance Materiality:</span>
              <span className="font-bold">₦{performanceMateriality.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
