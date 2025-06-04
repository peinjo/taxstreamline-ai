
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ComplianceFilters as FiltersType } from "@/types/compliance";
import { Search } from "lucide-react";

interface ComplianceFiltersProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  filters: FiltersType;
  onFiltersChange: (filters: FiltersType) => void;
}

export function ComplianceFilters({ 
  searchTerm, 
  onSearchChange, 
  filters, 
  onFiltersChange 
}: ComplianceFiltersProps) {
  const updateFilter = (key: keyof FiltersType, value: string) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          placeholder="Search compliance items..."
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          className="pl-10"
        />
      </div>
      
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Select value={filters.status} onValueChange={(value) => updateFilter('status', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="compliant">Compliant</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="attention">Attention</SelectItem>
            <SelectItem value="overdue">Overdue</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.priority} onValueChange={(value) => updateFilter('priority', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Priority</SelectItem>
            <SelectItem value="low">Low</SelectItem>
            <SelectItem value="medium">Medium</SelectItem>
            <SelectItem value="high">High</SelectItem>
            <SelectItem value="urgent">Urgent</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.frequency} onValueChange={(value) => updateFilter('frequency', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Frequency" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Frequency</SelectItem>
            <SelectItem value="daily">Daily</SelectItem>
            <SelectItem value="weekly">Weekly</SelectItem>
            <SelectItem value="monthly">Monthly</SelectItem>
            <SelectItem value="quarterly">Quarterly</SelectItem>
            <SelectItem value="annual">Annual</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.country} onValueChange={(value) => updateFilter('country', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Country" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Countries</SelectItem>
            <SelectItem value="United States">United States</SelectItem>
            <SelectItem value="United Kingdom">United Kingdom</SelectItem>
            <SelectItem value="Germany">Germany</SelectItem>
            <SelectItem value="Canada">Canada</SelectItem>
            <SelectItem value="Australia">Australia</SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.requirement_type} onValueChange={(value) => updateFilter('requirement_type', value)}>
          <SelectTrigger>
            <SelectValue placeholder="Type" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="Tax Filing">Tax Filing</SelectItem>
            <SelectItem value="VAT Registration">VAT Registration</SelectItem>
            <SelectItem value="Trade Registration">Trade Registration</SelectItem>
            <SelectItem value="Employment Standards">Employment Standards</SelectItem>
            <SelectItem value="Environmental Compliance">Environmental Compliance</SelectItem>
          </SelectContent>
        </Select>
      </div>
    </div>
  );
}
