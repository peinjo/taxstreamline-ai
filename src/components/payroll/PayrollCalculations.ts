// Nigerian PAYE tax calculation (annual basis, returns monthly amount)
export function calculatePAYE(annualGross: number): number {
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

  return Math.max(tax, annualGross * 0.01) / 12;
}

export function calculateEmployeePayroll(emp: {
  basic_salary: number;
  housing_allowance: number | null;
  transport_allowance: number | null;
  other_allowances: number | null;
}) {
  const basic = Number(emp.basic_salary);
  const housing = Number(emp.housing_allowance || 0);
  const transport = Number(emp.transport_allowance || 0);
  const other = Number(emp.other_allowances || 0);
  const gross = basic + housing + transport + other;
  const paye = calculatePAYE(gross * 12);
  const pensionEmployee = gross * 0.08;
  const pensionEmployer = gross * 0.10;
  const nhf = basic * 0.025;
  const net = gross - paye - pensionEmployee - nhf;

  return { basic, housing, transport, other, gross, paye, pensionEmployee, pensionEmployer, nhf, net };
}

export const formatNaira = (n: number) =>
  `₦${n.toLocaleString("en-NG", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
