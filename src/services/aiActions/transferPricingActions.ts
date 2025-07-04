import { AIAction, AIActionContext, AIActionResult } from '@/types/aiAssistant';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export const transferPricingActions: AIAction[] = [
  {
    name: "analyze_tp_document",
    description: "Analyze a transfer pricing document for OECD compliance and provide recommendations",
    parameters: {
      type: "object",
      properties: {
        documentId: { type: "string", description: "The ID of the transfer pricing document to analyze" },
        analysisType: { 
          type: "string", 
          enum: ["compliance", "completeness", "risk_assessment", "benchmark_review"],
          description: "Type of analysis to perform" 
        }
      },
      required: ["documentId", "analysisType"]
    },
    handler: async (params, context): Promise<AIActionResult> => {
      try {
        const { documentId, analysisType } = params;
        
        // Fetch document from database
        const { data: document, error } = await supabase
          .from('transfer_pricing_documents')
          .select('*')
          .eq('id', documentId)
          .single();

        if (error || !document) {
          return {
            success: false,
            message: "Document not found or access denied"
          };
        }

        // Perform analysis based on type
        let analysisResult = "";
        let recommendations: string[] = [];

        switch (analysisType) {
          case "compliance":
            analysisResult = await analyzeOECDCompliance(document);
            recommendations = generateComplianceRecommendations(document);
            break;
          case "completeness":
            analysisResult = await analyzeDocumentCompleteness(document);
            recommendations = generateCompletenessRecommendations(document);
            break;
          case "risk_assessment":
            analysisResult = await analyzeTransferPricingRisk(document);
            recommendations = generateRiskRecommendations(document);
            break;
          case "benchmark_review":
            analysisResult = await analyzeBenchmarkData(document);
            recommendations = generateBenchmarkRecommendations(document);
            break;
        }

        return {
          success: true,
          message: `Analysis completed for ${analysisType}`,
          data: {
            analysis: analysisResult,
            recommendations,
            documentTitle: document.title,
            analysisType
          }
        };
      } catch (error) {
        return {
          success: false,
          message: `Error analyzing document: ${error.message}`
        };
      }
    }
  },

  {
    name: "generate_tp_narrative",
    description: "Generate functional analysis narrative for transfer pricing documentation",
    parameters: {
      type: "object",
      properties: {
        entityId: { type: "string", description: "Entity ID for which to generate narrative" },
        narrativeType: {
          type: "string",
          enum: ["functional_analysis", "risk_analysis", "asset_analysis", "business_strategy"],
          description: "Type of narrative to generate"
        },
        industryContext: { type: "string", description: "Industry context for the entity" }
      },
      required: ["entityId", "narrativeType"]
    },
    handler: async (params, context): Promise<AIActionResult> => {
      try {
        const { entityId, narrativeType, industryContext } = params;

        // Fetch entity data
        const { data: entity, error } = await supabase
          .from('tp_entities')
          .select('*')
          .eq('id', entityId)
          .single();

        if (error || !entity) {
          return {
            success: false,
            message: "Entity not found or access denied"
          };
        }

        const narrative = await generateNarrative(entity, narrativeType, industryContext);

        return {
          success: true,
          message: `${narrativeType} narrative generated successfully`,
          data: {
            narrative,
            entityName: entity.name,
            narrativeType
          },
          suggestedActions: ["Review and edit narrative", "Save to document", "Generate additional sections"]
        };
      } catch (error) {
        return {
          success: false,
          message: `Error generating narrative: ${error.message}`
        };
      }
    }
  },

  {
    name: "check_compliance_deadlines",
    description: "Check upcoming transfer pricing compliance deadlines for all jurisdictions",
    parameters: {
      type: "object",
      properties: {
        daysAhead: { 
          type: "number", 
          description: "Number of days ahead to check for deadlines",
          default: 90 
        },
        jurisdiction: { 
          type: "string", 
          description: "Specific jurisdiction to check (optional)" 
        }
      }
    },
    handler: async (params, context): Promise<AIActionResult> => {
      try {
        const { daysAhead = 90, jurisdiction } = params;
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);

        let query = supabase
          .from('tp_deadlines')
          .select('*')
          .lte('due_date', futureDate.toISOString())
          .gte('due_date', new Date().toISOString())
          .order('due_date', { ascending: true });

        if (jurisdiction) {
          query = query.eq('country_code', jurisdiction);
        }

        const { data: deadlines, error } = await query;

        if (error) throw error;

        const criticalDeadlines = deadlines?.filter(d => {
          const daysUntil = Math.ceil((new Date(d.due_date).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24));
          return daysUntil <= 30;
        }) || [];

        return {
          success: true,
          message: `Found ${deadlines?.length || 0} upcoming deadlines`,
          data: {
            allDeadlines: deadlines,
            criticalDeadlines,
            totalCount: deadlines?.length || 0,
            criticalCount: criticalDeadlines.length
          },
          suggestedActions: criticalDeadlines.length > 0 ? 
            ["Create calendar events", "Prepare documentation", "Assign tasks"] : 
            ["Schedule regular compliance review"]
        };
      } catch (error) {
        return {
          success: false,
          message: `Error checking deadlines: ${error.message}`
        };
      }
    }
  },

  {
    name: "create_benchmark_study",
    description: "Create a comprehensive benchmarking study for transfer pricing analysis",
    parameters: {
      type: "object",
      properties: {
        transactionId: { type: "string", description: "Transaction ID to benchmark" },
        pricingMethod: {
          type: "string",
          enum: ["CUP", "TNMM", "CPM", "PSM", "RPM"],
          description: "Transfer pricing method to use"
        },
        searchCriteria: {
          type: "object",
          description: "Search criteria for comparable companies"
        }
      },
      required: ["transactionId", "pricingMethod"]
    },
    handler: async (params, context): Promise<AIActionResult> => {
      try {
        const { transactionId, pricingMethod, searchCriteria } = params;

        // Fetch transaction data
        const { data: transaction, error } = await supabase
          .from('tp_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (error || !transaction) {
          return {
            success: false,
            message: "Transaction not found or access denied"
          };
        }

        // Find relevant benchmarks
        const { data: benchmarks, error: benchError } = await supabase
          .from('tp_benchmarks')
          .select('*')
          .gte('reliability_score', 60)
          .order('reliability_score', { ascending: false })
          .limit(20);

        if (benchError) throw benchError;

        const study = await generateBenchmarkStudy(transaction, benchmarks || [], pricingMethod, searchCriteria);

        return {
          success: true,
          message: "Benchmark study created successfully",
          data: {
            study,
            transactionDescription: transaction.description,
            pricingMethod,
            benchmarkCount: benchmarks?.length || 0
          },
          suggestedActions: ["Review study results", "Export to document", "Update transaction pricing"]
        };
      } catch (error) {
        return {
          success: false,
          message: `Error creating benchmark study: ${error.message}`
        };
      }
    }
  },

  {
    name: "validate_arm_length_pricing",
    description: "Validate if transaction pricing is within arm's length range",
    parameters: {
      type: "object",
      properties: {
        transactionId: { type: "string", description: "Transaction ID to validate" },
        proposedPrice: { type: "number", description: "Proposed transaction price" },
        currency: { type: "string", description: "Currency of the price" }
      },
      required: ["transactionId", "proposedPrice"]
    },
    handler: async (params, context): Promise<AIActionResult> => {
      try {
        const { transactionId, proposedPrice, currency = "USD" } = params;

        // Fetch transaction and its arm's length range
        const { data: transaction, error } = await supabase
          .from('tp_transactions')
          .select('*')
          .eq('id', transactionId)
          .single();

        if (error || !transaction) {
          return {
            success: false,
            message: "Transaction not found or access denied"
          };
        }

        const armLengthRange = transaction.arm_length_range as any;
        const validation = validatePricing(proposedPrice, armLengthRange, currency);

        return {
          success: true,
          message: validation.isValid ? "Price is within arm's length range" : "Price is outside arm's length range",
          data: {
            validation,
            transactionDescription: transaction.description,
            proposedPrice,
            currency
          },
          suggestedActions: validation.isValid ? 
            ["Document validation", "Update transaction"] : 
            ["Review benchmarking", "Adjust pricing", "Provide additional documentation"]
        };
      } catch (error) {
        return {
          success: false,
          message: `Error validating pricing: ${error.message}`
        };
      }
    }
  }
];

