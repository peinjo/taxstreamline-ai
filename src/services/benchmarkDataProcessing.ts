import { supabase } from '@/integrations/supabase/client';
import { logger } from '@/lib/logging/logger';
import ExcelJS from 'exceljs';

interface BenchmarkData {
  comparable_name: string;
  country: string;
  industry: string;
  financial_data: Record<string, number>;
  search_criteria: Record<string, any>;
  reliability_score: number;
}

interface FileProcessingResult {
  processed: number;
  errors: string[];
  data: BenchmarkData[];
}

export class BenchmarkDataProcessingService {
  async processFile(file: File): Promise<FileProcessingResult> {
    const operationId = `benchmark-file-processing-${Date.now()}`;
    logger.startTimer(operationId, 'Benchmark File Processing', { fileName: file.name });

    try {
      const data = await this.readFileData(file);
      const processed = await this.processFileData(data);
      
      logger.endTimer(operationId);
      return processed;
    } catch (error) {
      logger.endTimer(operationId);
      logger.error('Benchmark file processing failed', error as Error, { fileName: file.name });
      throw error;
    }
  }

  private async readFileData(file: File): Promise<any[]> {
    const buffer = await file.arrayBuffer();

    if (file.name.endsWith('.csv')) {
      const text = new TextDecoder().decode(buffer);
      return this.parseCsv(text);
    }

    if (file.name.endsWith('.xlsx') || file.name.endsWith('.xls')) {
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      const worksheet = workbook.worksheets[0];
      if (!worksheet) throw new Error('No worksheet found');

      const jsonData: any[] = [];
      const headers: string[] = [];

      worksheet.eachRow((row, rowNumber) => {
        const values = row.values as any[];
        // ExcelJS row.values is 1-indexed (index 0 is undefined)
        const cells = values.slice(1);

        if (rowNumber === 1) {
          cells.forEach(cell => headers.push(String(cell ?? '')));
          return;
        }

        const obj: Record<string, any> = {};
        cells.forEach((cell, i) => {
          if (headers[i] && cell !== undefined && cell !== null && cell !== '') {
            obj[headers[i]] = cell;
          }
        });
        if (Object.keys(obj).length > 0) jsonData.push(obj);
      });

      return jsonData;
    }

    throw new Error('Unsupported file format');
  }

  private parseCsv(text: string): any[] {
    const lines = text.split('\n').filter(l => l.trim());
    if (lines.length < 2) return [];
    const headers = lines[0].split(',').map(h => h.trim());
    return lines.slice(1).map(line => {
      const values = line.split(',');
      const obj: Record<string, any> = {};
      values.forEach((v, i) => {
        const val = v.trim();
        if (headers[i] && val) obj[headers[i]] = isNaN(Number(val)) ? val : Number(val);
      });
      return obj;
    }).filter(o => Object.keys(o).length > 0);
  }

  private async processFileData(rawData: any[]): Promise<FileProcessingResult> {
    const result: FileProcessingResult = {
      processed: 0,
      errors: [],
      data: []
    };

    for (let i = 0; i < rawData.length; i++) {
      try {
        const row = rawData[i];
        const benchmarkData = this.mapRowToBenchmarkData(row);
        
        if (benchmarkData) {
          result.data.push(benchmarkData);
          result.processed++;
        }
      } catch (error) {
        result.errors.push(`Row ${i + 1}: ${(error as Error).message}`);
      }
    }

    return result;
  }

  private mapRowToBenchmarkData(row: any): BenchmarkData | null {
    // Common field mappings
    const fieldMappings = {
      name: ['company_name', 'name', 'entity_name', 'comparable_name'],
      country: ['country', 'jurisdiction', 'country_code'],
      industry: ['industry', 'sector', 'business_type'],
      revenue: ['revenue', 'sales', 'turnover', 'total_revenue'],
      operating_profit: ['operating_profit', 'ebit', 'operating_income'],
      net_profit: ['net_profit', 'net_income', 'profit_after_tax'],
      total_assets: ['total_assets', 'assets', 'total_asset'],
      operating_margin: ['operating_margin', 'ebit_margin', 'operating_margin_%'],
    };

    // Extract basic information
    const comparable_name = String(this.findFieldValue(row, fieldMappings.name) || '');
    const country = String(this.findFieldValue(row, fieldMappings.country) || '');
    const industry = String(this.findFieldValue(row, fieldMappings.industry) || '');

    if (!comparable_name || !country) {
      return null; // Skip rows without essential data
    }

    // Extract financial data
    const financial_data: Record<string, number> = {};
    
    Object.keys(fieldMappings).forEach(key => {
      if (key !== 'name' && key !== 'country' && key !== 'industry') {
        const value = this.findFieldValue(row, fieldMappings[key as keyof typeof fieldMappings]);
        if (value !== null && !isNaN(Number(value))) {
          financial_data[key] = Number(value);
        }
      }
    });

    // Calculate derived metrics if possible
    if (financial_data.operating_profit && financial_data.revenue) {
      financial_data.operating_margin = (financial_data.operating_profit / financial_data.revenue) * 100;
    }

    if (financial_data.net_profit && financial_data.total_assets) {
      financial_data.roa = (financial_data.net_profit / financial_data.total_assets) * 100;
    }

    // Determine reliability score based on data completeness
    const reliability_score = this.calculateReliabilityScore(financial_data);

    return {
      comparable_name,
      country,
      industry: industry || 'Not specified',
      financial_data,
      search_criteria: {
        source: 'File Upload',
        upload_date: new Date().toISOString(),
        original_row: row
      },
      reliability_score
    };
  }

  private findFieldValue(row: any, fieldNames: string[]): string | number | null {
    for (const fieldName of fieldNames) {
      // Check exact match
      if (row[fieldName] !== undefined && row[fieldName] !== null && row[fieldName] !== '') {
        return row[fieldName];
      }
      
      // Check case-insensitive match
      const lowerFieldName = fieldName.toLowerCase();
      for (const key of Object.keys(row)) {
        if (key.toLowerCase() === lowerFieldName && row[key] !== undefined && row[key] !== null && row[key] !== '') {
          return row[key];
        }
      }
    }
    return null;
  }

  private calculateReliabilityScore(financialData: Record<string, number>): number {
    const essentialFields = ['revenue', 'operating_profit', 'total_assets'];
    const desirableFields = ['net_profit', 'operating_margin', 'roa'];
    
    let score = 50; // Base score
    
    // Essential fields
    essentialFields.forEach(field => {
      if (financialData[field] !== undefined) {
        score += 15;
      }
    });
    
    // Desirable fields
    desirableFields.forEach(field => {
      if (financialData[field] !== undefined) {
        score += 5;
      }
    });
    
    return Math.min(score, 95); // Cap at 95%
  }

  async saveBenchmarkData(data: BenchmarkData[]): Promise<void> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');

      const dataWithUserId = data.map(item => ({
        ...item,
        user_id: user.id,
        created_at: new Date().toISOString()
      }));

      const { error } = await supabase
        .from('tp_benchmarks')
        .insert(dataWithUserId);

      if (error) throw error;
      
      logger.info('Benchmark data saved successfully', { count: data.length });
    } catch (error) {
      logger.error('Failed to save benchmark data', error as Error, { count: data.length });
      throw error;
    }
  }
}

export const benchmarkDataService = new BenchmarkDataProcessingService();