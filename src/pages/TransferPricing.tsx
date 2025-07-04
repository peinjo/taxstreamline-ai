import { Button } from "@/components/ui/button";
import { FileText, Building2, BarChart3, Settings } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";
import { Document, Activity } from "@/components/transfer-pricing/types";
import { defaultTemplate } from "@/components/transfer-pricing/constants";
import { EditDocumentDialog } from "@/components/transfer-pricing/EditDocumentDialog";
import { FileUploader } from "@/components/transfer-pricing/FileUploader";
import { ActivityLog } from "@/components/transfer-pricing/ActivityLog";
import { DocumentList } from "@/components/transfer-pricing/DocumentList";
import { DocumentWizard } from '@/components/transfer-pricing/DocumentWizard';
import { OECDCompliantDocumentWizard } from '@/components/transfer-pricing/enhanced-wizard/OECDCompliantDocumentWizard';
import { TransferPricingProvider } from '@/contexts/TransferPricingContext';
import TPDashboard from '@/components/transfer-pricing/TPDashboard';
import EntityManagement from '@/components/transfer-pricing/EntityManagement';
import { BenchmarkingDashboard } from '@/components/transfer-pricing/benchmarking/BenchmarkingDashboard';
import { RiskAssessmentEngine } from '@/components/transfer-pricing/risk-assessment/RiskAssessmentEngine';
import { FinancialDataIntegration } from '@/components/transfer-pricing/financial-integration/FinancialDataIntegration';
import { AutomatedComplianceTracker } from '@/components/transfer-pricing/compliance/AutomatedComplianceTracker';
import { SmartDocumentGenerator } from '@/components/transfer-pricing/ai/SmartDocumentGenerator';
import { CountryByCountryReporting } from '@/components/transfer-pricing/reporting/CountryByCountryReporting';
import { TPOverviewDashboard } from '@/components/transfer-pricing/dashboard/TPOverviewDashboard';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const TransferPricing = () => {
  const [activeTab, setActiveTab] = useState<"dashboard" | "documents" | "entities" | "analytics" | "benchmarking" | "risk" | "financial" | "compliance" | "ai" | "reporting">("dashboard");
  const [documentTab, setDocumentTab] = useState<"master" | "local">("master");
  
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
    const newActivity: Activity = {
      id: activities.length + 1,
      action,
      documentTitle,
      documentType,
      timestamp: new Date().toLocaleString(),
    };
    setActivities([newActivity, ...activities]);
  };

  const handleFileUpload = async (file: File, type: "master" | "local") => {
    try {
      const content = await file.text();
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
    } catch (error) {
      toast.error("Error reading file");
    }
  };

  const createNewDocument = () => {
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
  };

  const handleEditDocument = (document: Document) => {
    setEditingDocument(document);
    setEditedContent(document.content || "");
  };

  const handleTitleChange = (id: number, newTitle: string) => {
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
  };

  const handleDeleteDocument = (id: number) => {
    const documentToDelete = documents.find(doc => doc.id === id);
    if (documentToDelete) {
      setDocuments(documents.filter(doc => doc.id !== id));
      addActivity("Deleted", documentToDelete.title, documentToDelete.type);
      toast.success("Document deleted successfully");
    }
  };

  const saveEditedDocument = () => {
    if (!editingDocument) return;

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
  };

  return (
    <TransferPricingProvider>
      <DashboardLayout>
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold">Transfer Pricing Hub</h1>
            <div className="flex gap-2">
              <FileUploader onFileUpload={handleFileUpload} />
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

          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as typeof activeTab)}>
            <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 lg:grid-cols-10 gap-1">
              <TabsTrigger value="dashboard" className="text-xs lg:text-sm">
                <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Dashboard</span>
              </TabsTrigger>
              <TabsTrigger value="documents" className="text-xs lg:text-sm">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Documents</span>
              </TabsTrigger>
              <TabsTrigger value="entities" className="text-xs lg:text-sm">
                <Building2 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Entities</span>
              </TabsTrigger>
              <TabsTrigger value="benchmarking" className="text-xs lg:text-sm">
                <BarChart3 className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Benchmark</span>
              </TabsTrigger>
              <TabsTrigger value="risk" className="text-xs lg:text-sm">
                <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Risk</span>
              </TabsTrigger>
              <TabsTrigger value="financial" className="text-xs lg:text-sm">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Financial</span>
              </TabsTrigger>
              <TabsTrigger value="compliance" className="text-xs lg:text-sm">
                <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Compliance</span>
              </TabsTrigger>
              <TabsTrigger value="ai" className="text-xs lg:text-sm">
                <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">AI Tools</span>
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-xs lg:text-sm">
                <Settings className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">Analytics</span>
              </TabsTrigger>
              <TabsTrigger value="reporting" className="text-xs lg:text-sm">
                <FileText className="h-3 w-3 lg:h-4 lg:w-4 mr-1" />
                <span className="hidden sm:inline">CbC Report</span>
              </TabsTrigger>
            </TabsList>

            <TabsContent value="dashboard" className="mt-6">
              <TPOverviewDashboard />
            </TabsContent>

            <TabsContent value="documents" className="mt-6">
              <div className="space-y-4">
                <div className="flex space-x-4 border-b">
                  <button 
                    className={`px-4 py-2 ${documentTab === "master" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setDocumentTab("master")}
                  >
                    Master File
                  </button>
                  <button 
                    className={`px-4 py-2 ${documentTab === "local" ? "border-b-2 border-blue-600 text-blue-600 font-medium" : "text-gray-500 hover:text-gray-700"}`}
                    onClick={() => setDocumentTab("local")}
                  >
                    Local File
                  </button>
                </div>

                {documentTab === "master" ? (
                  <OECDCompliantDocumentWizard />
                ) : (
                  <DocumentList 
                    documents={documents}
                    activeTab={documentTab}
                    onEdit={handleEditDocument}
                    onTitleChange={handleTitleChange}
                    onDelete={handleDeleteDocument}
                  />
                )}
              </div>
            </TabsContent>

            <TabsContent value="entities" className="mt-6">
              <EntityManagement />
            </TabsContent>

            <TabsContent value="benchmarking" className="mt-6">
              <BenchmarkingDashboard />
            </TabsContent>

            <TabsContent value="risk" className="mt-6">
              <RiskAssessmentEngine />
            </TabsContent>

            <TabsContent value="financial" className="mt-6">
              <FinancialDataIntegration />
            </TabsContent>

            <TabsContent value="compliance" className="mt-6">
              <AutomatedComplianceTracker />
            </TabsContent>

            <TabsContent value="ai" className="mt-6">
              <SmartDocumentGenerator />
            </TabsContent>

            <TabsContent value="reporting" className="mt-6">
              <CountryByCountryReporting />
            </TabsContent>

            <TabsContent value="analytics" className="mt-6">
              <div className="text-center py-12">
                <BarChart3 className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                <h3 className="text-lg font-medium mb-2">Advanced Analytics</h3>
                <p className="text-muted-foreground">
                  Advanced analytics and performance tracking coming soon.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <EditDocumentDialog
            document={editingDocument}
            editedContent={editedContent}
            onClose={() => setEditingDocument(null)}
            onSave={saveEditedDocument}
            onContentChange={setEditedContent}
          />

          <ActivityLog activities={activities} />
        </div>
      </DashboardLayout>
    </TransferPricingProvider>
  );
};

export default TransferPricing;
