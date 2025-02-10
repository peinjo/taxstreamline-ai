
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { TPDocument, TPTransaction, TPBenchmark } from '@/types/transfer-pricing';
import { toast } from 'sonner';

interface TransferPricingContextType {
  documents: TPDocument[];
  currentDocument: TPDocument | null;
  loading: boolean;
  createDocument: (doc: Partial<TPDocument>) => Promise<void>;
  updateDocument: (id: string, updates: Partial<TPDocument>) => Promise<void>;
  approveDocument: (id: string) => Promise<void>;
  rejectDocument: (id: string) => Promise<void>;
  uploadSupportingDoc: (docId: string, file: File) => Promise<void>;
}

const TransferPricingContext = createContext<TransferPricingContextType | undefined>(undefined);

export function TransferPricingProvider({ children }: { children: React.ReactNode }) {
  const [documents, setDocuments] = useState<TPDocument[]>([]);
  const [currentDocument, setCurrentDocument] = useState<TPDocument | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDocuments();
  }, []);

  async function fetchDocuments() {
    try {
      const { data, error } = await supabase
        .from('tp_documents')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setDocuments(data);
    } catch (error) {
      toast.error('Error fetching documents');
    } finally {
      setLoading(false);
    }
  }

  async function createDocument(doc: Partial<TPDocument>) {
    try {
      const { data, error } = await supabase
        .from('tp_documents')
        .insert([doc])
        .select()
        .single();

      if (error) throw error;
      setDocuments([...documents, data]);
      toast.success('Document created successfully');
    } catch (error) {
      toast.error('Error creating document');
    }
  }

  async function updateDocument(id: string, updates: Partial<TPDocument>) {
    try {
      const { error } = await supabase
        .from('tp_documents')
        .update(updates)
        .eq('id', id);

      if (error) throw error;
      await fetchDocuments();
      toast.success('Document updated successfully');
    } catch (error) {
      toast.error('Error updating document');
    }
  }

  async function approveDocument(id: string) {
    try {
      const { error } = await supabase
        .from('tp_documents')
        .update({ status: 'approved', approvedBy: supabase.auth.user()?.id })
        .eq('id', id);

      if (error) throw error;
      await fetchDocuments();
      toast.success('Document approved successfully');
    } catch (error) {
      toast.error('Error approving document');
    }
  }

  async function rejectDocument(id: string) {
    try {
      const { error } = await supabase
        .from('tp_documents')
        .update({ status: 'rejected' })
        .eq('id', id);

      if (error) throw error;
      await fetchDocuments();
      toast.success('Document rejected');
    } catch (error) {
      toast.error('Error rejecting document');
    }
  }

  async function uploadSupportingDoc(docId: string, file: File) {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${docId}/${Date.now()}.${fileExt}`;
      
      const { error: uploadError } = await supabase.storage
        .from('supporting-docs')
        .upload(fileName, file);

      if (uploadError) throw uploadError;
      toast.success('File uploaded successfully');
    } catch (error) {
      toast.error('Error uploading file');
    }
  }

  const value = {
    documents,
    currentDocument,
    loading,
    createDocument,
    updateDocument,
    approveDocument,
    rejectDocument,
    uploadSupportingDoc,
  };

  return (
    <TransferPricingContext.Provider value={value}>
      {children}
    </TransferPricingContext.Provider>
  );
}

export const useTransferPricing = () => {
  const context = useContext(TransferPricingContext);
  if (context === undefined) {
    throw new Error('useTransferPricing must be used within a TransferPricingProvider');
  }
  return context;
};
