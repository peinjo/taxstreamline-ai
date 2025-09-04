import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, RefreshCw } from 'lucide-react';
import { EntityData, TransactionData, DocumentData } from '@/types/transfer-pricing';

interface GenerationRequest {
  type: 'narrative' | 'analysis' | 'compliance_check' | 'benchmark_summary';
  entityId?: string;
  transactionId?: string;
  documentId?: string;
  parameters: Record<string, unknown>;
}

interface ContentGenerationFormProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  generationRequest: GenerationRequest;
  onRequestChange: (request: GenerationRequest) => void;
  entities: EntityData[];
  transactions: TransactionData[];
  documents: DocumentData[];
  isGenerating: boolean;
  onGenerate: () => void;
}

export const ContentGenerationForm: React.FC<ContentGenerationFormProps> = ({
  activeTab,
  onTabChange,
  generationRequest,
  onRequestChange,
  entities,
  transactions,
  documents,
  isGenerating,
  onGenerate
}) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Wand2 className="h-5 w-5" />
          Content Generation
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Tabs value={activeTab} onValueChange={onTabChange}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="narrative">Narrative</TabsTrigger>
            <TabsTrigger value="analysis">Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value="narrative" className="space-y-4">
            <div>
              <Label htmlFor="narrative-type">Narrative Type</Label>
              <Select
                value={String(generationRequest.parameters.narrativeType || '')}
                onValueChange={(value) => 
                  onRequestChange({
                    ...generationRequest,
                    type: 'narrative',
                    parameters: { ...generationRequest.parameters, narrativeType: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select narrative type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="functional_analysis">Functional Analysis</SelectItem>
                  <SelectItem value="risk_analysis">Risk Analysis</SelectItem>
                  <SelectItem value="asset_analysis">Asset Analysis</SelectItem>
                  <SelectItem value="business_strategy">Business Strategy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="entity-select">Entity</Label>
              <Select
                value={generationRequest.entityId || ''}
                onValueChange={(value) => 
                  onRequestChange({ ...generationRequest, entityId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select entity" />
                </SelectTrigger>
                <SelectContent>
                  {entities.map(entity => (
                    <SelectItem key={entity.id} value={entity.id}>
                      {entity.name} ({entity.country_code})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="industry-context">Industry Context</Label>
              <Input
                id="industry-context"
                placeholder="e.g., Technology, Manufacturing"
                value={String(generationRequest.parameters.industryContext || '')}
                onChange={(e) => 
                  onRequestChange({
                    ...generationRequest,
                    parameters: { ...generationRequest.parameters, industryContext: e.target.value }
                  })
                }
              />
            </div>
          </TabsContent>

          <TabsContent value="analysis" className="space-y-4">
            <div>
              <Label htmlFor="analysis-type">Analysis Type</Label>
              <Select
                value={String(generationRequest.parameters.analysisType || '')}
                onValueChange={(value) => 
                  onRequestChange({
                    ...generationRequest,
                    type: value === 'compliance_check' ? 'compliance_check' : 
                          value === 'benchmark_summary' ? 'benchmark_summary' : 'analysis',
                    parameters: { ...generationRequest.parameters, analysisType: value }
                  })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select analysis type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="economic_analysis">Economic Analysis</SelectItem>
                  <SelectItem value="compliance_check">Compliance Check</SelectItem>
                  <SelectItem value="benchmark_summary">Benchmark Summary</SelectItem>
                  <SelectItem value="risk_assessment">Risk Assessment</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="transaction-select">Transaction (Optional)</Label>
              <Select
                value={generationRequest.transactionId || ''}
                onValueChange={(value) => 
                  onRequestChange({ ...generationRequest, transactionId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select transaction" />
                </SelectTrigger>
                <SelectContent>
                  {transactions.map(transaction => (
                    <SelectItem key={transaction.id} value={transaction.id}>
                      {transaction.description} ({transaction.transaction_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="document-select">Target Document (Optional)</Label>
              <Select
                value={generationRequest.documentId || ''}
                onValueChange={(value) => 
                  onRequestChange({ ...generationRequest, documentId: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select document" />
                </SelectTrigger>
                <SelectContent>
                  {documents.map(document => (
                    <SelectItem key={document.id} value={document.id}>
                      {document.title} ({document.type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </TabsContent>
        </Tabs>

        <div>
          <Label htmlFor="additional-context">Additional Context</Label>
          <Textarea
            id="additional-context"
            placeholder="Provide any additional context or requirements..."
            value={String(generationRequest.parameters.additionalContext || '')}
            onChange={(e) => 
              onRequestChange({
                ...generationRequest,
                parameters: { ...generationRequest.parameters, additionalContext: e.target.value }
              })
            }
          />
        </div>

        <Button 
          onClick={onGenerate} 
          disabled={isGenerating}
          className="w-full"
        >
          {isGenerating ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Wand2 className="h-4 w-4 mr-2" />
              Generate Content
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
};