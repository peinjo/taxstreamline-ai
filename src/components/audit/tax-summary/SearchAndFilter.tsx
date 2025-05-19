
import React from "react";
import { Input } from "@/components/ui/input";
import { 
  Select, 
  SelectTrigger, 
  SelectValue, 
  SelectContent, 
  SelectItem 
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Search, Calendar } from "lucide-react";

interface SearchAndFilterProps {
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  year: string;
  setYear: (year: string) => void;
  status: string;
  setStatus: (status: string) => void;
  onScheduleReport: () => void;
}

export const SearchAndFilter: React.FC<SearchAndFilterProps> = ({
  searchQuery,
  setSearchQuery,
  year,
  setYear,
  status,
  setStatus,
  onScheduleReport,
}) => {
  const currentYear = new Date().getFullYear();
  const years = Array.from(
    { length: 10 },
    (_, i) => (currentYear - i).toString()
  );

  return (
    <div className="flex flex-col gap-4 md:flex-row md:items-end justify-between">
      <div className="flex flex-1 flex-col md:flex-row gap-2 md:items-end">
        <div className="w-full md:w-auto md:flex-1">
          <label htmlFor="search" className="text-sm font-medium mb-1 block">
            Search
          </label>
          <div className="relative">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="search"
              placeholder="Search tax reports..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8"
            />
          </div>
        </div>
        
        <div className="w-full md:w-[150px]">
          <label htmlFor="year-filter" className="text-sm font-medium mb-1 block">
            Year
          </label>
          <Select value={year} onValueChange={setYear}>
            <SelectTrigger id="year-filter">
              <SelectValue placeholder="Select Year" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Years</SelectItem>
              {years.map((y) => (
                <SelectItem key={y} value={y}>
                  {y}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="w-full md:w-[150px]">
          <label htmlFor="status-filter" className="text-sm font-medium mb-1 block">
            Status
          </label>
          <Select value={status} onValueChange={setStatus}>
            <SelectTrigger id="status-filter">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="approved">Approved</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="rejected">Rejected</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      
      <div className="w-full md:w-auto">
        <Button onClick={onScheduleReport}>
          <Calendar className="mr-2 h-4 w-4" />
          Schedule Report
        </Button>
      </div>
    </div>
  );
};
