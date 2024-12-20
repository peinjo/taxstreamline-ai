import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types/team';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import DashboardLayout from '@/components/DashboardLayout';
import { Button } from '@/components/ui/button';
import { ArrowLeft } from 'lucide-react';

const TeamDetails = () => {
  const { teamId } = useParams();
  const navigate = useNavigate();

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
    return (
      <DashboardLayout>
        <div>Loading team details...</div>
      </DashboardLayout>
    );
  }

  if (!team) {
    return (
      <DashboardLayout>
        <div>Team not found</div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-4">
        <div className="flex items-center gap-4">
          <Button 
            variant="outline" 
            onClick={() => navigate('/')}
            className="flex items-center gap-2"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Dashboard
          </Button>
        </div>
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
    </DashboardLayout>
  );
};

export default TeamDetails;