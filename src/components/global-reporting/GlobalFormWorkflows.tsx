
import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { FileText, Plus, CheckCircle, Clock, ArrowRight } from "lucide-react";
import { toast } from "sonner";

interface GlobalFormWorkflowsProps {
  countries: string[];
  deadlines: any[];
}

export function GlobalFormWorkflows({ countries, deadlines }: GlobalFormWorkflowsProps) {
  const [activeWorkflow, setActiveWorkflow] = useState<string | null>(null);
  const [selectedCountry, setSelectedCountry] = useState("");
  const [selectedTaxType, setSelectedTaxType] = useState("");
  const [currentStep, setCurrentStep] = useState(1);

  const workflowTypes = [
    {
      id: "new-report",
      title: "Start New Country Report",
      description: "Begin a new tax report for a specific country",
      steps: ["Select Country & Tax Type", "Enter Basic Information", "Upload Supporting Documents", "Review & Submit"]
    },
    {
      id: "compliance-setup",
      title: "Setup Compliance Requirements",
      description: "Configure compliance monitoring for a jurisdiction",
      steps: ["Select Jurisdiction", "Define Requirements", "Set Deadlines", "Configure Alerts"]
    },
    {
      id: "cross-border",
      title: "Cross-Border Tax Planning",
      description: "Manage multi-jurisdiction tax obligations",
      steps: ["Identify Jurisdictions", "Map Tax Obligations", "Plan Reporting Schedule", "Coordinate Filings"]
    }
  ];

  const taxTypes = [
    "Corporate Income Tax",
    "VAT/GST",
    "Transfer Pricing",
    "Withholding Tax",
    "Digital Services Tax",
    "Other"
  ];

  const startWorkflow = (workflowId: string) => {
    setActiveWorkflow(workflowId);
    setCurrentStep(1);
    setSelectedCountry("");
    setSelectedTaxType("");
  };

  const nextStep = () => {
    const workflow = workflowTypes.find(w => w.id === activeWorkflow);
    if (workflow && currentStep < workflow.steps.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const completeWorkflow = () => {
    toast.success("Workflow completed successfully!");
    setActiveWorkflow(null);
    setCurrentStep(1);
  };

  const renderWorkflowStep = () => {
    if (!activeWorkflow) return null;

    const workflow = workflowTypes.find(w => w.id === activeWorkflow);
    if (!workflow) return null;

    switch (activeWorkflow) {
      case "new-report":
        return renderNewReportStep();
      case "compliance-setup":
        return renderComplianceSetupStep();
      case "cross-border":
        return renderCrossBorderStep();
      default:
        return null;
    }
  };

  const renderNewReportStep = () => {
    switch (currentStep) {
      case 1:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Country</label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country} value={country}>
                      {country}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Tax Type</label>
              <Select value={selectedTaxType} onValueChange={setSelectedTaxType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select tax type" />
                </SelectTrigger>
                <SelectContent>
                  {taxTypes.map((type) => (
                    <SelectItem key={type} value={type}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        );
      case 2:
        return (
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Tax Year</label>
              <Input type="number" placeholder="2024" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Company Name</label>
              <Input placeholder="Enter company name" />
            </div>
            <div>
              <label className="text-sm font-medium mb-2 block">Report Description</label>
              <Textarea placeholder="Brief description of the report" />
            </div>
          </div>
        );
      case 3:
        return (
          <div className="space-y-4">
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-400" />
              <p className="text-gray-600 mb-2">Upload supporting documents</p>
              <Button variant="outline">
                <Plus className="mr-2 h-4 w-4" />
                Add Documents
              </Button>
            </div>
          </div>
        );
      case 4:
        return (
          <div className="space-y-4">
            <div className="p-4 bg-muted rounded-lg">
              <h4 className="font-medium mb-2">Review Your Submission</h4>
              <div className="space-y-2 text-sm">
                <div><strong>Country:</strong> {selectedCountry}</div>
                <div><strong>Tax Type:</strong> {selectedTaxType}</div>
                <div><strong>Status:</strong> Ready to submit</div>
              </div>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const renderComplianceSetupStep = () => {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4" />
          <p>Compliance setup workflow step {currentStep}</p>
          <p className="text-sm">This would contain jurisdiction-specific compliance forms</p>
        </div>
      </div>
    );
  };

  const renderCrossBorderStep = () => {
    return (
      <div className="space-y-4">
        <div className="text-center py-8 text-muted-foreground">
          <Clock className="h-12 w-12 mx-auto mb-4" />
          <p>Cross-border planning workflow step {currentStep}</p>
          <p className="text-sm">This would contain multi-jurisdiction coordination tools</p>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-6">
      {!activeWorkflow ? (
        <>
          {/* Workflow Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {workflowTypes.map((workflow) => (
              <Card key={workflow.id} className="cursor-pointer hover:shadow-md transition-shadow">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <FileText className="h-5 w-5" />
                    {workflow.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground mb-4">{workflow.description}</p>
                  <div className="space-y-2 mb-4">
                    {workflow.steps.map((step, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center text-xs">
                          {index + 1}
                        </div>
                        <span>{step}</span>
                      </div>
                    ))}
                  </div>
                  <Button onClick={() => startWorkflow(workflow.id)} className="w-full">
                    Start Workflow
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Quick Actions */}
          <Card>
            <CardHeader>
              <CardTitle>Quick Actions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {deadlines.slice(0, 4).map((deadline) => (
                  <div key={deadline.id} className="p-4 border rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <Badge variant="outline" className="text-xs">
                        {deadline.country}
                      </Badge>
                      <Badge className={deadline.priority === 'high' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}>
                        {deadline.priority}
                      </Badge>
                    </div>
                    <h4 className="font-medium text-sm mb-1">{deadline.title}</h4>
                    <p className="text-xs text-muted-foreground mb-3">
                      Due: {new Date(deadline.due_date).toLocaleDateString()}
                    </p>
                    <Button size="sm" variant="outline" className="w-full">
                      <ArrowRight className="mr-1 h-3 w-3" />
                      Start Report
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      ) : (
        /* Active Workflow */
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>
                {workflowTypes.find(w => w.id === activeWorkflow)?.title}
              </CardTitle>
              <Button variant="outline" onClick={() => setActiveWorkflow(null)}>
                Cancel
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <span>Step {currentStep} of {workflowTypes.find(w => w.id === activeWorkflow)?.steps.length}</span>
                <span>{Math.round((currentStep / (workflowTypes.find(w => w.id === activeWorkflow)?.steps.length || 1)) * 100)}%</span>
              </div>
              <Progress value={(currentStep / (workflowTypes.find(w => w.id === activeWorkflow)?.steps.length || 1)) * 100} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div>
                <h3 className="font-medium mb-4">
                  {workflowTypes.find(w => w.id === activeWorkflow)?.steps[currentStep - 1]}
                </h3>
                {renderWorkflowStep()}
              </div>
              
              <div className="flex justify-between">
                <Button 
                  variant="outline" 
                  onClick={() => setCurrentStep(Math.max(1, currentStep - 1))}
                  disabled={currentStep === 1}
                >
                  Previous
                </Button>
                {currentStep === workflowTypes.find(w => w.id === activeWorkflow)?.steps.length ? (
                  <Button onClick={completeWorkflow}>
                    <CheckCircle className="mr-2 h-4 w-4" />
                    Complete
                  </Button>
                ) : (
                  <Button onClick={nextStep}>
                    Next
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
