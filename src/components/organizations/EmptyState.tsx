import React from 'react';
import { Building, Plus, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';

interface EmptyStateProps {
  onCreateClick: () => void;
}

export function EmptyState({ onCreateClick }: EmptyStateProps) {
  return (
    <Card className="p-8">
      <div className="text-center space-y-4">
        <Building className="w-12 h-12 mx-auto text-muted-foreground" />
        <h3 className="text-lg font-semibold">No Organizations Yet</h3>
        <p className="text-muted-foreground">
          Get started by creating a new organization or join an existing one
        </p>
        <div className="flex justify-center gap-4">
          <Button onClick={onCreateClick}>
            <Plus className="w-4 h-4 mr-2" />
            Create Organization
          </Button>
          <Button variant="outline">
            <Users className="w-4 h-4 mr-2" />
            Join Organization
          </Button>
        </div>
      </div>
    </Card>
  );
}