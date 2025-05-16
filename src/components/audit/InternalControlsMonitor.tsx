import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck, Plus, Loader2, CheckCircle, AlertCircle } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { InternalControl } from "@/types";
import { format } from "date-fns";

export const InternalControlsMonitor = () => {
  const [isNewControlOpen, setIsNewControlOpen] = useState<boolean>(false);
  const [newControl, setNewControl] = useState({
    controlName: "",
    controlDescription: "",
    riskLevel: "medium",
  });
  
  const queryClient = useQueryClient();

  // Fetch internal controls
  const { data: internalControls, isLoading } = useQuery({
    queryKey: ['internal-controls'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('internal_controls')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading internal controls",
          description: error.message,
        });
        throw error;
      }
      return data as InternalControl[];
    }
  });

  // Create new internal control
  const createControlMutation = useMutation({
    mutationFn: async (control: Partial<InternalControl>) => {
      const { data, error } = await supabase
        .from('internal_controls')
        .insert(control)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Internal control created",
        description: "Your internal control has been created successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['internal-controls'] });
      setIsNewControlOpen(false);
      setNewControl({
        controlName: "",
        controlDescription: "",
        riskLevel: "medium",
      });
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        variant: "destructive",
        title: "Error creating internal control",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  // Update control status
  const updateControlMutation = useMutation({
    mutationFn: async ({ id, status, testResult }: { id: string, status: string, testResult?: string }) => {
      const updateData: Partial<InternalControl> = {
        status,
      };
      
      if (testResult) {
        updateData.test_result = testResult;
        updateData.last_tested = new Date().toISOString();
      }
      
      const { data, error } = await supabase
        .from('internal_controls')
        .update(updateData)
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Control updated",
        description: "Internal control has been updated successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['internal-controls'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating control",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const handleCreateControl = () => {
    if (!newControl.controlName || !newControl.controlDescription) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    const control: Partial<InternalControl> = {
      control_name: newControl.controlName,
      control_description: newControl.controlDescription,
      risk_level: newControl.riskLevel,
      status: "active"
    };
    
    createControlMutation.mutate(control);
  };

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      active: "bg-green-100 text-green-800",
      deficient: "bg-red-100 text-red-800",
      "needs review": "bg-yellow-100 text-yellow-800",
      inactive: "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
      active: "Effective",
      deficient: "Deficient",
      "needs review": "Needs Review",
      inactive: "Inactive",
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const getRiskLevelBadge = (riskLevel: string) => {
    const riskStyles = {
      high: "bg-red-100 text-red-800",
      medium: "bg-yellow-100 text-yellow-800",
      low: "bg-blue-100 text-blue-800",
    };

    return (
      <Badge className={riskStyles[riskLevel as keyof typeof riskStyles] || "bg-gray-100 text-gray-800"}>
        {riskLevel.charAt(0).toUpperCase() + riskLevel.slice(1)}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      process: "Process Control",
      it: "IT General Control",
      segregation: "Segregation of Duties",
      management: "Management Review",
      authorization: "Authorization Control",
      reconciliation: "Reconciliation Control",
    };
    return typeLabels[type] || type;
  };

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "Not tested";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-5 w-5" />
            <CardTitle>Internal Controls Monitor</CardTitle>
          </div>
          <Dialog open={isNewControlOpen} onOpenChange={setIsNewControlOpen}>
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="h-4 w-4 mr-2" />
                New Control
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Add New Internal Control</DialogTitle>
                <DialogDescription>
                  Create a new internal control to monitor and test within your organization.
                </DialogDescription>
              </DialogHeader>
              
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label htmlFor="controlName">Control Name*</Label>
                  <Input 
                    id="controlName" 
                    value={newControl.controlName}
                    onChange={(e) => setNewControl({...newControl, controlName: e.target.value})}
                    placeholder="e.g., Bank Reconciliation" 
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="controlDescription">Description*</Label>
                  <Textarea 
                    id="controlDescription" 
                    value={newControl.controlDescription}
                    onChange={(e) => setNewControl({...newControl, controlDescription: e.target.value})}
                    placeholder="Detailed description of the control" 
                    rows={3}
                  />
                </div>
                
                <div className="grid gap-2">
                  <Label htmlFor="riskLevel">Risk Level*</Label>
                  <Select 
                    value={newControl.riskLevel}
                    onValueChange={(value) => setNewControl({...newControl, riskLevel: value})}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select risk level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="low">Low</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              
              <DialogFooter>
                <Button variant="outline" onClick={() => setIsNewControlOpen(false)}>Cancel</Button>
                <Button onClick={handleCreateControl} disabled={createControlMutation.isPending}>
                  {createControlMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  Create Control
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
        <CardDescription>
          Track and evaluate internal controls across business processes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="controls">
          <TabsList className="mb-4">
            <TabsTrigger value="controls">Controls List</TabsTrigger>
            <TabsTrigger value="flowchart">Process Flowchart</TabsTrigger>
            <TabsTrigger value="testing">Test Results</TabsTrigger>
          </TabsList>
          
          <TabsContent value="controls">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : internalControls && internalControls.length > 0 ? (
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Control</TableHead>
                      <TableHead>Risk Level</TableHead>
                      <TableHead>Last Tested</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {internalControls.map((control) => (
                      <TableRow key={control.id}>
                        <TableCell>
                          <div>
                            <p className="font-medium">{control.control_name}</p>
                            <p className="text-xs text-muted-foreground truncate max-w-[300px]">{control.control_description}</p>
                          </div>
                        </TableCell>
                        <TableCell>{getRiskLevelBadge(control.risk_level)}</TableCell>
                        <TableCell>{formatDate(control.last_tested)}</TableCell>
                        <TableCell>{getStatusBadge(control.status)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Dialog>
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm">View</Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Control Details</DialogTitle>
                                </DialogHeader>
                                <div className="space-y-4">
                                  <div>
                                    <h3 className="font-semibold text-lg">{control.control_name}</h3>
                                    <div className="flex gap-2 mt-1">
                                      {getRiskLevelBadge(control.risk_level)}
                                      {getStatusBadge(control.status)}
                                    </div>
                                  </div>
                                  
                                  <div>
                                    <Label className="text-muted-foreground">Description</Label>
                                    <p className="mt-1">{control.control_description}</p>
                                  </div>
                                  
                                  <div className="grid grid-cols-2 gap-4">
                                    <div>
                                      <Label className="text-muted-foreground">Last Tested</Label>
                                      <p className="font-medium">{formatDate(control.last_tested)}</p>
                                    </div>
                                    <div>
                                      <Label className="text-muted-foreground">Test Result</Label>
                                      <p className="font-medium">{control.test_result || "Not tested"}</p>
                                    </div>
                                  </div>
                                  
                                  <div className="border-t pt-4">
                                    <Label>Test Control</Label>
                                    <div className="flex gap-2 mt-2">
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateControlMutation.mutate({ 
                                          id: control.id!, 
                                          status: "active",
                                          testResult: "Control is operating effectively"
                                        })}
                                        variant="outline"
                                        className="gap-1"
                                      >
                                        <CheckCircle className="h-4 w-4" />
                                        Test Passed
                                      </Button>
                                      <Button 
                                        size="sm" 
                                        onClick={() => updateControlMutation.mutate({ 
                                          id: control.id!, 
                                          status: "deficient",
                                          testResult: "Control is not operating as intended"
                                        })}
                                        variant="outline" 
                                        className="gap-1"
                                      >
                                        <AlertCircle className="h-4 w-4" />
                                        Test Failed
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </DialogContent>
                            </Dialog>
                            
                            <Button variant="outline" size="sm">Test</Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-10 border rounded-md">
                <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No internal controls found</h3>
                <p className="text-sm text-muted-foreground mt-1">Create a new internal control to get started.</p>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="flowchart">
            <div className="flex justify-center p-4 bg-white rounded-md border">
              <div className="text-center">
                <p className="text-muted-foreground mb-2">Order-to-Cash (OTC) Process Flowchart</p>
                <div className="p-4 bg-gray-50 rounded border text-center">
                  <p>Flowchart visualization would be displayed here, showing the entire OTC process 
                  with highlighted controls for:</p>
                  <ul className="list-disc text-left pl-6 mt-2">
                    <li>Sales term approvals (Control A)</li>
                    <li>ERP access restrictions (Control B)</li>
                    <li>Order entry segregation (Control C)</li>
                    <li>AR report review process (Control D)</li>
                  </ul>
                </div>
              </div>
            </div>
          </TabsContent>
          
          <TabsContent value="testing">
            {isLoading ? (
              <div className="space-y-2">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
              </div>
            ) : internalControls && internalControls.filter(c => c.last_tested).length > 0 ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <Card className="p-4 text-center">
                    <h3 className="text-lg font-medium">Total Controls</h3>
                    <p className="text-3xl font-bold mt-2">{internalControls.length}</p>
                  </Card>
                  <Card className="p-4 text-center">
                    <h3 className="text-lg font-medium">Controls Tested</h3>
                    <p className="text-3xl font-bold mt-2">
                      {internalControls.filter(c => c.last_tested).length}
                    </p>
                  </Card>
                  <Card className="p-4 text-center">
                    <h3 className="text-lg font-medium">Deficient Controls</h3>
                    <p className="text-3xl font-bold mt-2 text-red-600">
                      {internalControls.filter(c => c.status === "deficient").length}
                    </p>
                  </Card>
                </div>
                
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Control</TableHead>
                        <TableHead>Date Tested</TableHead>
                        <TableHead>Result</TableHead>
                        <TableHead>Action Required</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {internalControls
                        .filter(c => c.last_tested)
                        .sort((a, b) => 
                          new Date(b.last_tested!).getTime() - new Date(a.last_tested!).getTime()
                        )
                        .map((control) => (
                          <TableRow key={`test-${control.id}`}>
                            <TableCell className="font-medium">{control.control_name}</TableCell>
                            <TableCell>{formatDate(control.last_tested)}</TableCell>
                            <TableCell>
                              {control.status === "active" ? (
                                <Badge className="bg-green-100 text-green-800">Passed</Badge>
                              ) : (
                                <Badge className="bg-red-100 text-red-800">Failed</Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              {control.status === "deficient" ? "Remediation required" : "None"}
                            </TableCell>
                          </TableRow>
                        ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            ) : (
              <div className="text-center py-10 border rounded-md">
                <ShieldCheck className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
                <h3 className="text-lg font-medium">No control tests have been performed</h3>
                <p className="text-sm text-muted-foreground mt-1">Test your controls to see results here.</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {internalControls?.length || 0} internal control{internalControls?.length === 1 ? "" : "s"} configured
        </div>
      </CardFooter>
    </Card>
  );
};
