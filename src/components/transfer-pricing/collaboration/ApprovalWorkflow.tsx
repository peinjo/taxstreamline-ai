import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, XCircle, Clock, Play, UserCheck, Workflow, Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface ApprovalWorkflow {
  id: string;
  document_id: string;
  workflow_name: string;
  current_step: number;
  total_steps: number;
  status: 'pending' | 'approved' | 'rejected' | 'cancelled';
  created_by: string;
  created_at: string;
  completed_at?: string;
  steps: ApprovalStep[];
}

interface ApprovalStep {
  id: string;
  workflow_id: string;
  step_number: number;
  approver_user_id: string;
  approver_role?: string;
  status: 'pending' | 'approved' | 'rejected' | 'skipped';
  comments?: string;
  approved_at?: string;
  approver_email?: string;
}

interface ApprovalWorkflowProps {
  documentId: string;
  canManageWorkflows?: boolean;
}

export function ApprovalWorkflow({ documentId, canManageWorkflows = false }: ApprovalWorkflowProps) {
  const [workflows, setWorkflows] = useState<ApprovalWorkflow[]>([]);
  const [loading, setLoading] = useState(true);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [newWorkflowName, setNewWorkflowName] = useState('');
  const [approvers, setApprovers] = useState<Array<{email: string, role?: string}>>([{email: '', role: ''}]);

  useEffect(() => {
    if (documentId) {
      fetchWorkflows();
    }
  }, [documentId]);

  const fetchWorkflows = async () => {
    try {
      setLoading(true);
      
      const { data: workflowsData, error: workflowsError } = await supabase
        .from('tp_approval_workflows')
        .select('*')
        .eq('document_id', documentId)
        .order('created_at', { ascending: false });

      if (workflowsError) throw workflowsError;

      // Fetch steps for each workflow
      const workflowsWithSteps = await Promise.all(
        (workflowsData || []).map(async (workflow) => {
          const { data: stepsData, error: stepsError } = await supabase
            .from('tp_approval_steps')
            .select('*')
            .eq('workflow_id', workflow.id)
            .order('step_number', { ascending: true });

          if (stepsError) throw stepsError;

          const stepsWithEmails = (stepsData || []).map(step => ({
            ...step,
            approver_email: 'approver@example.com',
            status: step.status as 'pending' | 'approved' | 'rejected' | 'skipped'
          }));

          return {
            ...workflow,
            status: workflow.status as 'pending' | 'approved' | 'rejected' | 'cancelled',
            steps: stepsWithEmails
          };
        })
      );

      setWorkflows(workflowsWithSteps);
    } catch (error) {
      console.error('Error fetching workflows:', error);
      toast.error('Failed to load approval workflows');
    } finally {
      setLoading(false);
    }
  };

  const createWorkflow = async () => {
    if (!newWorkflowName.trim() || approvers.some(a => !a.email.trim())) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      // Create workflow
      const { data: workflowData, error: workflowError } = await supabase
        .from('tp_approval_workflows')
        .insert({
          document_id: documentId,
          workflow_name: newWorkflowName,
          total_steps: approvers.length,
          created_by: 'current-user-id' // Replace with actual user ID
        })
        .select()
        .single();

      if (workflowError) throw workflowError;

      // Create approval steps
      const steps = approvers.map((approver, index) => ({
        workflow_id: workflowData.id,
        step_number: index + 1,
        approver_user_id: '00000000-0000-0000-0000-000000000000', // Placeholder - lookup by email
        approver_role: approver.role
      }));

      const { error: stepsError } = await supabase
        .from('tp_approval_steps')
        .insert(steps);

      if (stepsError) throw stepsError;

      toast.success('Approval workflow created successfully');
      setIsCreateDialogOpen(false);
      setNewWorkflowName('');
      setApprovers([{email: '', role: ''}]);
      fetchWorkflows();
    } catch (error) {
      console.error('Error creating workflow:', error);
      toast.error('Failed to create approval workflow');
    }
  };

  const approveStep = async (workflowId: string, stepId: string, comments?: string) => {
    try {
      const { error } = await supabase
        .from('tp_approval_steps')
        .update({
          status: 'approved',
          comments,
          approved_at: new Date().toISOString()
        })
        .eq('id', stepId);

      if (error) throw error;

      // Check if this was the last step and update workflow status
      const workflow = workflows.find(w => w.id === workflowId);
      if (workflow) {
        const currentStep = workflow.steps.find(s => s.id === stepId);
        if (currentStep && currentStep.step_number === workflow.total_steps) {
          await supabase
            .from('tp_approval_workflows')
            .update({
              status: 'approved',
              completed_at: new Date().toISOString()
            })
            .eq('id', workflowId);
        } else {
          await supabase
            .from('tp_approval_workflows')
            .update({
              current_step: (currentStep?.step_number || 0) + 1
            })
            .eq('id', workflowId);
        }
      }

      toast.success('Step approved successfully');
      fetchWorkflows();
    } catch (error) {
      console.error('Error approving step:', error);
      toast.error('Failed to approve step');
    }
  };

  const rejectStep = async (workflowId: string, stepId: string, comments: string) => {
    if (!comments.trim()) {
      toast.error('Please provide rejection comments');
      return;
    }

    try {
      const { error: stepError } = await supabase
        .from('tp_approval_steps')
        .update({
          status: 'rejected',
          comments
        })
        .eq('id', stepId);

      if (stepError) throw stepError;

      // Update workflow status to rejected
      const { error: workflowError } = await supabase
        .from('tp_approval_workflows')
        .update({
          status: 'rejected',
          completed_at: new Date().toISOString()
        })
        .eq('id', workflowId);

      if (workflowError) throw workflowError;

      toast.success('Step rejected');
      fetchWorkflows();
    } catch (error) {
      console.error('Error rejecting step:', error);
      toast.error('Failed to reject step');
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'approved': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'rejected': return <XCircle className="h-4 w-4 text-red-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      default: return <Clock className="h-4 w-4 text-gray-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      approved: 'bg-green-100 text-green-800',
      rejected: 'bg-red-100 text-red-800',
      cancelled: 'bg-gray-100 text-gray-800'
    };
    return colors[status as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const addApprover = () => {
    setApprovers([...approvers, {email: '', role: ''}]);
  };

  const removeApprover = (index: number) => {
    setApprovers(approvers.filter((_, i) => i !== index));
  };

  const updateApprover = (index: number, field: 'email' | 'role', value: string) => {
    const updated = [...approvers];
    updated[index][field] = value;
    setApprovers(updated);
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Workflow className="h-5 w-5" />
            Approval Workflows
          </h3>
          <p className="text-sm text-muted-foreground">
            Manage document approval processes and track progress
          </p>
        </div>
        {canManageWorkflows && (
          <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create Workflow
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl">
              <DialogHeader>
                <DialogTitle>Create Approval Workflow</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Workflow Name</label>
                  <Input
                    value={newWorkflowName}
                    onChange={(e) => setNewWorkflowName(e.target.value)}
                    placeholder="e.g., Master File Review Process"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Approvers (in order)</label>
                  <div className="space-y-2">
                    {approvers.map((approver, index) => (
                      <div key={index} className="flex gap-2 items-center">
                        <span className="text-sm w-8">{index + 1}.</span>
                        <Input
                          placeholder="Email"
                          value={approver.email}
                          onChange={(e) => updateApprover(index, 'email', e.target.value)}
                          className="flex-1"
                        />
                        <Select 
                          value={approver.role} 
                          onValueChange={(value) => updateApprover(index, 'role', value)}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue placeholder="Role" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="manager">Manager</SelectItem>
                            <SelectItem value="reviewer">Reviewer</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                          </SelectContent>
                        </Select>
                        {approvers.length > 1 && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => removeApprover(index)}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    ))}
                    <Button variant="outline" onClick={addApprover}>
                      Add Approver
                    </Button>
                  </div>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createWorkflow}>
                    Create Workflow
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>

      <div className="space-y-4">
        {workflows.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <Workflow className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">No approval workflows created yet</p>
            </CardContent>
          </Card>
        ) : (
          workflows.map((workflow) => (
            <Card key={workflow.id}>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle className="text-lg">{workflow.workflow_name}</CardTitle>
                    <p className="text-sm text-muted-foreground">
                      Created {new Date(workflow.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge className={getStatusColor(workflow.status)}>
                      {getStatusIcon(workflow.status)}
                      {workflow.status}
                    </Badge>
                    <div className="text-right">
                      <p className="text-sm font-medium">Step {workflow.current_step} of {workflow.total_steps}</p>
                      <Progress 
                        value={(workflow.current_step / workflow.total_steps) * 100} 
                        className="w-24"
                      />
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Step</TableHead>
                      <TableHead>Approver</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Comments</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {workflow.steps.map((step) => (
                      <TableRow key={step.id}>
                        <TableCell className="font-medium">{step.step_number}</TableCell>
                        <TableCell>{step.approver_email}</TableCell>
                        <TableCell>
                          {step.approver_role && (
                            <Badge variant="outline">{step.approver_role}</Badge>
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(step.status)}>
                            {getStatusIcon(step.status)}
                            {step.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-xs">
                          {step.comments && (
                            <p className="text-sm truncate">{step.comments}</p>
                          )}
                        </TableCell>
                        <TableCell>
                          {step.status === 'pending' && step.step_number === workflow.current_step && (
                            <div className="flex gap-2">
                              <Button 
                                size="sm" 
                                onClick={() => approveStep(workflow.id, step.id)}
                              >
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive"
                                onClick={() => {
                                  const comments = prompt('Rejection reason:');
                                  if (comments) rejectStep(workflow.id, step.id, comments);
                                }}
                              >
                                <XCircle className="h-3 w-3 mr-1" />
                                Reject
                              </Button>
                            </div>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}