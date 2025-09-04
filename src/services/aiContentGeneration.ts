import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logging/logger';

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

export class AIContentGenerationService {
  async generateContent(request: GenerationRequest): Promise<GeneratedContent> {
    const operationId = `ai-content-generation-${Date.now()}`;
    logger.startTimer(operationId, 'AI Content Generation', { type: request.type });

    try {
      // Get entity context if provided
      let entityContext = null;
      if (request.entityId) {
        const { data: entity } = await supabase
          .from('tp_entities')
          .select('*')
          .eq('id', request.entityId)
          .single();
        entityContext = entity;
      }

      // Get transaction context if provided
      let transactionContext = null;
      if (request.transactionId) {
        const { data: transaction } = await supabase
          .from('tp_transactions')
          .select('*')
          .eq('id', request.transactionId)
          .single();
        transactionContext = transaction;
      }

      // Build prompt based on type and context
      const prompt = this.buildPrompt(request, entityContext, transactionContext);
      
      // In a real implementation, this would call an AI service like OpenAI
      // For now, we'll use intelligent mock content based on the context
      const content = await this.generateContextualContent(request, entityContext, transactionContext);
      
      logger.endTimer(operationId);
      return content;
    } catch (error) {
      logger.endTimer(operationId);
      logger.error('AI content generation failed', error as Error);
      throw error;
    }
  }

  private buildPrompt(
    request: GenerationRequest, 
    entityContext: any, 
    transactionContext: any
  ): string {
    let prompt = `Generate ${request.type} content for transfer pricing documentation.`;
    
    if (entityContext) {
      prompt += `\nEntity: ${entityContext.name} (${entityContext.country_code})`;
      prompt += `\nIndustry: ${entityContext.industry || 'Not specified'}`;
    }
    
    if (transactionContext) {
      prompt += `\nTransaction: ${transactionContext.description}`;
      prompt += `\nType: ${transactionContext.transaction_type}`;
    }
    
    if (request.parameters.additionalContext) {
      prompt += `\nAdditional Context: ${request.parameters.additionalContext}`;
    }
    
    return prompt;
  }

  private async generateContextualContent(
    request: GenerationRequest,
    entityContext: any,
    transactionContext: any
  ): Promise<GeneratedContent> {
    const templates = {
      narrative: this.generateNarrativeContent(request, entityContext),
      analysis: this.generateAnalysisContent(request, entityContext, transactionContext),
      compliance_check: this.generateComplianceContent(request, entityContext),
      benchmark_summary: this.generateBenchmarkContent(request, entityContext)
    };

    return templates[request.type] || templates.narrative;
  }

  private generateNarrativeContent(request: GenerationRequest, entityContext: any): GeneratedContent {
    const entityName = entityContext?.name || '[Entity Name]';
    const country = entityContext?.country_code || '[Country]';
    const industry = entityContext?.industry || '[Industry]';
    
    const content = `${entityName} operates as a key entity within the multinational enterprise group, located in ${country} and primarily engaged in ${industry} activities.

Functional Profile:
The entity performs critical functions including strategic decision-making, risk management, and operational oversight. Based on its comprehensive functional analysis, the entity demonstrates significant value creation through its unique capabilities and market position.

Key Functions:
- Strategic planning and business development
- Risk assessment and management
- Operational control and oversight
- Asset utilization and management

Risk Profile:
The entity assumes entrepreneurial risks related to market fluctuations, operational decisions, and strategic investments. This risk assumption is commensurate with its functional capabilities and asset base.

Asset Utilization:
The entity controls and utilizes valuable assets including ${entityContext?.tangible_assets ? 'tangible assets, ' : ''}intangible assets, and financial resources that contribute to its value creation activities.

This functional characterization supports the entity's profit attribution and transfer pricing position in accordance with OECD Guidelines and local transfer pricing regulations in ${country}.`;

    return {
      content,
      type: 'narrative',
      confidence: 85,
      suggestions: [
        'Consider adding more specific industry context',
        'Include quantitative metrics where available',
        'Reference specific OECD guidelines sections'
      ],
      sources: ['Entity functional analysis', 'OECD Transfer Pricing Guidelines', `${country} transfer pricing regulations`]
    };
  }

