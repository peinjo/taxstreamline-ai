import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/lib/supabase";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Download, Trash2 } from "lucide-react";
import { deleteTaxDocument } from "@/utils/fileUpload";
import { toast } from "sonner";

interface TaxDocument {
  id: number;
  filename: string;
  file_path: string;
  content_type: string;
  size: number;
  created_at: string;
}

export function DocumentList() {
  const { data: documents, isLoading, refetch } = useQuery({
    queryKey: ['taxDocuments'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('tax_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return data as TaxDocument[];
    },
  });

  const handleDownload = async (document: TaxDocument) => {
    try {
      const { data, error } = await supabase.storage
        .from('tax_documents')
        .download(document.file_path);

      if (error) throw error;

      const url = window.URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = document.filename;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (error) {
      console.error('Error downloading file:', error);
      toast.error('Failed to download file');
    }
  };

  const handleDelete = async (document: TaxDocument) => {
    try {
      await deleteTaxDocument(document.file_path, document.id);
      toast.success('Document deleted successfully');
      refetch();
    } catch (error) {
      console.error('Error deleting file:', error);
      toast.error('Failed to delete document');
    }
  };

  if (isLoading) {
    return <div>Loading documents...</div>;
  }

  return (
    <div className="space-y-4">
      {documents?.map((document) => (
        <Card key={document.id}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium">{document.filename}</h3>
                <p className="text-sm text-gray-500">
                  Uploaded on {new Date(document.created_at).toLocaleDateString()}
                </p>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDownload(document)}
                >
                  <Download className="h-4 w-4 mr-2" />
                  Download
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(document)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
      {documents?.length === 0 && (
        <p className="text-center text-gray-500">No documents uploaded yet</p>
      )}
    </div>
  );
}