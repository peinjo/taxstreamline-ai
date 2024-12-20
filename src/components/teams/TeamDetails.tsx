import React from 'react';
import { useParams } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types/team';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

export function TeamDetails() {
  const { teamId } = useParams();

  const { data: team, isLoading } = useQuery({
    queryKey: ['team', teamId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, team_members(*)')
        .eq('id', teamId)
        .single();
      
      if (error) {
        toast.error('Failed to load team details');
        throw error;
      }
      return data as Team;
    },
    enabled: !!teamId,
  });

  if (isLoading) {
    return <div>Loading team details...</div>;
  }

  if (!team) {
    return <div>Team not found</div>;
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>{team.name}</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground">
            {team.description || 'No description'}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}