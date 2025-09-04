import React, { useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { EntityData, TransactionData, DocumentData } from '@/types/transfer-pricing';
import { ContentGenerationForm } from './ContentGenerationForm';
import { GeneratedContentDisplay } from './GeneratedContentDisplay';
import { aiContentService } from '@/services/aiContentGeneration';
import { useOptimizedQuery } from '@/hooks/useOptimizedQueries';
import { queryKeys } from '@/lib/performance/queryOptimization';

interface GenerationRequest {
  type: 'narrative' | 'analysis' | 'compliance_check' | 'benchmark_summary';
  entityId?: string;
  transactionId?: string;
  documentId?: string;
  parameters: Record<string, unknown>;
}

interface GeneratedContent {
  content: string;
  type: string;
  confidence: number;
  suggestions: string[];
  sources: string[];
}

export function SmartDocumentGenerator() {
  const [activeTab, setActiveTab] = useState('narrative');
  const [generationRequest, setGenerationRequest] = useState<GenerationRequest>({
    type: 'narrative',
    parameters: {}
  });
  const [generatedContent, setGeneratedContent] = useState<GeneratedContent | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);

  // Use optimized queries for data fetching
  const { data: entities = [] } = useOptimizedQuery(
    queryKeys.tpEntities(),
    async () => {
      const { data } = await supabase.from('tp_entities').select('id, name, country_code');
      return data || [];
    }
  );

  const { data: transactions = [] } = useOptimizedQuery(
    ['tp-transactions'],
    async () => {
      const { data } = await supabase.from('tp_transactions').select('id, description, transaction_type');
      return data || [];
    }
  );

  const { data: documents = [] } = useOptimizedQuery(
    queryKeys.tpDocuments(),
    async () => {
      const { data } = await supabase.from('transfer_pricing_documents').select('id, title, type');
      return data || [];
    }
  );

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      const content = await aiContentService.generateContent(generationRequest);
      setGeneratedContent(content);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };


  const copyToClipboard = () => {
    if (generatedContent) {
      navigator.clipboard.writeText(generatedContent.content);
      toast.success('Content copied to clipboard');
    }
  };

  const downloadContent = () => {
    if (generatedContent) {
      const blob = new Blob([generatedContent.content], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `generated-${generationRequest.type}-${Date.now()}.txt`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      toast.success('Content downloaded');
    }
  };

  const saveToDocument = async () => {
    if (!generatedContent || !generationRequest.documentId) {
      toast.error('Please select a document to save to');
      return;
    }

    try {
      await aiContentService.saveGeneratedContent(
        generationRequest.documentId,
        generatedContent.content
      );
      toast.success('Content saved to document');
    } catch (error) {
      toast.error('Failed to save content');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Smart Document Generator</h2>
          <p className="text-muted-foreground">
            AI-powered content generation for transfer pricing documentation
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Generation Controls */}
        <div className="lg:col-span-1">
          <ContentGenerationForm
            activeTab={activeTab}
            onTabChange={setActiveTab}
            generationRequest={generationRequest}
            onRequestChange={setGenerationRequest}
            entities={entities}
            transactions={transactions}
            documents={documents}
            isGenerating={isGenerating}
            onGenerate={generateContent}
          />
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-2">
          <GeneratedContentDisplay
            content={generatedContent}
            onCopyToClipboard={copyToClipboard}
            onDownload={downloadContent}
            onSaveToDocument={saveToDocument}
            canSaveToDocument={!!generationRequest.documentId}
          />
        </div>
      </div>
    </div>
  );
}