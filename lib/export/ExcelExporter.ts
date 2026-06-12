/**
 * Excel/CSV Export Functionality for Inheritance Calculations
 * تصدير حسابات المواريث إلى Excel/CSV
 *
 * This module provides functionality to export calculation results to CSV format
 * (which can be opened in Excel, Google Sheets, and other spreadsheet applications),
 * as well as PDF with enhanced formatting.
 *
 * @module lib/export/ExcelExporter
 */

import type { CalculationResult, EstateInput, HeirEntry } from '../engine/types';
import { MADHAB_NAMES } from '../engine/constants';

/**
 * Export format options
 */
export type ExportFormat = 'csv' | 'json' | 'txt' | 'pdf';

/**
 * Export configuration
 */
export interface ExportConfig {
  /** Include calculation steps in export */
  includeSteps?: boolean;
  /** Include special cases analysis */
  includeSpecialCases?: boolean;
  /** Include confidence score */
  includeConfidence?: boolean;
  /** Include performance metrics */
  includePerformance?: boolean;
  /** Language for export (default: English) */
  language?: 'en' | 'ar' | 'ms' | 'ur';
  /** Currency symbol */
  currencySymbol?: string;
  /** Include summary table */
  includeSummary?: boolean;
  /** Include breakdown by heir category */
  includeCategories?: boolean;
  /** Formatting style for PDF */
  pdfStyle?: 'simple' | 'detailed' | 'professional';
}

/**
 * Export data structure
 */
export interface ExportData {
  /** Export timestamp */
  timestamp: string;
  /** Estate information */
  estate: EstateInput;
  /** Heirs information */
  heirs: HeirEntry[];
  /** Calculation result */
  result: CalculationResult;
  /** Export configuration used */
  config: ExportConfig;
}

/**
 * Main exporter class
 */
