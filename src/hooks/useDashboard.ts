import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import type { Activity, Deadline, DashboardMetrics } from '@/types';

export const useDashboardMetrics = () => {
  return useQuery({
    queryKey: ['dashboard-metrics'],
    queryFn: async (): Promise<DashboardMetrics> => {
      const { data, error } = await supabase
        .from('dashboard_metrics')
        .select('*')
        .single();
      
      if (error) throw error;
      return data;
    }
  });
};

export const useRecentActivities = () => {
  return useQuery({
    queryKey: ['recent-activities'],
    queryFn: async (): Promise<Activity[]> => {
      const { data, error } = await supabase
        .from('activities')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });
};

export const useUpcomingDeadlines = () => {
  return useQuery({
    queryKey: ['upcoming-deadlines'],
    queryFn: async (): Promise<Deadline[]> => {
      const { data, error } = await supabase
        .from('deadlines')
        .select('*')
        .order('date', { ascending: true })
        .limit(4);
      
      if (error) throw error;
      return data;
    }
  });
};
