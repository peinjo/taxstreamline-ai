import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Upload } from "lucide-react";
import { toast } from "sonner";

interface TaxTemplateProps {
  searchQuery: string;
}

export function TaxTemplates({ searchQuery }: TaxTemplateProps) {
  const { data: templates, isLoading } = useQuery({
    queryKey: ["taxTemplates", searchQuery],
    queryFn: async () => {
      const query = supabase
        .from("tax_templates")
        .select("*")
        .order("created_at", { ascending: false });

      if (searchQuery) {
        query.ilike("title", `%${searchQuery}%`);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>, type: "master" | "local") => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"].includes(file.type)) {
      toast.error("Only PDF and DOCX files are allowed");
      return;
    }

    try {
      const fileExt = file.name.split(".").pop();
      const filePath = `${type}/${crypto.randomUUID()}.${fileExt}`;

      const { error: uploadError } = await supabase.storage
        .from("tax_templates")
        .upload(filePath, file);

      if (uploadError) throw uploadError;

      const { error: dbError } = await supabase
        .from("tax_templates")
        .insert({
          title: file.name,
          file_path: filePath,
          file_type: fileExt,
          template_type: type,
        });

      if (dbError) throw dbError;

      toast.success("Template uploaded successfully");
    } catch (error) {
      console.error("Upload error:", error);
      toast.error("Failed to upload template");
    }
  };

  const handleDownload = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from("tax_templates")
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download template");
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tax Templates</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex gap-2">
          <div>
            <input
              type="file"
              id="masterFile"
              className="hidden"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, "master")}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("masterFile")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Master File
            </Button>
          </div>
          <div>
            <input
              type="file"
              id="localFile"
              className="hidden"
              accept=".pdf,.docx"
              onChange={(e) => handleFileUpload(e, "local")}
            />
            <Button
              variant="outline"
              onClick={() => document.getElementById("localFile")?.click()}
            >
              <Upload className="mr-2 h-4 w-4" />
              Upload Local File
            </Button>
          </div>
        </div>

        {isLoading ? (
          <div>Loading templates...</div>
        ) : (
          <div className="space-y-2">
            {templates?.map((template) => (
              <div
                key={template.id}
                className="flex items-center justify-between rounded-lg border p-2"
              >
                <div>
                  <p className="font-medium">{template.title}</p>
                  <p className="text-sm text-muted-foreground">
                    Type: {template.template_type}
                  </p>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleDownload(template.file_path, template.title)}
                >
                  <Download className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}