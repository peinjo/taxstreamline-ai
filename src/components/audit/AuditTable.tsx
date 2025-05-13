
import React, { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Activity } from "@/types/activities";
import { format } from "date-fns";
import { Input } from "@/components/ui/input";
import { Search, ArrowUp, ArrowDown } from "lucide-react";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

interface AuditTableProps {
  activities: Activity[];
}

export const AuditTable = ({ activities }: AuditTableProps) => {
  const [searchTerm, setSearchTerm] = useState("");
  const [sortField, setSortField] = useState<"action" | "document_title" | "document_type" | "created_at">("created_at");
  const [sortDirection, setSortDirection] = useState<"asc" | "desc">("desc");

  // Filter activities based on search term
  const filteredActivities = activities.filter((activity) => {
    const searchLower = searchTerm.toLowerCase();
    return (
      activity.action.toLowerCase().includes(searchLower) ||
      activity.document_title.toLowerCase().includes(searchLower) ||
      activity.document_type.toLowerCase().includes(searchLower)
    );
  });

  // Sort activities based on sort field and direction
  const sortedActivities = [...filteredActivities].sort((a, b) => {
    if (sortField === "created_at") {
      const aDate = new Date(a[sortField]).getTime();
      const bDate = new Date(b[sortField]).getTime();
      return sortDirection === "asc" ? aDate - bDate : bDate - aDate;
    } else {
      const aVal = a[sortField].toLowerCase();
      const bVal = b[sortField].toLowerCase();
      if (sortDirection === "asc") {
        return aVal > bVal ? 1 : -1;
      } else {
        return aVal < bVal ? 1 : -1;
      }
    }
  });

  const handleSort = (field: "action" | "document_title" | "document_type" | "created_at") => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc");
    } else {
      setSortField(field);
      setSortDirection("asc");
    }
  };

  // Determine activity type and badge
  const getActivityBadge = (activity: Activity) => {
    const actionLower = activity.action.toLowerCase();
    
    if (actionLower.includes("submitted") || actionLower.includes("created")) {
      return <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">Created</Badge>;
    } else if (actionLower.includes("uploaded")) {
      return <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Upload</Badge>;
    } else if (actionLower.includes("reminder") || actionLower.includes("deadline")) {
      return <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">Reminder</Badge>;
    } else if (actionLower.includes("meeting") || actionLower.includes("scheduled")) {
      return <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">Meeting</Badge>;
    }
    return <Badge variant="outline">{activity.document_type}</Badge>;
  };

  if (activities.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-muted-foreground">No audit activities found.</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search audit logs..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-8"
        />
      </div>
      
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="cursor-pointer" onClick={() => handleSort("action")}>
                <div className="flex items-center">
                  Action
                  {sortField === "action" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("document_title")}>
                <div className="flex items-center">
                  Document Title
                  {sortField === "document_title" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("document_type")}>
                <div className="flex items-center">
                  Document Type
                  {sortField === "document_type" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="cursor-pointer" onClick={() => handleSort("created_at")}>
                <div className="flex items-center">
                  Timestamp
                  {sortField === "created_at" && (
                    sortDirection === "asc" ? <ArrowUp className="ml-1 h-4 w-4" /> : <ArrowDown className="ml-1 h-4 w-4" />
                  )}
                </div>
              </TableHead>
              <TableHead className="w-24">Type</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedActivities.map((activity) => (
              <TableRow key={activity.id} className="hover:bg-slate-50">
                <TableCell>{activity.action}</TableCell>
                <TableCell className="font-medium">{activity.document_title}</TableCell>
                <TableCell>{activity.document_type}</TableCell>
                <TableCell>
                  {format(new Date(activity.created_at), "PPpp")}
                </TableCell>
                <TableCell>{getActivityBadge(activity)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      
      {filteredActivities.length === 0 && searchTerm && (
        <div className="py-4 text-center">
          <p className="text-muted-foreground">No activities found matching your search criteria.</p>
        </div>
      )}
      
      {activities.length > 0 && (
        <div className="text-sm text-muted-foreground">
          Showing {filteredActivities.length} of {activities.length} activities
        </div>
      )}
    </div>
  );
};
