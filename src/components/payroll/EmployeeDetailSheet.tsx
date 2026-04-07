import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { calculateEmployeePayroll, formatNaira } from "./PayrollCalculations";
import { UserX, Save } from "lucide-react";

interface Employee {
  id: string;
  full_name: string;
  email: string | null;
  department: string | null;
  job_title: string | null;
  basic_salary: number;
  housing_allowance: number | null;
  transport_allowance: number | null;
  other_allowances: number | null;
  bank_name: string | null;
  bank_account_number: string | null;
  tax_id: string | null;
  pension_id: string | null;
  nhf_id: string | null;
  hire_date: string;
  is_active: boolean | null;
}

interface Props {
  employee: Employee | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function EmployeeDetailSheet({ employee, open, onOpenChange }: Props) {
  const queryClient = useQueryClient();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState<Partial<Employee>>({});

  const startEdit = () => {
    if (employee) {
      setForm({ ...employee });
      setEditing(true);
    }
  };

  const updateMutation = useMutation({
    mutationFn: async () => {
      if (!employee) return;
      const { error } = await supabase.from("employees").update({
        full_name: form.full_name,
        email: form.email || null,
        department: form.department || null,
        job_title: form.job_title || null,
        basic_salary: Number(form.basic_salary) || 0,
        housing_allowance: Number(form.housing_allowance) || 0,
        transport_allowance: Number(form.transport_allowance) || 0,
        other_allowances: Number(form.other_allowances) || 0,
        bank_name: form.bank_name || null,
        bank_account_number: form.bank_account_number || null,
        tax_id: form.tax_id || null,
        pension_id: form.pension_id || null,
      }).eq("id", employee.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee updated");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      setEditing(false);
    },
    onError: () => toast.error("Failed to update employee"),
  });

  const deactivateMutation = useMutation({
    mutationFn: async () => {
      if (!employee) return;
      const { error } = await supabase.from("employees").update({
        is_active: false,
        termination_date: new Date().toISOString().split("T")[0],
      }).eq("id", employee.id);
      if (error) throw error;
    },
    onSuccess: () => {
      toast.success("Employee deactivated");
      queryClient.invalidateQueries({ queryKey: ["employees"] });
      onOpenChange(false);
    },
    onError: () => toast.error("Failed to deactivate employee"),
  });

  if (!employee) return null;

  const calc = calculateEmployeePayroll(employee);

  return (
    <Sheet open={open} onOpenChange={(v) => { onOpenChange(v); if (!v) setEditing(false); }}>
      <SheetContent className="w-full sm:max-w-lg overflow-y-auto">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            {employee.full_name}
            <Badge variant={employee.is_active ? "default" : "secondary"}>
              {employee.is_active ? "Active" : "Inactive"}
            </Badge>
          </SheetTitle>
          <SheetDescription>
            {employee.job_title || "No title"} · {employee.department || "No department"}
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-6">
          {/* Pay Breakdown */}
          <div>
            <h4 className="text-sm font-semibold text-muted-foreground mb-3">Monthly Pay Breakdown</h4>
            <div className="rounded-lg border bg-muted/30 p-4 space-y-2 text-sm">
              <div className="flex justify-between"><span>Basic Salary</span><span className="font-medium">{formatNaira(calc.basic)}</span></div>
              <div className="flex justify-between"><span>Housing Allowance</span><span>{formatNaira(calc.housing)}</span></div>
              <div className="flex justify-between"><span>Transport Allowance</span><span>{formatNaira(calc.transport)}</span></div>
              <div className="flex justify-between"><span>Other Allowances</span><span>{formatNaira(calc.other)}</span></div>
              <Separator />
              <div className="flex justify-between font-semibold"><span>Gross Pay</span><span>{formatNaira(calc.gross)}</span></div>
              <Separator />
              <div className="flex justify-between text-destructive"><span>PAYE Tax</span><span>-{formatNaira(calc.paye)}</span></div>
              <div className="flex justify-between text-destructive"><span>Pension (Employee 8%)</span><span>-{formatNaira(calc.pensionEmployee)}</span></div>
              <div className="flex justify-between text-destructive"><span>NHF (2.5%)</span><span>-{formatNaira(calc.nhf)}</span></div>
              <Separator />
              <div className="flex justify-between font-bold text-lg"><span>Net Pay</span><span className="text-primary">{formatNaira(calc.net)}</span></div>
              <div className="flex justify-between text-xs text-muted-foreground"><span>Employer Pension (10%)</span><span>{formatNaira(calc.pensionEmployer)}</span></div>
            </div>
          </div>

          {/* Edit Form or Details */}
          {editing ? (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Edit Employee</h4>
              <div className="grid grid-cols-2 gap-3">
                {([
                  ["full_name", "Full Name"],
                  ["email", "Email"],
                  ["department", "Department"],
                  ["job_title", "Job Title"],
                  ["basic_salary", "Basic Salary (₦)", "number"],
                  ["housing_allowance", "Housing Allow.", "number"],
                  ["transport_allowance", "Transport Allow.", "number"],
                  ["other_allowances", "Other Allow.", "number"],
                  ["bank_name", "Bank Name"],
                  ["bank_account_number", "Account No."],
                  ["tax_id", "Tax ID (TIN)"],
                  ["pension_id", "Pension PIN"],
                ] as [keyof Employee, string, string?][]).map(([key, label, type]) => (
                  <div key={key} className="space-y-1">
                    <Label className="text-xs">{label}</Label>
                    <Input
                      type={type || "text"}
                      value={form[key]?.toString() || ""}
                      onChange={e => setForm(p => ({ ...p, [key]: e.target.value }))}
                      className="h-8 text-sm"
                    />
                  </div>
                ))}
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={() => updateMutation.mutate()} disabled={updateMutation.isPending}>
                  <Save className="mr-1 h-3 w-3" />{updateMutation.isPending ? "Saving..." : "Save"}
                </Button>
                <Button size="sm" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <h4 className="text-sm font-semibold text-muted-foreground">Personal & Banking</h4>
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div><span className="text-muted-foreground">Email:</span> {employee.email || "—"}</div>
                <div><span className="text-muted-foreground">Hire Date:</span> {employee.hire_date}</div>
                <div><span className="text-muted-foreground">Bank:</span> {employee.bank_name || "—"}</div>
                <div><span className="text-muted-foreground">Account:</span> {employee.bank_account_number ? `***${employee.bank_account_number.slice(-4)}` : "—"}</div>
                <div><span className="text-muted-foreground">TIN:</span> {employee.tax_id || "—"}</div>
                <div><span className="text-muted-foreground">Pension PIN:</span> {employee.pension_id || "—"}</div>
              </div>
              <div className="flex gap-2">
                <Button size="sm" onClick={startEdit}>Edit Details</Button>
                <Button size="sm" variant="destructive" onClick={() => deactivateMutation.mutate()} disabled={deactivateMutation.isPending}>
                  <UserX className="mr-1 h-3 w-3" />Deactivate
                </Button>
              </div>
            </div>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
