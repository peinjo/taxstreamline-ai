import React from 'react';
import { Building, Users } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface OrganizationCardProps {
  id: number;
  name: string;
  memberCount: number;
  isSelected: boolean;
  onClick: () => void;
}

export function OrganizationCard({ 
  name, 
  memberCount, 
  isSelected, 
  onClick 
}: OrganizationCardProps) {
  return (
    <Card 
      className={`cursor-pointer hover:shadow-lg transition-shadow ${isSelected ? 'ring-2 ring-primary' : ''}`}
      onClick={onClick}
    >
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          {name}
        </CardTitle>
        <Building className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="flex items-center mt-2">
          <Users className="h-4 w-4 mr-2 text-muted-foreground" />
          <span className="text-sm text-muted-foreground">
            {memberCount} members
          </span>
        </div>
      </CardContent>
    </Card>
  );
}