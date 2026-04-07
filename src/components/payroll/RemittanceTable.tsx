import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { formatNaira, MONTHS } from "./PayrollCalculations";
import { TrendingUp, Building2, Home } from "lucide-react";

interface PayrollRun {
  id: string;
  period_month: number;
  period_year: number;
  total_paye: number | null;
  total_pension: number | null;
  total_nhf: number | null;
  total_gross: number | null;
  total_net: number | null;
  employee_count: number | null;
  status: string | null;
}

interface Props {
  payrollRuns: PayrollRun[];
}

export default function RemittanceTable({ payrollRuns }: Props) {
  const totals = payrollRuns.reduce(
    (acc, r) => ({
      paye: acc.paye + Number(r.total_paye || 0),
      pension: acc.pension + Number(r.total_pension || 0),
      nhf: acc.nhf + Number(r.total_nhf || 0),
    }),
    { paye: 0, pension: 0, nhf: 0 }
  );

  const remittanceTypes = [
    {
      title: "PAYE Tax",
      description: "Monthly income tax deductions remitted to FIRS",
      icon: TrendingUp,
      total: totals.paye,
      color: "text-orange-600",
      bgColor: "bg-orange-50 dark:bg-orange-950/30",
    },
    {
      title: "Pension Fund",
      description: "Employee (8%) + Employer (10%) contributions to PFA",
      icon: Building2,
      total: totals.pension,
      color: "text-blue-600",
      bgColor: "bg-blue-50 dark:bg-blue-950/30",
    },
    {
      title: "NHF",
      description: "National Housing Fund (2.5% of basic salary)",
      icon: Home,
      total: totals.nhf,
      color: "text-green-600",
      bgColor: "bg-green-50 dark:bg-green-950/30",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid gap-4 md:grid-cols-3">
        {remittanceTypes.map((item) => (
          <Card key={item.title} className={item.bgColor}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                <item.icon className={`h-5 w-5 ${item.color}`} />
                <CardTitle className="text-sm font-semibold">{item.title}</CardTitle>
              </div>
              <CardDescription className="text-xs">{item.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-2xl font-bold">{formatNaira(item.total)}</p>
              <p className="text-xs text-muted-foreground mt-1">
                Cumulative across {payrollRuns.length} payroll run{payrollRuns.length !== 1 ? "s" : ""}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Monthly Breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Remittance Schedule</CardTitle>
          <CardDescription>Breakdown of statutory remittances per payroll period</CardDescription>
        </CardHeader>
        <CardContent>
          {payrollRuns.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">No payroll runs to show remittances for.</p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Period</TableHead>
                  <TableHead>Employees</TableHead>
                  <TableHead className="text-right">PAYE</TableHead>
                  <TableHead className="text-right">Pension</TableHead>
                  <TableHead className="text-right">NHF</TableHead>
                  <TableHead className="text-right">Total Remittance</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payrollRuns.map((run) => {
                  const paye = Number(run.total_paye || 0);
                  const pension = Number(run.total_pension || 0);
                  const nhf = Number(run.total_nhf || 0);
                  return (
                    <TableRow key={run.id}>
                      <TableCell className="font-medium">
                        {MONTHS[(run.period_month ?? 1) - 1]} {run.period_year}
                      </TableCell>
                      <TableCell>{run.employee_count}</TableCell>
                      <TableCell className="text-right">{formatNaira(paye)}</TableCell>
                      <TableCell className="text-right">{formatNaira(pension)}</TableCell>
                      <TableCell className="text-right">{formatNaira(nhf)}</TableCell>
                      <TableCell className="text-right font-semibold">{formatNaira(paye + pension + nhf)}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="text-xs">
                          Pending
                        </Badge>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {/* Totals row */}
                <TableRow className="bg-muted/50 font-bold">
                  <TableCell>Total</TableCell>
                  <TableCell />
                  <TableCell className="text-right">{formatNaira(totals.paye)}</TableCell>
                  <TableCell className="text-right">{formatNaira(totals.pension)}</TableCell>
                  <TableCell className="text-right">{formatNaira(totals.nhf)}</TableCell>
                  <TableCell className="text-right">{formatNaira(totals.paye + totals.pension + totals.nhf)}</TableCell>
                  <TableCell />
                </TableRow>
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
