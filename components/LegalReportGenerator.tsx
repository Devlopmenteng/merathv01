import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { Platform } from 'react-native';
import { showAlert } from '../lib/utils/alerts';
import { formatCurrency } from '../lib/utils/currency';
import { t, i18n } from '../lib/i18n';
import type { CalculationResult } from '../lib/engine/types';

export async function generateLegalReport(result: CalculationResult, madhab: string) {
  const today = new Date().toLocaleDateString(i18n.locale === 'ar' ? 'ar-EG' : 'en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  const caseNumber = `MER-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

  const subtitle = `${t('report_subheader')} ${madhab} – ${today}`;
  const caseNumLabel = `${t('report_case_number')} ${caseNumber}`;

  const html = `
  <html>
  <head><meta charset="UTF-8">
  <style>
    body { font-family: 'Arial', 'Tahoma', sans-serif; padding: 30px; direction: ${i18n.locale === 'ar' ? 'rtl' : 'ltr'}; }
    .header { text-align: center; border-bottom: 2px solid #0D7C66; padding-bottom: 10px; margin-bottom: 20px; }
    .title { font-size: 24px; font-weight: bold; color: #0D7C66; }
    .subtitle { font-size: 14px; color: #666; }
    .case-number { font-size: 12px; color: #999; text-align: start; direction: ltr; margin-top: 5px; }
    .section { margin-bottom: 20px; }
    .table { width: 100%; border-collapse: collapse; }
    .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: end; }
    .table th { background-color: #0D7C66; color: white; }
    .signature { margin-top: 40px; border-top: 1px solid #000; padding-top: 10px; font-size: 12px; text-align: center; }
    .disclaimer { margin-top: 20px; font-size: 10px; color: #777; text-align: center; }
  </style>
  </head>
  <body>
    <div class="header">
      <div class="title">${t('report_header')}</div>
      <div class="subtitle">${subtitle}</div>
      <div class="case-number">${caseNumLabel}</div>
    </div>
    <div class="section">
      <h3>${t('report_estate_summary')}</h3>
      <p>${t('report_net_estate')}: ${formatCurrency(result.netEstate || 0)}</p>
    </div>
    <div class="section">
      <h3>${t('report_distribution')}</h3>
      <table class="table">
        <thead><tr><th>${t('heir')}</th><th>${t('amount')}</th><th>${t('report_share_fraction')}</th></tr></thead>
        <tbody>
          ${result.shares
            .map(
              (s) => `
            <tr>
              <td>${s.name}</td>
              <td>${formatCurrency(s.amount)}</td>
              <td>${s.fraction?.numerator}/${s.fraction?.denominator || t('not_applicable')}</td>
            </tr>
          `
            )
            .join('')}
        </tbody>
      </table>
    </div>
    <div class="signature">
      <p>${t('report_generated_by')}</p>
      <p>${t('report_contact')}</p>
    </div>
    <div class="disclaimer">${t('report_disclaimer')}</div>
  </body>
  </html>`;

  const { uri } = await Print.printToFileAsync({ html });
  if (Platform.OS === 'android' && (await Sharing.isAvailableAsync())) {
    await Sharing.shareAsync(uri);
  } else {
    showAlert(t('report_saved'), uri);
  }
}
