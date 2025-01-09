import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useForm } from "react-hook-form";
import { supabase } from "@/lib/supabase";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";
import { Plus } from "lucide-react";

interface CreateOrganizationForm {
  name: string;
}

export function CreateOrganizationDialog() {
  const { user } = useAuth();
  const [open, setOpen] = React.useState(false);
  const { register, handleSubmit, reset } = useForm<CreateOrganizationForm>();

  const onSubmit = async (data: CreateOrganizationForm) => {
    try {
      // Create organization
      const { data: org, error: orgError } = await supabase
        .from('organizations')
        .insert({
          name: data.name,
          created_by: user?.id
        })
        .select('id')
        .single();

      if (orgError) {
        console.error('Error creating organization:', orgError);
        toast.error("Failed to create organization");
        return;
      }

      // Add creator as admin member
      const { error: memberError } = await supabase
        .from('organization_members')
        .insert({
          organization_id: org.id,
          user_id: user?.id,
          role: 'admin'
        });

      if (memberError) {
        console.error('Error adding member:', memberError);
        toast.error("Failed to add member to organization");
        return;
      }

      // Log activity
      await supabase.rpc('log_organization_activity', {
        org_id: org.id,
        action: 'Organization created',
        details: { organization_name: data.name }
      });

      toast.success("Organization created successfully!");
      setOpen(false);
      reset();
    } catch (error) {
      console.error('Error creating organization:', error);
      toast.error("Failed to create organization");
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button>
          <Plus className="w-4 h-4 mr-2" />
          Create Organization
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Organization</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <div>
            <label htmlFor="name" className="block text-sm font-medium mb-1">
              Organization Name
            </label>
            <Input
              id="name"
              {...register("name", { required: true })}
              placeholder="Enter organization name"
            />
          </div>
          <Button type="submit" className="w-full">
            Create Organization
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}