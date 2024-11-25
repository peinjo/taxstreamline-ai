import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Document } from "./types";
import { RichTextEditor } from "./RichTextEditor";
import { X } from "lucide-react";

interface EditDocumentDialogProps {
  document: Document | null;
  editedContent: string;
  onClose: () => void;
  onSave: () => void;
  onContentChange: (content: string) => void;
}

export function EditDocumentDialog({
  document,
  editedContent,
  onClose,
  onSave,
  onContentChange,
}: EditDocumentDialogProps) {
  if (!document) return null;

  return (
    <Dialog open={!!document} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl h-[80vh]">
        <DialogHeader className="flex flex-row items-center justify-between">
          <DialogTitle>{document.title}</DialogTitle>
          <div className="flex items-center gap-2">
            <Button onClick={onSave} className="bg-blue-600 hover:bg-blue-700 text-white">
              Save Changes
            </Button>
            <Button variant="outline" onClick={onClose}>
              <X className="h-4 w-4 mr-2" />
              Close
            </Button>
          </div>
        </DialogHeader>
        <div className="mt-4 flex-1 overflow-y-auto">
          <RichTextEditor content={editedContent} onChange={onContentChange} />
        </div>
      </DialogContent>
    </Dialog>
  );
}