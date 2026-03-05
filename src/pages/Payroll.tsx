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
import { Users, Plus, Play, FileText, DollarSign, TrendingUp, Building2 } from "lucide-react";

const MONTHS = ["January","February","March","April","May","June","July","August","September","October","November","December"];

// Nigerian PAYE tax calculation (annual basis)
function calculatePAYE(annualGross: number): number {
  const cra = Math.max(200000, annualGross * 0.01) + (annualGross * 0.2);
  const taxableIncome = Math.max(0, annualGross - cra);
  
  const bands = [
    { limit: 300000, rate: 0.07 },
    { limit: 300000, rate: 0.11 },
    { limit: 500000, rate: 0.15 },
    { limit: 500000, rate: 0.19 },
    { limit: 1600000, rate: 0.21 },
    { limit: Infinity, rate: 0.24 },
  ];
  
  let tax = 0;
  let remaining = taxableIncome;
  for (const band of bands) {
    if (remaining <= 0) break;
    const taxable = Math.min(remaining, band.limit);
    tax += taxable * band.rate;
    remaining -= taxable;
  }
  
  return Math.max(tax, annualGross * 0.01) / 12; // Monthly PAYE
}

const Payroll = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [showAddEmployee, setShowAddEmployee] = useState(false);
  const [showRunPayroll, setShowRunPayroll] = useState(false);
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

  const addEmployeeMutation = useMutation({
    mutationFn: async () => {
      const { error } = await supabase.from("employees").insert({
        user_id: user!.id,
        full_name: newEmployee.full_name,
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
    onError: () => toast.error("Failed to add employee"),
  });

  const runPayrollMutation = useMutation({
    mutationFn: async () => {
      if (employees.length === 0) throw new Error("No employees to process");

      // Create payroll run
      const totals = employees.reduce((acc, emp) => {
        const gross = Number(emp.basic_salary) + Number(emp.housing_allowance) + Number(emp.transport_allowance) + Number(emp.other_allowances);
        const annualGross = gross * 12;
        const paye = calculatePAYE(annualGross);
        const pensionEmp = gross * 0.08;
        const pensionEr = gross * 0.10;
        const nhf = Number(emp.basic_salary) * 0.025;
        const net = gross - paye - pensionEmp - nhf;
        return {
          totalGross: acc.totalGross + gross,
          totalNet: acc.totalNet + net,
          totalPaye: acc.totalPaye + paye,
          totalPension: acc.totalPension + pensionEmp + pensionEr,
          totalNhf: acc.totalNhf + nhf,
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

      // Create payslips
      const payslips = employees.map(emp => {
        const gross = Number(emp.basic_salary) + Number(emp.housing_allowance) + Number(emp.transport_allowance) + Number(emp.other_allowances);
        const paye = calculatePAYE(gross * 12);
        const pensionEmp = gross * 0.08;
        const pensionEr = gross * 0.10;
        const nhf = Number(emp.basic_salary) * 0.025;
        const net = gross - paye - pensionEmp - nhf;
        return {
          payroll_run_id: run.id,
          employee_id: emp.id,
          basic_salary: Number(emp.basic_salary),
          housing_allowance: Number(emp.housing_allowance),
          transport_allowance: Number(emp.transport_allowance),
          other_allowances: Number(emp.other_allowances),
          gross_pay: gross,
          paye_tax: paye,
          pension_employee: pensionEmp,
          pension_employer: pensionEr,
          nhf,
          other_deductions: 0,
          net_pay: net,
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
    return sum + Number(emp.basic_salary) + Number(emp.housing_allowance) + Number(emp.transport_allowance) + Number(emp.other_allowances);
  }, 0);

  const formatCurrency = (n: number) => `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2 })}`;

  return (
    <DashboardLayout>
        <div className="mb-6 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Payroll Management</h1>
            <p className="text-muted-foreground">Manage employees, run payroll, and track remittances</p>
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
                  <div className="space-y-2">
                    <Label>Full Name *</Label>
                    <Input value={newEmployee.full_name} onChange={e => setNewEmployee(p => ({ ...p, full_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Email</Label>
                    <Input value={newEmployee.email} onChange={e => setNewEmployee(p => ({ ...p, email: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Department</Label>
                    <Input value={newEmployee.department} onChange={e => setNewEmployee(p => ({ ...p, department: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Job Title</Label>
                    <Input value={newEmployee.job_title} onChange={e => setNewEmployee(p => ({ ...p, job_title: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Basic Salary (₦/month) *</Label>
                    <Input type="number" value={newEmployee.basic_salary} onChange={e => setNewEmployee(p => ({ ...p, basic_salary: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Housing Allowance</Label>
                    <Input type="number" value={newEmployee.housing_allowance} onChange={e => setNewEmployee(p => ({ ...p, housing_allowance: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Transport Allowance</Label>
                    <Input type="number" value={newEmployee.transport_allowance} onChange={e => setNewEmployee(p => ({ ...p, transport_allowance: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Other Allowances</Label>
                    <Input type="number" value={newEmployee.other_allowances} onChange={e => setNewEmployee(p => ({ ...p, other_allowances: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Bank Name</Label>
                    <Input value={newEmployee.bank_name} onChange={e => setNewEmployee(p => ({ ...p, bank_name: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Account Number</Label>
                    <Input value={newEmployee.bank_account_number} onChange={e => setNewEmployee(p => ({ ...p, bank_account_number: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Tax ID (TIN)</Label>
                    <Input value={newEmployee.tax_id} onChange={e => setNewEmployee(p => ({ ...p, tax_id: e.target.value }))} />
                  </div>
                  <div className="space-y-2">
                    <Label>Pension PIN</Label>
                    <Input value={newEmployee.pension_id} onChange={e => setNewEmployee(p => ({ ...p, pension_id: e.target.value }))} />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowAddEmployee(false)}>Cancel</Button>
                  <Button onClick={() => addEmployeeMutation.mutate()} disabled={!newEmployee.full_name || addEmployeeMutation.isPending}>
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
                  <DialogDescription>Process payroll for {employees.length} active employees</DialogDescription>
                </DialogHeader>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Month</Label>
                    <Select value={String(payrollMonth)} onValueChange={v => setPayrollMonth(Number(v))}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {MONTHS.map((m, i) => <SelectItem key={i} value={String(i + 1)}>{m}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Year</Label>
                    <Input type="number" value={payrollYear} onChange={e => setPayrollYear(Number(e.target.value))} />
                  </div>
                </div>
                <div className="rounded-lg border p-4 space-y-2 bg-muted/50">
                  <p className="text-sm font-medium">Payroll Summary</p>
                  <p className="text-sm text-muted-foreground">Employees: {employees.length}</p>
                  <p className="text-sm text-muted-foreground">Est. Gross: {formatCurrency(totalMonthlyPayroll)}</p>
                </div>
                <DialogFooter>
                  <Button variant="outline" onClick={() => setShowRunPayroll(false)}>Cancel</Button>
                  <Button onClick={() => runPayrollMutation.mutate()} disabled={employees.length === 0 || runPayrollMutation.isPending}>
                    {runPayrollMutation.isPending ? "Processing..." : "Process Payroll"}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Stats */}
        <div className="mb-6 grid grid-cols-1 gap-4 md:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Employees</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{employees.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Monthly Gross</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{formatCurrency(totalMonthlyPayroll)}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Payroll Runs</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{payrollRuns.length}</p></CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Departments</CardTitle>
              <Building2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent><p className="text-2xl font-bold">{new Set(employees.map(e => e.department).filter(Boolean)).size}</p></CardContent>
          </Card>
        </div>

        <Tabs defaultValue="employees">
          <TabsList>
            <TabsTrigger value="employees">Employees</TabsTrigger>
            <TabsTrigger value="history">Payroll History</TabsTrigger>
            <TabsTrigger value="remittances">Remittance Summary</TabsTrigger>
          </TabsList>

          <TabsContent value="employees">
            <Card>
              <CardHeader>
                <CardTitle>Employee Register</CardTitle>
                <CardDescription>All active employees and their compensation</CardDescription>
              </CardHeader>
              <CardContent>
                {loadingEmployees ? (
                  <p className="text-muted-foreground text-center py-8">Loading...</p>
                ) : employees.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No employees yet. Add your first employee to get started.</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Department</TableHead>
                        <TableHead>Job Title</TableHead>
                        <TableHead className="text-right">Basic Salary</TableHead>
                        <TableHead className="text-right">Gross Pay</TableHead>
                        <TableHead className="text-right">Est. PAYE</TableHead>
                        <TableHead className="text-right">Est. Net</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {employees.map(emp => {
                        const gross = Number(emp.basic_salary) + Number(emp.housing_allowance) + Number(emp.transport_allowance) + Number(emp.other_allowances);
                        const paye = calculatePAYE(gross * 12);
                        const pension = gross * 0.08;
                        const nhf = Number(emp.basic_salary) * 0.025;
                        const net = gross - paye - pension - nhf;
                        return (
                          <TableRow key={emp.id}>
                            <TableCell className="font-medium">{emp.full_name}</TableCell>
                            <TableCell>{emp.department || "—"}</TableCell>
                            <TableCell>{emp.job_title || "—"}</TableCell>
                            <TableCell className="text-right">{formatCurrency(Number(emp.basic_salary))}</TableCell>
                            <TableCell className="text-right">{formatCurrency(gross)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(paye)}</TableCell>
                            <TableCell className="text-right">{formatCurrency(net)}</TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle>Payroll History</CardTitle>
                <CardDescription>All processed payroll runs</CardDescription>
              </CardHeader>
              <CardContent>
                {payrollRuns.length === 0 ? (
                  <p className="text-muted-foreground text-center py-8">No payroll runs yet.</p>
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
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {payrollRuns.map(run => (
                        <TableRow key={run.id}>
                          <TableCell className="font-medium">{MONTHS[(run.period_month ?? 1) - 1]} {run.period_year}</TableCell>
                          <TableCell>{run.employee_count}</TableCell>
                          <TableCell>
                            <Badge variant={run.status === "completed" ? "default" : "secondary"}>
                              {run.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(run.total_gross))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(run.total_paye))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(run.total_pension))}</TableCell>
                          <TableCell className="text-right">{formatCurrency(Number(run.total_net))}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="remittances">
            <div className="grid gap-4 md:grid-cols-3">
              {[
                { title: "PAYE Remittance", desc: "Monthly tax deductions to FIRS", total: payrollRuns.reduce((s, r) => s + Number(r.total_paye), 0), icon: TrendingUp },
                { title: "Pension Remittance", desc: "Employee + Employer contributions", total: payrollRuns.reduce((s, r) => s + Number(r.total_pension), 0), icon: Building2 },
                { title: "NHF Remittance", desc: "National Housing Fund contributions", total: payrollRuns.reduce((s, r) => s + Number(r.total_nhf), 0), icon: DollarSign },
              ].map(item => (
                <Card key={item.title}>
                  <CardHeader>
                    <div className="flex items-center gap-2">
                      <item.icon className="h-5 w-5 text-primary" />
                      <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                    <CardDescription>{item.desc}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold">{formatCurrency(item.total)}</p>
                    <p className="text-xs text-muted-foreground mt-1">Total across {payrollRuns.length} payroll runs</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
};

export default Payroll;
