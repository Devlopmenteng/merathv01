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

export const ExportBar: React.FC<ExportBarProps> = ({ resultData, estate, heirs, children }) => {
  const viewShotRef = useRef(null);
  const theme = useAppTheme();

  const generatePDF = async () => {
    const html = `
      <h1>Inheritance Report</h1>
      <p>Net Estate: $${resultData.netEstate ?? resultData.netEstate ?? 0}</p>
      <ul>${resultData.shares
        .map((s) => `<li>${s.name}: $${s.amount.toFixed(2)}</li>`)
        .join('')}</ul>
    `;
    const { uri } = await Print.printToFileAsync({ html });
    if (Platform.OS === 'web') window.open(uri);
    else await Sharing.shareAsync(uri);
  };

  const captureAndShare = async () => {
    if (!viewShotRef.current) return;
    const uri = await (viewShotRef.current as any).capture();
    await Share.share({ message: 'Inheritance Report', url: uri });
  };

  const exportToExcel = async () => {
    if (!estate || !heirs) {
      Alert.alert('Error', 'Estate and heirs data required for Excel export');
      return;
    }

    try {
      const { content, filename } = exportCalculation(estate, heirs, resultData, 'csv', { currencySymbol: '$' });

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
          message: `Inheritance Report (CSV)\n\n${content}`,
          title: filename,
        });
      }

      Alert.alert('Success', 'CSV file exported successfully');
    } catch (error) {
      console.error('Export error:', error);
      Alert.alert('Error', 'Failed to export to CSV format');
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
          style={{ padding: 12, backgroundColor: theme.colors.success || '#4CAF50', borderRadius: 8 }}
        >
          <Text style={{ color: '#FFF' }}>{t('share_image')}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
