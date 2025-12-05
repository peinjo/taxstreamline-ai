import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  History,
  Clock,
  User,
  FileText,
  RotateCcw,
  Eye,
  ChevronRight,
} from "lucide-react";
import { toast } from "sonner";
import { logger } from "@/lib/logging/logger";

interface DocumentVersion {
  id: string;
  version_number: number;
  created_at: string;
  created_by: string;
  changes_summary: string | null;
  file_size: number | null;
  content: Record<string, unknown>;
}

interface DocumentVersionHistoryProps {
  documentId: string;
  documentTitle: string;
  isOpen: boolean;
  onClose: () => void;
  onRestore?: (versionId: string) => Promise<void>;
}

export function DocumentVersionHistory({
  documentId,
  documentTitle,
  isOpen,
  onClose,
  onRestore,
}: DocumentVersionHistoryProps) {
  const [selectedVersion, setSelectedVersion] = useState<DocumentVersion | null>(null);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  const { data: versions, isLoading, refetch } = useQuery({
    queryKey: ["document-versions", documentId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("document_versions")
        .select("*")
        .eq("document_id", documentId)
        .order("version_number", { ascending: false });

      if (error) throw error;
      return data as DocumentVersion[];
    },
    enabled: isOpen && !!documentId,
  });

  const handleRestoreVersion = async () => {
    if (!selectedVersion || !onRestore) return;
    
    setIsRestoring(true);
    try {
      await onRestore(selectedVersion.id);
      toast.success(`Restored to version ${selectedVersion.version_number}`);
      setShowRestoreDialog(false);
      refetch();
    } catch (error) {
      logger.error("Failed to restore version", error as Error, {
        component: "DocumentVersionHistory",
        versionId: selectedVersion.id,
      });
      toast.error("Failed to restore version");
    } finally {
      setIsRestoring(false);
    }
  };

  const formatFileSize = (bytes: number | null) => {
    if (!bytes) return "Unknown size";
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  return (
    <>
      <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent className="w-full sm:max-w-lg">
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <History className="h-5 w-5" />
              Version History
            </SheetTitle>
            <SheetDescription>
              View and restore previous versions of "{documentTitle}"
            </SheetDescription>
          </SheetHeader>

          <div className="mt-6">
            {isLoading ? (
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-start gap-4 p-4 border rounded-lg">
                    <Skeleton className="h-10 w-10 rounded-full" />
                    <div className="flex-1 space-y-2">
                      <Skeleton className="h-4 w-24" />
                      <Skeleton className="h-3 w-full" />
                      <Skeleton className="h-3 w-32" />
                    </div>
                  </div>
                ))}
              </div>
            ) : !versions?.length ? (
              <div className="text-center py-12">
                <History className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium">No version history</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  Version history will appear here as changes are made.
                </p>
              </div>
            ) : (
              <ScrollArea className="h-[calc(100vh-200px)]">
                <div className="space-y-3 pr-4">
                  {versions.map((version, index) => (
                    <div
                      key={version.id}
                      className={`relative p-4 border rounded-lg transition-colors hover:bg-accent/50 cursor-pointer ${
                        index === 0 ? "border-primary" : ""
                      }`}
                      onClick={() => setSelectedVersion(version)}
                    >
                      {/* Timeline connector */}
                      {index < versions.length - 1 && (
                        <div className="absolute left-7 top-14 w-0.5 h-6 bg-border" />
                      )}

                      <div className="flex items-start gap-3">
                        <div
                          className={`flex h-10 w-10 items-center justify-center rounded-full ${
                            index === 0
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted"
                          }`}
                        >
                          <FileText className="h-5 w-5" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-medium">
                              Version {version.version_number}
                            </span>
                            {index === 0 && (
                              <Badge variant="default" className="text-xs">
                                Current
                              </Badge>
                            )}
                          </div>

                          {version.changes_summary && (
                            <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                              {version.changes_summary}
                            </p>
                          )}

                          <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              {format(new Date(version.created_at), "MMM d, yyyy h:mm a")}
                            </span>
                            <span className="flex items-center gap-1">
                              <FileText className="h-3 w-3" />
                              {formatFileSize(version.file_size)}
                            </span>
                          </div>
                        </div>

                        <ChevronRight className="h-5 w-5 text-muted-foreground" />
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </div>

          {/* Version Detail Footer */}
          {selectedVersion && (
            <div className="absolute bottom-0 left-0 right-0 p-4 border-t bg-background">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Version {selectedVersion.version_number}</p>
                  <p className="text-sm text-muted-foreground">
                    {format(new Date(selectedVersion.created_at), "MMMM d, yyyy")}
                  </p>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm">
                    <Eye className="h-4 w-4 mr-2" />
                    Preview
                  </Button>
                  {onRestore && selectedVersion.version_number !== versions?.[0]?.version_number && (
                    <Button
                      size="sm"
                      onClick={() => setShowRestoreDialog(true)}
                    >
                      <RotateCcw className="h-4 w-4 mr-2" />
                      Restore
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </SheetContent>
      </Sheet>

      {/* Restore Confirmation Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Restore this version?</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the document to Version {selectedVersion?.version_number}. 
              The current version will be saved in the history.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isRestoring}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreVersion} disabled={isRestoring}>
              {isRestoring ? "Restoring..." : "Restore Version"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
