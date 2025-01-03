import { useState, startTransition, Suspense } from "react";
import { toast } from "sonner";
import DashboardLayout from "@/components/DashboardLayout";
import { Document, Activity } from "@/components/transfer-pricing/types";
import { defaultTemplate } from "@/components/transfer-pricing/constants";
import { EditDocumentDialog } from "@/components/transfer-pricing/EditDocumentDialog";
import { ActivityLog } from "@/components/transfer-pricing/ActivityLog";
import { DocumentList } from "@/components/transfer-pricing/DocumentList";
import { ErrorBoundary } from "react-error-boundary";
import { TransferPricingHeader } from "@/components/transfer-pricing/TransferPricingHeader";
import { DocumentTabs } from "@/components/transfer-pricing/DocumentTabs";
import { LoadingSpinner } from "@/components/transfer-pricing/LoadingSpinner";
import { ErrorFallback } from "@/components/transfer-pricing/ErrorFallback";

const TransferPricing = () => {
  const [activeTab, setActiveTab] = useState<"master" | "local">("master");
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, title: "Document 1", modified: new Date().toLocaleDateString(), type: "master" },
    { id: 2, title: "Document 2", modified: new Date().toLocaleDateString(), type: "master" },
    { id: 3, title: "Document 3", modified: new Date().toLocaleDateString(), type: "master" },
    { id: 4, title: "Local File 1", modified: new Date().toLocaleDateString(), type: "local", content: defaultTemplate },
  ]);

  const [activities, setActivities] = useState<Activity[]>([]);
  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false);
  const [editingDocument, setEditingDocument] = useState<Document | null>(null);
  const [editedContent, setEditedContent] = useState("");

  const addActivity = (action: string, documentTitle: string, documentType: "master" | "local") => {
    startTransition(() => {
      const newActivity: Activity = {
        id: activities.length + 1,
        action,
        documentTitle,
        documentType,
        timestamp: new Date().toLocaleString(),
      };
      setActivities([newActivity, ...activities]);
    });
  };

  const handleFileUpload = async (file: File, type: "master" | "local") => {
    try {
      const content = await file.text();
      startTransition(() => {
        const newDocument: Document = {
          id: documents.length + 1,
          title: file.name,
          modified: new Date().toLocaleDateString(),
          type,
          content
        };

        setDocuments([...documents, newDocument]);
        addActivity("Uploaded", file.name, type);
        toast.success("File uploaded successfully");
      });
    } catch (error) {
      toast.error("Error reading file");
    }
  };

  const createNewDocument = () => {
    startTransition(() => {
      const newDocument: Document = {
        id: documents.length + 1,
        title: `Local File ${documents.filter(doc => doc.type === "local").length + 1}`,
        modified: new Date().toLocaleDateString(),
        type: "local",
        content: defaultTemplate
      };

      setDocuments([...documents, newDocument]);
      setIsNewDocumentDialogOpen(false);
      addActivity("Created", newDocument.title, newDocument.type);
      toast.success("New document created successfully with default template");
    });
  };

  const handleEditDocument = (document: Document) => {
    startTransition(() => {
      setEditingDocument(document);
      setEditedContent(document.content || "");
    });
  };

  const handleTitleChange = (id: number, newTitle: string) => {
    startTransition(() => {
      const updatedDocuments = documents.map(doc => {
        if (doc.id === id) {
          const updatedDoc = { ...doc, title: newTitle, modified: new Date().toLocaleDateString() };
          addActivity("Renamed", newTitle, doc.type);
          return updatedDoc;
        }
        return doc;
      });
      setDocuments(updatedDocuments);
      toast.success("Document title updated successfully");
    });
  };

  const handleDeleteDocument = (id: number) => {
    startTransition(() => {
      const documentToDelete = documents.find(doc => doc.id === id);
      if (documentToDelete) {
        setDocuments(documents.filter(doc => doc.id !== id));
        addActivity("Deleted", documentToDelete.title, documentToDelete.type);
        toast.success("Document deleted successfully");
      }
    });
  };

  const saveEditedDocument = () => {
    if (!editingDocument) return;

    startTransition(() => {
      const updatedDocuments = documents.map(doc => {
        if (doc.id === editingDocument.id) {
          const updatedDoc = {
            ...doc,
            content: editedContent,
            modified: new Date().toLocaleDateString()
          };
          addActivity("Edited", doc.title, doc.type);
          return updatedDoc;
        }
        return doc;
      });

      setDocuments(updatedDocuments);
      setEditingDocument(null);
      toast.success("Document updated successfully");
    });
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <ErrorBoundary FallbackComponent={ErrorFallback}>
          <TransferPricingHeader
            isNewDocumentDialogOpen={isNewDocumentDialogOpen}
            setIsNewDocumentDialogOpen={setIsNewDocumentDialogOpen}
            createNewDocument={createNewDocument}
            onFileUpload={handleFileUpload}
          />

          <div className="space-y-4">
            <DocumentTabs activeTab={activeTab} setActiveTab={setActiveTab} />

            <Suspense fallback={<LoadingSpinner />}>
              <DocumentList 
                documents={documents}
                activeTab={activeTab}
                onEdit={handleEditDocument}
                onTitleChange={handleTitleChange}
                onDelete={handleDeleteDocument}
              />
            </Suspense>
          </div>

          <EditDocumentDialog
            document={editingDocument}
            editedContent={editedContent}
            onClose={() => setEditingDocument(null)}
            onSave={saveEditedDocument}
            onContentChange={setEditedContent}
          />

          <Suspense fallback={<LoadingSpinner />}>
            <ActivityLog activities={activities} />
          </Suspense>
        </ErrorBoundary>
      </div>
    </DashboardLayout>
  );
};

export default TransferPricing;