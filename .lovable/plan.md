

# Fix Remaining `xlsx` Import Errors

The `xlsx` → `ExcelJS` migration missed three files that still import the removed `xlsx` package. All three need to be converted to use `ExcelJS`.

## Files to Fix

### 1. `src/services/exportService.ts` (line 3)
- Replace `import * as XLSX from "xlsx"` with `import ExcelJS from "exceljs"`
- Rewrite `ExcelExportService.export()` to use ExcelJS:
  - `new ExcelJS.Workbook()` → `addWorksheet()` → add rows → `writeBuffer()` → trigger download via Blob/URL

### 2. `src/components/audit/tax-summary/utils.ts` (line 6)
- Replace `import * as XLSX from "xlsx"` with `import ExcelJS from "exceljs"`
- Rewrite the Excel export function (~lines 160-173) to use ExcelJS workbook/worksheet API with `writeBuffer()` → Blob download

### 3. `src/pages/BankStatements.tsx` (lines 151-157)
- Replace dynamic `import("xlsx")` with `import("exceljs")`
- Rewrite Excel reading to use `new ExcelJS.Workbook().xlsx.load(buffer)` then iterate rows to build JSON array (same pattern already used in `benchmarkDataProcessing.ts`)

All three follow the same pattern already established in the earlier migration. No new dependencies needed — `exceljs` is already installed.

