import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { FileText, Download, Share, Edit2, Check, X } from "lucide-react";
import { Document } from "./types";
import { useState } from "react";

interface DocumentCardProps {
  doc: Document;
  onEdit: (doc: Document) => void;
  onTitleChange: (id: number, newTitle: string) => void;
}

export function DocumentCard({ doc, onEdit, onTitleChange }: DocumentCardProps) {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(doc.title);

  const handleTitleSave = () => {
    onTitleChange(doc.id, tempTitle);
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setTempTitle(doc.title);
    setIsEditingTitle(false);
  };

  return (
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
              <p className="mt-2 text-sm text-gray-600 line-clamp-3">
                {doc.content.split("\n")[0]}
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