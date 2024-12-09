import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState } from "react";
import { toast } from "sonner";
import mammoth from 'mammoth';

interface FileUploaderProps {
  onFileUpload: (file: File, type: "master" | "local") => void;
}

export function FileUploader({ onFileUpload }: FileUploaderProps) {
  const [uploadType, setUploadType] = useState<"master" | "local">("master");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      try {
        let text: string | undefined;

        // Handle different file types
        if (file.type === 'text/plain') {
          text = await file.text();
        } else if (file.type === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
          // Handle .docx files
          const arrayBuffer = await file.arrayBuffer();
          const result = await mammoth.extractRawText({ arrayBuffer });
          text = result.value;
        } else if (file.type === 'application/msword') {
          // Handle .doc files
          toast.error("Legacy .doc files are not supported. Please save as .docx and try again.");
          return;
        } else {
          toast.error("Unsupported file type. Please use .txt or .docx files");
          return;
        }

        if (text) {
          const newFile = new File([text], file.name, {
            type: 'text/plain',
            lastModified: file.lastModified,
          });
          onFileUpload(newFile, uploadType);
          toast.success("File uploaded successfully");
        }
      } catch (error) {
        console.error("Error reading file:", error);
        toast.error("Error reading file. Please ensure it's a valid document.");
      }

      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <Input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        className="hidden"
        accept=".txt,.docx"
      />
      <Select value={uploadType} onValueChange={(value: "master" | "local") => setUploadType(value)}>
        <SelectTrigger className="w-32">
          <SelectValue placeholder="Upload to..." />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="master">Master File</SelectItem>
          <SelectItem value="local">Local File</SelectItem>
        </SelectContent>
      </Select>
      <Button onClick={() => fileInputRef.current?.click()}>
        <Upload className="mr-2 h-4 w-4" />
        Upload
      </Button>
    </div>
  );
}