export class CalculationExporter {
  /**
   * Export calculation result to CSV format (enhanced with better formatting)
   *
   * @param data - Calculation data to export
   * @param config - Export configuration
   * @returns CSV string
   */
  public static exportToCSV(data: ExportData, config: ExportConfig = {}): string {
    const { result, estate, heirs } = data;
    const currencySymbol = config.currencySymbol || '$';
    const lang = config.language || 'en';

    // Build CSV content
    const csvRows: string[] = [];

    // Header section
    csvRows.push('Islamic Inheritance Calculation Export');
    csvRows.push('Exported:,' + new Date().toISOString());
    csvRows.push('Language:,' + lang);
    csvRows.push('');

    // Estate information
    csvRows.push('Estate Information');
    csvRows.push('Total Estate,' + currencySymbol + estate.total);
    csvRows.push('Funeral Expenses,' + currencySymbol + estate.funeral);
    csvRows.push('Debts,' + currencySymbol + estate.debts);
    csvRows.push('Will/Bequest,' + currencySymbol + estate.will);
    csvRows.push('Net Estate,' + currencySymbol + (result.netEstate || 'N/A'));
    csvRows.push('');

    // Calculation summary
    csvRows.push('Calculation Summary');
    csvRows.push('Madhab,' + MADHAB_NAMES[result.madhab]);
    csvRows.push('Success,' + (result.success ? 'Yes' : 'No'));
    csvRows.push('Confidence Score,' + (result.confidence?.toFixed(2) || 'N/A'));
    csvRows.push('Calculation Time,' + result.calculationTime + 'ms');
    csvRows.push('');

    // Heirs input
    csvRows.push('Heirs Input');
    csvRows.push('Heir Type,Count');
    heirs.forEach((heir) => {
      csvRows.push(heir.type + ',' + (heir.count || 1));
    });
    csvRows.push('');

    // Heirs distribution table
    csvRows.push('Heirs Distribution');
    csvRows.push('Heir Name,Heir Type,Count,Fraction,Percentage,Amount,Share Type');

    result.shares.forEach((share) => {
      const fraction = share.fraction
        ? share.fraction.numerator + '/' + share.fraction.denominator
        : 'N/A';
      const percentage = share.percentage ? share.percentage.toFixed(2) + '%' : 'N/A';
      const amount = share.amount ? currencySymbol + share.amount.toFixed(2) : 'N/A';

      csvRows.push(
        '"' +
          share.name +
          '","' +
          (share.key || 'N/A') +
          '",' +
          (share.count || 1) +
          ',' +
          fraction +
          ',' +
          percentage +
          ',' +
          amount +
          ',"' +
          (share.shareType || 'N/A') +
          '"'
      );
    });

    csvRows.push('');

    // Calculation steps if requested
    if (config.includeSteps && result.steps) {
      csvRows.push('Calculation Steps');
      csvRows.push('Step,Description');
      result.steps.forEach((step, index) => {
        csvRows.push(
          '"' + (index + 1) + '. ' + step.title + '","' + step.description.replace(/"/g, '""') + '"'
        );
      });
      csvRows.push('');
    }

    // Special cases if requested
    if (config.includeSpecialCases && result.specialCases) {
      csvRows.push('Special Cases Applied');
      csvRows.push('Case,Applied');
      if (result.specialCases.awl) {
        csvRows.push('"Awl (عول)","Yes"');
      }
      if (result.specialCases.radd) {
        csvRows.push('"Radd (رد)","Yes"');
      }
      if (result.specialCases.hijabTypes?.length > 0) {
        result.specialCases.hijabTypes.forEach((ht) => {
          csvRows.push('"' + ht + '","Yes"');
        });
      }
      csvRows.push('');
    }

    // Footer
    csvRows.push('');
    csvRows.push('Generated by Merath - Islamic Inheritance Calculator');
    csvRows.push('For accurate calculations, consult with Islamic scholars');

    return csvRows.join('\n');
  }

  /**
   * Export calculation result to JSON format
   *
   * @param data - Calculation data to export
   * @param config - Export configuration
   * @returns JSON string
   */
  public static exportToJSON(data: ExportData, config: ExportConfig = {}): string {
    const exportObj = {
      metadata: {
        exportedAt: new Date().toISOString(),
        appVersion: '1.0.0',
        format: 'merath-calculation-export',
        language: config.language || 'en',
      },
      estate: data.estate,
      heirs: data.heirs,
      result: {
        ...data.result,
        // Optional fields based on config
        steps: config.includeSteps ? data.result.steps : undefined,
        confidenceFactors: config.includeConfidence ? data.result.confidenceFactors : undefined,
      },
      config: config,
    };

    return JSON.stringify(exportObj, null, 2);
  }

  /**
   * Export calculation result to PDF format (HTML-based)
   *
   * @param data - Calculation data to export
   * @param config - Export configuration
   * @returns HTML string for PDF generation
   */
  public static exportToPDF(data: ExportData, config: ExportConfig = {}): string {
    const { result, estate, heirs } = data;
    const currencySymbol = config.currencySymbol || '$';
    const style = config.pdfStyle || 'detailed';

    let html = '';

    // HTML Head
    html += `<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Islamic Inheritance Calculation</title>
<style>
  body { font-family: Arial, sans-serif; padding: 20px; color: #333; }
  .header { text-align: center; border-bottom: 3px solid #2c3e50; padding-bottom: 20px; margin-bottom: 30px; }
  .header h1 { color: #2c3e50; margin: 0; }
  .header p { color: #7f8c8d; font-size: 12px; margin-top: 10px; }
  .section { margin-bottom: 25px; }
  .section h2 { color: #34495e; border-bottom: 2px solid #ecf0f1; padding-bottom: 10px; }
  .table { width: 100%; border-collapse: collapse; margin-top: 10px; }
  .table th { background-color: #34495e; color: white; padding: 12px; text-align: left; }
  .table td { border: 1px solid #ecf0f1; padding: 10px; }
  .table tr:nth-child(even) { background-color: #f9f9f9; }
  .summary { background-color: #f0f3f4; padding: 15px; border-radius: 5px; }
  .footer { margin-top: 40px; padding-top: 20px; border-top: 1px solid #ecf0f1; text-align: center; color: #7f8c8d; font-size: 11px; }
  .label { font-weight: bold; color: #2c3e50; }
  .value { margin-left: 10px; }
</style>
</head>
<body>`;

    // Header
    html += `
<div class="header">
  <h1>Islamic Inheritance Calculation</h1>
  <p>Madhab: ${MADHAB_NAMES[result.madhab]} | Generated: ${new Date().toLocaleDateString()}</p>
</div>`;

    // Estate Summary
    html += `
<div class="section summary">
  <h2>Estate Summary</h2>
  <p><span class="label">Total Estate:</span><span class="value">${currencySymbol}${estate.total.toLocaleString()}</span></p>
  <p><span class="label">Funeral Expenses:</span><span class="value">${currencySymbol}${estate.funeral.toLocaleString()}</span></p>
  <p><span class="label">Debts:</span><span class="value">${currencySymbol}${estate.debts.toLocaleString()}</span></p>
  <p><span class="label">Will/Bequest:</span><span class="value">${currencySymbol}${estate.will.toLocaleString()}</span></p>
  <p><span class="label">Net Estate:</span><span class="value">${currencySymbol}${(result.netEstate || 0).toLocaleString()}</span></p>
</div>`;

    // Heirs Input
    if (style === 'detailed' || style === 'professional') {
      html += `
<div class="section">
  <h2>Heirs Input</h2>
  <table class="table">
    <tr>
      <th>Heir Type</th>
      <th>Count</th>
    </tr>`;
      heirs.forEach((heir) => {
        html += `
    <tr>
      <td>${heir.type}</td>
      <td>${heir.count || 1}</td>
    </tr>`;
      });
      html += `
  </table>
</div>`;
    }

    // Distribution Table
    html += `
<div class="section">
  <h2>Inheritance Distribution</h2>
  <table class="table">
    <tr>
      <th>Heir Name</th>
      <th>Type</th>
      <th>Count</th>
      <th>Fraction</th>
      <th>Percentage</th>
      <th>Amount</th>
      <th>Share Type</th>
    </tr>`;

    result.shares.forEach((share) => {
      const fraction = share.fraction
        ? `${share.fraction.numerator}/${share.fraction.denominator}`
        : 'N/A';
      const percentage = share.percentage ? `${share.percentage.toFixed(2)}%` : 'N/A';
      const amount = share.amount ? `${currencySymbol}${share.amount.toFixed(2)}` : 'N/A';

      html += `
    <tr>
      <td>${share.name}</td>
      <td>${share.key || 'N/A'}</td>
      <td>${share.count || 1}</td>
      <td>${fraction}</td>
      <td>${percentage}</td>
      <td>${amount}</td>
      <td>${share.shareType || 'N/A'}</td>
    </tr>`;
    });

    html += `
  </table>
</div>`;

    // Calculation Steps
    if (config.includeSteps && result.steps) {
      html += `
<div class="section">
  <h2>Calculation Steps</h2>`;
      result.steps.forEach((step, index) => {
        html += `
  <p><strong>${index + 1}. ${step.title}</strong></p>
  <p>${step.description}</p>`;
      });
      html += `
</div>`;
    }

    // Special Cases
    if (config.includeSpecialCases && result.specialCases) {
      html += `
<div class="section">
  <h2>Special Cases Applied</h2>`;
      if (result.specialCases.awl) {
        html += `<p>• Awl (عول) applied</p>`;
      }
      if (result.specialCases.radd) {
        html += `<p>• Radd (رد) applied</p>`;
      }
      if (result.specialCases.hijabTypes?.length > 0) {
        result.specialCases.hijabTypes.forEach((ht) => {
          html += `<p>• ${ht}</p>`;
        });
      }
      html += `
</div>`;
    }

    // Footer
    html += `
<div class="footer">
  <p>Generated by Merath - Islamic Inheritance Calculator</p>
  <p>For accurate calculations, consult with Islamic scholars</p>
  <p>Calculation Time: ${result.calculationTime}ms | Confidence: ${(result.confidence || 0).toFixed(2)}%</p>
</div>
</body>
</html>`;

    return html;
  }

  /**
   * Export calculation result to plain text format (SIMPLIFIED)
   *
   * @param data - Calculation data to export
   * @param config - Export configuration
   * @returns Text string
   */
  public static exportToText(data: ExportData, config: ExportConfig = {}): string {
    const { result, estate } = data;
    const currencySymbol = config.currencySymbol || '$';

    let text = 'ISLAMIC INHERITANCE CALCULATION REPORT\n';
    text += '========================================\n\n';
    text += 'Generated: ' + new Date().toISOString() + '\n';
    text += 'Madhab: ' + MADHAB_NAMES[result.madhab] + '\n';
    text += 'Total Estate: ' + currencySymbol + estate.total + '\n';
    text += 'Net Estate: ' + currencySymbol + (result.netEstate || 0) + '\n\n';
    text += 'Heirs Distribution:\n';

    result.shares.forEach((share) => {
      const amount = share.amount ? currencySymbol + share.amount.toFixed(2) : 'N/A';
      text += '- ' + share.name + ': ' + amount + '\n';
    });

    text += '\nGenerated by Merath - Islamic Inheritance Calculator';
    return text;
  }

  /**
   * Export calculation result based on format
   *
   * @param data - Calculation data to export
   * @param format - Export format
   * @param config - Export configuration
   * @returns Exported string
   */
  public static export(
    data: ExportData,
    format: ExportFormat = 'csv',
    config: ExportConfig = {}
  ): string {
    switch (format) {
      case 'csv':
        return this.exportToCSV(data, config);
      case 'json':
        return this.exportToJSON(data, config);
      case 'txt':
        return this.exportToText(data, config);
      case 'pdf':
        return this.exportToPDF(data, config);
      default:
        return this.exportToCSV(data, config);
    }
  }

  /**
   * Generate filename for export
   *
   * @param format - Export format
   * @param madhab - Madhab used
   * @returns Suggested filename
   */
  public static generateFilename(format: ExportFormat = 'csv', madhab?: string): string {
    const date = new Date();
    const dateStr = date.toISOString().split('T')[0];
    const madhabStr = madhab ? '_' + madhab : '';

    switch (format) {
      case 'csv':
        return 'inheritance_calculation' + madhabStr + '_' + dateStr + '.csv';
      case 'json':
        return 'inheritance_calculation' + madhabStr + '_' + dateStr + '.json';
      case 'txt':
        return 'inheritance_calculation' + madhabStr + '_' + dateStr + '.txt';
      case 'pdf':
        return 'inheritance_calculation' + madhabStr + '_' + dateStr + '.pdf';
      default:
        return 'inheritance_calculation' + madhabStr + '_' + dateStr + '.csv';
    }
  }

  /**
   * Create export data structure from calculation components
   *
   * @param estate - Estate input
   * @param heirs - Heirs array
   * @param result - Calculation result
   * @returns Export data
   */
  public static createExportData(
    estate: EstateInput,
    heirs: HeirEntry[],
    result: CalculationResult
  ): ExportData {
    return {
      timestamp: new Date().toISOString(),
      estate,
      heirs,
      result,
      config: {},
    };
  }
}

/**
 * Convenience function to export calculation
 *
 * @param estate - Estate input
 * @param heirs - Heirs array
 * @param result - Calculation result
 * @param format - Export format
 * @param config - Export configuration
 * @returns Exported string and filename
 */
export function exportCalculation(
  estate: EstateInput,
  heirs: HeirEntry[],
  result: CalculationResult,
  format: ExportFormat = 'csv',
  config: ExportConfig = {}
): { content: string; filename: string } {
  const data = CalculationExporter.createExportData(estate, heirs, result);
  const content = CalculationExporter.export(data, format, config);
  const filename = CalculationExporter.generateFilename(format, result.madhab);

  return { content, filename };
}
