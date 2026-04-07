import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatNaira, MONTHS } from "./PayrollCalculations";
import { generatePayslipPDF } from "./PayslipGenerator";
import { Download } from "lucide-react";

interface Props {
  runId: string | null;
  month: number;
  year: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function PayslipViewerDialog({ runId, month, year, open, onOpenChange }: Props) {
  const { data: payslips = [], isLoading } = useQuery({
    queryKey: ["payslips", runId],
    queryFn: async () => {
      if (!runId) return [];
      const { data, error } = await supabase
        .from("payslips")
        .select("*, employees(full_name, department, job_title)")
        .eq("payroll_run_id", runId);
      if (error) throw error;
      return data;
    },
    enabled: !!runId && open,
  });

  const downloadPayslip = (slip: any) => {
    const emp = slip.employees;
    generatePayslipPDF({
      employeeName: emp?.full_name || "Unknown",
      department: emp?.department || "—",
      jobTitle: emp?.job_title || "—",
      month,
      year,
      basic: Number(slip.basic_salary),
      housing: Number(slip.housing_allowance || 0),
      transport: Number(slip.transport_allowance || 0),
      otherAllowances: Number(slip.other_allowances || 0),
      gross: Number(slip.gross_pay),
      paye: Number(slip.paye_tax || 0),
      pensionEmployee: Number(slip.pension_employee || 0),
      pensionEmployer: Number(slip.pension_employer || 0),
      nhf: Number(slip.nhf || 0),
      net: Number(slip.net_pay),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Payslips — {MONTHS[month - 1]} {year}</DialogTitle>
          <DialogDescription>View and download individual payslips for this payroll run</DialogDescription>
        </DialogHeader>
        {isLoading ? (
          <p className="text-center py-8 text-muted-foreground">Loading payslips...</p>
        ) : payslips.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">No payslips found for this run.</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Employee</TableHead>
                <TableHead className="text-right">Gross</TableHead>
                <TableHead className="text-right">PAYE</TableHead>
                <TableHead className="text-right">Pension</TableHead>
                <TableHead className="text-right">NHF</TableHead>
                <TableHead className="text-right">Net Pay</TableHead>
                <TableHead />
              </TableRow>
            </TableHeader>
            <TableBody>
              {payslips.map((slip: any) => (
                <TableRow key={slip.id}>
                  <TableCell className="font-medium">{slip.employees?.full_name || "Unknown"}</TableCell>
                  <TableCell className="text-right">{formatNaira(Number(slip.gross_pay))}</TableCell>
                  <TableCell className="text-right">{formatNaira(Number(slip.paye_tax || 0))}</TableCell>
                  <TableCell className="text-right">{formatNaira(Number(slip.pension_employee || 0))}</TableCell>
                  <TableCell className="text-right">{formatNaira(Number(slip.nhf || 0))}</TableCell>
                  <TableCell className="text-right font-semibold">{formatNaira(Number(slip.net_pay))}</TableCell>
                  <TableCell>
                    <Button size="sm" variant="ghost" onClick={() => downloadPayslip(slip)}>
                      <Download className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </DialogContent>
    </Dialog>
  );
}
