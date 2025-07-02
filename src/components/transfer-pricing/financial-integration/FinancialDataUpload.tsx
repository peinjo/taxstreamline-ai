import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Progress } from '@/components/ui/progress';
import { Upload, FileSpreadsheet, AlertTriangle, CheckCircle, X } from 'lucide-react';
import { toast } from 'sonner';

interface FinancialDataUploadProps {
  entityId?: string;
}

interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  status: 'uploading' | 'processing' | 'completed' | 'error';
  progress: number;
  errorMessage?: string;
  parsedRows?: number;
  validRows?: number;
}

const SUPPORTED_FORMATS = [
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // .xlsx
  'application/vnd.ms-excel', // .xls
  'text/csv', // .csv
  'application/pdf' // .pdf
];

const FINANCIAL_STATEMENT_TYPES = [
  'Income Statement',
  'Balance Sheet',
  'Cash Flow Statement',
  'Trial Balance',
  'Management Accounts',
  'Segment Report',
  'Other'
];

export function FinancialDataUpload({ entityId }: FinancialDataUploadProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [selectedEntity, setSelectedEntity] = useState(entityId || '');
  const [statementType, setStatementType] = useState('');
  const [period, setPeriod] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [isDragging, setIsDragging] = useState(false);

  const handleFileUpload = async (files: FileList | File[]) => {
    const fileArray = Array.from(files);
    
    for (const file of fileArray) {
      if (!SUPPORTED_FORMATS.includes(file.type)) {
        toast.error(`Unsupported file format: ${file.name}`);
        continue;
      }

      const uploadedFile: UploadedFile = {
        id: `file_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        name: file.name,
        size: file.size,
        type: file.type,
        status: 'uploading',
        progress: 0
      };

      setUploadedFiles(prev => [...prev, uploadedFile]);

      // Simulate file upload and processing
      await simulateFileProcessing(uploadedFile.id, file);
    }
  };

  const simulateFileProcessing = async (fileId: string, file: File) => {
    try {
      // Simulate upload progress
      for (let progress = 0; progress <= 100; progress += 10) {
        await new Promise(resolve => setTimeout(resolve, 100));
        updateFileProgress(fileId, progress, 'uploading');
      }

      // Simulate processing
      updateFileStatus(fileId, 'processing', 0);
      
      // Simulate data parsing
      for (let progress = 0; progress <= 100; progress += 20) {
        await new Promise(resolve => setTimeout(resolve, 200));
        updateFileProgress(fileId, progress, 'processing');
      }

      // Simulate completion with mock data
      const mockParsedRows = Math.floor(Math.random() * 1000) + 100;
      const mockValidRows = Math.floor(mockParsedRows * (0.85 + Math.random() * 0.15));
      
      setUploadedFiles(prev => prev.map(f => 
        f.id === fileId 
          ? { 
              ...f, 
              status: 'completed', 
              progress: 100,
              parsedRows: mockParsedRows,
              validRows: mockValidRows
            }
          : f
      ));

      toast.success(`Successfully processed ${file.name}`);
      
    } catch (error) {
      updateFileStatus(fileId, 'error', 100, 'Failed to process file');
      toast.error(`Error processing ${file.name}`);
    }
  };

  const updateFileProgress = (fileId: string, progress: number, status: UploadedFile['status']) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, progress, status } : f
    ));
  };

  const updateFileStatus = (fileId: string, status: UploadedFile['status'], progress: number, errorMessage?: string) => {
    setUploadedFiles(prev => prev.map(f => 
      f.id === fileId ? { ...f, status, progress, errorMessage } : f
    ));
  };

  const removeFile = (fileId: string) => {
    setUploadedFiles(prev => prev.filter(f => f.id !== fileId));
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
      handleFileUpload(files);
    }
  };

  const getStatusIcon = (status: UploadedFile['status']) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-500" />;
      default:
        return <div className="h-4 w-4 rounded-full border-2 border-blue-500 border-t-transparent animate-spin" />;
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="space-y-6">
      {/* Upload Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Configuration</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entity">Entity</Label>
              <Select value={selectedEntity} onValueChange={setSelectedEntity}>
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="entity1">Entity A (US)</SelectItem>
                  <SelectItem value="entity2">Entity B (UK)</SelectItem>
                  <SelectItem value="entity3">Entity C (DE)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="statement-type">Statement Type</Label>
              <Select value={statementType} onValueChange={setStatementType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select type" />
                </SelectTrigger>
                <SelectContent>
                  {FINANCIAL_STATEMENT_TYPES.map(type => (
                    <SelectItem key={type} value={type.toLowerCase().replace(' ', '_')}>
                      {type}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="period">Period</Label>
              <Input
                id="period"
                type="month"
                value={period}
                onChange={(e) => setPeriod(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Select value={currency} onValueChange={setCurrency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="USD">USD</SelectItem>
                  <SelectItem value="EUR">EUR</SelectItem>
                  <SelectItem value="GBP">GBP</SelectItem>
                  <SelectItem value="JPY">JPY</SelectItem>
                  <SelectItem value="CAD">CAD</SelectItem>
                  <SelectItem value="AUD">AUD</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* File Upload Area */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Financial Data
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div
            className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
              isDragging 
                ? 'border-primary bg-primary/5' 
                : 'border-muted-foreground/25 hover:border-primary/50'
            }`}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <FileSpreadsheet className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <p className="text-lg font-medium mb-2">
              Drop your financial files here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Supports Excel (.xlsx, .xls), CSV, and PDF files up to 50MB
            </p>
            
            <Input
              type="file"
              multiple
              accept=".xlsx,.xls,.csv,.pdf"
              onChange={(e) => e.target.files && handleFileUpload(e.target.files)}
              className="hidden"
              id="file-upload"
            />
            <Label htmlFor="file-upload">
              <Button variant="outline" className="cursor-pointer">
                <Upload className="h-4 w-4 mr-2" />
                Choose Files
              </Button>
            </Label>
          </div>

          <Alert className="mt-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              <strong>Data Security:</strong> All uploaded files are encrypted and processed securely. 
              Financial data is automatically validated for completeness and accuracy.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Uploaded Files */}
      {uploadedFiles.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Uploaded Files</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {uploadedFiles.map((file) => (
                <div key={file.id} className="flex items-center gap-4 p-4 border rounded-lg">
                  <div className="flex-shrink-0">
                    {getStatusIcon(file.status)}
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <p className="font-medium truncate">{file.name}</p>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(file.id)}
                        className="flex-shrink-0"
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <span>{formatFileSize(file.size)}</span>
                      {file.status === 'completed' && file.parsedRows && (
                        <>
                          <span>•</span>
                          <span>{file.parsedRows.toLocaleString()} rows parsed</span>
                          <span>•</span>
                          <span className="text-green-600">
                            {file.validRows?.toLocaleString()} valid
                          </span>
                        </>
                      )}
                      {file.status === 'error' && (
                        <>
                          <span>•</span>
                          <span className="text-red-600">{file.errorMessage}</span>
                        </>
                      )}
                    </div>
                    
                    {(file.status === 'uploading' || file.status === 'processing') && (
                      <div className="mt-2">
                        <div className="flex items-center justify-between text-xs mb-1">
                          <span className="capitalize">{file.status}...</span>
                          <span>{file.progress}%</span>
                        </div>
                        <Progress value={file.progress} className="h-2" />
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Upload Guidelines */}
      <Card>
        <CardHeader>
          <CardTitle>Upload Guidelines</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium mb-3">File Requirements</h4>
              <ul className="text-sm space-y-1">
                <li>• Excel files: .xlsx or .xls format</li>
                <li>• CSV files: UTF-8 encoding preferred</li>
                <li>• Maximum file size: 50MB</li>
                <li>• Include headers in first row</li>
                <li>• Use consistent date formats</li>
                <li>• No merged cells in data ranges</li>
              </ul>
            </div>
            
            <div>
              <h4 className="font-medium mb-3">Data Structure</h4>
              <ul className="text-sm space-y-1">
                <li>• Account codes in first column</li>
                <li>• Account names in second column</li>
                <li>• Amounts in subsequent columns</li>
                <li>• Use negative values for credits</li>
                <li>• Include period identifiers</li>
                <li>• Separate sheets for different statements</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}