import React from 'react';
import { useOrganizations } from '@/hooks/useOrganizations';
import { CreateOrganizationDialog } from './CreateOrganizationDialog';
import { MemberList } from './MemberList';
import { EmptyState } from './EmptyState';
import { OrganizationCard } from './OrganizationCard';
import { OrganizationHeader } from './OrganizationHeader';

export function OrganizationList() {
  const { organizations, isLoading } = useOrganizations();
  const [isCreateOpen, setIsCreateOpen] = React.useState(false);
  const [selectedOrgId, setSelectedOrgId] = React.useState<number | null>(null);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <p className="text-muted-foreground">Loading organizations...</p>
      </div>
    );
  }

  if (!organizations || organizations.length === 0) {
    return (
      <div className="space-y-8">
        <OrganizationHeader onCreateClick={() => setIsCreateOpen(true)} />
        <EmptyState onCreateClick={() => setIsCreateOpen(true)} />
        <CreateOrganizationDialog
          open={isCreateOpen}
          onOpenChange={setIsCreateOpen}
        />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <OrganizationHeader onCreateClick={() => setIsCreateOpen(true)} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {organizations.map((org) => (
          <OrganizationCard
            key={org.id}
            id={org.id}
            name={org.name}
            memberCount={org.organization_members?.length || 0}
            isSelected={selectedOrgId === org.id}
            onClick={() => setSelectedOrgId(selectedOrgId === org.id ? null : org.id)}
          />
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