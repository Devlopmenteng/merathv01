import React, { useRef } from 'react';
import { View, TouchableOpacity, Text, Share, Platform, Alert } from 'react-native';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import ViewShot from 'react-native-view-shot';
import { useAppTheme } from '../hooks/useAppTheme';
import type { CalculationResult } from '../lib/engine/types';

type ExportBarProps = {
  resultData: CalculationResult;
  children: React.ReactNode;
};

export const ExportBar: React.FC<ExportBarProps> = ({ resultData, children }) => {
  const viewShotRef = useRef<any>(null);
  const theme = useAppTheme();

  const generatePDF = async () => {
    try {
      const html = `
        <h1>Inheritance Report</h1>
        <p>Net Estate: $${resultData.netEstate ?? 0}</p>
        <ul>${resultData.shares
          .map((s) => `<li>${s.name}: $${s.amount.toFixed(2)}</li>`)
          .join('')}</ul>
      `;
      const { uri } = await Print.printToFileAsync({ html });
      if (Platform.OS === 'web') window.open(uri);
      else await Sharing.shareAsync(uri);
    } catch {
      Alert.alert('خطأ', 'تعذر إنشاء ملف PDF. حاول مرة أخرى.');
    }
  };

  const captureAndShare = async () => {
    try {
      const uri = await viewShotRef.current.capture();
      await Share.share({ message: 'Inheritance Report', url: uri });
    } catch {
      Alert.alert('خطأ', 'تعذر مشاركة الصورة. حاول مرة أخرى.');
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
          <Text style={{ color: theme.colors.onPrimary }}>PDF</Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={captureAndShare}
          style={{ padding: 12, backgroundColor: theme.colors.secondary, borderRadius: 8 }}
        >
          <Text style={{ color: theme.colors.onSecondary }}>Share Image</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};
