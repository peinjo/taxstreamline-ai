import { Button } from "@/components/ui/button";
import { FileText } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { DocumentCard } from "@/components/transfer-pricing/DocumentCard";
import { EditDocumentDialog } from "@/components/transfer-pricing/EditDocumentDialog";
import { Document } from "@/components/transfer-pricing/types";
import { defaultTemplate } from "@/components/transfer-pricing/constants";

const TransferPricing = () => {
  const [activeTab, setActiveTab] = useState<"master" | "local">("master");
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, title: "Document 1", modified: "Mar 15, 2024", type: "master" },
    { id: 2, title: "Document 2", modified: "Mar 15, 2024", type: "master" },
    { id: 3, title: "Document 3", modified: "Mar 15, 2024", type: "master" },
    { id: 4, title: "Local File 1", modified: "Mar 16, 2024", type: "local", content: defaultTemplate },
  ]);

  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const createNewDocument = () => {
    const newDocument: Document = {
      id: documents.length + 1,
      title: `Local File ${documents.filter(doc => doc.type === "local").length + 1}`,
      modified: new Date().toLocaleDateString("en-US", { 
        year: "numeric",
        month: "short",
        day: "numeric"
      }),
      type: "local",
      content: defaultTemplate
    };

    setDocuments([...documents, newDocument]);
    setIsNewDocumentDialogOpen(false);
    toast.success("New document created successfully with default template");
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setEditedContent(document.content || "");
  };

  const saveEditedDocument = () => {
    if (!editingDocument) return;

    const updatedDocuments = documents.map(doc => {
      if (doc.id === editingDocument.id) {
        return {
          ...doc,
          content: editedContent,
          modified: new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "short",
            day: "numeric"
          })
        };
      }
      return doc;
    });

    setDocuments(updatedDocuments);
    setEditingDocument(null);
    toast.success("Document updated successfully");
  };

  const filteredDocuments = documents.filter(doc => doc.type === activeTab);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transfer Pricing Documentation</h1>
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

        <div className="space-y-4">
          <div className="flex space-x-4 border-b">
            <button 
              className={`px-4 py-2 ${activeTab === "master" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("master")}
            >
              Master File
            </button>
            <button 
              className={`px-4 py-2 ${activeTab === "local" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
              onClick={() => setActiveTab("local")}
            >
              Local File
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {filteredDocuments.map((doc) => (
              <DocumentCard key={doc.id} doc={doc} onEdit={handleEditDocument} />
            ))}
          </div>
        </div>

        <EditDocumentDialog
          document={editingDocument}
          editedContent={editedContent}
          onClose={() => setEditingDocument(null)}
          onSave={saveEditedDocument}
          onContentChange={setEditedContent}
        />

        <div className="mt-8">
          <h2 className="mb-4 text-xl font-semibold">Recent Activity</h2>
          <div className="space-y-2">
            {[
              "Master File template updated",
              "New Local File created for Entity A",
              "Benchmark analysis completed",
              "Documentation reviewed by Tax Team",
            ].map((activity, index) => (
              <div
                key={index}
                className="flex items-center space-x-2 text-gray-600"
              >
                <div className="h-2 w-2 rounded-full bg-blue-600"></div>
                <span>{activity}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};

export default TransferPricing;