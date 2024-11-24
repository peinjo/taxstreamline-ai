import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Share } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { useState } from "react";
import { toast } from "sonner";

interface Document {
  id: number;
  title: string;
  modified: string;
  type: "master" | "local";
  content?: string;
}

const defaultTemplate = `Transfer Pricing Local File template sample

Below you find a table of contents of a Transfer Pricing local file in the format the OECD describes. The TOC is generated with our software solution at Phester Consult.
The below structure is an example for an entity named [Company] and has four intercompany transactions included.

Table of Contents

• Abbreviations
• 1 Introduction
  ○ Scope and purpose
  ○ Structure of the report
• 2 Executive Summary
  ○ Summary for transaction Sale of goods and materials
  ○ Summary for transaction Provision of Services
  ○ Summary for transaction Licensing of intellectual property
  ○ Summary for transaction Financial Transaction`;

const TransferPricing = () => {
  const [activeTab, setActiveTab] = useState<"master" | "local">("master");
  const [documents, setDocuments] = useState<Document[]>([
    { id: 1, title: "Document 1", modified: "Mar 15, 2024", type: "master" },
    { id: 2, title: "Document 2", modified: "Mar 15, 2024", type: "master" },
    { id: 3, title: "Document 3", modified: "Mar 15, 2024", type: "master" },
    { id: 4, title: "Local File 1", modified: "Mar 16, 2024", type: "local" },
  ]);

  const [isNewDocumentDialogOpen, setIsNewDocumentDialogOpen] = useState(false);

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
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <FileText className="mb-2 h-6 w-6 text-blue-600" />
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        Last modified: {doc.modified}
                      </p>
                      {doc.content && (
                        <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                          {doc.content.split('\n')[0]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button variant="outline" size="sm">
                      <Share className="mr-2 h-4 w-4" />
                      Share
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

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