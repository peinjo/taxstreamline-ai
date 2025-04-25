
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ShieldCheck } from "lucide-react";

interface InternalControl {
  id: string;
  name: string;
  type: 'process' | 'it' | 'segregation' | 'management';
  description: string;
  status: 'effective' | 'deficient' | 'not-tested';
}

export const InternalControlsMonitor = () => {
  // Mock data for internal controls
  const internalControls: InternalControl[] = [
    {
      id: "ctrl-001",
      name: "Sales Terms Approval",
      type: "process",
      description: "The corporate controller reviews and approves sales terms for all customer orders over $10,000.",
      status: "effective"
    },
    {
      id: "ctrl-002",
      name: "ERP Access Control",
      type: "it",
      description: "Only designated and approved personnel have access to the ERP inventory module.",
      status: "effective"
    },
    {
      id: "ctrl-003",
      name: "Sales Order Segregation",
      type: "segregation",
      description: "Only customer service team members can enter and make adjustments to sales orders, not sales personnel.",
      status: "deficient"
    },
    {
      id: "ctrl-004",
      name: "AR Review",
      type: "management",
      description: "The corporate controller reviews the AR report weekly and follows up on all customer balances greater than $20,000 that are 30 days or more past due.",
      status: "not-tested"
    },
  ];

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      effective: "bg-green-100 text-green-800",
      deficient: "bg-red-100 text-red-800",
      "not-tested": "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
      effective: "Effective",
      deficient: "Deficient",
      "not-tested": "Not Tested",
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {statusLabels[status as keyof typeof statusLabels]}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels = {
      process: "Process Control",
      it: "IT General Control",
      segregation: "Segregation of Duties",
      management: "Management Review",
    };

    return typeLabels[type as keyof typeof typeLabels];
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <ShieldCheck className="h-5 w-5" />
          Internal Controls Monitor
        </CardTitle>
        <CardDescription>
          Track and evaluate internal controls across business processes
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="controls">
          <TabsList className="mb-4">
            <TabsTrigger value="controls">Controls List</TabsTrigger>
            <TabsTrigger value="flowchart">Process Flowchart</TabsTrigger>
          </TabsList>
          
          <TabsContent value="controls">
            <div className="rounded-md border">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Control</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {internalControls.map((control) => (
                    <TableRow key={control.id}>
                      <TableCell className="font-medium">{control.name}</TableCell>
                      <TableCell>{getTypeLabel(control.type)}</TableCell>
                      <TableCell>{control.description}</TableCell>
                      <TableCell>{getStatusBadge(control.status)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
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
        </Tabs>
      </CardContent>
    </Card>
  );
};
