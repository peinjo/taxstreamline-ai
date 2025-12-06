import { FileText, Trash2, Eye, Tag, Plus, History, Activity, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { DocumentMetadata } from "@/types/documents";
import { formatFileSize } from "../utils/document-utils";
import { useState } from "react";
import { toast } from "sonner";
import { useResponsiveLayout } from "@/hooks/useResponsiveLayout";

interface DocumentListProps {
  documents: DocumentMetadata[];
  onDelete: (id: number, filePath: string) => void;
  onUpdateTags?: (id: number, tags: string[]) => void;
  onViewDocument?: (document: DocumentMetadata) => void;
  onViewHistory?: (document: DocumentMetadata) => void;
  onViewAuditLog?: (document: DocumentMetadata) => void;
  selectedIds?: Set<number>;
  onToggleSelect?: (id: number) => void;
}

export function DocumentList({ 
  documents, 
  onDelete, 
  onUpdateTags,
  onViewDocument,
  onViewHistory,
  onViewAuditLog,
  selectedIds = new Set(),
  onToggleSelect
}: DocumentListProps) {
  const [editingTagsForId, setEditingTagsForId] = useState<number | null>(null);
  const [newTag, setNewTag] = useState<string>("");
  const { isMobile } = useResponsiveLayout();

  const handleAddTag = (document: DocumentMetadata) => {
    if (!newTag.trim() || !onUpdateTags) return;
    
    const existingTags = document.tags || [];
    if (existingTags.includes(newTag.trim())) {
      toast.error("Tag already exists");
      return;
    }
    
    const updatedTags = [...existingTags, newTag.trim()];
    onUpdateTags(document.id, updatedTags);
    setNewTag("");
  };

  const handleRemoveTag = (document: DocumentMetadata, tagToRemove: string) => {
    if (!onUpdateTags) return;
    
    const existingTags = document.tags || [];
    const updatedTags = existingTags.filter(tag => tag !== tagToRemove);
    onUpdateTags(document.id, updatedTags);
  };

  return (
    <div className="grid gap-4">
      {documents?.length === 0 ? (
        <div className="text-center p-4 border rounded-lg text-muted-foreground">
          No documents found
        </div>
      ) : (
        documents.map((doc) => (
          <div
            key={doc.id}
            className={`flex flex-col rounded-lg border p-4 transition-colors ${
              selectedIds.has(doc.id) ? "bg-primary/5 border-primary" : ""
            }`}
          >
            <div className={`flex items-start ${isMobile ? "flex-col" : "justify-between"}`}>
              <div className="flex items-start space-x-4">
                {onToggleSelect && (
                  <Checkbox
                    checked={selectedIds.has(doc.id)}
                    onCheckedChange={() => onToggleSelect(doc.id)}
                    className="mt-2"
                  />
                )}
                <FileText className="h-8 w-8 text-blue-500 mt-1" />
                <div className="space-y-1">
                  <p className="font-medium">{doc.file_name}</p>
                  <p className="text-sm text-muted-foreground">
                    {doc.file_type} • {formatFileSize(doc.file_size)} • Tax Year: {doc.tax_year}
                  </p>
                  
                  {/* Tags section */}
                  <div className="pt-2">
                    <div className="flex flex-wrap items-center gap-2">
                      {doc.tags && doc.tags.length > 0 ? (
                        <>
                          <Tag className="h-3 w-3 text-muted-foreground" />
                          {doc.tags.map((tag, index) => (
                            <Badge 
                              key={index} 
                              variant="secondary"
                              className="flex items-center gap-1 text-xs"
                            >
                              {tag}
                              {onUpdateTags && (
                                <button 
                                  className="ml-1 text-muted-foreground hover:text-foreground"
                                  onClick={() => handleRemoveTag(doc, tag)}
                                >
                                  ×
                                </button>
                              )}
                            </Badge>
                          ))}
                        </>
                      ) : (
                        <span className="text-xs text-muted-foreground">No tags</span>
                      )}
                      
                      {onUpdateTags && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="h-5 w-5 p-0 rounded-full"
                          onClick={() => setEditingTagsForId(doc.id)}
                        >
                          <Plus className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                    
                    {/* Add tags UI */}
                    {editingTagsForId === doc.id && (
                      <div className="mt-2 flex items-center gap-2">
                        <Input
                          value={newTag}
                          onChange={(e) => setNewTag(e.target.value)}
                          className="h-7 text-xs"
                          placeholder="Add a tag"
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') {
                              handleAddTag(doc);
                            }
                          }}
                        />
                        <Button
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => handleAddTag(doc)}
                        >
                          Add
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-7 text-xs"
                          onClick={() => {
                            setEditingTagsForId(null);
                            setNewTag("");
                          }}
                        >
                          Cancel
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              <div className={`flex items-center space-x-1 ${isMobile ? "mt-4 ml-12" : ""}`}>
                {onViewDocument && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDocument(doc)}
                    title="View document"
                  >
                    <Eye className="h-4 w-4 text-blue-500" />
                  </Button>
                )}
                {onViewHistory && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewHistory(doc)}
                    title="Version history"
                  >
                    <History className="h-4 w-4 text-purple-500" />
                  </Button>
                )}
                {onViewAuditLog && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewAuditLog(doc)}
                    title="Activity log"
                  >
                    <Activity className="h-4 w-4 text-green-500" />
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onDelete(doc.id, doc.file_path)}
                  title="Delete document"
                >
                  <Trash2 className="h-4 w-4 text-red-500" />
                </Button>
              </div>
            </div>
            
            {/* Description if available */}
            {doc.description && (
              <div className="mt-3 ml-12 text-sm">
                <p className="text-muted-foreground">{doc.description}</p>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
