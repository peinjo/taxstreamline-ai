
import React from "react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { getCurrentYearOptions } from "./utils";
import { MaterialityFormData, MaterialityResults } from "./types";

interface MaterialityFormProps {
  formData: MaterialityFormData;
  results: MaterialityResults;
  onChange: (field: keyof MaterialityFormData, value: any) => void;
}

export function MaterialityForm({ formData, results, onChange }: MaterialityFormProps) {
  return (
    <div className="space-y-4">
      <div className="grid gap-2">
        <Label htmlFor="year">Year</Label>
        <Select 
          value={formData.year.toString()} 
          onValueChange={(value) => onChange("year", parseInt(value))}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select year" />
          </SelectTrigger>
          <SelectContent>
            {getCurrentYearOptions().map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="preTaxIncome">Pre-Tax Net Income (₦)</Label>
        <Input
          id="preTaxIncome"
          type="number"
          value={formData.preTaxIncome}
          onChange={(e) => onChange("preTaxIncome", parseFloat(e.target.value) || 0)}
          placeholder="Enter pre-tax net income"
        />
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="industry">Industry (Optional)</Label>
        <Select 
          value={formData.industry} 
          onValueChange={(value) => onChange("industry", value)}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="banking">Banking & Finance</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
            <SelectItem value="oil-gas">Oil & Gas</SelectItem>
            <SelectItem value="telecommunications">Telecommunications</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="agriculture">Agriculture</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="other">Other</SelectItem>
          </SelectContent>
        </Select>
      </div>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="materialityPercentage">Materiality Percentage (%)</Label>
          <Input
            id="materialityPercentage"
            type="number"
            value={formData.materialityPercentage}
            onChange={(e) => onChange("materialityPercentage", parseFloat(e.target.value) || 1)}
            placeholder="Default: 1%"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="performanceMateriality">Performance Materiality (%)</Label>
          <Input
            id="performanceMateriality"
            type="number" 
            value={formData.performanceMaterialityPercentage}
            onChange={(e) => onChange("performanceMaterialityPercentage", parseFloat(e.target.value) || 75)}
            placeholder="Default: 75%"
          />
        </div>
      </div>
      
      <div className="grid gap-2">
        <Label htmlFor="notes">Notes (Optional)</Label>
        <Textarea
          id="notes"
          value={formData.notes}
          onChange={(e) => onChange("notes", e.target.value)}
          placeholder="Add any additional notes or context"
          rows={3}
        />
      </div>
      
      <div className="mt-6 space-y-4 rounded-md bg-muted p-4">
        <div className="flex justify-between">
          <span className="font-medium">Materiality Threshold:</span>
          <span className="font-bold">₦{results.materialityThreshold.toLocaleString()}</span>
        </div>
        <div className="flex justify-between">
          <span className="font-medium">Performance Materiality:</span>
          <span className="font-bold">₦{results.performanceMateriality.toLocaleString()}</span>
        </div>
      </div>
    </div>
  );
}
