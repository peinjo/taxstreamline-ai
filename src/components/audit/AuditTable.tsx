import React from "react";
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

interface AuditTableProps {
  activities: Activity[];
}

export const AuditTable = ({ activities }: AuditTableProps) => {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Action</TableHead>
            <TableHead>Document Title</TableHead>
            <TableHead>Document Type</TableHead>
            <TableHead>Timestamp</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {activities.map((activity) => (
            <TableRow key={activity.id}>
              <TableCell>{activity.action}</TableCell>
              <TableCell>{activity.document_title}</TableCell>
              <TableCell>{activity.document_type}</TableCell>
              <TableCell>
                {format(new Date(activity.created_at), "PPpp")}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};