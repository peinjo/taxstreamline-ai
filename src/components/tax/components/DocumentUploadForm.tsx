
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";

interface DocumentUploadFormProps {
  selectedYear: string;
  selectedType: "receipt" | "filing" | "statement" | "report" | "other";
  uploading: boolean;
  onYearChange: (year: string) => void;
  onTypeChange: (type: string) => void;
  onFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

export function DocumentUploadForm({
  selectedYear,
  selectedType,
  uploading,
  onYearChange,
  onTypeChange,
  onFileUpload,
}: DocumentUploadFormProps) {
  return (
    <div className="flex flex-wrap gap-4">
      <Select value={selectedYear} onValueChange={onYearChange}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Tax Year" />
        </SelectTrigger>
        <SelectContent>
          {Array.from({ length: 5 }, (_, i) => {
            const year = new Date().getFullYear() - i;
            return (
              <SelectItem key={year} value={year.toString()}>
                {year}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      <Select value={selectedType} onValueChange={onTypeChange}>
        <SelectTrigger className="w-40">
          <SelectValue placeholder="Document Type" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="receipt">Receipt</SelectItem>
          <SelectItem value="filing">Filing</SelectItem>
          <SelectItem value="statement">Statement</SelectItem>
          <SelectItem value="report">Report</SelectItem>
          <SelectItem value="other">Other</SelectItem>
        </SelectContent>
      </Select>

      <div className="flex-1 ml-auto">
        <Input
          type="file"
          id="document-upload"
          className="hidden"
          onChange={onFileUpload}
          accept=".pdf,.doc,.docx,.txt,.csv,.xlsx,.jpg,.jpeg,.png"
        />
        <Button
          onClick={() => document.getElementById("document-upload")?.click()}
          disabled={uploading}
          className="w-full sm:w-auto"
        >
          <Upload className="mr-2 h-4 w-4" />
          {uploading ? "Uploading..." : "Upload Document"}
        </Button>
      </div>
    </div>
  );
}
