import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, Share, Platform, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useAppTheme } from '../hooks/useAppTheme';
import type { CalculationResult } from '../lib/engine/types';
import { t } from '../lib/i18n';
import { exportCalculation } from '../lib/export/ExcelExporter';
import type { HeirEntry, EstateInput } from '../lib/engine/types';

type ExportBarProps = {
  resultData: CalculationResult;
  estate?: EstateInput;
  heirs?: HeirEntry[];
  children: React.ReactNode;
};

export const ExportBar: React.FC<ExportBarProps> = React.memo(
  ({ resultData, estate, heirs, children }) => {
    const viewShotRef = useRef<ViewShot>(null);
    const theme = useAppTheme();

    const generatePDF = async () => {
      const html = `
      <h1>${t('pdf_report_title')}</h1>
      <p>${t('pdf_estate_label', { amount: t('currency_symbol') + (resultData.netEstate ?? 0) })}</p>
      <ul>${resultData.shares
        .map((s) => `<li>${s.name}: ${t('currency_symbol')}${s.amount.toFixed(2)}</li>`)
        .join('')}</ul>
    `;
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'web') window.open(uri);
      else await Sharing.shareAsync(uri);
    };

    const captureAndShare = async () => {
      if (!viewShotRef.current) return;
      const uri = await viewShotRef.current?.capture?.();
      await Share.share({ message: t('pdf_report_title'), url: uri });
    };

    const exportToExcel = async () => {
      if (!estate || !heirs) {
        Alert.alert(t('error'), t('export_error_data_required'));
        return;
      }

      try {
        const { content, filename } = exportCalculation(estate, heirs, resultData, 'csv', {
          currencySymbol: t('currency_symbol'),
        });

        if (Platform.OS === 'web') {
          // On web, create a download link
          const blob = new Blob([content], { type: 'text/csv' });
          const url = URL.createObjectURL(blob);
          const a = document.createElement('a');
          a.href = url;
          a.download = filename;
          a.click();
          URL.revokeObjectURL(url);
        } else {
          // On mobile, just share the content as text for now
          await Share.share({
            message: `${t('share_message_prefix')}\n\n${content}`,
            title: filename,
          });
        }

        Alert.alert(t('success'), t('export_success_csv'));
      } catch (error) {
        console.error('Export error:', error);
        Alert.alert(t('error'), t('export_error_csv'));
      }
    };

    return (
      <View>
        <ViewShot ref={viewShotRef} options={{ format: 'png', quality: 1 }}>
          {children}
        </ViewShot>
        <View style={{ flexDirection: 'row', justifyContent: 'space-around', marginVertical: 12 }}>
          <TouchableOpacity
            onPress={generatePDF}
            style={{ padding: 12, backgroundColor: theme.colors.primary, borderRadius: 8 }}
          >
            <Text style={{ color: theme.colors.onPrimary }}>{t('pdf')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={exportToExcel}
            style={{ padding: 12, backgroundColor: theme.colors.secondary, borderRadius: 8 }}
          >
            <Text style={{ color: theme.colors.onSecondary }}>{t('csv')}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={captureAndShare}
            style={{
              padding: 12,
              backgroundColor: theme.colors.success,
              borderRadius: 8,
            }}
          >
            <Text style={{ color: theme.colors.onPrimary }}>{t('share_image')}</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }
);
