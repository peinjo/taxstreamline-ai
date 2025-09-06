import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Download, Edit2, Check, X, Trash2 } from "lucide-react";
import { Document } from "./types";
import { useState } from "react";
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
import { toast } from "sonner";

interface DocumentCardProps {
  doc: Document;
  onEdit: (doc: Document) => void;
  onTitleChange: (id: number, newTitle: string) => void;
  onDelete: (id: number) => void;
}

export function DocumentCard({ doc, onEdit, onTitleChange, onDelete }: DocumentCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(doc.title);
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const handleTitleSave = () => {
    onTitleChange(doc.id, tempTitle);
    setIsEditingTitle(false);
    toast.success("Title updated successfully");
  };

  const handleTitleCancel = () => {
    setTempTitle(doc.title);
    setIsEditingTitle(false);
  };

  const handleDelete = () => {
    onDelete(doc.id);
    setShowDeleteDialog(false);
    toast.success("Document deleted successfully");
  };

  const handleDownload = () => {
    if (doc.content) {
      const blob = new Blob([doc.content], { type: 'text/plain' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${doc.title}.txt`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      toast.success("File downloaded successfully");
    }
  };

  return (
    <>
      <Card key={doc.id} className="overflow-hidden">
        <CardContent className="p-4">
          <div className="mb-4 flex items-start justify-between">
            <div className="w-full">
              <FileText className="mb-2 h-6 w-6 text-blue-600" />
              {isEditingTitle ? (
                <div className="flex items-center gap-2">
                  <Input
                    value={tempTitle}
                    onChange={(e) => setTempTitle(e.target.value)}
                    className="h-8"
                  />
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTitleSave}
                    className="h-8 w-8 p-0"
                  >
                    <Check className="h-4 w-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleTitleCancel}
                    className="h-8 w-8 p-0"
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <h3 className="font-medium">{doc.title}</h3>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsEditingTitle(true)}
                    className="h-8 w-8 p-0"
                  >
                    <Edit2 className="h-4 w-4" />
                  </Button>
                </div>
              )}
              <p className="text-sm text-gray-500">Last modified: {doc.modified}</p>
              {doc.content && (
                <div className="mt-2 text-sm text-gray-600 line-clamp-3">
                  {doc.content.replace(/<[^>]*>/g, '').substring(0, 150)}
                  {doc.content.length > 150 && '...'}
                </div>
              )}
            </div>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" size="sm" onClick={handleDownload}>
              <Download className="mr-2 h-4 w-4" />
              Download
            </Button>
            <Button variant="outline" size="sm" onClick={() => onEdit(doc)}>
              <Edit2 className="mr-2 h-4 w-4" />
              Edit
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => setShowDeleteDialog(true)}
              className="text-red-600 hover:text-red-700"
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
          </div>
        </CardContent>
      </Card>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the document.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}