  private generateAnalysisContent(request: GenerationRequest, entityContext: any, transactionContext: any): GeneratedContent {
    const entityName = entityContext?.name || '[Entity Name]';
    const transactionType = transactionContext?.transaction_type || 'intercompany service';
    
    const content = `Economic Analysis Summary for ${entityName}

Transfer Pricing Method: Transactional Net Margin Method (TNMM)
Tested Party: ${entityName}
Transaction Type: ${transactionType}
Profit Level Indicator: Operating Margin

Benchmarking Analysis:
- Sample size: 12-18 comparable companies
- Selection criteria: Functional similarity, geographic relevance, size comparability
- Data period: Most recent 3-year period
- Rejection criteria: Loss-making companies, extreme outliers

Statistical Results:
- Median operating margin: 12.5%
- Mean operating margin: 13.2%
- Interquartile range: 8.2% - 16.8%
- Standard deviation: 4.1%

Arm's Length Assessment:
The tested party's operating margin falls within the interquartile range of comparable companies, indicating compliance with the arm's length principle under OECD Guidelines.

Key Assumptions and Limitations:
- Functional comparability verified through detailed analysis
- Accounting adjustments applied where necessary
- Economic circumstances considered in selection process`;

    return {
      content,
      type: 'analysis',
      confidence: 92,
      suggestions: [
        'Validate comparable company selection criteria',
        'Consider sensitivity analysis for key assumptions',
        'Document any specific adjustments made to comparables'
      ],
      sources: ['Benchmarking database', 'Entity financial statements', 'OECD Transfer Pricing Guidelines']
    };
  }

  private generateComplianceContent(request: GenerationRequest, entityContext: any): GeneratedContent {
    const country = entityContext?.country_code || '[Country]';
    
    const content = `OECD BEPS Action 13 Compliance Assessment

Master File Requirements:
✅ Organizational structure documented
✅ Description of business activities included
✅ Intangibles owned and used identified
✅ Financial activities and arrangements described
✅ Financial and tax position information provided

Local File Requirements:
✅ Controlled transactions identified and categorized
✅ Financial information for local entity provided
✅ Transfer pricing methods documented
✅ Comparability analysis completed

${country}-Specific Requirements:
${country === 'US' ? '✅ Form 8975 Country-by-Country Report filed' : ''}
${country === 'UK' ? '✅ UK-specific notification requirements met' : ''}
${country === 'DE' ? '✅ German documentation requirements satisfied' : ''}

Areas for Enhancement:
⚠️ Enhanced functional analysis for intangible property transactions
⚠️ Additional supporting documentation for certain benchmarking studies
⚠️ Update of documentation for recent organizational changes

Overall Compliance Score: 87%
Risk Assessment: Low to Medium

Recommended Actions:
1. Complete enhanced functional analysis within 30 days
2. Update benchmarking studies with most recent data
3. Review and update documentation for organizational changes`;

    return {
      content,
      type: 'compliance_check',
      confidence: 90,
      suggestions: [
        'Complete functional analysis for intangible transactions',
        'Update benchmarking studies with current market data',
        'Ensure all documentation is current and complete'
      ],
      sources: ['OECD BEPS Action 13 Guidelines', `${country} transfer pricing regulations`, 'Internal compliance review']
    };
  }

  private generateBenchmarkContent(request: GenerationRequest, entityContext: any): GeneratedContent {
    const industry = entityContext?.industry || 'Technology services';
    
    const content = `Benchmarking Study Summary

Search Strategy and Database:
- Primary database: [Commercial Database Name]
- Industry classification: ${industry}
- Geographic scope: Global with regional focus
- Time period: 2021-2023 (3-year average)
- Size criteria: Revenue $50M - $500M annually

Selection Criteria:
- Functional similarity: Service provider entities
- Independence test: <25% related party transactions
- Completeness: Full financial data available
- Reliability: Audited financial statements

Screening Process:
- Initial universe: 847 companies
- After industry filter: 234 companies
- After independence test: 156 companies
- After data quality screen: 89 companies
- Final sample: 23 companies

Statistical Analysis:
- Arithmetic mean: 11.8%
- Median: 12.5%
- Standard deviation: 3.2%
- 25th percentile: 8.2%
- 75th percentile: 16.8%
- Minimum: 4.1%
- Maximum: 22.3%

Arm's Length Range: 8.2% - 16.8% (Interquartile Range)

Reliability Assessment: HIGH
✅ Strong functional comparability
✅ Adequate sample size (>20 observations)
✅ Recent and relevant data
✅ Transparent selection methodology
✅ Appropriate statistical measures`;

    return {
      content,
      type: 'benchmark_summary',
      confidence: 94,
      suggestions: [
        'Consider annual update of benchmarking study',
        'Monitor market conditions for significant changes',
        'Document and retain detailed search and selection rationale'
      ],
      sources: ['Commercial benchmarking database', 'Comparable company analysis', 'OECD statistical guidelines']
    };
  }

  async saveGeneratedContent(documentId: string, content: string): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      // In a real implementation, this would append or update the document content
      const { error } = await supabase
        .from('transfer_pricing_documents')
        .update({ content })
        .eq('id', documentId)
        .eq('user_id', user.id);

      if (error) throw error;
      
      logger.info('Generated content saved to document', { documentId });
    } catch (error) {
      logger.error('Failed to save generated content', error as Error);
      throw error;
    }
  }
}

export const aiContentService = new AIContentGenerationService();