
import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { 
  Calculator, 
  Save, 
  History, 
  X, 
  Check, 
  AlertTriangle 
} from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import type { MaterialityCalculation } from "@/types";
import { toast } from "@/components/ui/use-toast";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";

export const MaterialityCalculator = () => {
  const [preTaxIncome, setPreTaxIncome] = useState<number>(0);
  const [materialityPercentage, setMaterialityPercentage] = useState<number>(1);
  const [performanceMaterialityPercentage, setPerformanceMaterialityPercentage] = useState<number>(75);
  const [year, setYear] = useState<number>(new Date().getFullYear());
  const [industry, setIndustry] = useState<string>("");
  const [notes, setNotes] = useState<string>("");
  const [isHistoryOpen, setIsHistoryOpen] = useState<boolean>(false);
  
  const queryClient = useQueryClient();

  const materialityThreshold = (preTaxIncome * materialityPercentage) / 100;
  const performanceMateriality = (materialityThreshold * performanceMaterialityPercentage) / 100;

  // Fetch previous calculations
  const { data: previousCalculations, isLoading } = useQuery({
    queryKey: ['materiality-calculations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('materiality_calculations')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading previous calculations",
          description: error.message,
        });
        throw error;
      }
      return data as MaterialityCalculation[];
    }
  });

  // Save calculation to database
  const saveMutation = useMutation({
    mutationFn: async (calculation: MaterialityCalculation) => {
      const { data, error } = await supabase
        .from('materiality_calculations')
        .insert(calculation);

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Calculation saved",
        description: "Your materiality calculation has been saved successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['materiality-calculations'] });
    },
    onError: (error) => {
      console.error("Save error:", error);
      toast({
        variant: "destructive",
        title: "Error saving calculation",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const handleSave = () => {
    if (preTaxIncome <= 0) {
      toast({
        variant: "destructive",
        title: "Invalid input",
        description: "Pre-tax income must be greater than zero.",
      });
      return;
    }

    const calculation: MaterialityCalculation = {
      pre_tax_income: preTaxIncome,
      materiality_percentage: materialityPercentage,
      performance_materiality_percentage: performanceMaterialityPercentage,
      materiality_threshold: materialityThreshold,
      performance_materiality: performanceMateriality,
      year,
      industry: industry || null,
      notes: notes || null
    };

    saveMutation.mutate(calculation);
  };

  const loadCalculation = (calc: MaterialityCalculation) => {
    setPreTaxIncome(calc.pre_tax_income);
    setMaterialityPercentage(calc.materiality_percentage);
    setPerformanceMaterialityPercentage(calc.performance_materiality_percentage);
    setYear(calc.year);
    setIndustry(calc.industry || "");
    setNotes(calc.notes || "");
    setIsHistoryOpen(false);
  };

  const currentYearOptions = () => {
    const currentYear = new Date().getFullYear();
    return [currentYear - 2, currentYear - 1, currentYear, currentYear + 1].map(
      (year) => ({
        value: year.toString(),
        label: year.toString(),
      })
    );
  };

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
          {isHistoryOpen ? (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-lg font-medium">Previous Calculations</h3>
                <Button variant="ghost" size="sm" onClick={() => setIsHistoryOpen(false)}>
                  <X className="h-4 w-4 mr-1" /> Close History
                </Button>
              </div>
              
              {isLoading ? (
                <p className="text-center py-4 text-muted-foreground">Loading previous calculations...</p>
              ) : previousCalculations?.length ? (
                <div className="max-h-[300px] overflow-y-auto border rounded-md">
                  <div className="divide-y">
                    {previousCalculations.map((calc) => (
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
                          <Button variant="ghost" size="sm" onClick={() => loadCalculation(calc)}>
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
          ) : (
            <>
              <div className="grid gap-2">
                <Label htmlFor="year">Year</Label>
                <Select value={year.toString()} onValueChange={(value) => setYear(parseInt(value))}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select year" />
                  </SelectTrigger>
                  <SelectContent>
                    {currentYearOptions().map((option) => (
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
                  value={preTaxIncome}
                  onChange={(e) => setPreTaxIncome(parseFloat(e.target.value) || 0)}
                  placeholder="Enter pre-tax net income"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="industry">Industry (Optional)</Label>
                <Select value={industry} onValueChange={setIndustry}>
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
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Notes (Optional)</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Add any additional notes or context"
                  rows={3}
                />
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
            </>
          )}
        </div>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => setIsHistoryOpen(!isHistoryOpen)}
        >
          <History className="h-4 w-4 mr-2" />
          {isHistoryOpen ? "Calculator" : "History"}
        </Button>
        {!isHistoryOpen && (
          <Button 
            onClick={handleSave}
            disabled={saveMutation.isPending || preTaxIncome <= 0}
          >
            <Save className="h-4 w-4 mr-2" />
            {saveMutation.isPending ? "Saving..." : "Save Calculation"}
          </Button>
        )}
      </CardFooter>
    </Card>
  );
};
