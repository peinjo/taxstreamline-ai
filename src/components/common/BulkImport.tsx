import React, { useState, useCallback } from 'react';
import Papa from 'papaparse';
import { Upload, FileSpreadsheet, AlertCircle, CheckCircle2, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { ImportType, ImportPreview } from '@/types/import';
import { validateImportData, normalizeHeaders } from '@/services/importValidator';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';

export const BulkImport: React.FC = () => {
  const { user } = useAuth();
  const [importType, setImportType] = useState<ImportType>('tax_reports');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<ImportPreview | null>(null);
  const [importing, setImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileSelect(e.dataTransfer.files[0]);
    }
  }, []);

  const handleFileSelect = (selectedFile: File) => {
    if (!selectedFile.name.endsWith('.csv') && !selectedFile.name.endsWith('.xlsx')) {
      toast.error('Please upload a CSV or Excel file');
      return;
    }

    setFile(selectedFile);
    parseFile(selectedFile);
  };

  const parseFile = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.trim(),
      complete: (results) => {
        const headers = normalizeHeaders(Object.keys(results.data[0] || {}));
        const validation = validateImportData(results.data, importType);
        
        setPreview({
          headers,
          rows: results.data.slice(0, 5),
          totalRows: results.data.length,
          validRows: validation.data.length,
          invalidRows: validation.errors.length,
          errors: validation.errors.slice(0, 10),
        });
      },
      error: (error) => {
        toast.error(`Error parsing file: ${error.message}`);
      },
    });
  };

  const handleImport = async () => {
    if (!file || !preview || !user) return;

    setImporting(true);
    setProgress(0);

    try {
      // Create import history record
      const { data: historyRecord, error: historyError } = await supabase
        .from('import_history')
        .insert({
          user_id: user.id,
          file_name: file.name,
          import_type: importType,
          total_records: preview.totalRows,
          status: 'processing',
        })
        .select()
        .single();

      if (historyError) throw historyError;

      // Parse full file
      Papa.parse(file, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header) => header.trim(),
        complete: async (results) => {
          const validation = validateImportData(results.data, importType);
          let successCount = 0;
          let failCount = 0;

          // Import valid records in batches
          const batchSize = 50;
          for (let i = 0; i < validation.data.length; i += batchSize) {
            const batch = validation.data.slice(i, i + batchSize);
            
            const { error } = await supabase
              .from(importType)
              .insert(batch.map(record => ({ ...record, user_id: user.id })));

            if (error) {
              failCount += batch.length;
            } else {
              successCount += batch.length;
            }

            setProgress(Math.round(((i + batch.length) / validation.data.length) * 100));
          }

          // Update history record
          await supabase
            .from('import_history')
            .update({
              successful_records: successCount,
              failed_records: failCount + validation.errors.length,
              errors: validation.errors as any,
              status: failCount > 0 ? 'completed' : 'completed',
              completed_at: new Date().toISOString(),
            })
            .eq('id', historyRecord.id);

          toast.success(
            `Import completed! ${successCount} records imported successfully.${
              failCount > 0 ? ` ${failCount} records failed.` : ''
            }`
          );

          // Reset
          setFile(null);
          setPreview(null);
          setImporting(false);
          setProgress(0);
        },
      });
    } catch (error: any) {
      toast.error(`Import failed: ${error.message}`);
      setImporting(false);
    }
  };

  const downloadTemplate = () => {
    const templates = {
      tax_reports: 'tax_type,tax_year,amount,status,country\nincome_tax,2024,50000,draft,Nigeria',
      compliance_items: 'title,country,requirement_type,frequency,priority,description\nAnnual Filing,Nigeria,Tax Return,annual,high,Corporate tax return',
      calendar_events: 'title,date,category,description,priority\nQ1 Tax Deadline,2024-03-31,deadline,Quarterly tax filing,high',
      tax_calculations: 'tax_type,income,deductions\nincome_tax,100000,20000',
    };

    const blob = new Blob([templates[importType]], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${importType}_template.csv`;
    a.click();
  };

  return (
    <div className="space-y-6">
      <Card className="p-6">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold">Bulk Import</h2>
              <p className="text-muted-foreground">Import multiple records from CSV files</p>
            </div>
            <Button variant="outline" onClick={downloadTemplate} className="gap-2">
              <Download className="h-4 w-4" />
              Download Template
            </Button>
          </div>

          <Select value={importType} onValueChange={(value) => setImportType(value as ImportType)}>
            <SelectTrigger>
              <SelectValue placeholder="Select import type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="tax_reports">Tax Reports</SelectItem>
              <SelectItem value="compliance_items">Compliance Items</SelectItem>
              <SelectItem value="calendar_events">Calendar Events</SelectItem>
              <SelectItem value="tax_calculations">Tax Calculations</SelectItem>
            </SelectContent>
          </Select>

          <div
            className={`border-2 border-dashed rounded-lg p-12 text-center transition-colors ${
              dragActive ? 'border-primary bg-primary/5' : 'border-border'
            }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
          >
            <Upload className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg mb-2">Drag and drop your CSV file here</p>
            <p className="text-sm text-muted-foreground mb-4">or</p>
            <Button variant="outline" onClick={() => document.getElementById('file-input')?.click()}>
              <FileSpreadsheet className="h-4 w-4 mr-2" />
              Browse Files
            </Button>
            <input
              id="file-input"
              type="file"
              accept=".csv,.xlsx"
              className="hidden"
              onChange={(e) => e.target.files?.[0] && handleFileSelect(e.target.files[0])}
            />
          </div>

          {preview && (
            <div className="space-y-4">
              <Alert>
                <CheckCircle2 className="h-4 w-4" />
                <AlertDescription>
                  Found {preview.totalRows} records: {preview.validRows} valid, {preview.invalidRows} with errors
                </AlertDescription>
              </Alert>

              {preview.errors.length > 0 && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    <div className="font-semibold mb-2">Validation Errors (showing first 10):</div>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                      {preview.errors.map((error, idx) => (
                        <li key={idx}>
                          Row {error.row}: {error.message}
                        </li>
                      ))}
                    </ul>
                  </AlertDescription>
                </Alert>
              )}

              {importing && (
                <div className="space-y-2">
                  <Progress value={progress} />
                  <p className="text-sm text-center text-muted-foreground">
                    Importing... {progress}%
                  </p>
                </div>
              )}

              <div className="flex gap-2 justify-end">
                <Button variant="outline" onClick={() => { setFile(null); setPreview(null); }}>
                  Cancel
                </Button>
                <Button onClick={handleImport} disabled={importing || preview.validRows === 0}>
                  Import {preview.validRows} Records
                </Button>
              </div>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};
