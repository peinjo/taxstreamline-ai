
import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { ComplianceItem, ComplianceFilters } from "@/types/compliance";
import { toast } from "sonner";
import { logger } from "@/lib/logging/logger";

export function useCompliance() {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<ComplianceFilters>({
    status: "all",
    priority: "all",
    country: "all",
    requirement_type: "all",
    frequency: "all"
  });
  const [sortBy, setSortBy] = useState("next_due_date");
  
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // Fetch compliance items
  const { data: complianceItems = [], isLoading, error } = useQuery({
    queryKey: ["compliance-items", user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      
      const { data, error } = await supabase
        .from("compliance_items")
        .select("*")
        .eq("user_id", user.id)
        .order("next_due_date", { ascending: true });
      
      if (error) throw error;
      return data as ComplianceItem[];
    },
    enabled: !!user?.id,
  });

  // Filter and sort items
  const filteredItems = complianceItems.filter(item => {
    const matchesSearch = searchTerm === "" || 
      item.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.country.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.requirement_type.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = filters.status === "all" || item.status === filters.status;
    const matchesPriority = filters.priority === "all" || item.priority === filters.priority;
    const matchesCountry = filters.country === "all" || item.country === filters.country;
    const matchesType = filters.requirement_type === "all" || item.requirement_type === filters.requirement_type;
    const matchesFrequency = filters.frequency === "all" || item.frequency === filters.frequency;

    return matchesSearch && matchesStatus && matchesPriority && matchesCountry && matchesType && matchesFrequency;
  });

  // Create compliance item
  const createItemMutation = useMutation({
    mutationFn: async (itemData: Omit<ComplianceItem, 'id' | 'created_at' | 'updated_at'>) => {
      const { data, error } = await supabase
        .from("compliance_items")
        .insert([{ ...itemData, user_id: user!.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      toast.success("Compliance item created successfully");
    },
    onError: (error) => {
      logger.error("Error creating compliance item", error as Error, { component: "useCompliance", action: "createItem" });
      toast.error("Failed to create compliance item");
    },
  });

  // Update compliance item
  const updateItemMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<ComplianceItem> & { id: string }) => {
      const { data, error } = await supabase
        .from("compliance_items")
        .update(updates)
        .eq("id", id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      toast.success("Compliance item updated successfully");
    },
    onError: (error) => {
      logger.error("Error updating compliance item", error as Error, { component: "useCompliance", action: "updateItem" });
      toast.error("Failed to update compliance item");
    },
  });

  // Delete compliance item
  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("compliance_items")
        .delete()
        .eq("id", id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["compliance-items"] });
      toast.success("Compliance item deleted successfully");
    },
    onError: (error) => {
      logger.error("Error deleting compliance item", error as Error, { component: "useCompliance", action: "deleteItem" });
      toast.error("Failed to delete compliance item");
    },
  });

  // Get compliance statistics
  const getStats = () => {
    const total = complianceItems.length;
    const compliant = complianceItems.filter(item => item.status === 'compliant').length;
    const pending = complianceItems.filter(item => item.status === 'pending').length;
    const attention = complianceItems.filter(item => item.status === 'attention').length;
    const overdue = complianceItems.filter(item => item.status === 'overdue').length;

    return { total, compliant, pending, attention, overdue };
  };

  return {
    complianceItems: filteredItems,
    allItems: complianceItems,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    sortBy,
    setSortBy,
    isLoading,
    error,
    createItem: createItemMutation.mutate,
    updateItem: updateItemMutation.mutate,
    deleteItem: deleteItemMutation.mutate,
    isCreating: createItemMutation.isPending,
    isUpdating: updateItemMutation.isPending,
    isDeleting: deleteItemMutation.isPending,
    stats: getStats(),
  };
}
