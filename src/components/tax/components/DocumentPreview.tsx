
import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { X, Download, FileText, FileImage, File } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { DocumentMetadata } from "@/types/documents";
import { toast } from "sonner";

interface DocumentPreviewProps {
  document: DocumentMetadata | null;
  onClose: () => void;
}

export function DocumentPreview({ document, onClose }: DocumentPreviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    if (!document) return;
    
    const fetchDocumentUrl = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase.storage
          .from("tax_documents")
          .createSignedUrl(document.file_path, 60); // 60 seconds expiry
        
        if (error) throw error;
        
        setPreviewUrl(data?.signedUrl || null);
      } catch (error) {
        console.error("Error fetching document URL:", error);
        toast.error("Failed to load document preview");
      } finally {
        setLoading(false);
      }
    };
    
    fetchDocumentUrl();
    
    return () => {
      // Clean up the URL object when component unmounts
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, [document]);
  
  if (!document) return null;
  
  const getFileIcon = () => {
    const extension = document.file_name.split('.').pop()?.toLowerCase();
    
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(extension || '')) {
      return <FileImage className="h-8 w-8 text-blue-500" />;
    } else if (['pdf'].includes(extension || '')) {
      return <File className="h-8 w-8 text-red-500" />;
    } else {
      return <FileText className="h-8 w-8 text-blue-500" />;
    }
  };
  
  const isImage = (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(
    document.file_name.split('.').pop()?.toLowerCase() || ''
  ));
  
  const isPdf = document.file_name.toLowerCase().endsWith('.pdf');
  
  const handleDownload = async () => {
    try {
      const { data, error } = await supabase.storage
        .from("tax_documents")
        .download(document.file_path);
      
      if (error) throw error;
      
      const url = URL.createObjectURL(data);
      const a = window.document.createElement("a");
      a.href = url;
      a.download = document.file_name;
      window.document.body.appendChild(a);
      a.click();
      URL.revokeObjectURL(url);
      window.document.body.removeChild(a);
    } catch (error) {
      console.error("Download error:", error);
      toast.error("Failed to download document");
    }
  };
  
  return (
    <Card className="fixed inset-0 z-50 flex flex-col bg-white shadow-xl md:inset-auto md:left-1/2 md:top-1/2 md:h-[80vh] md:w-[80vw] md:-translate-x-1/2 md:-translate-y-1/2">
      <CardHeader className="flex flex-row items-center justify-between border-b px-6 py-4">
        <CardTitle className="flex items-center gap-2">
          {getFileIcon()}
          <span className="truncate">{document.file_name}</span>
        </CardTitle>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={handleDownload}>
            <Download className="mr-2 h-4 w-4" />
            Download
          </Button>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-5 w-5" />
          </Button>
        </div>
      </CardHeader>
      
      <CardContent className="flex-1 overflow-auto p-0">
        {loading ? (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">Loading document...</p>
          </div>
        ) : previewUrl ? (
          <div className="flex h-full w-full items-center justify-center overflow-auto p-4">
            {isImage ? (
              <img 
                src={previewUrl} 
                alt={document.file_name} 
                className="max-h-full max-w-full object-contain" 
              />
            ) : isPdf ? (
              <iframe 
                src={`${previewUrl}#toolbar=0`} 
                title={document.file_name}
                className="h-full w-full border-0" 
              />
            ) : (
              <div className="flex flex-col items-center justify-center text-center p-4">
                <FileText className="h-16 w-16 text-blue-500 mb-4" />
                <p className="text-xl font-medium">Document preview not available</p>
                <p className="text-muted-foreground">
                  This document type cannot be previewed. Please download to view.
                </p>
                <Button className="mt-4" onClick={handleDownload}>
                  <Download className="mr-2 h-4 w-4" />
                  Download
                </Button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <p className="text-muted-foreground">Failed to load document preview</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
