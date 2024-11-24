import { Document } from "./types";
import { DocumentCard } from "./DocumentCard";

interface DocumentListProps {
  documents: Document[];
  activeTab: "master" | "local";
  onEdit: (doc: Document) => void;
  onTitleChange: (id: number, newTitle: string) => void;
  onDelete: (id: number) => void;
}

export function DocumentList({ 
  documents, 
  activeTab, 
  onEdit, 
  onTitleChange,
  onDelete 
}: DocumentListProps) {
  const filteredDocuments = documents.filter(doc => doc.type === activeTab);

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-3">
      {filteredDocuments.map((doc) => (
        <DocumentCard 
          key={doc.id} 
          doc={doc} 
          onEdit={onEdit}
          onTitleChange={onTitleChange}
          onDelete={onDelete}
        />
      ))}
    </div>
  );
}