import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Switch } from '@/components/ui/switch';
import { Link, Share2, Eye, Download, MessageSquare, Calendar, Users, Settings, Shield } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { logger } from '@/lib/logging/logger';

interface ClientAccess {
  id: string;
  client_user_id: string;
  document_id: string;
  access_level: 'view' | 'comment' | 'download';
  expires_at?: string;
  granted_by: string;
  created_at: string;
  client_email?: string;
  document_title?: string;
}

interface DocumentShare {
  id: string;
  document_id: string;
  share_token: string;
  access_level: 'view' | 'comment' | 'download';
  password_hash?: string;
  expires_at?: string;
  max_uses?: number;
  current_uses: number;
  created_by: string;
  created_at: string;
  document_title?: string;
}

export function ClientPortal() {
  const [clientAccess, setClientAccess] = useState<ClientAccess[]>([]);
  const [documentShares, setDocumentShares] = useState<DocumentShare[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('access');
  
  // New access dialog state
  const [isNewAccessDialogOpen, setIsNewAccessDialogOpen] = useState(false);
  const [newClientEmail, setNewClientEmail] = useState('');
  const [selectedDocumentId, setSelectedDocumentId] = useState('');
  const [accessLevel, setAccessLevel] = useState<'view' | 'comment' | 'download'>('view');
  const [expiryDays, setExpiryDays] = useState<string>('30');
  
  // Share link dialog state
  const [isShareDialogOpen, setIsShareDialogOpen] = useState(false);
  const [sharePassword, setSharePassword] = useState('');
  const [shareMaxUses, setShareMaxUses] = useState<string>('');
  const [shareExpiryDays, setShareExpiryDays] = useState<string>('7');

  useEffect(() => {
    fetchClientAccess();
    fetchDocumentShares();
  }, []);

  const fetchClientAccess = async () => {
    try {
      const { data, error } = await supabase
        .from('tp_client_access')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add client emails and document titles (simplified)
      const accessWithDetails = (data || []).map(access => ({
        ...access,
        client_email: 'client@example.com',
        document_title: 'Master File Document',
        access_level: access.access_level as 'view' | 'comment' | 'download'
      }));

      setClientAccess(accessWithDetails);
    } catch (error) {
      logger.error('Error fetching client access', error as Error, { component: 'ClientPortal' });
      toast.error('Failed to load client access');
    }
  };

  const fetchDocumentShares = async () => {
    try {
      setLoading(true);
      
      const { data, error } = await supabase
        .from('tp_document_shares')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Add document titles (simplified)
      const sharesWithDetails = (data || []).map(share => ({
        ...share,
        document_title: 'Transfer Pricing Document',
        access_level: share.access_level as 'view' | 'comment' | 'download'
      }));

      setDocumentShares(sharesWithDetails);
    } catch (error) {
      logger.error('Error fetching document shares', error as Error, { component: 'ClientPortal' });
      toast.error('Failed to load document shares');
    } finally {
      setLoading(false);
    }
  };

  const grantClientAccess = async () => {
    if (!newClientEmail || !selectedDocumentId) {
      toast.error('Please fill in all required fields');
      return;
    }

    try {
      const expiresAt = expiryDays !== 'never' 
        ? new Date(Date.now() + parseInt(expiryDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      const { error } = await supabase
        .from('tp_client_access')
        .insert({
          client_user_id: '00000000-0000-0000-0000-000000000000', // Placeholder - lookup by email
          document_id: selectedDocumentId,
          access_level: accessLevel,
          expires_at: expiresAt,
          granted_by: 'current-user-id' // Replace with actual user ID
        });

      if (error) throw error;

      toast.success('Client access granted successfully');
      setIsNewAccessDialogOpen(false);
      setNewClientEmail('');
      setSelectedDocumentId('');
      setAccessLevel('view');
      setExpiryDays('30');
      fetchClientAccess();
    } catch (error) {
      logger.error('Error granting client access', error as Error, { component: 'ClientPortal', clientEmail: newClientEmail, documentId: selectedDocumentId });
      toast.error('Failed to grant client access');
    }
  };

  const createShareLink = async () => {
    if (!selectedDocumentId) {
      toast.error('Please select a document');
      return;
    }

    try {
      const expiresAt = shareExpiryDays !== 'never'
        ? new Date(Date.now() + parseInt(shareExpiryDays) * 24 * 60 * 60 * 1000).toISOString()
        : null;

      // Get the current session for authorization
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        toast.error('You must be logged in to create share links');
        return;
      }

      // Call edge function to securely hash password and create share link
      const { data, error } = await supabase.functions.invoke('create-share-link', {
        body: {
          document_id: selectedDocumentId,
          access_level: accessLevel,
          password: sharePassword || undefined,
          expires_at: expiresAt,
          max_uses: shareMaxUses ? parseInt(shareMaxUses) : undefined
        }
      });

      if (error) throw error;
      if (!data.success) throw new Error(data.error || 'Failed to create share link');

      const shareUrl = `${window.location.origin}/shared/${data.data.share_token}`;
      navigator.clipboard.writeText(shareUrl);
      
      toast.success('Share link created and copied to clipboard');
      setIsShareDialogOpen(false);
      setSelectedDocumentId('');
      setSharePassword('');
      setShareMaxUses('');
      setShareExpiryDays('7');
      fetchDocumentShares();
    } catch (error) {
      logger.error('Error creating share link', error as Error, { component: 'ClientPortal', documentId: selectedDocumentId });
      toast.error('Failed to create share link');
    }
  };

  const revokeAccess = async (accessId: string) => {
    try {
      const { error } = await supabase
        .from('tp_client_access')
        .delete()
        .eq('id', accessId);

      if (error) throw error;

      toast.success('Client access revoked');
      fetchClientAccess();
    } catch (error) {
      logger.error('Error revoking access', error as Error, { component: 'ClientPortal', accessId });
      toast.error('Failed to revoke access');
    }
  };

  const revokeShareLink = async (shareId: string) => {
    try {
      const { error } = await supabase
        .from('tp_document_shares')
        .delete()
        .eq('id', shareId);

      if (error) throw error;

      toast.success('Share link revoked');
      fetchDocumentShares();
    } catch (error) {
      logger.error('Error revoking share link', error as Error, { component: 'ClientPortal', shareId });
      toast.error('Failed to revoke share link');
    }
  };

  const getAccessLevelColor = (level: string) => {
    const colors = {
      view: 'bg-blue-100 text-blue-800',
      comment: 'bg-yellow-100 text-yellow-800',
      download: 'bg-green-100 text-green-800'
    };
    return colors[level as keyof typeof colors] || 'bg-gray-100 text-gray-800';
  };

  const getAccessLevelIcon = (level: string) => {
    switch (level) {
      case 'view': return <Eye className="h-3 w-3" />;
      case 'comment': return <MessageSquare className="h-3 w-3" />;
      case 'download': return <Download className="h-3 w-3" />;
      default: return <Eye className="h-3 w-3" />;
    }
  };

  const copyShareLink = (token: string) => {
    const shareUrl = `${window.location.origin}/shared/${token}`;
    navigator.clipboard.writeText(shareUrl);
    toast.success('Share link copied to clipboard');
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
          <h2 className="text-2xl font-bold flex items-center gap-2">
            <Users className="h-6 w-6" />
            Client Portal
          </h2>
          <p className="text-muted-foreground">
            Manage client access to documents and create secure sharing links
          </p>
        </div>
        <div className="flex gap-2">
          <Dialog open={isNewAccessDialogOpen} onOpenChange={setIsNewAccessDialogOpen}>
            <DialogTrigger asChild>
              <Button>
                <Shield className="h-4 w-4 mr-2" />
                Grant Access
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Grant Client Access</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Client Email</label>
                  <Input
                    value={newClientEmail}
                    onChange={(e) => setNewClientEmail(e.target.value)}
                    placeholder="client@company.com"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Document</label>
                  <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doc1">Master File - Entity A</SelectItem>
                      <SelectItem value="doc2">Local File - Jurisdiction B</SelectItem>
                      <SelectItem value="doc3">Transfer Pricing Study</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Access Level</label>
                  <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">View & Comment</SelectItem>
                      <SelectItem value="download">View & Download</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Expires After</label>
                  <Select value={expiryDays} onValueChange={setExpiryDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="90">90 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsNewAccessDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={grantClientAccess}>
                    Grant Access
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={isShareDialogOpen} onOpenChange={setIsShareDialogOpen}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <Share2 className="h-4 w-4 mr-2" />
                Create Share Link
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create Share Link</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <label className="text-sm font-medium">Document</label>
                  <Select value={selectedDocumentId} onValueChange={setSelectedDocumentId}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select document" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="doc1">Master File - Entity A</SelectItem>
                      <SelectItem value="doc2">Local File - Jurisdiction B</SelectItem>
                      <SelectItem value="doc3">Transfer Pricing Study</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Access Level</label>
                  <Select value={accessLevel} onValueChange={(value) => setAccessLevel(value as any)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="view">View Only</SelectItem>
                      <SelectItem value="comment">View & Comment</SelectItem>
                      <SelectItem value="download">View & Download</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <label className="text-sm font-medium">Password (Optional)</label>
                  <Input
                    type="password"
                    value={sharePassword}
                    onChange={(e) => setSharePassword(e.target.value)}
                    placeholder="Leave empty for no password"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Max Uses (Optional)</label>
                  <Input
                    type="number"
                    value={shareMaxUses}
                    onChange={(e) => setShareMaxUses(e.target.value)}
                    placeholder="Unlimited if empty"
                  />
                </div>
                <div>
                  <label className="text-sm font-medium">Expires After</label>
                  <Select value={shareExpiryDays} onValueChange={setShareExpiryDays}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="1">1 day</SelectItem>
                      <SelectItem value="7">7 days</SelectItem>
                      <SelectItem value="30">30 days</SelectItem>
                      <SelectItem value="never">Never</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setIsShareDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={createShareLink}>
                    Create Link
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="access">Client Access</TabsTrigger>
          <TabsTrigger value="shares">Share Links</TabsTrigger>
        </TabsList>

        <TabsContent value="access" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5" />
                Direct Client Access
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Client</TableHead>
                    <TableHead>Document</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Granted</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clientAccess.map((access) => (
                    <TableRow key={access.id}>
                      <TableCell className="font-medium">{access.client_email}</TableCell>
                      <TableCell>{access.document_title}</TableCell>
                      <TableCell>
                        <Badge className={`${getAccessLevelColor(access.access_level)} flex items-center gap-1 w-fit`}>
                          {getAccessLevelIcon(access.access_level)}
                          {access.access_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {access.expires_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(access.expires_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {new Date(access.created_at).toLocaleDateString()}
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="destructive" 
                          size="sm"
                          onClick={() => revokeAccess(access.id)}
                        >
                          Revoke
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {clientAccess.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No client access granted yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="shares" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Link className="h-5 w-5" />
                Shareable Links
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Document</TableHead>
                    <TableHead>Access Level</TableHead>
                    <TableHead>Uses</TableHead>
                    <TableHead>Expires</TableHead>
                    <TableHead>Protected</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {documentShares.map((share) => (
                    <TableRow key={share.id}>
                      <TableCell className="font-medium">{share.document_title}</TableCell>
                      <TableCell>
                        <Badge className={`${getAccessLevelColor(share.access_level)} flex items-center gap-1 w-fit`}>
                          {getAccessLevelIcon(share.access_level)}
                          {share.access_level}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <span className={share.max_uses && share.current_uses >= share.max_uses ? 'text-red-600' : ''}>
                          {share.current_uses}{share.max_uses ? `/${share.max_uses}` : ''}
                        </span>
                      </TableCell>
                      <TableCell>
                        {share.expires_at ? (
                          <div className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            {new Date(share.expires_at).toLocaleDateString()}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">Never</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {share.password_hash ? (
                          <Badge variant="outline">🔒 Password</Badge>
                        ) : (
                          <span className="text-muted-foreground">No</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-2">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => copyShareLink(share.share_token)}
                          >
                            <Link className="h-3 w-3 mr-1" />
                            Copy
                          </Button>
                          <Button 
                            variant="destructive" 
                            size="sm"
                            onClick={() => revokeShareLink(share.id)}
                          >
                            Revoke
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              
              {documentShares.length === 0 && (
                <div className="text-center py-8 text-muted-foreground">
                  <Share2 className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No share links created yet</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}