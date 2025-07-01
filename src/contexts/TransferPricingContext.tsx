import React, { createContext, useContext, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { TPDocument, TPEntity, TPTransaction, TPDeadline } from "@/types/transfer-pricing";

interface TransferPricingContextType {
  documents: TPDocument[];
  entities: TPEntity[];
  transactions: TPTransaction[];
  deadlines: TPDeadline[];
  loading: boolean;
  fetchDocuments: () => Promise<void>;
  fetchEntities: () => Promise<void>;
  fetchTransactions: () => Promise<void>;
  fetchDeadlines: () => Promise<void>;
  createDocument: (document: Partial<TPDocument>) => Promise<TPDocument | null>;
  updateDocument: (id: string, updates: Partial<TPDocument>) => Promise<void>;
  deleteDocument: (id: string) => Promise<void>;
  createEntity: (entity: Partial<TPEntity>) => Promise<TPEntity | null>;
  updateEntity: (id: string, updates: Partial<TPEntity>) => Promise<void>;
  deleteEntity: (id: string) => Promise<void>;
}

const TransferPricingContext = createContext<TransferPricingContextType>({
  documents: [],
  entities: [],
  transactions: [],
  deadlines: [],
  loading: false,
  fetchDocuments: async () => {},
  fetchEntities: async () => {},
  fetchTransactions: async () => {},
  fetchDeadlines: async () => {},
  createDocument: async () => null,
  updateDocument: async () => {},
  deleteDocument: async () => {},
  createEntity: async () => null,
  updateEntity: async () => {},
  deleteEntity: async () => {},
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
  const [entities, setEntities] = useState<TPEntity[]>([]);
  const [transactions, setTransactions] = useState<TPTransaction[]>([]);
  const [deadlines, setDeadlines] = useState<TPDeadline[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchDocuments = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('transfer_pricing_documents')
        .select('*')
        .eq('created_by', user.id);

      if (error) throw error;

      const typedDocuments: TPDocument[] = (data || []).map(doc => ({
        id: doc.id,
        title: doc.title,
        type: doc.type,
        status: doc.status,
        content: doc.content,
        company_id: doc.company_id,
        created_by: doc.created_by,
        created_at: doc.created_at,
        updated_at: doc.updated_at,
        version: doc.version,
        entity_id: doc.entity_id,
        template_id: doc.template_id,
        jurisdiction: doc.jurisdiction,
        compliance_status: doc.compliance_status,
        risk_level: doc.risk_level,
        last_reviewed_at: doc.last_reviewed_at,
      }));

      setDocuments(typedDocuments);
    } catch (error: any) {
      console.error("Error fetching documents:", error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchEntities = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('tp_entities')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setEntities(data || []);
    } catch (error: any) {
      console.error("Error fetching entities:", error);
      toast.error(error.message);
    }
  };

  const fetchTransactions = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('tp_transactions')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setTransactions(data || []);
    } catch (error: any) {
      console.error("Error fetching transactions:", error);
      toast.error(error.message);
    }
  };

  const fetchDeadlines = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const { data, error } = await supabase
        .from('tp_deadlines')
        .select('*')
        .eq('user_id', user.id);

      if (error) throw error;
      setDeadlines(data || []);
    } catch (error: any) {
      console.error("Error fetching deadlines:", error);
      toast.error(error.message);
    }
  };

  const createDocument = async (document: Partial<TPDocument>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const newDocument = {
        title: document.title,
        type: document.type,
        status: document.status || 'draft',
        content: document.content,
        company_id: document.company_id,
        created_by: user.id,
        version: 1,
        entity_id: document.entity_id,
        template_id: document.template_id,
        jurisdiction: document.jurisdiction,
        compliance_status: document.compliance_status || 'pending',
        risk_level: document.risk_level || 'medium',
      };

      const { data, error } = await supabase
        .from('transfer_pricing_documents')
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
        company_id: data.company_id,
        created_by: data.created_by,
        created_at: data.created_at,
        updated_at: data.updated_at,
        version: data.version,
        entity_id: data.entity_id,
        template_id: data.template_id,
        jurisdiction: data.jurisdiction,
        compliance_status: data.compliance_status,
        risk_level: data.risk_level,
        last_reviewed_at: data.last_reviewed_at,
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
      const updatePayload = {
        title: updates.title,
        type: updates.type,
        status: updates.status,
        content: updates.content,
        company_id: updates.company_id,
        version: updates.version,
        entity_id: updates.entity_id,
        template_id: updates.template_id,
        jurisdiction: updates.jurisdiction,
        compliance_status: updates.compliance_status,
        risk_level: updates.risk_level,
        last_reviewed_at: updates.last_reviewed_at,
      };

      const { error } = await supabase
        .from('transfer_pricing_documents')
        .update(updatePayload)
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev =>
        prev.map(doc =>
          doc.id === id ? { ...doc, ...updates, updated_at: new Date().toISOString() } : doc
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
        .from('transfer_pricing_documents')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setDocuments(prev => prev.filter(doc => doc.id !== id));
      toast.success("Document deleted successfully");
    } catch (error: any) {
      console.error("Error deleting document:", error);
      toast.error(error.message);
    }
  };

  const createEntity = async (entity: Partial<TPEntity>) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("No authenticated user");

      const newEntity = {
        ...entity,
        user_id: user.id,
        functional_analysis: entity.functional_analysis || {},
        financial_data: entity.financial_data || {},
      };

      const { data, error } = await supabase
        .from('tp_entities')
        .insert([newEntity])
        .select()
        .single();

      if (error) throw error;

      setEntities(prev => [...prev, data]);
      return data;
    } catch (error: any) {
      console.error("Error creating entity:", error);
      toast.error(error.message);
      return null;
    }
  };

  const updateEntity = async (id: string, updates: Partial<TPEntity>) => {
    try {
      const { error } = await supabase
        .from('tp_entities')
        .update(updates)
        .eq('id', id);

      if (error) throw error;

      setEntities(prev =>
        prev.map(entity =>
          entity.id === id ? { ...entity, ...updates, updated_at: new Date().toISOString() } : entity
        )
      );

      toast.success("Entity updated successfully");
    } catch (error: any) {
      console.error("Error updating entity:", error);
      toast.error(error.message);
    }
  };

  const deleteEntity = async (id: string) => {
    try {
      const { error } = await supabase
        .from('tp_entities')
        .delete()
        .eq('id', id);

      if (error) throw error;

      setEntities(prev => prev.filter(entity => entity.id !== id));
      toast.success("Entity deleted successfully");
    } catch (error: any) {
      console.error("Error deleting entity:", error);
      toast.error(error.message);
    }
  };

  return (
    <TransferPricingContext.Provider
      value={{
        documents,
        entities,
        transactions,
        deadlines,
        loading,
        fetchDocuments,
        fetchEntities,
        fetchTransactions,
        fetchDeadlines,
        createDocument,
        updateDocument,
        deleteDocument,
        createEntity,
        updateEntity,
        deleteEntity,
      }}
    >
      {children}
    </TransferPricingContext.Provider>
  );
};
