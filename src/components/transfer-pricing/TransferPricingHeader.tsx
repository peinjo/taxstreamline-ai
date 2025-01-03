import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { FileUploader } from "./FileUploader";

interface TransferPricingHeaderProps {
  isNewDocumentDialogOpen: boolean;
  setIsNewDocumentDialogOpen: (open: boolean) => void;
  createNewDocument: () => void;
  onFileUpload: (file: File, type: "master" | "local") => void;
}

export function TransferPricingHeader({
  isNewDocumentDialogOpen,
  setIsNewDocumentDialogOpen,
  createNewDocument,
  onFileUpload
}: TransferPricingHeaderProps) {
  return (
    <div className="flex items-center justify-between">
      <h1 className="text-2xl font-bold">Transfer Pricing Documentation</h1>
      <div className="flex gap-4">
        <FileUploader onFileUpload={onFileUpload} />
        <Dialog open={isNewDocumentDialogOpen} onOpenChange={setIsNewDocumentDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <span className="mr-2">New Document</span>
              <FileText className="h-4 w-4" />
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create New Document</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 p-4">
              <p className="text-sm text-gray-500">
                This will create a new Local File document with the default template.
              </p>
              <div className="flex justify-end space-x-2">
                <Button variant="outline" onClick={() => setIsNewDocumentDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={createNewDocument}>
                  Create Document
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}