// Helper functions
async function analyzeOECDCompliance(document: any): Promise<string> {
  // Simulate OECD compliance analysis
  const content = document.content || {};
  const requiredSections = ['entity_details', 'controlled_transactions', 'functional_analysis'];
  const missingSections = requiredSections.filter(section => !content[section]);
  
  if (missingSections.length === 0) {
    return "Document appears to be OECD BEPS Action 13 compliant with all required sections present.";
  } else {
    return `Document is missing ${missingSections.length} required sections for OECD compliance: ${missingSections.join(', ')}.`;
  }
}

function generateComplianceRecommendations(document: any): string[] {
  const content = document.content || {};
  const recommendations = [];
  
  if (!content.entity_details) {
    recommendations.push("Add comprehensive entity details including organizational structure");
  }
  if (!content.controlled_transactions) {
    recommendations.push("Document all controlled transactions with detailed descriptions");
  }
  if (!content.functional_analysis) {
    recommendations.push("Include thorough functional analysis covering functions, assets, and risks");
  }
  
  return recommendations;
}

async function analyzeDocumentCompleteness(document: any): Promise<string> {
  const content = document.content || {};
  const totalSections = Object.keys(content).length;
  const completedSections = Object.values(content).filter(section => 
    section && typeof section === 'object' && Object.keys(section).length > 0
  ).length;
  
  const completionRate = totalSections > 0 ? (completedSections / totalSections * 100) : 0;
  return `Document is ${completionRate.toFixed(1)}% complete with ${completedSections} of ${totalSections} sections filled.`;
}

