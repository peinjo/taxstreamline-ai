

# Migrate `xlsx` to `ExcelJS` — Security Vulnerability Fix

## Why
The `xlsx` package (v0.18.5) has known Prototype Pollution and ReDoS vulnerabilities. ExcelJS is an actively maintained, secure alternative with equivalent read/write capabilities that works in the browser.

## Changes

### 1. Update dependencies in `package.json`
- Remove `"xlsx": "^0.18.5"`
- Add `"exceljs": "^4.4.0"`

### 2. Rewrite `src/services/benchmarkDataProcessing.ts`
Replace `XLSX.read()` + `XLSX.utils.sheet_to_json()` with ExcelJS's `Workbook.xlsx.load()` and manual row-to-JSON conversion.

- Read file as `ArrayBuffer` (not binary string)
- Load workbook via `new ExcelJS.Workbook().xlsx.load(buffer)`
- Get first worksheet, iterate rows, map header row to keys
- Return array of objects (same output shape as before)

### 3. Rewrite `src/services/aiActions/integrationActions.ts` (lines 4, 117-129)
Replace `XLSX.utils.json_to_sheet()` / `XLSX.write()` with ExcelJS equivalents:

- Create `new ExcelJS.Workbook()`, add worksheet
- Write header row from object keys, then data rows
- Export via `workbook.xlsx.writeBuffer()` → Blob → download link

### 4. Delete the `xlsx` security finding
Use the security management tool to remove/update the vulnerability note since it will be resolved.

## No other files affected
The remaining 9 files referencing "xlsx" only mention it in `accept` attributes or help text strings — no code changes needed there.

