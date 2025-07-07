import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Crown, Shield, Database, Zap, Settings, FileText, AlertTriangle, CheckCircle, XCircle, Activity } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditItem {
  id: string;
  audit_type: string;
  audit_phase: string;
  status: string;
  findings: Record<string, any>;
  recommendations: string;
  due_date: string;
  assigned_to: string;
}

interface EconomicSubstance {
  id: string;
  substance_test: string;
  test_results: Record<string, any>;
  compliance_score: number;
  deficiencies: string[];
  remediation_plan: string;
}

interface ERPIntegration {
  id: string;
  erp_system: string;
  connection_config: Record<string, any>;
  sync_frequency: string;
  last_sync_at: string;
  is_active: boolean;
}

export function PremiumFeatures() {
  const [auditItems, setAuditItems] = useState<AuditItem[]>([]);
  const [substanceAnalysis, setSubstanceAnalysis] = useState<EconomicSubstance[]>([]);
  const [erpIntegrations, setERPIntegrations] = useState<ERPIntegration[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchPremiumData();
  }, []);

  const fetchPremiumData = async () => {
    try {
      setLoading(true);
      
      // Fetch audit trail data
      const { data: auditData } = await supabase
        .from('tp_audit_trail')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      // Fetch economic substance data
      const { data: substanceData } = await supabase
        .from('tp_economic_substance')
        .select('*')
        .order('assessment_date', { ascending: false });

      // Fetch ERP integrations
      const { data: erpData } = await supabase
        .from('tp_erp_integrations')
        .select('*')
        .order('created_at', { ascending: false });

      setAuditItems((auditData || []).map(item => ({
        ...item,
        findings: item.findings as Record<string, any>
      })));
      setSubstanceAnalysis((substanceData || []).map(item => ({
        ...item,
        test_results: item.test_results as Record<string, any>
      })));
      setERPIntegrations((erpData || []).map(item => ({
        ...item,
        connection_config: item.connection_config as Record<string, any>
      })));
    } catch (error) {
      console.error('Error fetching premium data:', error);
      toast.error('Failed to load premium features data');
    } finally {
      setLoading(false);
    }
  };

  const createAuditItem = async (auditData: Partial<AuditItem>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('tp_audit_trail')
        .insert({
          user_id: user.id,
          audit_type: auditData.audit_type || 'preparation',
          audit_phase: auditData.audit_phase || 'Initial Review',
          status: auditData.status || 'in_progress',
          findings: auditData.findings as any || {},
          recommendations: auditData.recommendations || '',
          due_date: auditData.due_date,
          assigned_to: auditData.assigned_to
        });

      if (error) throw error;

      toast.success('Audit item created successfully');
      fetchPremiumData();
    } catch (error) {
      console.error('Error creating audit item:', error);
      toast.error('Failed to create audit item');
    }
  };

  const mockAuditData = [
    {
      id: '1',
      audit_type: 'preparation',
      audit_phase: 'Initial Review',
      status: 'in_progress',
      findings: { issues: 3, recommendations: 5 },
      recommendations: 'Review transfer pricing documentation for entity ABC Corp',
      due_date: '2024-02-15',
      assigned_to: 'John Smith'
    },
    {
      id: '2',
      audit_type: 'review',
      audit_phase: 'Benchmarking Analysis',
      status: 'completed',
      findings: { issues: 1, recommendations: 2 },
      recommendations: 'Update comparable analysis for manufacturing transactions',
      due_date: '2024-01-30',
      assigned_to: 'Sarah Johnson'
    }
  ];

  const mockSubstanceData = [
    {
      id: '1',
      entity: 'Tech Holdings Ltd',
      substance_test: 'ciga',
      compliance_score: 85,
      status: 'compliant',
      deficiencies: ['Insufficient local workforce'],
      next_review: '2024-06-30'
    },
    {
      id: '2',
      entity: 'Finance Services Inc',
      substance_test: 'directed_managed',
      compliance_score: 45,
      status: 'non_compliant',
      deficiencies: ['No local board meetings', 'Key decisions made abroad'],
      next_review: '2024-03-31'
    }
  ];

  const mockERPSystems = [
    { name: 'SAP', status: 'connected', last_sync: '2024-01-15 10:30' },
    { name: 'Oracle Financials', status: 'pending', last_sync: null },
    { name: 'NetSuite', status: 'error', last_sync: '2024-01-10 14:20' }
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
      case 'compliant':
      case 'connected':
        return 'text-green-600 bg-green-100';
      case 'in_progress':
      case 'pending':
        return 'text-yellow-600 bg-yellow-100';
      case 'non_compliant':
      case 'error':
        return 'text-red-600 bg-red-100';
      default:
        return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
      case 'compliant':
      case 'connected':
        return <CheckCircle className="h-4 w-4" />;
      case 'in_progress':
      case 'pending':
        return <Activity className="h-4 w-4" />;
      case 'non_compliant':
      case 'error':
        return <XCircle className="h-4 w-4" />;
      default:
        return <AlertTriangle className="h-4 w-4" />;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Crown className="h-6 w-6 text-yellow-500" />
            Premium Features
          </h2>
          <p className="text-muted-foreground">
            Advanced tools for enterprise transfer pricing management
          </p>
        </div>
        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 text-white">
          <Crown className="h-3 w-3 mr-1" />
          Premium
        </Badge>
      </div>

      <Tabs defaultValue="audit" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="audit">Audit Manager</TabsTrigger>
          <TabsTrigger value="substance">Economic Substance</TabsTrigger>
          <TabsTrigger value="benchmarks">Advanced Benchmarking</TabsTrigger>
          <TabsTrigger value="erp">ERP Integration</TabsTrigger>
        </TabsList>

        <TabsContent value="audit" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Transfer Pricing Audit Manager</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <FileText className="h-4 w-4 mr-2" />
                  New Audit Item
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create Audit Item</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Audit Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="preparation">Preparation</SelectItem>
                      <SelectItem value="review">Review</SelectItem>
                      <SelectItem value="adjustment">Adjustment</SelectItem>
                      <SelectItem value="filing">Filing</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Audit Phase" />
                  <Input placeholder="Assigned To" />
                  <Input type="date" placeholder="Due Date" />
                  <Button className="w-full">Create Audit Item</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">12</p>
                <p className="text-sm text-muted-foreground">Active Audits</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">28</p>
                <p className="text-sm text-muted-foreground">Completed</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <AlertTriangle className="h-8 w-8 mx-auto mb-2 text-yellow-500" />
                <p className="text-2xl font-bold">3</p>
                <p className="text-sm text-muted-foreground">Overdue</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Current Audit Items</CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Type</TableHead>
                    <TableHead>Phase</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Due Date</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {mockAuditData.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-medium">{item.audit_type}</TableCell>
                      <TableCell>{item.audit_phase}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className={getStatusColor(item.status)}>
                          {getStatusIcon(item.status)}
                          <span className="ml-1">{item.status}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>{item.assigned_to}</TableCell>
                      <TableCell>{item.due_date}</TableCell>
                      <TableCell>
                        <Button variant="outline" size="sm">View</Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="substance" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Economic Substance Analyzer</h3>
            <Button>
              <Shield className="h-4 w-4 mr-2" />
              Run Analysis
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {mockSubstanceData.map((item) => (
              <Card key={item.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{item.entity}</CardTitle>
                    <Badge variant="outline" className={getStatusColor(item.status)}>
                      {item.status}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between text-sm mb-2">
                        <span>Compliance Score</span>
                        <span>{item.compliance_score}%</span>
                      </div>
                      <Progress value={item.compliance_score} className="w-full" />
                    </div>
                    
                    <div>
                      <p className="text-sm font-medium mb-2">Test Type: {item.substance_test.toUpperCase()}</p>
                      <p className="text-sm text-muted-foreground">Next Review: {item.next_review}</p>
                    </div>

                    {item.deficiencies.length > 0 && (
                      <div>
                        <p className="text-sm font-medium text-red-600 mb-2">Deficiencies:</p>
                        <ul className="text-sm text-muted-foreground list-disc list-inside">
                          {item.deficiencies.map((deficiency, idx) => (
                            <li key={idx}>{deficiency}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    <Button variant="outline" className="w-full">
                      View Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="benchmarks" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">Advanced Benchmarking Database</h3>
            <Button>
              <Database className="h-4 w-4 mr-2" />
              Search Comparables
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardContent className="p-6 text-center">
                <Database className="h-8 w-8 mx-auto mb-2 text-blue-500" />
                <p className="text-2xl font-bold">2.5M+</p>
                <p className="text-sm text-muted-foreground">Global Comparables</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Shield className="h-8 w-8 mx-auto mb-2 text-green-500" />
                <p className="text-2xl font-bold">150+</p>
                <p className="text-sm text-muted-foreground">Jurisdictions</p>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-6 text-center">
                <Activity className="h-8 w-8 mx-auto mb-2 text-purple-500" />
                <p className="text-2xl font-bold">Daily</p>
                <p className="text-sm text-muted-foreground">Data Updates</p>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Database Access Features</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Global public company databases</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Advanced statistical analysis tools</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Multi-year trend analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Industry-specific filters</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Automated rejection analysis</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Export to Excel/PDF reports</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Real-time data validation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Custom search strategies</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="erp" className="space-y-6">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold">ERP System Integrations</h3>
            <Dialog>
              <DialogTrigger asChild>
                <Button>
                  <Zap className="h-4 w-4 mr-2" />
                  Add Integration
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Connect ERP System</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Select ERP System" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="sap">SAP</SelectItem>
                      <SelectItem value="oracle">Oracle Financials</SelectItem>
                      <SelectItem value="netsuite">NetSuite</SelectItem>
                      <SelectItem value="dynamics">Microsoft Dynamics</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input placeholder="Server URL" />
                  <Input placeholder="Username" />
                  <Input type="password" placeholder="Password" />
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Sync Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="hourly">Hourly</SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button className="w-full">Test Connection</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          <div className="grid gap-4">
            {mockERPSystems.map((system, index) => (
              <Card key={index}>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <Settings className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-semibold">{system.name}</h3>
                        <p className="text-sm text-muted-foreground">
                          Last sync: {system.last_sync || 'Never'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={getStatusColor(system.status)}>
                        {getStatusIcon(system.status)}
                        <span className="ml-1">{system.status}</span>
                      </Badge>
                      <Button variant="outline" size="sm">
                        Configure
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Integration Benefits</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Zap className="h-5 w-5 text-blue-500" />
                    <span>Automated data extraction</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-green-500" />
                    <span>Real-time synchronization</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <Database className="h-5 w-5 text-purple-500" />
                    <span>Multi-entity consolidation</span>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Activity className="h-5 w-5 text-orange-500" />
                    <span>Automated report generation</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span>Data validation and cleansing</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5 text-indigo-500" />
                    <span>Audit trail maintenance</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}