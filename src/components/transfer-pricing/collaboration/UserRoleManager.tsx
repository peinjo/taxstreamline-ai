import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { UserPlus, Shield, Users, Settings } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface UserRole {
  id: string;
  user_id: string;
  role: 'admin' | 'manager' | 'analyst' | 'reviewer' | 'client';
  permissions: Record<string, boolean>;
  created_at: string;
  user_email?: string;
}

export function UserRoleManager() {
  const [roles, setRoles] = useState<UserRole[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState<UserRole['role']>('analyst');

  useEffect(() => {
    fetchUserRoles();
  }, []);

  const fetchUserRoles = async () => {
    try {
      setLoading(true);
      
      // Get user roles with email from auth metadata
      const { data: rolesData, error } = await supabase
        .from('tp_user_roles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Fetch user emails separately (simplified approach)
      const rolesWithEmails = rolesData?.map(role => ({
        ...role,
        user_email: 'user@example.com', // In real implementation, fetch from user_profiles or auth metadata
        role: role.role as 'admin' | 'manager' | 'analyst' | 'reviewer' | 'client',
        permissions: role.permissions as Record<string, boolean> || {}
      })) || [];

      setRoles(rolesWithEmails);
    } catch (error) {
      console.error('Error fetching user roles:', error);
      toast.error('Failed to load user roles');
    } finally {
      setLoading(false);
    }
  };

  const addUserRole = async () => {
    if (!newUserEmail || !newUserRole) {
      toast.error('Please fill in all fields');
      return;
    }

    try {
      // In a real implementation, you'd first look up the user by email
      // For demo purposes, we'll use a placeholder user_id
      const { error } = await supabase
        .from('tp_user_roles')
        .insert({
          user_id: '00000000-0000-0000-0000-000000000000', // Placeholder
          role: newUserRole,
          permissions: getDefaultPermissions(newUserRole)
        });

      if (error) throw error;

      toast.success('User role added successfully');
      setIsAddDialogOpen(false);
      setNewUserEmail('');
      setNewUserRole('analyst');
      fetchUserRoles();
    } catch (error) {
      console.error('Error adding user role:', error);
      toast.error('Failed to add user role');
    }
  };

  const updateUserRole = async (userId: string, newRole: UserRole['role']) => {
    try {
      const { error } = await supabase
        .from('tp_user_roles')
        .update({ 
          role: newRole,
          permissions: getDefaultPermissions(newRole),
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User role updated successfully');
      fetchUserRoles();
    } catch (error) {
      console.error('Error updating user role:', error);
      toast.error('Failed to update user role');
    }
  };

  const removeUserRole = async (userId: string) => {
    try {
      const { error } = await supabase
        .from('tp_user_roles')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;

      toast.success('User role removed successfully');
      fetchUserRoles();
    } catch (error) {
      console.error('Error removing user role:', error);
      toast.error('Failed to remove user role');
    }
  };

  const getDefaultPermissions = (role: UserRole['role']) => {
    const permissions = {
      admin: { view: true, edit: true, delete: true, manage_users: true, manage_workflows: true },
      manager: { view: true, edit: true, delete: false, manage_users: true, manage_workflows: true },
      analyst: { view: true, edit: true, delete: false, manage_users: false, manage_workflows: false },
      reviewer: { view: true, edit: false, delete: false, manage_users: false, manage_workflows: false },
      client: { view: true, edit: false, delete: false, manage_users: false, manage_workflows: false }
    };
    return permissions[role];
  };

  const getRoleBadgeColor = (role: UserRole['role']) => {
    const colors = {
      admin: 'bg-red-100 text-red-800',
      manager: 'bg-blue-100 text-blue-800',
      analyst: 'bg-green-100 text-green-800',
      reviewer: 'bg-yellow-100 text-yellow-800',
      client: 'bg-gray-100 text-gray-800'
    };
    return colors[role];
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
            User Role Management
          </h2>
          <p className="text-muted-foreground">
            Manage user access and permissions for transfer pricing modules
          </p>
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="h-4 w-4 mr-2" />
              Add User
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New User Role</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <label className="text-sm font-medium">User Email</label>
                <Input
                  value={newUserEmail}
                  onChange={(e) => setNewUserEmail(e.target.value)}
                  placeholder="user@example.com"
                />
              </div>
              <div>
                <label className="text-sm font-medium">Role</label>
                <Select value={newUserRole} onValueChange={(value) => setNewUserRole(value as UserRole['role'])}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="admin">Admin</SelectItem>
                    <SelectItem value="manager">Manager</SelectItem>
                    <SelectItem value="analyst">Analyst</SelectItem>
                    <SelectItem value="reviewer">Reviewer</SelectItem>
                    <SelectItem value="client">Client</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={addUserRole}>
                  Add User
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Current User Roles
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>User</TableHead>
                <TableHead>Role</TableHead>
                <TableHead>Permissions</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {roles.map((role) => (
                <TableRow key={role.id}>
                  <TableCell className="font-medium">{role.user_email}</TableCell>
                  <TableCell>
                    <Badge className={getRoleBadgeColor(role.role)}>
                      {role.role.charAt(0).toUpperCase() + role.role.slice(1)}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {Object.entries(role.permissions).map(([perm, enabled]) => (
                        enabled && (
                          <Badge key={perm} variant="outline" className="text-xs">
                            {perm.replace('_', ' ')}
                          </Badge>
                        )
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {new Date(role.created_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Select 
                        value={role.role} 
                        onValueChange={(value) => updateUserRole(role.user_id, value as UserRole['role'])}
                      >
                        <SelectTrigger className="w-32">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="admin">Admin</SelectItem>
                          <SelectItem value="manager">Manager</SelectItem>
                          <SelectItem value="analyst">Analyst</SelectItem>
                          <SelectItem value="reviewer">Reviewer</SelectItem>
                          <SelectItem value="client">Client</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => removeUserRole(role.user_id)}
                      >
                        Remove
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}