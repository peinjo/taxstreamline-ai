import React from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Eye, 
  Download, 
  Upload, 
  Trash2, 
  Edit, 
  Tag,
  History,
  FileText
} from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface AuditLogEntry {
  id: string;
  document_id: number;
  user_id: string;
  action: string;
  details: Record<string, unknown>;
  created_at: string;
}

interface DocumentAuditLogProps {
  documentId: number;
  documentName: string;
  isOpen: boolean;
  onClose: () => void;
}

const actionIcons: Record<string, React.ReactNode> = {
  view: <Eye className="h-4 w-4" />,
  download: <Download className="h-4 w-4" />,
  upload: <Upload className="h-4 w-4" />,
  delete: <Trash2 className="h-4 w-4" />,
  update: <Edit className="h-4 w-4" />,
  tag_added: <Tag className="h-4 w-4" />,
  tag_removed: <Tag className="h-4 w-4" />,
  version_created: <History className="h-4 w-4" />,
  version_restored: <History className="h-4 w-4" />,
};

const actionColors: Record<string, string> = {
  view: "bg-blue-500/10 text-blue-500",
  download: "bg-green-500/10 text-green-500",
  upload: "bg-purple-500/10 text-purple-500",
  delete: "bg-destructive/10 text-destructive",
  update: "bg-orange-500/10 text-orange-500",
  tag_added: "bg-teal-500/10 text-teal-500",
  tag_removed: "bg-yellow-500/10 text-yellow-500",
  version_created: "bg-indigo-500/10 text-indigo-500",
  version_restored: "bg-pink-500/10 text-pink-500",
};

export function DocumentAuditLog({ 
  documentId, 
  documentName, 
  isOpen, 
  onClose 
}: DocumentAuditLogProps) {
  const { data: auditLogs, isLoading } = useQuery({
    queryKey: ["document-audit-logs", documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_audit_logs")
        .select("*")
        .eq("document_id", documentId)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as AuditLogEntry[];
    },
    enabled: isOpen,
  });

  const formatAction = (action: string) => {
    return action
      .split("_")
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(" ");
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className="w-full sm:max-w-lg">
        <SheetHeader>
          <SheetTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Activity Log
          </SheetTitle>
          <p className="text-sm text-muted-foreground truncate">
            {documentName}
          </p>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)] mt-6 pr-4">
          {isLoading ? (
            <div className="space-y-4">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="flex items-start gap-3">
                  <Skeleton className="h-8 w-8 rounded-full" />
                  <div className="flex-1 space-y-2">
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                  </div>
                </div>
              ))}
            </div>
          ) : auditLogs && auditLogs.length > 0 ? (
            <div className="relative">
              {/* Timeline line */}
              <div className="absolute left-4 top-2 bottom-2 w-px bg-border" />
              
              <div className="space-y-6">
                {auditLogs.map((log, index) => (
                  <div key={log.id} className="relative flex items-start gap-4 pl-2">
                    {/* Timeline dot */}
                    <div 
                      className={`relative z-10 flex h-8 w-8 items-center justify-center rounded-full ${
                        actionColors[log.action] || "bg-muted text-muted-foreground"
                      }`}
                    >
                      {actionIcons[log.action] || <FileText className="h-4 w-4" />}
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant="outline" className="text-xs">
                          {formatAction(log.action)}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      
                      {log.details && Object.keys(log.details).length > 0 && (
                        <p className="mt-1 text-sm text-muted-foreground">
                          {log.details.message as string || 
                           log.details.description as string || 
                           JSON.stringify(log.details)}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/50 mb-4" />
              <h3 className="font-medium">No activity recorded</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Document activity will appear here
              </p>
            </div>
          )}
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}

// Helper function to log document actions
export async function logDocumentAction(
  documentId: number,
  action: string,
  details?: Record<string, unknown>
) {
  try {
    const { error } = await supabase.from("document_audit_logs").insert([{
      document_id: documentId,
      action,
      details: (details || {}) as unknown as import("@/integrations/supabase/types").Json,
    }]);
    if (error) {
      console.error("Failed to log document action:", error);
    }
  } catch (error) {
    console.error("Failed to log document action:", error);
  }
}
