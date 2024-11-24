import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Document } from "./types";
import { RichTextEditor } from "./RichTextEditor";

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
  return (
    <Dialog open={!!document} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-4xl">
        <DialogHeader>
          <DialogTitle>Edit Document</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 p-4">
          <RichTextEditor content={editedContent} onChange={onContentChange} />
          <div className="flex justify-end space-x-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={onSave}>
              Save Changes
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}