import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { Team } from '@/types/team';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { CreateTeamDialog } from './CreateTeamDialog';
import { toast } from 'sonner';

export function TeamWorkspace() {
  const { user } = useAuth();
  const [isCreateTeamOpen, setIsCreateTeamOpen] = React.useState(false);

  const { data: teams, isLoading } = useQuery({
    queryKey: ['teams'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('teams')
        .select('*, team_members!inner(*)')
        .eq('team_members.user_id', user?.id);
      
      if (error) {
        toast.error('Failed to load teams');
        throw error;
      }
      return data as Team[];
    },
    enabled: !!user,
  });

  if (isLoading) {
    return <div>Loading teams...</div>;
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Teams</h2>
        <Button onClick={() => setIsCreateTeamOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Team
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {teams?.map((team) => (
          <Card key={team.id}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {team.name}
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground">
                {team.description || 'No description'}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <CreateTeamDialog
        open={isCreateTeamOpen}
        onOpenChange={setIsCreateTeamOpen}
      />
    </div>
  );
}