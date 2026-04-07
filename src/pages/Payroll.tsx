import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, Plus, Play, FileText, DollarSign, Building2, Search, Eye } from "lucide-react";
import { calculateEmployeePayroll, formatNaira, MONTHS } from "@/components/payroll/PayrollCalculations";
import EmployeeDetailSheet from "@/components/payroll/EmployeeDetailSheet";
import RemittanceTable from "@/components/payroll/RemittanceTable";
import PayslipViewerDialog from "@/components/payroll/PayslipViewerDialog";

const Payroll = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showRunPayroll, setShowRunPayroll] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedEmployee, setSelectedEmployee] = useState<any>(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [payslipRun, setPayslipRun] = useState<{ id: string; month: number; year: number } | null>(null);
  const [newEmployee, setNewEmployee] = useState({
    full_name: "", email: "", department: "", job_title: "",
    basic_salary: "", housing_allowance: "", transport_allowance: "", other_allowances: "",
    bank_name: "", bank_account_number: "", tax_id: "", pension_id: "",
  });
  const [payrollMonth, setPayrollMonth] = useState(new Date().getMonth() + 1);
  const [payrollYear, setPayrollYear] = useState(new Date().getFullYear());

  const { data: employees = [], isLoading: loadingEmployees } = useQuery({
    queryKey: ["employees"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("employees")
        .select("*")
        .eq("is_active", true)
        .order("full_name");
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const { data: payrollRuns = [] } = useQuery({
    queryKey: ["payroll_runs"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("payroll_runs")
        .select("*")
        .order("period_year", { ascending: false })
        .order("period_month", { ascending: false });
      if (error) throw error;
      return data;
    },
    enabled: !!user,
  });

  const filteredEmployees = employees.filter((emp) => {
    const term = searchTerm.toLowerCase();
    return (
      emp.full_name.toLowerCase().includes(term) ||
      (emp.department || "").toLowerCase().includes(term) ||
      (emp.job_title || "").toLowerCase().includes(term)
    );
  });

  const addEmployeeMutation = useMutation({
    mutationFn: async () => {
      if (!newEmployee.full_name.trim()) throw new Error("Name is required");
      const { error } = await supabase.from("employees").insert({
        user_id: user!.id,
        full_name: newEmployee.full_name.trim(),
        email: newEmployee.email || null,
        department: newEmployee.department || null,
        job_title: newEmployee.job_title || null,
        basic_salary: parseFloat(newEmployee.basic_salary) || 0,
        housing_allowance: parseFloat(newEmployee.housing_allowance) || 0,
        transport_allowance: parseFloat(newEmployee.transport_allowance) || 0,
        other_allowances: parseFloat(newEmployee.other_allowances) || 0,
        bank_name: newEmployee.bank_name || null,
        bank_account_number: newEmployee.bank_account_number || null,
        tax_id: newEmployee.tax_id || null,
        pension_id: newEmployee.pension_id || null,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee added successfully");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setShowAddEmployee(false);
      setNewEmployee({ full_name: "", email: "", department: "", job_title: "", basic_salary: "", housing_allowance: "", transport_allowance: "", other_allowances: "", bank_name: "", bank_account_number: "", tax_id: "", pension_id: "" });
    },
    onError: (e: Error) => toast.error(e.message || "Failed to add employee"),
  });

  const runPayrollMutation = useMutation({
    mutationFn: async () => {
      if (employees.length === 0) throw new Error("No employees to process");

      const totals = employees.reduce((acc, emp) => {
        const calc = calculateEmployeePayroll(emp);
        return {
          totalGross: acc.totalGross + calc.gross,
          totalNet: acc.totalNet + calc.net,
          totalPaye: acc.totalPaye + calc.paye,
          totalPension: acc.totalPension + calc.pensionEmployee + calc.pensionEmployer,
          totalNhf: acc.totalNhf + calc.nhf,
        };
      }, { totalGross: 0, totalNet: 0, totalPaye: 0, totalPension: 0, totalNhf: 0 });

      const { data: run, error: runError } = await supabase.from("payroll_runs").insert({
        user_id: user!.id,
        period_month: payrollMonth,
        period_year: payrollYear,
        status: "completed",
        total_gross: totals.totalGross,
        total_net: totals.totalNet,
        total_paye: totals.totalPaye,
        total_pension: totals.totalPension,
        total_nhf: totals.totalNhf,
        employee_count: employees.length,
        processed_at: new Date().toISOString(),
      }).select().single();
      if (runError) throw runError;

      const payslips = employees.map((emp) => {
        const calc = calculateEmployeePayroll(emp);
        return {
          payroll_run_id: run.id,
          employee_id: emp.id,
          basic_salary: calc.basic,
          housing_allowance: calc.housing,
          transport_allowance: calc.transport,
          other_allowances: calc.other,
          gross_pay: calc.gross,
          paye_tax: calc.paye,
          pension_employee: calc.pensionEmployee,
          pension_employer: calc.pensionEmployer,
          nhf: calc.nhf,
          other_deductions: 0,
          net_pay: calc.net,
        };
      });

      const { error: slipError } = await supabase.from("payslips").insert(payslips);
      if (slipError) throw slipError;
    },
    onSuccess: () => {
      toast.success("Payroll processed successfully!");
      queryClient.invalidateQueries({ queryKey: ["payroll_runs"] });
      setShowRunPayroll(false);
    },
    onError: (e: Error) => toast.error(e.message || "Failed to process payroll"),
  });

  const totalMonthlyPayroll = employees.reduce((sum, emp) => {
    return sum + calculateEmployeePayroll(emp).gross;
  }, 0);

  const totalMonthlyPaye = employees.reduce((sum, emp) => {
    return sum + calculateEmployeePayroll(emp).paye;
  }, 0);

  const totalMonthlyNet = employees.reduce((sum, emp) => {
    return sum + calculateEmployeePayroll(emp).net;
  }, 0);

  return (
    <DashboardLayout>
      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
          <p className="text-muted-foreground">Manage employees, run payroll, generate payslips & track remittances</p>
        </div>
        <div className="flex gap-2">
          <Dialog open={showAddEmployee} onOpenChange={setShowAddEmployee}>
            <DialogTrigger asChild>
              <Button><Plus className="mr-2 h-4 w-4" />Add Employee</Button>
            </DialogTrigger>
            <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>Add New Employee</DialogTitle>
                <DialogDescription>Enter employee details and salary information</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                {([
                  ["full_name", "Full Name *", "text"],
                  ["email", "Email", "email"],
                  ["department", "Department", "text"],
                  ["job_title", "Job Title", "text"],
                  ["basic_salary", "Basic Salary (₦/month) *", "number"],
                  ["housing_allowance", "Housing Allowance", "number"],
                  ["transport_allowance", "Transport Allowance", "number"],
                  ["other_allowances", "Other Allowances", "number"],
                  ["bank_name", "Bank Name", "text"],
                  ["bank_account_number", "Account Number", "text"],
                  ["tax_id", "Tax ID (TIN)", "text"],
                  ["pension_id", "Pension PIN", "text"],
                ] as const).map(([key, label, type]) => (
                  <div key={key} className="space-y-2">
                    <Label>{label}</Label>
                    <Input
                      type={type}
                      value={newEmployee[key]}
                      onChange={(e) => setNewEmployee((p) => ({ ...p, [key]: e.target.value }))}
                    />
                  </div>
                ))}
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
                <Button
                  onClick={() => addEmployeeMutation.mutate()}
                  disabled={!newEmployee.full_name.trim() || addEmployeeMutation.isPending}
                >
                  {addEmployeeMutation.isPending ? "Adding..." : "Add Employee"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>

          <Dialog open={showRunPayroll} onOpenChange={setShowRunPayroll}>
            <DialogTrigger asChild>
              <Button variant="secondary"><Play className="mr-2 h-4 w-4" />Run Payroll</Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Run Monthly Payroll</DialogTitle>
                <DialogDescription>Process payroll for {employees.length} active employee{employees.length !== 1 ? "s" : ""}</DialogDescription>
              </DialogHeader>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Month</Label>
                  <Select value={String(payrollMonth)} onValueChange={(v) => setPayrollMonth(Number(v))}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Year</Label>
                  <Input type="number" value={payrollYear} onChange={(e) => setPayrollYear(Number(e.target.value))} />
                </div>
              </div>
              <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                <p className="text-sm font-semibold">Payroll Preview</p>
                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div><span className="text-muted-foreground">Employees:</span> {employees.length}</div>
                  <div><span className="text-muted-foreground">Gross:</span> {formatNaira(totalMonthlyPayroll)}</div>
                  <div><span className="text-muted-foreground">Est. PAYE:</span> {formatNaira(totalMonthlyPaye)}</div>
                  <div><span className="text-muted-foreground">Est. Net:</span> {formatNaira(totalMonthlyNet)}</div>
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => setShowRunPayroll(false)}>Cancel</Button>
                <Button
                  onClick={() => runPayrollMutation.mutate()}
                  disabled={employees.length === 0 || runPayrollMutation.isPending}
                >
                  {runPayrollMutation.isPending ? "Processing..." : "Process Payroll"}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      {/* Stats */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{employees.length}</p>
            <p className="text-xs text-muted-foreground">{new Set(employees.map((e) => e.department).filter(Boolean)).size} departments</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly Gross</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNaira(totalMonthlyPayroll)}</p>
            <p className="text-xs text-muted-foreground">Total compensation</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Monthly PAYE</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{formatNaira(totalMonthlyPaye)}</p>
            <p className="text-xs text-muted-foreground">Tax withholding</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{payrollRuns.length}</p>
            <p className="text-xs text-muted-foreground">Processed to date</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="employees">
        <TabsList>
          <TabsTrigger value="employees">Employees</TabsTrigger>
          <TabsTrigger value="history">Payroll History</TabsTrigger>
          <TabsTrigger value="remittances">Remittances</TabsTrigger>
        </TabsList>

        {/* ── EMPLOYEES TAB ── */}
        <TabsContent value="employees">
          <Card>
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <CardTitle>Employee Register</CardTitle>
                <CardDescription>{employees.length} active employee{employees.length !== 1 ? "s" : ""}</CardDescription>
              </div>
              <div className="relative w-full sm:w-64">
                <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search employees..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-8"
                />
              </div>
            </CardHeader>
            <CardContent>
              {loadingEmployees ? (
                <p className="text-muted-foreground text-center py-8">Loading...</p>
              ) : filteredEmployees.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  {employees.length === 0 ? "No employees yet. Add your first employee to get started." : "No employees match your search."}
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead className="text-right">Basic Salary</TableHead>
                        <TableHead className="text-right">Gross Pay</TableHead>
                        <TableHead className="text-right">PAYE</TableHead>
                        <TableHead className="text-right">Net Pay</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredEmployees.map((emp) => {
                        const calc = calculateEmployeePayroll(emp);
                        return (
                          <TableRow
                            key={emp.id}
                            className="cursor-pointer hover:bg-muted/50"
                            onClick={() => { setSelectedEmployee(emp); setDetailOpen(true); }}
                          >
                            <TableCell className="font-medium">{emp.full_name}</TableCell>
                            <TableCell>{emp.department || "—"}</TableCell>
                            <TableCell>{emp.job_title || "—"}</TableCell>
                            <TableCell className="text-right">{formatNaira(calc.basic)}</TableCell>
                            <TableCell className="text-right">{formatNaira(calc.gross)}</TableCell>
                            <TableCell className="text-right">{formatNaira(calc.paye)}</TableCell>
                            <TableCell className="text-right font-semibold">{formatNaira(calc.net)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── PAYROLL HISTORY TAB ── */}
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Payroll History</CardTitle>
              <CardDescription>All processed payroll runs — click to view payslips</CardDescription>
            </CardHeader>
            <CardContent>
              {payrollRuns.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">No payroll runs yet. Run your first payroll to see history.</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Period</TableHead>
                      <TableHead>Employees</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead className="text-right">Gross</TableHead>
                      <TableHead className="text-right">PAYE</TableHead>
                      <TableHead className="text-right">Pension</TableHead>
                      <TableHead className="text-right">Net</TableHead>
                      <TableHead />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {payrollRuns.map((run) => (
                      <TableRow key={run.id}>
                        <TableCell className="font-medium">{MONTHS[(run.period_month ?? 1) - 1]} {run.period_year}</TableCell>
                        <TableCell>{run.employee_count}</TableCell>
                        <TableCell>
                          <Badge variant={run.status === "completed" ? "default" : "secondary"}>
                            {run.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">{formatNaira(Number(run.total_gross))}</TableCell>
                        <TableCell className="text-right">{formatNaira(Number(run.total_paye))}</TableCell>
                        <TableCell className="text-right">{formatNaira(Number(run.total_pension))}</TableCell>
                        <TableCell className="text-right">{formatNaira(Number(run.total_net))}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setPayslipRun({ id: run.id, month: run.period_month, year: run.period_year })}
                          >
                            <Eye className="h-4 w-4 mr-1" /> Payslips
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── REMITTANCES TAB ── */}
        <TabsContent value="remittances">
          <RemittanceTable payrollRuns={payrollRuns} />
        </TabsContent>
      </Tabs>

      {/* Detail Sheet */}
      <EmployeeDetailSheet
        employee={selectedEmployee}
        open={detailOpen}
        onOpenChange={setDetailOpen}
      />

      {/* Payslip Viewer */}
      <PayslipViewerDialog
        runId={payslipRun?.id || null}
        month={payslipRun?.month || 1}
        year={payslipRun?.year || 2026}
        open={!!payslipRun}
        onOpenChange={(v) => { if (!v) setPayslipRun(null); }}
      />
    </DashboardLayout>
  );
};

export default Payroll;
