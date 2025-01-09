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

  // Separate query for organizations
  const { data: organizations, isLoading: isLoadingOrgs, error: orgsError } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*');
      
      if (error) {
        console.error('Error fetching organizations:', error);
        toast.error('Unable to load organizations. Please try again.');
        throw error;
      }
      return data as Organization[];
    },
  });

  // Separate query for organization members
  const { data: members, isLoading: isLoadingMembers } = useQuery({
    queryKey: ['organization_members'],
    queryFn: async () => {
      if (!organizations) return [];
      
      const orgIds = organizations.map(org => org.id);
      const { data, error } = await supabase
        .from('organization_members')
        .select('*')
        .in('organization_id', orgIds);
      
      if (error) {
        console.error('Error fetching members:', error);
        toast.error('Unable to load organization members. Please try again.');
        throw error;
      }
      return data as OrganizationMember[];
    },
    enabled: !!organizations && organizations.length > 0,
  });

  // Combine organizations and members
  const enrichedOrganizations = organizations?.map(org => ({
    ...org,
    organization_members: members?.filter(member => member.organization_id === org.id) || []
  }));

  const createOrganization = useMutation({
    mutationFn: async (name: string) => {
      const { data, error } = await supabase
        .from('organizations')
        .insert([{ name }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organizations'] });
      toast.success('Organization created successfully');
    },
    onError: () => {
      toast.error('Failed to create organization');
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

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_members'] });
      toast.success('Member invited successfully');
    },
    onError: () => {
      toast.error('Failed to invite member');
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

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_members'] });
      toast.success('Member removed successfully');
    },
    onError: () => {
      toast.error('Failed to remove member');
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

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['organization_members'] });
      toast.success('Member role updated successfully');
    },
    onError: () => {
      toast.error('Failed to update member role');
    },
  });

  const isLoading = isLoadingOrgs || isLoadingMembers;
  const error = orgsError;

  return {
    organizations: enrichedOrganizations,
    isLoading,
    error,
    createOrganization,
    inviteMember,
    removeMember,
    updateMemberRole,
  };
}