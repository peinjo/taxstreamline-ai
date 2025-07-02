import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Calendar as CalendarIcon, Plus, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
import { TPEntity, TPTransaction } from '@/types/transfer-pricing';
import { format } from 'date-fns';

interface RiskMitigationPlanProps {
  overallAssessment: any;
  entities: TPEntity[];
  transactions: TPTransaction[];
}

interface MitigationAction {
  id: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  category: 'documentation' | 'compliance' | 'economic' | 'operational' | 'regulatory';
  status: 'pending' | 'in_progress' | 'completed';
  due_date?: Date;
  assigned_to?: string;
  estimated_effort: string;
  expected_risk_reduction: number;
  cost_estimate?: string;
  resources_needed: string[];
  progress: number;
}

const INITIAL_MITIGATION_ACTIONS: Omit<MitigationAction, 'id'>[] = [
  {
    title: 'Complete Transfer Pricing Documentation',
    description: 'Prepare comprehensive transfer pricing studies for all material controlled transactions',
    priority: 'critical',
    category: 'documentation',
    status: 'pending',
    estimated_effort: '4-6 weeks',
    expected_risk_reduction: 25,
    cost_estimate: '$50,000 - $100,000',
    resources_needed: ['Transfer pricing specialist', 'Financial data', 'Legal review'],
    progress: 0
  },
  {
    title: 'Update Benchmarking Studies',
    description: 'Refresh economic analysis with current market data and expanded comparable search',
    priority: 'high',
    category: 'economic',
    status: 'pending',
    estimated_effort: '3-4 weeks',
    expected_risk_reduction: 20,
    cost_estimate: '$25,000 - $50,000',
    resources_needed: ['Economic analyst', 'Database access', 'Statistical software'],
    progress: 0
  },
  {
    title: 'Implement Compliance Monitoring System',
    description: 'Set up automated system to track filing deadlines and regulatory changes',
    priority: 'medium',
    category: 'compliance',
    status: 'pending',
    estimated_effort: '2-3 weeks',
    expected_risk_reduction: 15,
    cost_estimate: '$10,000 - $25,000',
    resources_needed: ['Compliance software', 'Process documentation', 'Training'],
    progress: 0
  },
  {
    title: 'Review Inter-company Agreements',
    description: 'Update and standardize all inter-company service and financing agreements',
    priority: 'high',
    category: 'operational',
    status: 'pending',
    estimated_effort: '3-5 weeks',
    expected_risk_reduction: 18,
    cost_estimate: '$30,000 - $60,000',
    resources_needed: ['Legal counsel', 'Tax advisor', 'Business stakeholders'],
    progress: 0
  },
  {
    title: 'Consider Advance Pricing Agreement',
    description: 'Evaluate and potentially file for APA in high-risk jurisdictions',
    priority: 'medium',
    category: 'regulatory',
    status: 'pending',
    estimated_effort: '6-12 months',
    expected_risk_reduction: 30,
    cost_estimate: '$100,000 - $200,000',
    resources_needed: ['APA specialist', 'Economic analysis', 'Government liaison'],
    progress: 0
  }
];

