import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { toast } from 'sonner';

interface Organization {
  id: number;
  name: string;
  created_at: string;
  created_by: string;
}

export function useOrganizations() {
  const queryClient = useQueryClient();

  const { data: organizations, isLoading } = useQuery({
    queryKey: ['organizations'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('organizations')
        .select('*, organization_members(*)');
      
      if (error) {
        toast.error('Failed to load organizations');
        throw error;
      }
      return data as Organization[];
    },
  });

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

  return {
    organizations,
    isLoading,
    createOrganization,
  };
}