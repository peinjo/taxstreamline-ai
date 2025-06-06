
import { AIAction } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";
import { subDays, subMonths, format, startOfMonth, endOfMonth } from "date-fns";

export const analyticsActions: AIAction[] = [
  {
    name: "analyze_compliance_trends",
    description: "Analyze compliance performance trends over time",
    parameters: {
      type: "object",
      properties: {
        period: {
          type: "string",
          enum: ["30days", "3months", "6months", "1year"],
          description: "Analysis period"
        },
        metric: {
          type: "string",
          enum: ["completion_rate", "overdue_items", "by_country", "by_priority"],
          description: "Metric to analyze"
        }
      }
    },
    handler: async (params, context) => {
      const period = params.period || "3months";
      const metric = params.metric || "completion_rate";
      
      try {
        const { data: complianceItems, error } = await supabase
          .from("compliance_items")
          .select("*")
          .eq("user_id", context.user.id);

        if (error) throw error;

        const now = new Date();
        const periodDays = {
          "30days": 30,
          "3months": 90,
          "6months": 180,
          "1year": 365
        }[period];

        const startDate = subDays(now, periodDays);
        const relevantItems = complianceItems?.filter(item => 
          new Date(item.created_at) >= startDate
        ) || [];

        let analysis: any = {};

        switch (metric) {
          case "completion_rate":
            const total = relevantItems.length;
            const completed = relevantItems.filter(item => item.status === 'compliant').length;
            const rate = total > 0 ? (completed / total * 100).toFixed(1) : 0;
            
            analysis = {
              total_items: total,
              completed_items: completed,
              completion_rate: `${rate}%`,
              trend: total > 0 ? (completed > total * 0.8 ? "Excellent" : completed > total * 0.6 ? "Good" : "Needs Improvement") : "No data"
            };
            break;

          case "overdue_items":
            const overdue = relevantItems.filter(item => item.status === 'overdue').length;
            const overdueRate = relevantItems.length > 0 ? (overdue / relevantItems.length * 100).toFixed(1) : 0;
            
            analysis = {
              total_overdue: overdue,
              overdue_rate: `${overdueRate}%`,
              risk_level: overdue === 0 ? "Low" : overdue < 3 ? "Medium" : "High"
            };
            break;

          case "by_country":
            const byCountry = relevantItems.reduce((acc, item) => {
              acc[item.country] = (acc[item.country] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            analysis = {
              countries: Object.keys(byCountry).length,
              distribution: byCountry,
              most_active: Object.entries(byCountry).sort(([,a], [,b]) => b - a)[0]?.[0] || "None"
            };
            break;

          case "by_priority":
            const byPriority = relevantItems.reduce((acc, item) => {
              acc[item.priority] = (acc[item.priority] || 0) + 1;
              return acc;
            }, {} as Record<string, number>);
            
            analysis = {
              priority_distribution: byPriority,
              high_priority_items: byPriority.high || 0,
              urgent_items: byPriority.urgent || 0
            };
            break;
        }

        return {
          success: true,
          message: `Compliance ${metric.replace('_', ' ')} analysis for the last ${period} completed. ${analysis.trend ? `Trend: ${analysis.trend}` : ''}`,
          data: {
            period,
            metric,
            analysis,
            insights: generateComplianceInsights(analysis, metric)
          },
          suggestedActions: ["get_compliance_summary", "create_compliance_item"]
        };

      } catch (error) {
        return {
          success: false,
          message: `Failed to analyze compliance trends: ${error.message}`
        };
      }
    }
  },
  {
    name: "identify_tax_opportunities",
    description: "Identify tax optimization opportunities based on calculation history",
    parameters: {
      type: "object",
      properties: {
        tax_type: {
          type: "string",
          enum: ["all", "income", "corporate", "vat", "withholding"],
          description: "Tax type to analyze"
        },
        analysis_depth: {
          type: "string",
          enum: ["basic", "detailed"],
          description: "Level of analysis detail"
        }
      }
    },
    handler: async (params, context) => {
      const taxType = params.tax_type || "all";
      const analysisDepth = params.analysis_depth || "basic";

      try {
        let query = supabase
          .from("tax_calculations")
          .select("*")
          .eq("user_id", context.user.id)
          .order("created_at", { ascending: false })
          .limit(50);

        if (taxType !== "all") {
          query = query.eq("tax_type", taxType);
        }

        const { data: calculations, error } = await query;
        if (error) throw error;

        const opportunities = [];
        const insights = [];

        if (calculations && calculations.length > 0) {
          // Analyze patterns in tax calculations
          const avgTaxAmount = calculations.reduce((sum, calc) => sum + calc.tax_amount, 0) / calculations.length;
          const totalTaxPaid = calculations.reduce((sum, calc) => sum + calc.tax_amount, 0);
          const highestTax = Math.max(...calculations.map(calc => calc.tax_amount));
          const lowestTax = Math.min(...calculations.map(calc => calc.tax_amount));

          // Basic opportunities
          if (avgTaxAmount > 100000) {
            opportunities.push({
              type: "deduction_review",
              title: "Review Available Deductions",
              description: "Your average tax amount suggests reviewing all available deductions and allowances",
              potential_savings: avgTaxAmount * 0.1,
              priority: "high"
            });
          }

          if (calculations.filter(calc => calc.tax_type === 'vat').length > 5) {
            opportunities.push({
              type: "vat_optimization",
              title: "VAT Input Tax Claims",
              description: "Regular VAT calculations indicate potential for optimizing input tax claims",
              potential_savings: totalTaxPaid * 0.05,
              priority: "medium"
            });
          }

          // Detailed analysis
          if (analysisDepth === "detailed") {
            const monthlyPattern = calculations.reduce((acc, calc) => {
              const month = format(new Date(calc.created_at), 'yyyy-MM');
              acc[month] = (acc[month] || 0) + calc.tax_amount;
              return acc;
            }, {} as Record<string, number>);

            if (Object.keys(monthlyPattern).length > 3) {
              const variance = calculateVariance(Object.values(monthlyPattern));
              if (variance > avgTaxAmount * 0.3) {
                opportunities.push({
                  type: "timing_optimization",
                  title: "Income/Expense Timing",
                  description: "High variance in monthly tax amounts suggests potential timing optimization",
                  potential_savings: variance * 0.2,
                  priority: "medium"
                });
              }
            }
          }

          insights.push(
            `You've made ${calculations.length} tax calculations with an average tax amount of ₦${avgTaxAmount.toLocaleString()}`,
            `Total tax computed: ₦${totalTaxPaid.toLocaleString()}`,
            `Tax range: ₦${lowestTax.toLocaleString()} - ₦${highestTax.toLocaleString()}`
          );
        }

        const totalPotentialSavings = opportunities.reduce((sum, opp) => sum + (opp.potential_savings || 0), 0);

        return {
          success: true,
          message: `Tax optimization analysis completed. Found ${opportunities.length} opportunities with potential savings of ₦${totalPotentialSavings.toLocaleString()}`,
          data: {
            opportunities,
            insights,
            total_potential_savings: totalPotentialSavings,
            analysis_period: "Last 50 calculations",
            recommendations: generateTaxRecommendations(opportunities)
          },
          suggestedActions: ["calculate_tax", "get_dashboard_metrics"]
        };

      } catch (error) {
        return {
          success: false,
          message: `Failed to identify tax opportunities: ${error.message}`
        };
      }
    }
  },
  {
    name: "generate_risk_assessment",
    description: "Generate comprehensive risk assessment report",
    parameters: {
      type: "object",
      properties: {
        scope: {
          type: "string",
          enum: ["compliance", "tax", "operational", "comprehensive"],
          description: "Scope of risk assessment"
        },
        risk_tolerance: {
          type: "string",
          enum: ["low", "medium", "high"],
          description: "Risk tolerance level"
        }
      }
    },
    handler: async (params, context) => {
      const scope = params.scope || "comprehensive";
      const riskTolerance = params.risk_tolerance || "medium";

      try {
        const risks = [];
        const mitigationStrategies = [];

        // Fetch relevant data based on scope
        if (scope === "compliance" || scope === "comprehensive") {
          const { data: complianceItems } = await supabase
            .from("compliance_items")
            .select("*")
            .eq("user_id", context.user.id);

          const overdueItems = complianceItems?.filter(item => item.status === 'overdue').length || 0;
          const highPriorityItems = complianceItems?.filter(item => item.priority === 'high' || item.priority === 'urgent').length || 0;

          if (overdueItems > 0) {
            risks.push({
              category: "compliance",
              type: "overdue_obligations",
              severity: overdueItems > 5 ? "high" : overdueItems > 2 ? "medium" : "low",
              description: `${overdueItems} overdue compliance items`,
              impact: "Potential penalties and regulatory action",
              likelihood: "high"
            });

            mitigationStrategies.push({
              risk_type: "overdue_obligations",
              strategy: "Implement automated reminder system and prioritize overdue items",
              timeline: "Immediate",
              cost: "Low"
            });
          }

          if (highPriorityItems > 10) {
            risks.push({
              category: "compliance",
              type: "high_priority_load",
              severity: "medium",
              description: `${highPriorityItems} high-priority compliance items`,
              impact: "Resource strain and potential missed deadlines",
              likelihood: "medium"
            });
          }
        }

        if (scope === "tax" || scope === "comprehensive") {
          const { data: taxCalculations } = await supabase
            .from("tax_calculations")
            .select("*")
            .eq("user_id", context.user.id)
            .gte("created_at", subMonths(new Date(), 6).toISOString());

          if (taxCalculations && taxCalculations.length > 0) {
            const avgTaxAmount = taxCalculations.reduce((sum, calc) => sum + calc.tax_amount, 0) / taxCalculations.length;
            
            if (avgTaxAmount > 500000) {
              risks.push({
                category: "tax",
                type: "high_tax_liability",
                severity: "medium",
                description: "Consistently high tax liabilities",
                impact: "Cash flow impact and audit attention",
                likelihood: "medium"
              });

              mitigationStrategies.push({
                risk_type: "high_tax_liability",
                strategy: "Review tax planning strategies and available incentives",
                timeline: "3-6 months",
                cost: "Medium"
              });
            }
          }
        }

        if (scope === "operational" || scope === "comprehensive") {
          risks.push({
            category: "operational",
            type: "data_security",
            severity: "medium",
            description: "Financial data security and backup procedures",
            impact: "Data loss or breach consequences",
            likelihood: "low"
          });

          mitigationStrategies.push({
            risk_type: "data_security",
            strategy: "Implement regular backups and security audits",
            timeline: "Ongoing",
            cost: "Medium"
          });
        }

        // Calculate overall risk score
        const riskScores = { low: 1, medium: 2, high: 3 };
        const totalRiskScore = risks.reduce((sum, risk) => sum + riskScores[risk.severity], 0);
        const averageRiskScore = risks.length > 0 ? totalRiskScore / risks.length : 0;
        
        const overallRiskLevel = averageRiskScore > 2.5 ? "High" : averageRiskScore > 1.5 ? "Medium" : "Low";

        return {
          success: true,
          message: `Risk assessment completed. Overall risk level: ${overallRiskLevel}. Found ${risks.length} risk areas with ${mitigationStrategies.length} mitigation strategies.`,
          data: {
            scope,
            risk_tolerance: riskTolerance,
            overall_risk_level: overallRiskLevel,
            total_risks: risks.length,
            risks,
            mitigation_strategies: mitigationStrategies,
            assessment_date: new Date().toISOString(),
            recommendations: generateRiskRecommendations(risks, riskTolerance)
          },
          suggestedActions: ["get_compliance_summary", "get_dashboard_metrics"]
        };

      } catch (error) {
        return {
          success: false,
          message: `Failed to generate risk assessment: ${error.message}`
        };
      }
    }
  }
];

// Helper functions
function generateComplianceInsights(analysis: any, metric: string): string[] {
  const insights = [];
  
  if (metric === "completion_rate") {
    if (parseFloat(analysis.completion_rate) > 80) {
      insights.push("Excellent compliance performance! Keep up the good work.");
    } else if (parseFloat(analysis.completion_rate) > 60) {
      insights.push("Good compliance rate, but there's room for improvement.");
    } else {
      insights.push("Compliance rate needs attention. Consider setting up automated reminders.");
    }
  }
  
  return insights;
}

function calculateVariance(values: number[]): number {
  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
  return Math.sqrt(squaredDiffs.reduce((sum, val) => sum + val, 0) / values.length);
}

function generateTaxRecommendations(opportunities: any[]): string[] {
  const recommendations = [];
  
  if (opportunities.some(opp => opp.type === "deduction_review")) {
    recommendations.push("Schedule a tax planning session to review all available deductions");
  }
  
  if (opportunities.some(opp => opp.type === "vat_optimization")) {
    recommendations.push("Implement systematic VAT input tax tracking and claims process");
  }
  
  return recommendations;
}

function generateRiskRecommendations(risks: any[], riskTolerance: string): string[] {
  const recommendations = [];
  
  const highRisks = risks.filter(risk => risk.severity === "high");
  if (highRisks.length > 0) {
    recommendations.push("Address high-severity risks immediately");
  }
  
  if (riskTolerance === "low" && risks.length > 0) {
    recommendations.push("Consider implementing additional controls due to low risk tolerance");
  }
  
  return recommendations;
}
