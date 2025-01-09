import React from 'react';
import { useForm } from 'react-hook-form';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Form, FormField, FormItem, FormLabel, FormControl, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useOrganizations } from '@/hooks/useOrganizations';

interface InviteMemberDialogProps {
  organizationId: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

interface FormData {
  email: string;
  role: 'admin' | 'accountant' | 'taxpayer';
}

export function InviteMemberDialog({ organizationId, open, onOpenChange }: InviteMemberDialogProps) {
  const { inviteMember } = useOrganizations();
  const form = useForm<FormData>();

  const onSubmit = async (data: FormData) => {
    try {
      await inviteMember.mutateAsync({
        organizationId,
        email: data.email,
        role: data.role,
      });
      onOpenChange(false);
      form.reset();
    } catch (error) {
      console.error('Error inviting member:', error);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Invite Team Member</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} type="email" placeholder="Enter email address" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a role" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="admin">Admin</SelectItem>
                      <SelectItem value="accountant">Accountant</SelectItem>
                      <SelectItem value="taxpayer">Taxpayer</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit">Invite Member</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}