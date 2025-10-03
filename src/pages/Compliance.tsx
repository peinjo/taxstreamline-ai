
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Plus, ClipboardCheck } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { ComplianceFilters } from "@/components/compliance/ComplianceFilters";
import { ComplianceStats } from "@/components/compliance/ComplianceStats";
import { ComplianceItemCard } from "@/components/compliance/ComplianceItemCard";
import { CreateComplianceDialog } from "@/components/compliance/CreateComplianceDialog";
import { useCompliance } from "@/hooks/useCompliance";
import { ComplianceItem } from "@/types/compliance";
import { EmptyState } from "@/components/common/EmptyState";

const ComplianceTracker = () => {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingItem, setEditingItem] = useState<ComplianceItem | null>(null);

  const {
    complianceItems,
    searchTerm,
    setSearchTerm,
    filters,
    setFilters,
    isLoading,
    createItem,
    updateItem,
    deleteItem,
    isCreating,
    stats,
  } = useCompliance();

  const handleCreateItem = (data: Omit<ComplianceItem, 'id' | 'created_at' | 'updated_at'>) => {
    createItem(data);
    setShowCreateDialog(false);
  };

  const handleUpdateStatus = (id: string, status: string) => {
    updateItem({ 
      id, 
      status: status as ComplianceItem['status'],
      last_completed_date: status === 'compliant' ? new Date().toISOString() : undefined
    });
  };

  const handleDeleteItem = (id: string) => {
    if (confirm("Are you sure you want to delete this compliance item?")) {
      deleteItem(id);
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="space-y-8">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Compliance Tracker</h1>
          </div>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="h-24 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 rounded animate-pulse"></div>
            ))}
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="space-y-8">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Compliance Tracker</h1>
          <Button onClick={() => setShowCreateDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
            Add Compliance Item
          </Button>
        </div>

        <ComplianceStats stats={stats} />

        <div className="space-y-6">
          <ComplianceFilters
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
            filters={filters}
            onFiltersChange={setFilters}
          />

          {complianceItems.length === 0 && !searchTerm && !filters.country && !filters.status ? (
            <EmptyState
              icon={ClipboardCheck}
              title="No compliance items yet"
              description="Start tracking your compliance requirements by creating your first item. Monitor deadlines, statuses, and ensure you stay compliant across all jurisdictions."
              actionLabel="Create Compliance Item"
              onAction={() => setShowCreateDialog(true)}
            />
          ) : complianceItems.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-gray-500 mb-4">No compliance items match your filters</p>
              <Button variant="outline" onClick={() => {
                setSearchTerm("");
                setFilters({ country: "", status: "", priority: "", requirement_type: "", frequency: "" });
              }}>
                Clear Filters
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {complianceItems.map((item) => (
                <ComplianceItemCard
                  key={item.id}
                  item={item}
                  onEdit={setEditingItem}
                  onDelete={handleDeleteItem}
                  onUpdateStatus={handleUpdateStatus}
                />
              ))}
            </div>
          )}
        </div>

        <CreateComplianceDialog
          open={showCreateDialog}
          onOpenChange={setShowCreateDialog}
          onSubmit={handleCreateItem}
          isLoading={isCreating}
        />
      </div>
    </DashboardLayout>
  );
};

export default ComplianceTracker;
