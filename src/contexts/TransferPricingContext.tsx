
import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";

export interface TPDocument {
  id: string;
  title: string;
  type: "master" | "local";
  status: "draft" | "published";
  content?: string;
  companyId: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  version: number;
}

interface TransferPricingContextType {
  documents: TPDocument[];
  loading: boolean;
  fetchDocuments: () => Promise<void>;
  createDocument: (document: Partial<TPDocument>) => Promise<TPDocument | null>;
  updateDocument: (id: string, updates: Partial<TPDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
}

const TransferPricingContext = createContext<TransferPricingContextType>({
  documents: [],
  loading: false,
  fetchDocuments: async () => {},
  createDocument: async () => null,
  updateDocument: async () => {},
  deleteDocument: async () => {},
});

export const useTransferPricing = () => {
  const context = useContext(TransferPricingContext);
  if (!context) {
    throw new Error("useTransferPricing must be used within a TransferPricingProvider");
  }
  return context;
};

export const TransferPricingProvider = ({ children }: { children: React.ReactNode }) => {
  const [documents, setDocuments] = useState<TPDocument[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from("transfer_pricing_documents")
        .select("*")
        .eq("created_by", user.id);

      if (error) throw error;

      const typedDocuments = data.map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type as "master" | "local",
        status: doc.status as "draft" | "published",
        content: doc.content,
        companyId: doc.company_id,
        createdBy: doc.created_by,
        createdAt: doc.created_at,
        updatedAt: doc.updated_at,
        version: doc.version,
      }));

      setDocuments(typedDocuments);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const createDocument = async (document: Partial<TPDocument>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const newDocument = {
        ...document,
        created_by: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
        version: 1,
      };

      const { data, error } = await supabase
        .from("transfer_pricing_documents")
        .insert([newDocument])
        .select()
        .single();

      if (error) throw error;

      const typedDocument: TPDocument = {
        id: data.id,
        title: data.title,
        type: data.type,
        status: data.status,
        content: data.content,
        companyId: data.company_id,
        createdBy: data.created_by,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        version: data.version,
      };

      setDocuments(prev => [...prev, typedDocument]);
      return typedDocument;
    } catch (error: any) {
      console.error("Error creating document:", error);
      toast.error(error.message);
      return null;
    }
  };

  const updateDocument = async (id: string, updates: Partial<TPDocument>) => {
    try {
      const { error } = await supabase
        .from("transfer_pricing_documents")
        .update(updates)
        .eq("id", id);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === id ? { ...doc, ...updates, updatedAt: new Date().toISOString() } : doc
        )
      );

      toast.success("Document updated successfully");
    } catch (error: any) {
      console.error("Error updating document:", error);
      toast.error(error.message);
    }
  };

  const deleteDocument = async (id: string) => {
    try {
      const { error } = await supabase
        .from("transfer_pricing_documents")
        .delete()
        .eq("id", id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Document deleted successfully");
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(error.message);
    }
  };

  return (
    <TransferPricingContext.Provider
      value={{
        documents,
        loading,
        fetchDocuments,
        createDocument,
        updateDocument,
        deleteDocument,
      }}
    >
      {children}
    </TransferPricingContext.Provider>
  );
};