export function RiskMitigationPlan({ overallAssessment, entities, transactions }: RiskMitigationPlanProps) {
  const [mitigationActions, setMitigationActions] = useState<MitigationAction[]>(() => 
    INITIAL_MITIGATION_ACTIONS.map((action, index) => ({
      ...action,
      id: `action_${index + 1}`
    }))
  );
  const [isAddingAction, setIsAddingAction] = useState(false);
  const [newAction, setNewAction] = useState<Partial<MitigationAction>>({
    title: '',
    description: '',
    priority: 'medium',
    category: 'documentation',
    status: 'pending',
    estimated_effort: '',
    expected_risk_reduction: 0,
    resources_needed: [],
    progress: 0
  });

  const updateActionStatus = (actionId: string, updates: Partial<MitigationAction>) => {
    setMitigationActions(prev => prev.map(action => 
      action.id === actionId ? { ...action, ...updates } : action
    ));
  };

  const addNewAction = () => {
    if (!newAction.title || !newAction.description) return;

    const action: MitigationAction = {
      id: `action_${Date.now()}`,
      title: newAction.title!,
      description: newAction.description!,
      priority: newAction.priority || 'medium',
      category: newAction.category || 'documentation',
      status: 'pending',
      estimated_effort: newAction.estimated_effort || '',
      expected_risk_reduction: newAction.expected_risk_reduction || 0,
      cost_estimate: newAction.cost_estimate,
      resources_needed: newAction.resources_needed || [],
      progress: 0
    };

    setMitigationActions(prev => [...prev, action]);
    setNewAction({
      title: '',
      description: '',
      priority: 'medium',
      category: 'documentation',
      status: 'pending',
      estimated_effort: '',
      expected_risk_reduction: 0,
      resources_needed: [],
      progress: 0
    });
    setIsAddingAction(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'low': return 'text-green-600';
      case 'medium': return 'text-yellow-600';
      case 'high': return 'text-orange-600';
      case 'critical': return 'text-red-600';
      default: return 'text-gray-600';
    }
  };

  const getPriorityBadge = (priority: string) => {
    switch (priority) {
      case 'low': return 'secondary';
      case 'medium': return 'outline';
      case 'high': return 'destructive';
      case 'critical': return 'destructive';
      default: return 'outline';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'in_progress': return <AlertTriangle className="h-4 w-4 text-blue-500" />;
      case 'completed': return <CheckCircle className="h-4 w-4 text-green-500" />;
      default: return <Clock className="h-4 w-4 text-gray-500" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'documentation': return <FileText className="h-4 w-4" />;
      case 'compliance': return <Clock className="h-4 w-4" />;
      case 'economic': return <AlertTriangle className="h-4 w-4" />;
      case 'operational': return <Shield className="h-4 w-4" />;
      case 'regulatory': return <AlertTriangle className="h-4 w-4" />;
      default: return <FileText className="h-4 w-4" />;
    }
  };

  const totalRiskReduction = mitigationActions
    .filter(action => action.status === 'completed')
    .reduce((sum, action) => sum + action.expected_risk_reduction, 0);

  const completedActions = mitigationActions.filter(action => action.status === 'completed').length;
  const inProgressActions = mitigationActions.filter(action => action.status === 'in_progress').length;
  const pendingActions = mitigationActions.filter(action => action.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Mitigation Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Risk Mitigation Plan Overview
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{completedActions}</div>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{inProgressActions}</div>
              <p className="text-sm text-muted-foreground">In Progress</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">{pendingActions}</div>
              <p className="text-sm text-muted-foreground">Pending</p>
            </div>
            
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{totalRiskReduction}%</div>
              <p className="text-sm text-muted-foreground">Risk Reduced</p>
            </div>
          </div>

          {overallAssessment && (
            <div className="mt-6">
              <div className="flex items-center justify-between mb-2">
                <span className="text-sm font-medium">Overall Progress</span>
                <span className="text-sm">
                  {Math.round((completedActions / mitigationActions.length) * 100)}% Complete
                </span>
              </div>
              <Progress value={(completedActions / mitigationActions.length) * 100} />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Action Items */}
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold">Mitigation Actions</h3>
        <Dialog open={isAddingAction} onOpenChange={setIsAddingAction}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Add Action
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New Mitigation Action</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Title *</Label>
                  <Input
                    id="title"
                    value={newAction.title || ''}
                    onChange={(e) => setNewAction(prev => ({ ...prev, title: e.target.value }))}
                    placeholder="Action title"
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priority</Label>
                  <Select 
                    value={newAction.priority} 
                    onValueChange={(value: any) => setNewAction(prev => ({ ...prev, priority: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={newAction.description || ''}
                  onChange={(e) => setNewAction(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Detailed description of the action"
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="category">Category</Label>
                  <Select 
                    value={newAction.category} 
                    onValueChange={(value: any) => setNewAction(prev => ({ ...prev, category: value }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="documentation">Documentation</SelectItem>
                      <SelectItem value="compliance">Compliance</SelectItem>
                      <SelectItem value="economic">Economic</SelectItem>
                      <SelectItem value="operational">Operational</SelectItem>
                      <SelectItem value="regulatory">Regulatory</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="effort">Estimated Effort</Label>
                  <Input
                    id="effort"
                    value={newAction.estimated_effort || ''}
                    onChange={(e) => setNewAction(prev => ({ ...prev, estimated_effort: e.target.value }))}
                    placeholder="e.g., 2-3 weeks"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsAddingAction(false)}>
                  Cancel
                </Button>
                <Button onClick={addNewAction}>
                  Add Action
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="space-y-4">
        {mitigationActions
          .sort((a, b) => {
            const priorityOrder = { critical: 4, high: 3, medium: 2, low: 1 };
            const statusOrder = { pending: 3, in_progress: 2, completed: 1 };
            return (priorityOrder[b.priority] - priorityOrder[a.priority]) || 
                   (statusOrder[a.status] - statusOrder[b.status]);
          })
          .map((action) => (
          <Card key={action.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <Checkbox
                  checked={action.status === 'completed'}
                  onCheckedChange={(checked) => {
                    updateActionStatus(action.id, {
                      status: checked ? 'completed' : 'pending',
                      progress: checked ? 100 : 0
                    });
                  }}
                  className="mt-1"
                />
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="flex items-center gap-2">
                      {getCategoryIcon(action.category)}
                      <h4 className="font-semibold">{action.title}</h4>
                    </div>
                    <Badge variant={getPriorityBadge(action.priority)}>
                      {action.priority}
                    </Badge>
                    {getStatusIcon(action.status)}
                  </div>
                  
                  <p className="text-sm text-muted-foreground mb-3">
                    {action.description}
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="font-medium">Effort:</span> {action.estimated_effort}
                    </div>
                    <div>
                      <span className="font-medium">Risk Reduction:</span> {action.expected_risk_reduction}%
                    </div>
                    {action.cost_estimate && (
                      <div>
                        <span className="font-medium">Cost:</span> {action.cost_estimate}
                      </div>
                    )}
                  </div>

                  {action.resources_needed.length > 0 && (
                    <div className="mt-3">
                      <span className="text-sm font-medium">Resources Needed:</span>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {action.resources_needed.map((resource, index) => (
                          <Badge key={index} variant="outline" className="text-xs">
                            {resource}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {action.status === 'in_progress' && (
                    <div className="mt-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-medium">Progress</span>
                        <span className="text-sm">{action.progress}%</span>
                      </div>
                      <Progress value={action.progress} />
                    </div>
                  )}

                  {action.due_date && (
                    <div className="mt-3 flex items-center gap-2 text-sm">
                      <CalendarIcon className="h-4 w-4" />
                      <span>Due: {format(action.due_date, 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-col gap-2">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" size="sm">
                        <CalendarIcon className="h-4 w-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0">
                      <Calendar
                        mode="single"
                        selected={action.due_date}
                        onSelect={(date) => updateActionStatus(action.id, { due_date: date })}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>

                  <Select 
                    value={action.status} 
                    onValueChange={(value: any) => updateActionStatus(action.id, { status: value })}
                  >
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pending">Pending</SelectItem>
                      <SelectItem value="in_progress">In Progress</SelectItem>
                      <SelectItem value="completed">Completed</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {mitigationActions.length === 0 && (
        <Card>
          <CardContent className="p-8 text-center">
            <Shield className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
            <p className="text-muted-foreground">No mitigation actions defined yet.</p>
            <p className="text-sm text-muted-foreground">Add actions to reduce transfer pricing risks.</p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}