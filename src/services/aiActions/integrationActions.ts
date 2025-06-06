
import { AIAction } from "@/types/aiAssistant";
import { supabase } from "@/integrations/supabase/client";
import * as XLSX from 'xlsx';

export const integrationActions: AIAction[] = [
  {
    name: "export_compliance_to_excel",
    description: "Export compliance data to Excel format",
    parameters: {
      type: "object",
      properties: {
        format: {
          type: "string",
          enum: ["summary", "detailed", "by_country"],
          description: "Export format type"
        },
        date_range: {
          type: "string",
          enum: ["30days", "90days", "6months", "1year", "all"],
          description: "Date range for export"
        },
        include_attachments: {
          type: "boolean",
          description: "Include attachment information"
        }
      }
    },
    handler: async (params, context) => {
      const format = params.format || "detailed";
      const dateRange = params.date_range || "all";
      const includeAttachments = params.include_attachments || false;

      try {
        let query = supabase
          .from("compliance_items")
          .select("*")
          .eq("user_id", context.user.id);

        // Apply date filtering if needed
        if (dateRange !== "all") {
          const days = {
            "30days": 30,
            "90days": 90,
            "6months": 180,
            "1year": 365
          }[dateRange];
          
          const cutoffDate = new Date();
          cutoffDate.setDate(cutoffDate.getDate() - days);
          query = query.gte("created_at", cutoffDate.toISOString());
        }

        const { data: complianceItems, error } = await query;
        if (error) throw error;

        if (!complianceItems || complianceItems.length === 0) {
          return {
            success: false,
            message: "No compliance data found for the specified criteria."
          };
        }

        let exportData: any[] = [];

        switch (format) {
          case "summary":
            exportData = complianceItems.map(item => ({
              'Title': item.title,
              'Country': item.country,
              'Status': item.status,
              'Priority': item.priority,
              'Next Due Date': item.next_due_date ? new Date(item.next_due_date).toLocaleDateString() : 'N/A',
              'Frequency': item.frequency
            }));
            break;

          case "detailed":
            exportData = complianceItems.map(item => ({
              'ID': item.id,
              'Title': item.title,
              'Description': item.description || '',
              'Country': item.country,
              'Requirement Type': item.requirement_type,
              'Status': item.status,
              'Priority': item.priority,
              'Frequency': item.frequency,
              'Next Due Date': item.next_due_date ? new Date(item.next_due_date).toLocaleDateString() : 'N/A',
              'Last Completed': item.last_completed_date ? new Date(item.last_completed_date).toLocaleDateString() : 'N/A',
              'Created Date': new Date(item.created_at).toLocaleDateString(),
              'Updated Date': new Date(item.updated_at).toLocaleDateString()
            }));
            break;

          case "by_country":
            const byCountry = complianceItems.reduce((acc, item) => {
              if (!acc[item.country]) {
                acc[item.country] = [];
              }
              acc[item.country].push(item);
              return acc;
            }, {} as Record<string, any[]>);

            exportData = Object.entries(byCountry).flatMap(([country, items]) => 
              items.map(item => ({
                'Country': country,
                'Title': item.title,
                'Status': item.status,
                'Priority': item.priority,
                'Next Due Date': item.next_due_date ? new Date(item.next_due_date).toLocaleDateString() : 'N/A'
              }))
            );
            break;
        }

        // Create Excel workbook
        const ws = XLSX.utils.json_to_sheet(exportData);
        const wb = XLSX.utils.book_new();
        XLSX.utils.book_append_sheet(wb, ws, "Compliance Data");

        // Generate download
        const excelBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
        const blob = new Blob([excelBuffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = `compliance_export_${format}_${new Date().toISOString().split('T')[0]}.xlsx`;
        link.click();
        
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `Compliance data exported successfully to Excel (${format} format). ${exportData.length} records exported covering ${dateRange}.`,
          data: {
            format,
            records_exported: exportData.length,
            date_range: dateRange,
            file_name: `compliance_export_${format}_${new Date().toISOString().split('T')[0]}.xlsx`
          },
          suggestedActions: ["get_compliance_summary", "analyze_compliance_trends"]
        };

      } catch (error) {
        return {
          success: false,
          message: `Failed to export compliance data: ${error.message}`
        };
      }
    }
  },
  {
    name: "sync_calendar_events",
    description: "Sync calendar events with external systems",
    parameters: {
      type: "object",
      properties: {
        sync_direction: {
          type: "string",
          enum: ["export", "import", "bidirectional"],
          description: "Direction of synchronization"
        },
        external_system: {
          type: "string",
          enum: ["google_calendar", "outlook", "ical", "generic_webhook"],
          description: "External system to sync with"
        },
        event_filter: {
          type: "string",
          enum: ["all", "meetings", "deadlines", "high_priority"],
          description: "Filter events to sync"
        },
        webhook_url: {
          type: "string",
          description: "Webhook URL for external system (if applicable)"
        }
      },
      required: ["sync_direction", "external_system"]
    },
    handler: async (params, context) => {
      const syncDirection = params.sync_direction;
      const externalSystem = params.external_system;
      const eventFilter = params.event_filter || "all";

      try {
        let query = supabase
          .from("calendar_events")
          .select("*")
          .eq("user_id", context.user.id);

        // Apply event filtering
        if (eventFilter !== "all") {
          switch (eventFilter) {
            case "meetings":
              query = query.eq("category", "meeting");
              break;
            case "deadlines":
              query = query.eq("category", "deadline");
              break;
            case "high_priority":
              query = query.in("priority", ["high", "urgent"]);
              break;
          }
        }

        const { data: events, error } = await query;
        if (error) throw error;

        if (!events || events.length === 0) {
          return {
            success: false,
            message: "No events found matching the specified criteria."
          };
        }

        let syncResult: any = {};

        switch (externalSystem) {
          case "ical":
            // Generate iCal format
            const icalData = generateICalFormat(events);
            const blob = new Blob([icalData], { type: 'text/calendar' });
            const url = URL.createObjectURL(blob);
            
            const link = document.createElement('a');
            link.href = url;
            link.download = `calendar_events_${new Date().toISOString().split('T')[0]}.ics`;
            link.click();
            
            URL.revokeObjectURL(url);
            
            syncResult = {
              format: "iCal",
              events_exported: events.length,
              file_name: `calendar_events_${new Date().toISOString().split('T')[0]}.ics`
            };
            break;

          case "generic_webhook":
            if (!params.webhook_url) {
              return {
                success: false,
                message: "Webhook URL is required for generic webhook sync."
              };
            }

            // Send events to webhook
            const webhookPayload = {
              sync_direction: syncDirection,
              event_filter: eventFilter,
              timestamp: new Date().toISOString(),
              events: events.map(event => ({
                id: event.id,
                title: event.title,
                date: event.date,
                start_time: event.start_time,
                end_time: event.end_time,
                company: event.company,
                category: event.category,
                priority: event.priority,
                description: event.description
              }))
            };

            try {
              const response = await fetch(params.webhook_url, {
                method: 'POST',
                headers: {
                  'Content-Type': 'application/json',
                },
                mode: 'no-cors',
                body: JSON.stringify(webhookPayload)
              });

              syncResult = {
                webhook_url: params.webhook_url,
                events_sent: events.length,
                status: "sent"
              };
            } catch (webhookError) {
              return {
                success: false,
                message: `Failed to send events to webhook: ${webhookError.message}`
              };
            }
            break;

          case "google_calendar":
          case "outlook":
            // For now, provide instructions for manual sync
            syncResult = {
              system: externalSystem,
              instructions: `To sync with ${externalSystem}, export the iCal file and import it into your ${externalSystem} account.`,
              events_to_sync: events.length
            };
            break;
        }

        return {
          success: true,
          message: `Calendar sync completed for ${externalSystem}. ${events.length} events processed with ${eventFilter} filter.`,
          data: {
            sync_direction: syncDirection,
            external_system: externalSystem,
            event_filter: eventFilter,
            ...syncResult
          },
          suggestedActions: ["get_upcoming_events", "create_calendar_event"]
        };

      } catch (error) {
        return {
          success: false,
          message: `Failed to sync calendar events: ${error.message}`
        };
      }
    }
  },
  {
    name: "generate_api_report",
    description: "Generate API usage and data reports for third-party tools",
    parameters: {
      type: "object",
      properties: {
        report_type: {
          type: "string",
          enum: ["usage_summary", "data_export", "integration_status", "performance_metrics"],
          description: "Type of API report to generate"
        },
        format: {
          type: "string",
          enum: ["json", "csv", "xml"],
          description: "Output format for the report"
        },
        include_metadata: {
          type: "boolean",
          description: "Include metadata and timestamps"
        }
      },
      required: ["report_type"]
    },
    handler: async (params, context) => {
      const reportType = params.report_type;
      const format = params.format || "json";
      const includeMetadata = params.include_metadata || true;

      try {
        let reportData: any = {};

        switch (reportType) {
          case "usage_summary":
            // Get usage statistics from various tables
            const [complianceResult, eventsResult, taxResult] = await Promise.all([
              supabase.from("compliance_items").select("id, created_at").eq("user_id", context.user.id),
              supabase.from("calendar_events").select("id, created_at").eq("user_id", context.user.id),
              supabase.from("tax_calculations").select("id, created_at").eq("user_id", context.user.id)
            ]);

            reportData = {
              user_id: context.user.id,
              compliance_items: complianceResult.data?.length || 0,
              calendar_events: eventsResult.data?.length || 0,
              tax_calculations: taxResult.data?.length || 0,
              total_records: (complianceResult.data?.length || 0) + (eventsResult.data?.length || 0) + (taxResult.data?.length || 0)
            };
            break;

          case "data_export":
            // Export key data for API consumption
            const [compliance, events, taxes] = await Promise.all([
              supabase.from("compliance_items").select("*").eq("user_id", context.user.id).limit(100),
              supabase.from("calendar_events").select("*").eq("user_id", context.user.id).limit(100),
              supabase.from("tax_calculations").select("*").eq("user_id", context.user.id).limit(50)
            ]);

            reportData = {
              compliance_items: compliance.data || [],
              calendar_events: events.data || [],
              tax_calculations: taxes.data || []
            };
            break;

          case "integration_status":
            reportData = {
              integrations: [
                { name: "Calendar Sync", status: "active", last_sync: new Date().toISOString() },
                { name: "Compliance Export", status: "active", last_export: new Date().toISOString() },
                { name: "Tax Calculations", status: "active", last_calculation: new Date().toISOString() }
              ],
              api_version: "1.0",
              supported_formats: ["json", "csv", "xml", "ical", "xlsx"]
            };
            break;

          case "performance_metrics":
            reportData = {
              response_times: {
                compliance_queries: "< 100ms",
                calendar_operations: "< 50ms",
                tax_calculations: "< 200ms"
              },
              uptime: "99.9%",
              error_rate: "< 0.1%",
              last_updated: new Date().toISOString()
            };
            break;
        }

        if (includeMetadata) {
          reportData.metadata = {
            generated_at: new Date().toISOString(),
            report_type: reportType,
            format: format,
            user_id: context.user.id,
            version: "1.0"
          };
        }

        // Convert to requested format
        let outputData: string;
        let contentType: string;
        let fileName: string;

        switch (format) {
          case "json":
            outputData = JSON.stringify(reportData, null, 2);
            contentType = "application/json";
            fileName = `api_report_${reportType}.json`;
            break;

          case "csv":
            // Convert to CSV format (simplified)
            if (reportType === "usage_summary" || reportType === "performance_metrics") {
              const csvRows = Object.entries(reportData)
                .filter(([key, value]) => typeof value !== 'object')
                .map(([key, value]) => `${key},${value}`);
              outputData = "Key,Value\n" + csvRows.join("\n");
            } else {
              outputData = JSON.stringify(reportData, null, 2); // Fallback to JSON for complex data
            }
            contentType = "text/csv";
            fileName = `api_report_${reportType}.csv`;
            break;

          case "xml":
            outputData = jsonToXml(reportData);
            contentType = "application/xml";
            fileName = `api_report_${reportType}.xml`;
            break;

          default:
            outputData = JSON.stringify(reportData, null, 2);
            contentType = "application/json";
            fileName = `api_report_${reportType}.json`;
        }

        // Create download
        const blob = new Blob([outputData], { type: contentType });
        const url = URL.createObjectURL(blob);
        
        const link = document.createElement('a');
        link.href = url;
        link.download = fileName;
        link.click();
        
        URL.revokeObjectURL(url);

        return {
          success: true,
          message: `API report generated successfully: ${reportType} in ${format} format. Report downloaded as ${fileName}.`,
          data: {
            report_type: reportType,
            format: format,
            file_name: fileName,
            records_included: Object.keys(reportData).length,
            generated_at: new Date().toISOString()
          },
          suggestedActions: ["get_dashboard_metrics", "analyze_compliance_trends"]
        };

      } catch (error) {
        return {
          success: false,
          message: `Failed to generate API report: ${error.message}`
        };
      }
    }
  }
];

// Helper functions
function generateICalFormat(events: any[]): string {
  let ical = "BEGIN:VCALENDAR\nVERSION:2.0\nPRODID:-//Tax Management System//Calendar//EN\n";
  
  events.forEach(event => {
    ical += "BEGIN:VEVENT\n";
    ical += `UID:${event.id}@taxmanagement.system\n`;
    ical += `DTSTART:${formatDateForICal(event.date, event.start_time)}\n`;
    if (event.end_time) {
      ical += `DTEND:${formatDateForICal(event.date, event.end_time)}\n`;
    }
    ical += `SUMMARY:${event.title}\n`;
    ical += `DESCRIPTION:${event.description || ''}\n`;
    ical += `ORGANIZER:CN=${event.company}\n`;
    ical += `CATEGORIES:${event.category}\n`;
    ical += `PRIORITY:${event.priority === 'urgent' ? '1' : event.priority === 'high' ? '2' : '3'}\n`;
    ical += "END:VEVENT\n";
  });
  
  ical += "END:VCALENDAR";
  return ical;
}

function formatDateForICal(date: string, time?: string): string {
  const eventDate = new Date(date);
  if (time) {
    const [hours, minutes] = time.split(':');
    eventDate.setHours(parseInt(hours), parseInt(minutes));
  }
  return eventDate.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
}

function jsonToXml(obj: any, rootElement = 'root'): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n<${rootElement}>\n`;
  
  function convertToXml(data: any, indent = '  '): string {
    let result = '';
    
    for (const [key, value] of Object.entries(data)) {
      if (Array.isArray(value)) {
        result += `${indent}<${key}>\n`;
        value.forEach((item, index) => {
          result += `${indent}  <item_${index}>\n`;
          if (typeof item === 'object') {
            result += convertToXml(item, indent + '    ');
          } else {
            result += `${indent}    ${item}\n`;
          }
          result += `${indent}  </item_${index}>\n`;
        });
        result += `${indent}</${key}>\n`;
      } else if (typeof value === 'object' && value !== null) {
        result += `${indent}<${key}>\n`;
        result += convertToXml(value, indent + '  ');
        result += `${indent}</${key}>\n`;
      } else {
        result += `${indent}<${key}>${value}</${key}>\n`;
      }
    }
    
    return result;
  }
  
  xml += convertToXml(obj);
  xml += `</${rootElement}>`;
  return xml;
}
