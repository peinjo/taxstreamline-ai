import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, Users, Building } from 'lucide-react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { MemberList } from './MemberList';

export function OrganizationList() {
  const { organizations, isLoading } = useOrganizations();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedOrgId, setSelectedOrgId] = React.useState<number | null>(null);

  if (isLoading) {
    return <div>Loading organizations...</div>;
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Organizations</h2>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations?.map((org) => (
          <Card 
            key={org.id} 
            className="cursor-pointer hover:shadow-lg transition-shadow"
            onClick={() => setSelectedOrgId(selectedOrgId === org.id ? null : org.id)}
          >
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {org.name}
              </CardTitle>
              <Building className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="flex items-center mt-2">
                <Users className="h-4 w-4 mr-2 text-muted-foreground" />
                <span className="text-sm text-muted-foreground">
                  {org.organization_members?.length || 0} members
                </span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {selectedOrgId && (
        <MemberList organizationId={selectedOrgId} />
      )}

      <CreateOrganizationDialog
        open={isCreateOpen}
        onOpenChange={setIsCreateOpen}
      />
    </div>
  );
}