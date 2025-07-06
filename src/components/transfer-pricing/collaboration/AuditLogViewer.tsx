import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Search, Filter, Download, Eye, Shield, Activity, Calendar } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface AuditLogEntry {
  id: string;
  user_id?: string;
  action: string;
  resource_type: string;
  resource_id?: string;
  old_values?: Record<string, any>;
  new_values?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  metadata: Record<string, any>;
  created_at: string;
  user_email?: string;
}

interface AuditLogViewerProps {
  resourceType?: string;
  resourceId?: string;
}

export function AuditLogViewer({ resourceType, resourceId }: AuditLogViewerProps) {
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [actionFilter, setActionFilter] = useState<string>('all');
  const [resourceTypeFilter, setResourceTypeFilter] = useState<string>(resourceType || 'all');
  const [dateRange, setDateRange] = useState<string>('7');
  const [selectedLog, setSelectedLog] = useState<AuditLogEntry | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize] = useState(50);

  useEffect(() => {
    fetchAuditLogs();
  }, [actionFilter, resourceTypeFilter, dateRange, resourceType, resourceId]);

  const fetchAuditLogs = async () => {
    try {
      setLoading(true);
      
      let query = supabase
        .from('tp_audit_log')
        .select('*')
        .order('created_at', { ascending: false })
        .range((currentPage - 1) * pageSize, currentPage * pageSize - 1);

      // Apply filters
      if (resourceType && resourceId) {
        query = query.eq('resource_type', resourceType).eq('resource_id', resourceId);
      } else if (resourceTypeFilter !== 'all') {
        query = query.eq('resource_type', resourceTypeFilter);
      }

      if (actionFilter !== 'all') {
        query = query.eq('action', actionFilter);
      }

      // Date range filter
      if (dateRange !== 'all') {
        const daysAgo = new Date();
        daysAgo.setDate(daysAgo.getDate() - parseInt(dateRange));
        query = query.gte('created_at', daysAgo.toISOString());
      }

      const { data, error } = await query;

      if (error) throw error;

      // Add user emails (simplified - in real implementation, join with user data)
      const logsWithEmails = (data || []).map(log => ({
        ...log,
        user_email: log.user_id ? 'user@example.com' : 'System',
        old_values: log.old_values as Record<string, any> || {},
        new_values: log.new_values as Record<string, any> || {},
        metadata: log.metadata as Record<string, any> || {}
      }));

      setAuditLogs(logsWithEmails);
    } catch (error) {
      console.error('Error fetching audit logs:', error);
      toast.error('Failed to load audit logs');
    } finally {
      setLoading(false);
    }
  };

  const exportAuditLogs = async () => {
    try {
      const csvContent = [
        ['Timestamp', 'User', 'Action', 'Resource Type', 'Resource ID', 'IP Address'].join(','),
        ...auditLogs.map(log => [
          new Date(log.created_at).toISOString(),
          log.user_email || 'System',
          log.action,
          log.resource_type,
          log.resource_id || '',
          log.ip_address || ''
        ].join(','))
      ].join('\n');

      const blob = new Blob([csvContent], { type: 'text/csv' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit_logs_${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast.success('Audit logs exported');
    } catch (error) {
      console.error('Error exporting audit logs:', error);
      toast.error('Failed to export audit logs');
    }
  };

  const getActionColor = (action: string) => {
    const colors = {
      INSERT: 'bg-green-100 text-green-800',
      UPDATE: 'bg-yellow-100 text-yellow-800',
      DELETE: 'bg-red-100 text-red-800',
      LOGIN: 'bg-blue-100 text-blue-800',
      LOGOUT: 'bg-gray-100 text-gray-800'
    };
    return colors[action as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getActionIcon = (action: string) => {
    switch (action) {
      case 'INSERT': return '+';
      case 'UPDATE': return '~';
      case 'DELETE': return '×';
      case 'LOGIN': return '→';
      case 'LOGOUT': return '←';
      default: return '•';
    }
  };

  const filteredLogs = auditLogs.filter(log => 
    !searchTerm || 
    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
    log.resource_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (log.user_email && log.user_email.toLowerCase().includes(searchTerm.toLowerCase()))
  );

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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Shield className="h-6 w-6" />
            Audit Log
          </h2>
          <p className="text-muted-foreground">
            Comprehensive security and activity tracking
          </p>
        </div>
        <Button onClick={exportAuditLogs}>
          <Download className="h-4 w-4 mr-2" />
          Export
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            Filters
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={actionFilter} onValueChange={setActionFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Action" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Actions</SelectItem>
                <SelectItem value="INSERT">Create</SelectItem>
                <SelectItem value="UPDATE">Update</SelectItem>
                <SelectItem value="DELETE">Delete</SelectItem>
                <SelectItem value="LOGIN">Login</SelectItem>
                <SelectItem value="LOGOUT">Logout</SelectItem>
              </SelectContent>
            </Select>
            <Select value={resourceTypeFilter} onValueChange={setResourceTypeFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Resource Type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Resources</SelectItem>
                <SelectItem value="tp_entities">Entities</SelectItem>
                <SelectItem value="tp_transactions">Transactions</SelectItem>
                <SelectItem value="transfer_pricing_documents">Documents</SelectItem>
                <SelectItem value="tp_user_roles">User Roles</SelectItem>
              </SelectContent>
            </Select>
            <Select value={dateRange} onValueChange={setDateRange}>
              <SelectTrigger>
                <SelectValue placeholder="Date Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1">Last 24 hours</SelectItem>
                <SelectItem value="7">Last 7 days</SelectItem>
                <SelectItem value="30">Last 30 days</SelectItem>
                <SelectItem value="90">Last 90 days</SelectItem>
                <SelectItem value="all">All time</SelectItem>
              </SelectContent>
            </Select>
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Activity className="h-4 w-4" />
              {filteredLogs.length} entries
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Audit Log Table */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>User</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Resource</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Calendar className="h-3 w-3 text-muted-foreground" />
                      <span className="text-sm">
                        {new Date(log.created_at).toLocaleString()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-medium">{log.user_email}</span>
                  </TableCell>
                  <TableCell>
                    <Badge className={`${getActionColor(log.action)} font-mono`}>
                      {getActionIcon(log.action)} {log.action}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div>
                      <span className="font-medium">{log.resource_type}</span>
                      {log.resource_id && (
                        <p className="text-xs text-muted-foreground truncate max-w-32">
                          {log.resource_id}
                        </p>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="font-mono text-sm">{log.ip_address || 'N/A'}</span>
                  </TableCell>
                  <TableCell>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLog(log)}
                        >
                          <Eye className="h-3 w-3 mr-1" />
                          View
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="max-w-2xl">
                        <DialogHeader>
                          <DialogTitle>Audit Log Details</DialogTitle>
                        </DialogHeader>
                        {selectedLog && (
                          <ScrollArea className="max-h-96">
                            <div className="space-y-4 p-4">
                              <div className="grid grid-cols-2 gap-4">
                                <div>
                                  <label className="text-sm font-medium">Timestamp</label>
                                  <p className="text-sm">{new Date(selectedLog.created_at).toLocaleString()}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">User</label>
                                  <p className="text-sm">{selectedLog.user_email}</p>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Action</label>
                                  <Badge className={getActionColor(selectedLog.action)}>
                                    {selectedLog.action}
                                  </Badge>
                                </div>
                                <div>
                                  <label className="text-sm font-medium">Resource</label>
                                  <p className="text-sm">{selectedLog.resource_type}</p>
                                </div>
                              </div>
                              
                              {selectedLog.old_values && (
                                <div>
                                  <label className="text-sm font-medium">Previous Values</label>
                                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                                    {JSON.stringify(selectedLog.old_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              {selectedLog.new_values && (
                                <div>
                                  <label className="text-sm font-medium">New Values</label>
                                  <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                                    {JSON.stringify(selectedLog.new_values, null, 2)}
                                  </pre>
                                </div>
                              )}
                              
                              <div>
                                <label className="text-sm font-medium">Metadata</label>
                                <pre className="text-xs bg-muted p-3 rounded-lg overflow-auto">
                                  {JSON.stringify(selectedLog.metadata, null, 2)}
                                </pre>
                              </div>
                            </div>
                          </ScrollArea>
                        )}
                      </DialogContent>
                    </Dialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          
          {filteredLogs.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Activity className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>No audit log entries found</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}