
import React, { useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Plus, Search } from "lucide-react";

type ConfirmationType = "positive" | "negative" | "blank";
type ConfirmationStatus = "sent" | "returned" | "agreed" | "disagreed" | "no_response";

interface Confirmation {
  id: string;
  customerName: string;
  accountBalance: number;
  type: ConfirmationType;
  sentDate: string;
  status: ConfirmationStatus;
}

export const ConfirmationManager = () => {
  const [confirmationType, setConfirmationType] = useState<ConfirmationType>("positive");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  
  // Mock data for confirmations
  const mockConfirmations: Confirmation[] = [
    {
      id: "conf-001",
      customerName: "Great Manufacturing",
      accountBalance: 175000,
      type: "positive",
      sentDate: "2025-03-15",
      status: "disagreed",
    },
    {
      id: "conf-002",
      customerName: "ABC Corp",
      accountBalance: 89500,
      type: "positive",
      sentDate: "2025-03-15",
      status: "agreed",
    },
    {
      id: "conf-003",
      customerName: "XYZ Industries",
      accountBalance: 45000,
      type: "negative",
      sentDate: "2025-03-16",
      status: "no_response",
    },
    {
      id: "conf-004",
      customerName: "123 Enterprises",
      accountBalance: 28000,
      type: "blank",
      sentDate: "2025-03-16",
      status: "returned",
    },
  ];

  const getStatusBadge = (status: ConfirmationStatus) => {
    const statusStyles = {
      sent: "bg-blue-100 text-blue-800",
      returned: "bg-purple-100 text-purple-800",
      agreed: "bg-green-100 text-green-800",
      disagreed: "bg-red-100 text-red-800",
      no_response: "bg-yellow-100 text-yellow-800",
    };

    const statusLabels = {
      sent: "Sent",
      returned: "Returned",
      agreed: "Agreed",
      disagreed: "Disagreed",
      no_response: "No Response",
    };

    return (
      <Badge className={statusStyles[status]}>
        {statusLabels[status]}
      </Badge>
    );
  };

  const getTypeLabel = (type: ConfirmationType) => {
    const typeLabels = {
      positive: "Positive",
      negative: "Negative",
      blank: "Blank",
    };
    return typeLabels[type];
  };

  const filteredConfirmations = mockConfirmations.filter(conf => 
    statusFilter === "all" || conf.status === statusFilter
  );

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confirmation Management</CardTitle>
        <CardDescription>
          Track and manage third-party confirmations for accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4">
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="returned">Returned</SelectItem>
                <SelectItem value="agreed">Agreed</SelectItem>
                <SelectItem value="disagreed">Disagreed</SelectItem>
                <SelectItem value="no_response">No Response</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm">
              <Search className="h-4 w-4 mr-2" />
              Search
            </Button>
            <Button variant="outline" size="sm">
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button size="sm">
              <Plus className="h-4 w-4 mr-2" />
              New Confirmation
            </Button>
          </div>
        </div>
        
        <div className="rounded-md border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Account Balance</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Sent Date</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredConfirmations.map((conf) => (
                <TableRow key={conf.id}>
                  <TableCell className="font-medium">{conf.customerName}</TableCell>
                  <TableCell>₦{conf.accountBalance.toLocaleString()}</TableCell>
                  <TableCell>{getTypeLabel(conf.type)}</TableCell>
                  <TableCell>{conf.sentDate}</TableCell>
                  <TableCell>{getStatusBadge(conf.status)}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">View</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};
