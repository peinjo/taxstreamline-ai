import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Upload } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useRef, useState } from "react";
import { toast } from "sonner";

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
        // Check if file is a text file
        if (file.type === 'text/plain') {
          const reader = new FileReader();
          reader.onload = async (e) => {
            const text = e.target?.result;
            if (typeof text === 'string') {
              const newFile = new File([text], file.name, {
                type: 'text/plain',
                lastModified: file.lastModified,
              });
              onFileUpload(newFile, uploadType);
              toast.success("File uploaded successfully");
            }
          };
          reader.readAsText(file);
        } else {
          // For other file types, show an error
          toast.error("Only text files (.txt) are supported at the moment");
        }
      } catch (error) {
        toast.error("Error reading file. Please ensure it's a valid text document.");
        console.error("Error reading file:", error);
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
        accept=".txt"
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