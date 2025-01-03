import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FileText, Download, Loader2 } from "lucide-react";
import { toast } from "sonner";

export function TemplatesList() {
  const [searchTerm, setSearchTerm] = React.useState("");

  const { data: templates, isLoading } = useQuery({
    queryKey: ["tax-templates"],
    queryFn: async () => {
      const { data, error } = await supabase.storage
        .from("tax_templates")
        .list();

      if (error) throw error;
      return data;
    },
  });

  const filteredTemplates = templates?.filter((template) =>
    template.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("tax_templates")
        .download(fileName);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast.success("Template downloaded successfully");
    } catch (error) {
      console.error("Error downloading template:", error);
      toast.error("Failed to download template");
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center p-8">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Input
        placeholder="Search templates..."
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
        className="max-w-md"
      />
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates?.map((template) => (
          <div
            key={template.id}
            className="rounded-lg border bg-card p-4 text-card-foreground shadow-sm"
          >
            <div className="mb-4 flex items-center gap-2">
              <FileText className="h-5 w-5 text-blue-600" />
              <span className="font-medium">{template.name}</span>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => handleDownload(template.name)}
              className="w-full"
            >
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
          </div>
        ))}
      </div>
    </div>
  );
}