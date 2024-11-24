import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Share } from "lucide-react";
import DashboardLayout from "@/components/DashboardLayout";

const TransferPricing = () => {
  const documents = [
    { id: 1, title: "Document 1", modified: "Mar 15, 2024" },
    { id: 2, title: "Document 2", modified: "Mar 15, 2024" },
    { id: 3, title: "Document 3", modified: "Mar 15, 2024" },
  ];

  const recentActivity = [
    "Master File template updated",
    "New Local File created for Entity A",
    "Benchmark analysis completed",
    "Documentation reviewed by Tax Team",
  ];

  return (
    <DashboardLayout>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Transfer Pricing Documentation</h1>
          <Button>
            <span className="mr-2">New Document</span>
            <FileText className="h-4 w-4" />
          </Button>
        </div>

        <div className="space-y-4">
          <div className="flex space-x-4 border-b">
            <button className="border-b-2 border-blue-600 px-4 py-2 font-medium text-blue-600">
              Master File
            </button>
            <button className="px-4 py-2 text-gray-500 hover:text-gray-700">
              Local File
            </button>
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
            {documents.map((doc) => (
              <Card key={doc.id} className="overflow-hidden">
                <CardContent className="p-4">
                  <div className="mb-4 flex items-start justify-between">
                    <div>
                      <FileText className="mb-2 h-6 w-6 text-blue-600" />
                      <h3 className="font-medium">{doc.title}</h3>
                      <p className="text-sm text-gray-500">
                        Last modified: {doc.modified}
                      </p>
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
            {recentActivity.map((activity, index) => (
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