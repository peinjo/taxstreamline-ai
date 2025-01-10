import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface OrganizationMember {
  id: number;
  organization_id: number;
  user_id: string;
  role: 'admin' | 'accountant' | 'taxpayer';
  invited_email?: string;
  invitation_token?: string;
  joined_at?: string;
  created_at: string;
}

interface Organization {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
  organization_members?: OrganizationMember[];
}

export function useOrganizations() {
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data: orgs, error } = await supabase
        .from('organizations')
        .select(`
          *,
          organization_members (*)
        `);
      
      if (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Failed to load organizations');
        return [];
      }
      
      return (orgs || []) as Organization[];
    },
  });

  const createOrganization = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name }])
        .select()
        .single();

      if (error) {
        toast.error('Failed to create organization');
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully');
    },
  });

  const inviteMember = useMutation({
    mutationFn: async ({ organizationId, email, role }: { 
      organizationId: number; 
      email: string; 
      role: 'admin' | 'accountant' | 'taxpayer';
    }) => {
      const { data, error } = await supabase
        .from('organization_members')
        .insert([{
          organization_id: organizationId,
          invited_email: email,
          role,
        }])
        .select()
        .single();

      if (error) {
        toast.error('Failed to invite member');
        throw error;
      }
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Member invited successfully');
    },
  });

  const removeMember = useMutation({
    mutationFn: async ({ organizationId, memberId }: { 
      organizationId: number; 
      memberId: number;
    }) => {
      const { error } = await supabase
        .from('organization_members')
        .delete()
        .eq('id', memberId)
        .eq('organization_id', organizationId);

      if (error) {
        toast.error('Failed to remove member');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Member removed successfully');
    },
  });

  const updateMemberRole = useMutation({
    mutationFn: async ({ organizationId, memberId, role }: { 
      organizationId: number; 
      memberId: number;
      role: 'admin' | 'accountant' | 'taxpayer';
    }) => {
      const { error } = await supabase
        .from('organization_members')
        .update({ role })
        .eq('id', memberId)
        .eq('organization_id', organizationId);

      if (error) {
        toast.error('Failed to update member role');
        throw error;
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Member role updated successfully');
    },
  });

  return {
    organizations: organizations || [],
    isLoading,
    createOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
}