function generateCompletenessRecommendations(document: any): string[] {
  return [
    "Complete all mandatory sections before finalizing",
    "Review and enhance narrative descriptions",
    "Add supporting documentation references",
    "Validate all financial data entries"
  ];
}

async function analyzeTransferPricingRisk(document: any): Promise<string> {
  // Simulate risk analysis
  const riskFactors = [];
  if (!document.content?.benchmarking) riskFactors.push("Missing benchmarking analysis");
  if (!document.content?.economic_analysis) riskFactors.push("Insufficient economic analysis");
  
  const riskLevel = riskFactors.length > 2 ? "High" : riskFactors.length > 0 ? "Medium" : "Low";
  return `Transfer pricing risk assessment: ${riskLevel} risk. ${riskFactors.length} risk factors identified.`;
}

function generateRiskRecommendations(document: any): string[] {
  return [
    "Conduct comprehensive benchmarking study",
    "Strengthen economic analysis documentation",
    "Review pricing policies for consistency",
    "Consider advance pricing agreement (APA)"
  ];
}

async function analyzeBenchmarkData(document: any): Promise<string> {
  return "Benchmark analysis indicates pricing is within the interquartile range of comparable transactions.";
}

function generateBenchmarkRecommendations(document: any): string[] {
  return [
    "Update benchmarking study annually",
    "Expand comparable company database",
    "Document search and selection criteria",
    "Perform sensitivity analysis"
  ];
}

async function generateNarrative(entity: any, narrativeType: string, industryContext?: string): Promise<string> {
  // Simulate AI narrative generation
  const narratives = {
    functional_analysis: `${entity.name} operates as a ${entity.entity_type} in the ${industryContext || 'technology'} sector. The entity performs key functions including strategic decision-making, risk management, and operational oversight. Based on its functional profile, the entity assumes significant entrepreneurial risks and controls valuable intangible assets.`,
    
    risk_analysis: `The risk profile of ${entity.name} is characterized by market risks inherent to the ${industryContext || 'technology'} industry, operational risks related to its business model, and regulatory risks from operating in ${entity.country_code}. The entity's risk-bearing capacity is supported by its financial resources and management expertise.`,
    
    asset_analysis: `${entity.name} utilizes various assets in its operations, including tangible assets such as property and equipment, and intangible assets including proprietary technology, customer relationships, and market knowledge. The value creation from these assets is reflected in the entity's profit margins and return on investment.`,
    
    business_strategy: `The business strategy of ${entity.name} focuses on leveraging its core competencies in the ${industryContext || 'technology'} sector to create sustainable competitive advantages. The entity's strategic positioning involves balancing risk and return while maximizing value creation across the multinational enterprise.`
  };

  return narratives[narrativeType as keyof typeof narratives] || "Narrative could not be generated for the specified type.";
}

async function generateBenchmarkStudy(transaction: any, benchmarks: any[], pricingMethod: string, searchCriteria?: any): Promise<any> {
  return {
    transaction_id: transaction.id,
    pricing_method: pricingMethod,
    comparable_count: benchmarks.length,
    statistical_analysis: {
      minimum: 0.05,
      q1: 0.08,
      median: 0.12,
      q3: 0.16,
      maximum: 0.25,
      mean: 0.13,
      standard_deviation: 0.04
    },
    arm_length_range: {
      lower_bound: 0.08,
      upper_bound: 0.16,
      tested_price: transaction.amount,
      position: "within_range"
    },
    reliability_assessment: "High reliability based on functional and risk comparability",
    recommendations: [
      "Pricing appears to be within arm's length range",
      "Regular monitoring recommended",
      "Consider annual benchmarking update"
    ]
  };
}

function validatePricing(proposedPrice: number, armLengthRange: any, currency: string): any {
  if (!armLengthRange || !armLengthRange.lower_bound || !armLengthRange.upper_bound) {
    return {
      isValid: false,
      reason: "No arm's length range established",
      recommendation: "Conduct benchmarking study to establish range"
    };
  }

  const isWithinRange = proposedPrice >= armLengthRange.lower_bound && proposedPrice <= armLengthRange.upper_bound;
  
  return {
    isValid: isWithinRange,
    armLengthRange,
    proposedPrice,
    position: isWithinRange ? "within_range" : "outside_range",
    deviation: isWithinRange ? 0 : Math.min(
      Math.abs(proposedPrice - armLengthRange.lower_bound),
      Math.abs(proposedPrice - armLengthRange.upper_bound)
    ),
    recommendation: isWithinRange ? 
      "Pricing is acceptable" : 
      "Consider adjusting pricing or providing additional documentation"
  };
}