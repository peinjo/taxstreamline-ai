import React from 'react';
import { UserPlus, UserMinus, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { InviteMemberDialog } from './InviteMemberDialog';
import { useOrganizations } from '@/hooks/useOrganizations';

interface MemberListProps {
  organizationId: number;
}

export function MemberList({ organizationId }: MemberListProps) {
  const [isInviteOpen, setIsInviteOpen] = React.useState(false);
  const { organizations, removeMember, updateMemberRole } = useOrganizations();
  
  const organization = organizations?.find(org => org.id === organizationId);
  const members = organization?.organization_members || [];

  const handleRemoveMember = async (memberId: number) => {
    try {
      await removeMember.mutateAsync({ organizationId, memberId });
    } catch (error) {
      console.error('Error removing member:', error);
    }
  };

  const handleUpdateRole = async (memberId: number, newRole: 'admin' | 'accountant' | 'taxpayer') => {
    try {
      await updateMemberRole.mutateAsync({ organizationId, memberId, role: newRole });
    } catch (error) {
      console.error('Error updating role:', error);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold">Team Members</h3>
        <Button onClick={() => setIsInviteOpen(true)}>
          <UserPlus className="w-4 h-4 mr-2" />
          Invite Member
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {members.map((member) => (
            <TableRow key={member.id}>
              <TableCell>{member.invited_email || 'N/A'}</TableCell>
              <TableCell>{member.role}</TableCell>
              <TableCell>
                {member.joined_at ? 'Active' : 'Pending'}
              </TableCell>
              <TableCell>
                <div className="flex space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleUpdateRole(member.id, 'admin')}
                  >
                    <UserCog className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleRemoveMember(member.id)}
                  >
                    <UserMinus className="w-4 h-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      <InviteMemberDialog
        organizationId={organizationId}
        open={isInviteOpen}
        onOpenChange={setIsInviteOpen}
      />
    </div>
  );
}