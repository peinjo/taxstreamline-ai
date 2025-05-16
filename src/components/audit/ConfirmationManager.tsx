
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FileDown, Plus, Search, Loader2, Send, Clock } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "@/components/ui/use-toast";
import { Textarea } from "@/components/ui/textarea";
import type { ConfirmationRequest } from "@/types";
import { format } from "date-fns";
import { Skeleton } from "@/components/ui/skeleton";

export const ConfirmationManager = () => {
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [isNewConfirmationOpen, setIsNewConfirmationOpen] = useState<boolean>(false);
  const [newConfirmation, setNewConfirmation] = useState({
    entityName: "",
    contactEmail: "",
    requestType: "account_balance",
    amount: "",
    notes: ""
  });
  
  const queryClient = useQueryClient();

  // Fetch confirmation requests
  const { data: confirmations, isLoading } = useQuery({
    queryKey: ['confirmation-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('confirmation_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        toast({
          variant: "destructive",
          title: "Error loading confirmation requests",
          description: error.message,
        });
        throw error;
      }
      return data as ConfirmationRequest[];
    }
  });

  // Create new confirmation request
  const createConfirmationMutation = useMutation({
    mutationFn: async (confirmation: Partial<ConfirmationRequest>) => {
      const { data, error } = await supabase
        .from('confirmation_requests')
        .insert([confirmation])
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Confirmation request created",
        description: "Your confirmation request has been sent successfully.",
      });
      queryClient.invalidateQueries({ queryKey: ['confirmation-requests'] });
      setIsNewConfirmationOpen(false);
      setNewConfirmation({
        entityName: "",
        contactEmail: "",
        requestType: "account_balance",
        amount: "",
        notes: ""
      });
    },
    onError: (error) => {
      console.error("Create error:", error);
      toast({
        variant: "destructive",
        title: "Error creating confirmation request",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const handleCreateConfirmation = () => {
    const amount = newConfirmation.amount === "" ? null : parseFloat(newConfirmation.amount);
    
    if (!newConfirmation.entityName || !newConfirmation.contactEmail) {
      toast({
        variant: "destructive",
        title: "Missing required fields",
        description: "Please fill in all required fields.",
      });
      return;
    }
    
    const confirmation: Partial<ConfirmationRequest> = {
      entity_name: newConfirmation.entityName,
      contact_email: newConfirmation.contactEmail,
      request_type: newConfirmation.requestType,
      amount,
      status: "pending"
    };
    
    createConfirmationMutation.mutate(confirmation);
  };

  // Update confirmation status
  const updateStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: string, status: string }) => {
      const { data, error } = await supabase
        .from('confirmation_requests')
        .update({ status })
        .eq('id', id)
        .select();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      toast({
        title: "Status updated",
        description: "Confirmation request status has been updated.",
      });
      queryClient.invalidateQueries({ queryKey: ['confirmation-requests'] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Error updating status",
        description: error instanceof Error ? error.message : "Unknown error",
      });
    }
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-100 text-yellow-800",
      sent: "bg-blue-100 text-blue-800",
      confirmed: "bg-green-100 text-green-800",
      disputed: "bg-red-100 text-red-800",
      no_response: "bg-gray-100 text-gray-800",
    };

    const statusLabels = {
      pending: "Pending",
      sent: "Sent",
      confirmed: "Confirmed",
      disputed: "Disputed",
      no_response: "No Response",
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles] || "bg-gray-100 text-gray-800"}>
        {statusLabels[status as keyof typeof statusLabels] || status}
      </Badge>
    );
  };

  const getTypeLabel = (type: string) => {
    const typeLabels: Record<string, string> = {
      account_balance: "Account Balance",
      accounts_receivable: "Accounts Receivable",
      accounts_payable: "Accounts Payable", 
      inventory: "Inventory",
      loans_debt: "Loans & Debt",
      legal_claims: "Legal Claims"
    };
    return typeLabels[type] || type;
  };

  // Filter confirmations based on search term and status filter
  const filteredConfirmations = React.useMemo(() => {
    if (!confirmations) return [];
    
    return confirmations.filter(conf => {
      const matchesSearch = searchTerm === "" || 
        conf.entity_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conf.contact_email.toLowerCase().includes(searchTerm.toLowerCase()) ||
        conf.request_type.toLowerCase().includes(searchTerm.toLowerCase());
        
      const matchesStatus = statusFilter === "all" || conf.status === statusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [confirmations, searchTerm, statusFilter]);

  const formatDate = (dateString?: string | null) => {
    if (!dateString) return "N/A";
    try {
      return format(new Date(dateString), "MMM d, yyyy");
    } catch (error) {
      return "Invalid date";
    }
  };

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle>Confirmation Management</CardTitle>
        <CardDescription>
          Track and manage third-party confirmations for accounts
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="flex justify-between items-center mb-4 flex-wrap gap-4">
          <div className="flex gap-2">
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="pending">Pending</SelectItem>
                <SelectItem value="sent">Sent</SelectItem>
                <SelectItem value="confirmed">Confirmed</SelectItem>
                <SelectItem value="disputed">Disputed</SelectItem>
                <SelectItem value="no_response">No Response</SelectItem>
              </SelectContent>
            </Select>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search confirmations..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8 w-full md:w-[200px]"
              />
            </div>
          </div>
          
          <div className="flex gap-2">
            <Button variant="outline" size="sm" disabled={!filteredConfirmations.length}>
              <FileDown className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Dialog open={isNewConfirmationOpen} onOpenChange={setIsNewConfirmationOpen}>
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  New Confirmation
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Confirmation Request</DialogTitle>
                  <DialogDescription>
                    Send a new confirmation request to a third party for audit purposes.
                  </DialogDescription>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid gap-2">
                    <Label htmlFor="entityName">Entity Name*</Label>
                    <Input 
                      id="entityName" 
                      value={newConfirmation.entityName}
                      onChange={(e) => setNewConfirmation({...newConfirmation, entityName: e.target.value})}
                      placeholder="e.g., First Bank of Nigeria" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="contactEmail">Contact Email*</Label>
                    <Input 
                      id="contactEmail" 
                      type="email"
                      value={newConfirmation.contactEmail}
                      onChange={(e) => setNewConfirmation({...newConfirmation, contactEmail: e.target.value})}
                      placeholder="e.g., confirmations@bank.com" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="requestType">Request Type*</Label>
                    <Select 
                      value={newConfirmation.requestType}
                      onValueChange={(value) => setNewConfirmation({...newConfirmation, requestType: value})}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select request type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="account_balance">Account Balance</SelectItem>
                        <SelectItem value="accounts_receivable">Accounts Receivable</SelectItem>
                        <SelectItem value="accounts_payable">Accounts Payable</SelectItem>
                        <SelectItem value="inventory">Inventory</SelectItem>
                        <SelectItem value="loans_debt">Loans & Debt</SelectItem>
                        <SelectItem value="legal_claims">Legal Claims</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="amount">Amount (Optional)</Label>
                    <Input 
                      id="amount" 
                      type="number"
                      value={newConfirmation.amount}
                      onChange={(e) => setNewConfirmation({...newConfirmation, amount: e.target.value})}
                      placeholder="e.g., 1000000" 
                    />
                  </div>
                  
                  <div className="grid gap-2">
                    <Label htmlFor="notes">Notes (Optional)</Label>
                    <Textarea 
                      id="notes" 
                      value={newConfirmation.notes}
                      onChange={(e) => setNewConfirmation({...newConfirmation, notes: e.target.value})}
                      placeholder="Any additional details about the confirmation request" 
                      rows={3}
                    />
                  </div>
                </div>
                
                <DialogFooter>
                  <Button variant="outline" onClick={() => setIsNewConfirmationOpen(false)}>Cancel</Button>
                  <Button onClick={handleCreateConfirmation} disabled={createConfirmationMutation.isPending}>
                    {createConfirmationMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                    Create Request
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
        
        {isLoading ? (
          <div className="space-y-2">
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
            <Skeleton className="h-8 w-full" />
          </div>
        ) : filteredConfirmations.length > 0 ? (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Entity</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Date Requested</TableHead>
                  <TableHead>Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredConfirmations.map((conf) => (
                  <TableRow key={conf.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{conf.entity_name}</p>
                        <p className="text-xs text-muted-foreground">{conf.contact_email}</p>
                      </div>
                    </TableCell>
                    <TableCell>{getTypeLabel(conf.request_type)}</TableCell>
                    <TableCell>{formatDate(conf.date_requested)}</TableCell>
                    <TableCell>{conf.amount ? `₦${conf.amount.toLocaleString()}` : "N/A"}</TableCell>
                    <TableCell>{getStatusBadge(conf.status)}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="ghost" size="sm">View</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle>Confirmation Details</DialogTitle>
                            </DialogHeader>
                            <div className="space-y-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Entity</Label>
                                  <p className="font-medium">{conf.entity_name}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Type</Label>
                                  <p className="font-medium">{getTypeLabel(conf.request_type)}</p>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Email</Label>
                                  <p className="font-medium">{conf.contact_email}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Status</Label>
                                  <div className="pt-1">{getStatusBadge(conf.status)}</div>
                                </div>
                              </div>
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <Label className="text-muted-foreground">Date Requested</Label>
                                  <p className="font-medium">{formatDate(conf.date_requested)}</p>
                                </div>
                                <div>
                                  <Label className="text-muted-foreground">Date Responded</Label>
                                  <p className="font-medium">{formatDate(conf.date_responded)}</p>
                                </div>
                              </div>
                              <div>
                                <Label className="text-muted-foreground">Amount</Label>
                                <p className="font-medium">{conf.amount ? `₦${conf.amount.toLocaleString()}` : "N/A"}</p>
                              </div>
                              {conf.response && (
                                <div>
                                  <Label className="text-muted-foreground">Response</Label>
                                  <p className="bg-muted p-2 rounded mt-1">{conf.response}</p>
                                </div>
                              )}
                              
                              <div className="border-t pt-4">
                                <Label>Update Status</Label>
                                <div className="flex gap-2 mt-2">
                                  {conf.status !== "sent" && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => updateStatusMutation.mutate({ id: conf.id!, status: "sent" })}
                                      variant="outline"
                                      className="gap-1"
                                    >
                                      <Send className="h-4 w-4" />
                                      Mark as Sent
                                    </Button>
                                  )}
                                  {conf.status !== "confirmed" && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => updateStatusMutation.mutate({ id: conf.id!, status: "confirmed" })}
                                      variant="outline" 
                                      className="gap-1"
                                    >
                                      Confirm
                                    </Button>
                                  )}
                                  {conf.status !== "disputed" && (
                                    <Button 
                                      size="sm" 
                                      onClick={() => updateStatusMutation.mutate({ id: conf.id!, status: "disputed" })}
                                      variant="outline"
                                      className="gap-1"
                                    >
                                      Dispute
                                    </Button>
                                  )}
                                </div>
                              </div>
                            </div>
                          </DialogContent>
                        </Dialog>
                        
                        {conf.status === "pending" && (
                          <Button 
                            variant="outline" 
                            size="sm" 
                            onClick={() => updateStatusMutation.mutate({ id: conf.id!, status: "sent" })}
                            className="gap-1"
                          >
                            <Send className="h-4 w-4" />
                            Send
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 border rounded-md">
            <Clock className="mx-auto h-10 w-10 text-muted-foreground mb-2" />
            <h3 className="text-lg font-medium">No confirmation requests found</h3>
            <p className="text-sm text-muted-foreground mt-1">Create a new confirmation request to get started.</p>
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between border-t pt-4">
        <div className="text-sm text-muted-foreground">
          {filteredConfirmations.length} confirmation {filteredConfirmations.length === 1 ? "request" : "requests"} found
        </div>
        <Button variant="outline" size="sm" disabled={!filteredConfirmations.length}>
          <FileDown className="h-4 w-4 mr-2" />
          Export All
        </Button>
      </CardFooter>
    </Card>
  );
};
