import React from 'react';
import { Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface OrganizationHeaderProps {
  onCreateClick: () => void;
}

export function OrganizationHeader({ onCreateClick }: OrganizationHeaderProps) {
  return (
    <div className="flex justify-between items-center">
      <h2 className="text-2xl font-bold">Organizations</h2>
      <Button onClick={onCreateClick}>
        <Plus className="w-4 h-4 mr-2" />
        Create Organization
      </Button>
    </div>
  );
}