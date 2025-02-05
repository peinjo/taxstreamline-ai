import React from 'react';
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";

export const FilingHistory: React.FC = () => {
  const { data: filings, isLoading } = useQuery({
    queryKey: ["tax-filings"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tax_filings")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data;
    },
  });

  const getStatusBadge = (status: string) => {
    const statusStyles = {
      pending: "bg-yellow-500",
      submitted: "bg-green-500",
      error: "bg-red-500",
    };

    return (
      <Badge className={statusStyles[status as keyof typeof statusStyles]}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  if (isLoading) return <div>Loading...</div>;

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Reference</TableHead>
            <TableHead>Type</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Submitted</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filings?.map((filing) => (
            <TableRow key={filing.id}>
              <TableCell>{filing.firs_reference}</TableCell>
              <TableCell>{filing.filing_type}</TableCell>
              <TableCell>{getStatusBadge(filing.status)}</TableCell>
              <TableCell>
                {new Date(filing.created_at).toLocaleDateString()}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
};
