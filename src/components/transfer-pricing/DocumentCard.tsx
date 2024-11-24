import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { FileText, Download, Share, Edit2 } from "lucide-react";
import { Document } from "./types";

interface DocumentCardProps {
  doc: Document;
  onEdit: (doc: Document) => void;
}

export function DocumentCard({ doc, onEdit }: DocumentCardProps) {
  return (
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
          <Button variant="outline" size="sm" onClick={() => onEdit(doc)}>
            <Edit2 className="mr-2 h-4 w-4" />
            Edit
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}