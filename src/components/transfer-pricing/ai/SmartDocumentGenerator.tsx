import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Wand2, FileText, Download, Copy, RefreshCw, CheckCircle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

interface GenerationRequest {
  type: 'narrative' | 'analysis' | 'compliance_check' | 'benchmark_summary';
  entityId?: string;
  transactionId?: string;
  documentId?: string;
  parameters: Record<string, any>;
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
  const [entities, setEntities] = useState<any[]>([]);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [entitiesRes, transactionsRes, documentsRes] = await Promise.all([
        supabase.from('tp_entities').select('id, name, country_code'),
        supabase.from('tp_transactions').select('id, description, transaction_type'),
        supabase.from('transfer_pricing_documents').select('id, title, type')
      ]);

      setEntities(entitiesRes.data || []);
      setTransactions(transactionsRes.data || []);
      setDocuments(documentsRes.data || []);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  const generateContent = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI content generation
      await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate API delay

      const mockContent = await generateMockContent(generationRequest);
      setGeneratedContent(mockContent);
      toast.success('Content generated successfully');
    } catch (error) {
      console.error('Error generating content:', error);
      toast.error('Failed to generate content');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateMockContent = async (request: GenerationRequest): Promise<GeneratedContent> => {
    const mockContents = {
      narrative: {
        content: `The entity operates as a strategic decision-making center within the multinational enterprise, performing critical functions including strategic planning, risk management, and operational oversight. Based on its functional profile and risk assumption, the entity demonstrates significant value creation through its unique capabilities and market position.

The functional analysis reveals that the entity:
- Assumes entrepreneurial risks related to market fluctuations and operational decisions
- Controls valuable intangible assets including proprietary technology and market knowledge
- Performs key decision-making functions that drive value creation across the enterprise
- Maintains operational autonomy while adhering to group-wide policies and procedures

This functional characterization supports the entity's profit attribution and transfer pricing position in accordance with OECD Guidelines and local transfer pricing regulations.`,
        type: 'narrative',
        confidence: 85,
        suggestions: [
          'Consider adding more specific industry context',
          'Include quantitative metrics where available',
          'Reference specific OECD guidelines'
        ],
        sources: ['Entity functional analysis', 'OECD Transfer Pricing Guidelines', 'Local regulations']
      },
      analysis: {
        content: `Economic Analysis Summary:

Transfer Pricing Method: Transactional Net Margin Method (TNMM)
Tested Party: [Entity Name]
Profit Level Indicator: Operating Margin

Benchmarking Results:
- Sample size: 15 comparable companies
- Median operating margin: 12.5%
- Interquartile range: 8.2% - 16.8%
- Entity's actual margin: 14.3%

Conclusion: The tested party's operating margin of 14.3% falls within the interquartile range of comparable companies, indicating compliance with the arm's length principle.

Key Assumptions:
- Comparable companies selected based on functional similarity
- Financial data adjusted for accounting differences
- Analysis period covers three consecutive years`,
        type: 'analysis',
        confidence: 92,
        suggestions: [
          'Validate comparable company selection criteria',
          'Consider sensitivity analysis',
          'Document any adjustments made'
        ],
        sources: ['Benchmarking database', 'Entity financial statements', 'Economic analysis methodology']
      },
      compliance_check: {
        content: `OECD BEPS Action 13 Compliance Assessment:

✅ Master File Requirements:
- Organizational structure documented
- Description of business activities included
- Intangibles owned and used identified
- Financial activities described

✅ Local File Requirements:
- Controlled transactions identified
- Financial information provided
- Transfer pricing methods documented

⚠️ Areas for Improvement:
- Enhanced functional analysis needed for intangible transactions
- Additional benchmarking support for certain transactions
- Documentation of advance pricing agreements

Overall Compliance Score: 87%
Recommended Actions: Address identified gaps within 30 days`,
        type: 'compliance_check',
        confidence: 90,
        suggestions: [
          'Complete functional analysis for intangible transactions',
          'Update benchmarking studies',
          'Review documentation completeness'
        ],
        sources: ['OECD BEPS Action 13', 'Local transfer pricing regulations', 'Document review']
      },
      benchmark_summary: {
        content: `Benchmarking Study Summary:

Search Strategy:
- Industry classification: Technology services
- Geographic scope: Global with regional adjustments
- Size criteria: Revenue $50M - $500M
- Functional criteria: Service provider entities

Statistical Analysis:
- Mean: 11.8%
- Median: 12.5%
- Standard deviation: 3.2%
- 25th percentile: 8.2%
- 75th percentile: 16.8%

Arm's Length Range: 8.2% - 16.8% (interquartile range)

Reliability Assessment: HIGH
- Strong functional comparability
- Adequate sample size
- Recent financial data
- Transparent selection process`,
        type: 'benchmark_summary',
        confidence: 94,
        suggestions: [
          'Consider annual update of benchmarking study',
          'Monitor market conditions for significant changes',
          'Document search and selection rationale'
        ],
        sources: ['Commercial database', 'Comparable company analysis', 'Statistical methodology']
      }
    };

    return mockContents[request.type] || mockContents.narrative;
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
      // In a real implementation, this would update the document with the generated content
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
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Wand2 className="h-5 w-5" />
                Content Generation
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="narrative">Narrative</TabsTrigger>
                  <TabsTrigger value="analysis">Analysis</TabsTrigger>
                </TabsList>

                <TabsContent value="narrative" className="space-y-4">
                  <div>
                    <Label htmlFor="narrative-type">Narrative Type</Label>
                    <Select
                      value={generationRequest.parameters.narrativeType || ''}
                      onValueChange={(value) => 
                        setGenerationRequest(prev => ({
                          ...prev,
                          type: 'narrative',
                          parameters: { ...prev.parameters, narrativeType: value }
                        }))
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
                        setGenerationRequest(prev => ({ ...prev, entityId: value }))
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
                      value={generationRequest.parameters.industryContext || ''}
                      onChange={(e) => 
                        setGenerationRequest(prev => ({
                          ...prev,
                          parameters: { ...prev.parameters, industryContext: e.target.value }
                        }))
                      }
                    />
                  </div>
                </TabsContent>

                <TabsContent value="analysis" className="space-y-4">
                  <div>
                    <Label htmlFor="analysis-type">Analysis Type</Label>
                    <Select
                      value={generationRequest.parameters.analysisType || ''}
                      onValueChange={(value) => 
                        setGenerationRequest(prev => ({
                          ...prev,
                          type: value === 'compliance_check' ? 'compliance_check' : 
                                value === 'benchmark_summary' ? 'benchmark_summary' : 'analysis',
                          parameters: { ...prev.parameters, analysisType: value }
                        }))
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
                        setGenerationRequest(prev => ({ ...prev, transactionId: value }))
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
                        setGenerationRequest(prev => ({ ...prev, documentId: value }))
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
                  value={generationRequest.parameters.additionalContext || ''}
                  onChange={(e) => 
                    setGenerationRequest(prev => ({
                      ...prev,
                      parameters: { ...prev.parameters, additionalContext: e.target.value }
                    }))
                  }
                />
              </div>

              <Button 
                onClick={generateContent} 
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
        </div>

        {/* Generated Content */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  Generated Content
                </CardTitle>
                {generatedContent && (
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={copyToClipboard}>
                      <Copy className="h-4 w-4 mr-1" />
                      Copy
                    </Button>
                    <Button variant="outline" size="sm" onClick={downloadContent}>
                      <Download className="h-4 w-4 mr-1" />
                      Download
                    </Button>
                    {generationRequest.documentId && (
                      <Button size="sm" onClick={saveToDocument}>
                        <CheckCircle className="h-4 w-4 mr-1" />
                        Save to Document
                      </Button>
                    )}
                  </div>
                )}
              </div>
            </CardHeader>
            <CardContent>
              {isGenerating ? (
                <div className="flex items-center justify-center py-12">
                  <div className="text-center">
                    <RefreshCw className="h-12 w-12 mx-auto mb-4 animate-spin text-primary" />
                    <p className="text-muted-foreground">Generating content with AI...</p>
                  </div>
                </div>
              ) : generatedContent ? (
                <div className="space-y-4">
                  {/* Content Quality Indicators */}
                  <div className="flex items-center gap-4 p-3 bg-muted rounded-lg">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline">
                        Confidence: {generatedContent.confidence}%
                      </Badge>
                      <Badge variant={generatedContent.confidence >= 90 ? 'default' : 
                                   generatedContent.confidence >= 80 ? 'secondary' : 'destructive'}>
                        {generatedContent.confidence >= 90 ? 'High Quality' :
                         generatedContent.confidence >= 80 ? 'Good Quality' : 'Review Required'}
                      </Badge>
                    </div>
                  </div>

                  {/* Generated Text */}
                  <div className="prose max-w-none">
                    <div className="whitespace-pre-wrap bg-background border rounded-lg p-4">
                      {generatedContent.content}
                    </div>
                  </div>

                  {/* Suggestions */}
                  {generatedContent.suggestions.length > 0 && (
                    <Alert>
                      <AlertDescription>
                        <strong>AI Suggestions:</strong>
                        <ul className="mt-2 list-disc list-inside">
                          {generatedContent.suggestions.map((suggestion, index) => (
                            <li key={index} className="text-sm">{suggestion}</li>
                          ))}
                        </ul>
                      </AlertDescription>
                    </Alert>
                  )}

                  {/* Sources */}
                  <div className="text-sm text-muted-foreground">
                    <strong>Sources:</strong> {generatedContent.sources.join(', ')}
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-muted-foreground">
                  <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground/50" />
                  <p>Configure your generation parameters and click "Generate Content" to begin.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}